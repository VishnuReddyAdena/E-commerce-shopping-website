import { supabase } from '../config/supabase.js';
import { memoryCarts, memoryProducts } from '../config/memoryStore.js';

// Helper to populate product details in cart items
const populateCartItems = async (items) => {
  if (!items || items.length === 0) return [];
  const productIds = items.map(item => item.productId).filter(Boolean);
  
  if (productIds.length === 0) return [];

  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .in('id', productIds);

  if (error || !products) return [];

  return items.map(item => {
    const prod = products.find(p => p.id === item.productId);
    return {
      _id: item.productId,
      productId: prod ? {
        _id: prod.id,
        id: prod.id,
        title: prod.title,
        price: Number(prod.price) || 0,
        images: prod.images || [],
        inventoryCount: prod.inventory_count || 0,
        category: prod.category,
        ratings: {
          average: Number(prod.rating_average) || 0,
          count: prod.rating_count || 0
        }
      } : null,
      quantity: item.quantity
    };
  });
};

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
    let { data: cart, error } = await supabase
      .from('carts')
      .select('*')
      .eq('user_id', req.user._id)
      .maybeSingle();

    if (error) throw error;

    if (!cart) {
      const { data: newCart, error: createError } = await supabase
        .from('carts')
        .insert({ user_id: req.user._id, items: [] })
        .select()
        .single();
      if (createError) throw createError;
      cart = newCart;
    }

    const populatedItems = await populateCartItems(cart.items);

    res.json({
      _id: cart.id,
      userId: cart.user_id,
      items: populatedItems,
      updatedAt: cart.updated_at
    });
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
    const cartItems = items.map(item => ({
      productId: item.productId,
      quantity: item.quantity
    }));

    const { data: cart, error } = await supabase
      .from('carts')
      .upsert({ user_id: req.user._id, items: cartItems }, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) throw error;

    const populatedItems = await populateCartItems(cart.items);

    res.json({
      _id: cart.id,
      userId: cart.user_id,
      items: populatedItems,
      updatedAt: cart.updated_at
    });
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
    const { error } = await supabase
      .from('carts')
      .update({ items: [] })
      .eq('user_id', req.user._id);

    if (error) throw error;
    res.json({ message: 'Cart cleared' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
