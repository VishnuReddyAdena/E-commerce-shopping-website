import Cart from '../models/Cart.js';
import { memoryCarts, memoryProducts } from '../config/memoryStore.js';

// @desc    Get current user's cart
// @route   GET /api/cart
// @access  Private
export const getCart = async (req, res) => {
  const userId = req.user._id.toString();

  if (!global.isDbConnected) {
    if (!memoryCarts[userId]) {
      memoryCarts[userId] = [];
    }
    // Populate items
    const items = memoryCarts[userId].map(item => {
      const product = memoryProducts.find(p => p._id === item.productId);
      return {
        _id: `item_${Math.random().toString(36).substring(2, 9)}`,
        productId: product,
        quantity: item.quantity
      };
    });
    return res.json({ userId, items });
  }

  try {
    let cart = await Cart.findOne({ userId: req.user._id }).populate({
      path: 'items.productId',
      select: 'title price images inventoryCount category ratings'
    });

    if (!cart) {
      cart = await Cart.create({ userId: req.user._id, items: [] });
    }

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update/sync cart items
// @route   PUT /api/cart
// @access  Private
export const updateCart = async (req, res) => {
  const { items } = req.body;
  const userId = req.user._id.toString();

  if (!global.isDbConnected) {
    memoryCarts[userId] = items.map(item => ({
      productId: item.productId,
      quantity: item.quantity
    }));
    // Return populated
    const populatedItems = memoryCarts[userId].map(item => {
      const product = memoryProducts.find(p => p._id === item.productId);
      return {
        _id: `item_${Math.random().toString(36).substring(2, 9)}`,
        productId: product,
        quantity: item.quantity
      };
    });
    return res.json({ userId, items: populatedItems });
  }

  try {
    let cart = await Cart.findOne({ userId: req.user._id });

    if (!cart) {
      cart = new Cart({ userId: req.user._id });
    }

    cart.items = items.map(item => ({
      productId: item.productId,
      quantity: item.quantity
    }));

    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate({
      path: 'items.productId',
      select: 'title price images inventoryCount category ratings'
    });

    res.json(populatedCart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
export const clearCart = async (req, res) => {
  const userId = req.user._id.toString();

  if (!global.isDbConnected) {
    memoryCarts[userId] = [];
    return res.json({ message: 'Cart cleared (sandbox)' });
  }

  try {
    let cart = await Cart.findOne({ userId: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    res.json({ message: 'Cart cleared' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
