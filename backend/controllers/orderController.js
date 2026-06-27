import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { memoryOrders, memoryProducts, memoryUsers, memoryNotifications } from '../config/memoryStore.js';

// Helper to emit stock update via Socket.io
const emitInventoryUpdate = (req, product) => {
  const io = req.app.get('socketio');
  if (io) {
    io.emit('inventoryUpdate', {
      productId: product._id,
      title: product.title,
      inventoryCount: product.inventoryCount
    });
    if (product.inventoryCount <= 5 && product.inventoryCount > 0) {
      io.emit('inventoryLow', {
        productId: product._id,
        title: product.title,
        inventoryCount: product.inventoryCount
      });
    } else if (product.inventoryCount === 0) {
      io.emit('inventoryOutOfStock', {
        productId: product._id,
        title: product.title
      });
    }
  }
};

const emitNewOrder = (req, order) => {
  const io = req.app.get('socketio');
  if (io) {
    io.emit('newOrder', order);
  }
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res) => {
  const { items, paymentIntentId, paymentStatus, totalAmount, shippingAddress, walletUsed } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: 'No order items' });
  }

  if (!global.isDbConnected) {
    // 1. Verify stock count
    for (const item of items) {
      const product = memoryProducts.find(p => p._id === item.productId);
      if (!product) return res.status(404).json({ message: `Product ${item.title} not found` });
      if (product.inventoryCount < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.title}` });
      }
    }

    // 2. Decrement stock
    for (const item of items) {
      const product = memoryProducts.find(p => p._id === item.productId);
      product.inventoryCount -= item.quantity;
      emitInventoryUpdate(req, product);
    }

    // 3. Debit wallet & credit loyalty points
    const user = memoryUsers.find(u => u._id === req.user._id);
    const pointsEarned = Math.round(totalAmount * 0.1);
    if (user) {
      if (walletUsed && walletUsed > 0) {
        user.walletBalance = Math.max(0, user.walletBalance - Number(walletUsed));
      }
      user.loyaltyPoints += pointsEarned;
    }

    // 4. Create Notification
    memoryNotifications.push({
      _id: `notif_${Math.random().toString(36).substring(2, 9)}`,
      userId: req.user._id,
      title: 'Order Placed Successfully!',
      message: `Your order for $${totalAmount.toFixed(2)} has been placed. You earned ${pointsEarned} loyalty points.`,
      type: 'success',
      readStatus: false,
      createdAt: new Date()
    });

    const newOrder = {
      _id: `ord_${Math.random().toString(36).substring(2, 9)}`,
      userId: { _id: req.user._id, name: req.user.name },
      items,
      paymentIntentId,
      paymentStatus: paymentStatus || 'pending',
      orderStatus: 'Processing',
      totalAmount,
      shippingAddress,
      createdAt: new Date()
    };
    memoryOrders.push(newOrder);
    emitNewOrder(req, newOrder);
    return res.status(201).json(newOrder);
  }

  try {
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Product ${item.title} not found` });
      }
      if (product.inventoryCount < item.quantity) {
        return res.status(400).json({
          message: `Insufficient inventory for ${product.title}. Only ${product.inventoryCount} left.`
        });
      }
    }

    for (const item of items) {
      const product = await Product.findById(item.productId);
      product.inventoryCount -= item.quantity;
      await product.save();
      emitInventoryUpdate(req, product);
    }

    const user = await User.findById(req.user._id);
    if (user) {
      if (req.body.walletUsed && req.body.walletUsed > 0) {
        user.walletBalance = Math.max(0, user.walletBalance - Number(req.body.walletUsed));
      }
      const pointsEarned = Math.round(totalAmount * 0.1);
      user.loyaltyPoints += pointsEarned;
      await user.save();

      await Notification.create({
        userId: user._id,
        title: 'Order Placed Successfully!',
        message: `Your order for $${totalAmount.toFixed(2)} has been placed. You earned ${pointsEarned} loyalty points.`,
        type: 'success'
      });
    }

    const order = new Order({
      userId: req.user._id,
      items,
      paymentIntentId,
      paymentStatus: paymentStatus || 'pending',
      totalAmount,
      shippingAddress
    });

    const createdOrder = await order.save();
    const orderPayload = {
      ...createdOrder.toObject(),
      userId: { _id: req.user._id, name: req.user.name }
    };
    emitNewOrder(req, orderPayload);
    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res) => {
  if (!global.isDbConnected) {
    const order = memoryOrders.find(o => o._id === req.params.id);
    if (order) {
      return res.json(order);
    }
    return res.status(404).json({ message: 'Order not found' });
  }

  try {
    const order = await Order.findById(req.params.id).populate('userId', 'name email');

    if (order) {
      if (order.userId._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to view this order' });
      }
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = async (req, res) => {
  if (!global.isDbConnected) {
    // Return matching user orders
    const list = memoryOrders.filter(o => {
      const oId = typeof o.userId === 'object' ? o.userId._id : o.userId;
      return oId === req.user._id;
    });
    // sort newest first
    return res.json(list.reverse());
  }

  try {
    const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/Admin
export const getOrders = async (req, res) => {
  if (!global.isDbConnected) {
    return res.json(memoryOrders);
  }

  try {
    const orders = await Order.find({}).populate('userId', 'id name').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res) => {
  const { status } = req.body;

  if (!global.isDbConnected) {
    const order = memoryOrders.find(o => o._id === req.params.id);
    if (order) {
      order.orderStatus = status;
      return res.json(order);
    }
    return res.status(404).json({ message: 'Order not found' });
  }

  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.orderStatus = status;
      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get analytics dashboard statistics (Admin)
// @route   GET /api/orders/analytics/stats
// @access  Private/Admin
export const getAnalyticsStats = async (req, res) => {
  if (!global.isDbConnected) {
    // Generate simulated analytics from memoryOrders
    const paidOrders = memoryOrders.filter(o => o.paymentStatus === 'paid');
    const totalRevenue = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const activeOrdersCount = memoryOrders.filter(o => o.orderStatus === 'Processing' || o.orderStatus === 'Shipped').length;
    const totalOrdersCount = memoryOrders.length;

    // Daily revenue (last 7 days)
    const dailyRevenueMap = {};
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const str = date.toISOString().split('T')[0];
      dailyRevenueMap[str] = { _id: str, revenue: 0, count: 0 };
    }

    paidOrders.forEach(o => {
      const str = new Date(o.createdAt).toISOString().split('T')[0];
      if (dailyRevenueMap[str]) {
        dailyRevenueMap[str].revenue += o.totalAmount;
        dailyRevenueMap[str].count += 1;
      }
    });

    const dailyRevenue = Object.values(dailyRevenueMap).reverse();

    // Top selling
    const productSalesMap = {};
    paidOrders.forEach(o => {
      o.items.forEach(i => {
        if (!productSalesMap[i.productId]) {
          productSalesMap[i.productId] = { _id: i.productId, title: i.title, quantitySold: 0, totalSales: 0 };
        }
        productSalesMap[i.productId].quantitySold += i.quantity;
        productSalesMap[i.productId].totalSales += i.price * i.quantity;
      });
    });
    const topProducts = Object.values(productSalesMap).sort((a, b) => b.quantitySold - a.quantitySold).slice(0, 5);

    // Fallback default
    if (topProducts.length === 0 && memoryProducts.length > 0) {
      topProducts.push({
        _id: memoryProducts[0]._id,
        title: memoryProducts[0].title,
        quantitySold: 4,
        totalSales: memoryProducts[0].price * 4
      });
    }

    return res.json({
      totalRevenue,
      activeOrdersCount,
      totalOrdersCount,
      dailyRevenue,
      topProducts
    });
  }

  try {
    const salesData = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = salesData.length > 0 ? salesData[0].totalRevenue : 0;

    const activeOrdersCount = await Order.countDocuments({
      orderStatus: { $in: ['Processing', 'Shipped'] }
    });

    const totalOrdersCount = await Order.countDocuments({});

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyRevenue = await Order.aggregate([
      {
        $match: {
          paymentStatus: 'paid',
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const topProducts = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          title: { $first: '$items.title' },
          quantitySold: { $sum: '$items.quantity' },
          totalSales: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $sort: { quantitySold: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      totalRevenue,
      activeOrdersCount,
      totalOrdersCount,
      dailyRevenue,
      topProducts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
