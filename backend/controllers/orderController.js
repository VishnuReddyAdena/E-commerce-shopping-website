import { supabase } from '../config/supabase.js';
import { memoryOrders, memoryProducts, memoryUsers, memoryNotifications } from '../config/memoryStore.js';
import { realtimeService } from '../services/supabase.service.js';

// Map Postgres row to Mongoose structure
const mapOrderToFrontend = (order) => {
  if (!order) return null;
  return {
    _id: order.id,
    id: order.id,
    userId: order.profiles ? {
      _id: order.profiles.id,
      id: order.profiles.id,
      name: order.profiles.name,
      email: order.profiles.email
    } : order.user_id,
    items: order.items || [],
    paymentIntentId: order.payment_intent_id,
    paymentStatus: order.payment_status,
    orderStatus: order.order_status,
    totalAmount: Number(order.total_amount) || 0,
    shippingAddress: order.shipping_address || {},
    createdAt: order.created_at,
    updatedAt: order.updated_at
  };
};

const emitInventoryUpdate = (req, product) => {
  const io = req.app.get('socketio');
  if (io) {
    io.emit('inventoryUpdate', {
      productId: product.id || product._id,
      title: product.title,
      inventoryCount: product.inventory_count || product.inventoryCount
    });
  }
};

const emitNewOrder = async (req, order) => {
  const io = req.app.get('socketio');
  if (io) {
    io.emit('newOrder', order);
  }

  try {
    await realtimeService.broadcastEvent('e-commerce-notifications', 'newOrder', {
      orderId: order.id || order._id,
      totalAmount: order.totalAmount,
      userId: typeof order.userId === 'object' ? order.userId.id || order.userId._id : order.userId
    });
  } catch (err) {
    console.error('Supabase order broadcast failed:', err.message);
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
    // Sandbox Mode
    for (const item of items) {
      const product = memoryProducts.find(p => p._id === item.productId);
      if (!product) return res.status(404).json({ message: `Product ${item.title} not found` });
      if (product.inventoryCount < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.title}` });
      }
    }

    for (const item of items) {
      const product = memoryProducts.find(p => p._id === item.productId);
      product.inventoryCount -= item.quantity;
      emitInventoryUpdate(req, product);
    }

    const user = memoryUsers.find(u => u._id === req.user._id);
    const pointsEarned = Math.round(totalAmount * 0.1);
    if (user) {
      if (walletUsed && walletUsed > 0) {
        user.walletBalance = Math.max(0, user.walletBalance - Number(walletUsed));
      }
      user.loyaltyPoints += pointsEarned;
    }

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
    // 1. Verify stock count
    for (const item of items) {
      const { data: product } = await supabase
        .from('products')
        .select('*')
        .eq('id', item.productId)
        .maybeSingle();

      if (!product) {
        return res.status(404).json({ message: `Product ${item.title} not found` });
      }
      if (product.inventory_count < item.quantity) {
        return res.status(400).json({
          message: `Insufficient inventory for ${product.title}. Only ${product.inventory_count} left.`
        });
      }
    }

    // 2. Decrement stock
    for (const item of items) {
      const { data: product } = await supabase
        .from('products')
        .select('*')
        .eq('id', item.productId)
        .maybeSingle();

      const newStock = product.inventory_count - item.quantity;
      
      const { data: updatedProduct } = await supabase
        .from('products')
        .update({ inventory_count: newStock })
        .eq('id', product.id)
        .select()
        .single();

      emitInventoryUpdate(req, updatedProduct);
    }

    // 3. Update User Wallet and loyalty points
    const { data: user } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.user._id)
      .maybeSingle();

    if (user) {
      const currentWallet = Number(user.wallet_balance) || 0;
      const finalWallet = Math.max(0, currentWallet - (Number(walletUsed) || 0));
      const pointsEarned = Math.round(totalAmount * 0.1);
      const finalPoints = (user.loyalty_points || 0) + pointsEarned;

      await supabase
        .from('profiles')
        .update({
          wallet_balance: finalWallet,
          loyalty_points: finalPoints
        })
        .eq('id', user.id);

      await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          title: 'Order Placed Successfully!',
          message: `Your order for $${totalAmount.toFixed(2)} has been placed. You earned ${pointsEarned} loyalty points.`,
          type: 'success'
        });
    }

    // 4. Create Order
    const { data: createdOrder, error: createError } = await supabase
      .from('orders')
      .insert({
        user_id: req.user._id,
        items,
        payment_intent_id: paymentIntentId,
        payment_status: paymentStatus || 'pending',
        order_status: 'Processing',
        total_amount: Number(totalAmount),
        shipping_address: shippingAddress
      })
      .select()
      .single();

    if (createError) throw createError;

    const orderPayload = {
      ...mapOrderToFrontend(createdOrder),
      userId: { _id: req.user._id, name: req.user.name }
    };
    
    emitNewOrder(req, orderPayload);
    res.status(201).json(mapOrderToFrontend(createdOrder));
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
    const { data: order, error } = await supabase
      .from('orders')
      .select('*, profiles:user_id(id, name, email)')
      .eq('id', req.params.id)
      .maybeSingle();

    if (error) throw error;

    if (order) {
      const frontendOrder = mapOrderToFrontend(order);
      const orderUserId = typeof frontendOrder.userId === 'object' ? frontendOrder.userId.id : frontendOrder.userId;
      
      if (orderUserId !== req.user._id && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to view this order' });
      }
      res.json(frontendOrder);
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
    const list = memoryOrders.filter(o => {
      const oId = typeof o.userId === 'object' ? o.userId._id : o.userId;
      return oId === req.user._id;
    });
    return res.json(list.reverse());
  }

  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', req.user._id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(orders.map(mapOrderToFrontend));
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
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*, profiles:user_id(id, name, email)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(orders.map(mapOrderToFrontend));
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
      try {
        if (status === 'Delivered') {
          realtimeService.broadcastEvent('e-commerce-notifications', 'orderDelivered', {
            orderId: order._id,
            userId: typeof order.userId === 'object' ? order.userId._id : order.userId
          });
        }
        realtimeService.broadcastEvent('e-commerce-realtime', 'orderTracking', {
          orderId: order._id,
          status: status,
          userId: typeof order.userId === 'object' ? order.userId._id : order.userId
        });
      } catch (err) {
        console.error('Realtime status update failed (sandbox):', err.message);
      }
      return res.json(order);
    }
    return res.status(404).json({ message: 'Order not found' });
  }

  try {
    const { data: updatedOrder, error } = await supabase
      .from('orders')
      .update({ order_status: status })
      .eq('id', req.params.id)
      .select('*, profiles:user_id(id, name, email)')
      .single();

    if (error) throw error;

    if (updatedOrder) {
      try {
        if (status === 'Delivered') {
          await realtimeService.broadcastEvent('e-commerce-notifications', 'orderDelivered', {
            orderId: updatedOrder.id,
            userId: updatedOrder.user_id
          });
        }
        await realtimeService.broadcastEvent('e-commerce-realtime', 'orderTracking', {
          orderId: updatedOrder.id,
          status: status,
          userId: updatedOrder.user_id
        });
      } catch (err) {
        console.error('Supabase status update broadcast failed:', err.message);
      }

      res.json(mapOrderToFrontend(updatedOrder));
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
    // Sandbox analytical generator
    const paidOrders = memoryOrders.filter(o => o.paymentStatus === 'paid');
    const totalRevenue = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const activeOrdersCount = memoryOrders.filter(o => o.orderStatus === 'Processing' || o.orderStatus === 'Shipped').length;
    const totalOrdersCount = memoryOrders.length;

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
    // Fetch paid and all orders
    const { data: paidOrders, error: paidErr } = await supabase
      .from('orders')
      .select('*')
      .eq('payment_status', 'paid');
    
    if (paidErr) throw paidErr;

    const { data: allOrders, error: allErr } = await supabase
      .from('orders')
      .select('id, order_status');
    
    if (allErr) throw allErr;

    const totalRevenue = paidOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);
    const activeOrdersCount = allOrders.filter(o => o.order_status === 'Processing' || o.order_status === 'Shipped').length;
    const totalOrdersCount = allOrders.length;

    // Daily revenue (last 7 days)
    const dailyRevenueMap = {};
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const str = date.toISOString().split('T')[0];
      dailyRevenueMap[str] = { _id: str, revenue: 0, count: 0 };
    }

    paidOrders.forEach(o => {
      const dateStr = new Date(o.created_at).toISOString().split('T')[0];
      if (dailyRevenueMap[dateStr]) {
        dailyRevenueMap[dateStr].revenue += Number(o.total_amount);
        dailyRevenueMap[dateStr].count += 1;
      }
    });

    const dailyRevenue = Object.values(dailyRevenueMap).reverse();

    // Top selling products
    const productSalesMap = {};
    paidOrders.forEach(o => {
      if (Array.isArray(o.items)) {
        o.items.forEach(i => {
          if (!productSalesMap[i.productId]) {
            productSalesMap[i.productId] = { _id: i.productId, title: i.title, quantitySold: 0, totalSales: 0 };
          }
          productSalesMap[i.productId].quantitySold += Number(i.quantity) || 0;
          productSalesMap[i.productId].totalSales += (Number(i.price) || 0) * (Number(i.quantity) || 0);
        });
      }
    });

    const topProducts = Object.values(productSalesMap)
      .sort((a, b) => b.quantitySold - a.quantitySold)
      .slice(0, 5);

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
