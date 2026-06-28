import express from 'express';
import { protect } from '../middleware/auth.js';
import { supabase } from '../config/supabase.js';
import { memoryCoupons } from '../config/memoryStore.js';

const router = express.Router();

// Map Postgres profile row to frontend expected format
const mapProfileToUser = (profile) => {
  if (!profile) return null;
  return {
    _id: profile.id,
    id: profile.id,
    supabaseId: profile.id,
    name: profile.name,
    email: profile.email,
    role: profile.role,
    country: profile.country,
    avatarUrl: profile.avatar_url,
    shippingAddresses: profile.shipping_addresses || [],
    wishlist: profile.wishlist || [],
    walletBalance: Number(profile.wallet_balance) || 0,
    loyaltyPoints: profile.loyalty_points || 0,
    referralCode: profile.referral_code,
    referredBy: profile.referred_by,
    isBanned: profile.is_banned,
    createdAt: profile.created_at,
    updatedAt: profile.updated_at
  };
};

const mapProductToFrontend = (prod) => {
  if (!prod) return null;
  return {
    _id: prod.id,
    id: prod.id,
    title: prod.title,
    description: prod.description,
    price: Number(prod.price) || 0,
    category: prod.category,
    subCategory: prod.sub_category,
    images: prod.images || [],
    videos: prod.videos || [],
    inventoryCount: prod.inventory_count || 0,
    ratings: {
      average: Number(prod.rating_average) || 0,
      count: prod.rating_count || 0
    },
    reviews: prod.reviews || [],
    brand: prod.brand || 'Generic',
    colors: prod.colors || [],
    sizes: prod.sizes || [],
    specifications: prod.specifications || {},
    variants: prod.variants || [],
    isFlashSale: prod.is_flash_sale || false,
    flashSalePrice: prod.flash_sale_price ? Number(prod.flash_sale_price) : undefined,
    createdAt: prod.created_at,
    updatedAt: prod.updated_at
  };
};

const populateUserWishlist = async (profile) => {
  const mapped = mapProfileToUser(profile);
  if (!mapped) return null;
  
  const wishlistIds = mapped.wishlist || [];
  if (wishlistIds.length === 0) {
    mapped.wishlist = [];
    return mapped;
  }
  
  const { data: products } = await supabase.from('products').select('*').in('id', wishlistIds);
  if (products) {
    mapped.wishlist = products.map(mapProductToFrontend);
  } else {
    mapped.wishlist = [];
  }
  return mapped;
};

// Mock fallback store for Returns, Gift Cards, and Rewards
let mockReturnsStore = [
  { _id: 'ret1', orderId: 'ord123', status: 'Pending', refundAmount: 1299, refundMethod: 'UPI Wallet', expectedDate: '2026-07-02', reason: 'Size did not fit well', items: [{ title: 'Calfskin Premium Backpack', quantity: 1 }] },
  { _id: 'ret2', orderId: 'ord456', status: 'Approved', refundAmount: 549, refundMethod: 'Card refund', expectedDate: '2026-06-25', reason: 'Defective item', items: [{ title: 'USB-C Fast Charging Hub', quantity: 1 }] }
];

let mockGiftCardsStore = {
  balance: 2500,
  purchased: [
    { code: 'NEXAGIFT500', value: 500, status: 'Active', sentTo: 'friend@example.com', date: '2026-05-12' },
    { code: 'VALENTINE1000', value: 1000, status: 'Redeemed', sentTo: 'self', date: '2026-02-14' }
  ],
  received: [
    { code: 'BIRTHDAY2000', value: 2000, status: 'Redeemed', sender: 'mom@example.com', date: '2026-06-01' }
  ]
};

let mockRewardsStore = {
  points: 450,
  tier: 'Gold',
  history: [
    { action: 'Welcome bonus credit', points: 100, type: 'earned', date: '2026-01-10' },
    { action: 'Product purchase - Order #123', points: 350, type: 'earned', date: '2026-06-15' }
  ],
  achievements: [
    { title: 'Super Shopper', desc: 'Placed 5 orders in a month', badge: '🏆' },
    { title: 'Elite Member', desc: 'Reached Gold Loyalty Tier', badge: '🎖️' }
  ]
};

// Profile APIs
router.get('/profile', protect, async (req, res) => {
  if (!global.isDbConnected) {
    return res.json({
      success: true,
      profile: req.user,
      walletBalance: req.user.walletBalance || 100,
      loyaltyPoints: req.user.loyaltyPoints || 10,
      membershipTier: (req.user.loyaltyPoints || 0) > 500 ? 'Platinum' : (req.user.loyaltyPoints || 0) > 100 ? 'Gold' : 'Silver'
    });
  }
  try {
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', req.user._id).single();
    const populated = await populateUserWishlist(profile);
    res.json({
      success: true,
      profile: populated,
      walletBalance: populated.walletBalance,
      loyaltyPoints: populated.loyaltyPoints,
      membershipTier: populated.loyaltyPoints > 500 ? 'Platinum' : populated.loyaltyPoints > 100 ? 'Gold' : 'Silver'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/profile', protect, async (req, res) => {
  if (!global.isDbConnected) {
    const { memoryUsers } = await import('../config/memoryStore.js');
    const user = memoryUsers.find(u => u._id === req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.country = req.body.country || user.country;
    if (req.body.avatarUrl) user.avatarUrl = req.body.avatarUrl;
    return res.json({ success: true, profile: user });
  }
  try {
    const updateFields = {};
    if (req.body.name) updateFields.name = req.body.name;
    if (req.body.email) updateFields.email = req.body.email;
    if (req.body.country) updateFields.country = req.body.country;
    if (req.body.avatarUrl) updateFields.avatar_url = req.body.avatarUrl;

    const { data: updated, error } = await supabase.from('profiles').update(updateFields).eq('id', req.user._id).select().single();
    if (error) throw error;
    res.json({ success: true, profile: mapProfileToUser(updated) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Returns & Refunds APIs
router.get('/returns', protect, async (req, res) => {
  res.json({
    success: true,
    returns: mockReturnsStore
  });
});

router.post('/returns', protect, async (req, res) => {
  const { orderId, reason, refundMethod, refundAmount, items } = req.body;
  const newReturn = {
    _id: 'ret_' + Math.random().toString(36).substr(2, 9),
    orderId,
    status: 'Pending',
    refundAmount: refundAmount || 999,
    refundMethod: refundMethod || 'Wallet',
    expectedDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    reason,
    items: items || [{ title: 'Product Item', quantity: 1 }]
  };
  mockReturnsStore.unshift(newReturn);
  res.json({ success: true, message: 'Return request submitted successfully', newReturn });
});

// Wishlist APIs
router.get('/wishlist', protect, async (req, res) => {
  if (!global.isDbConnected) {
    const { memoryProducts } = await import('../config/memoryStore.js');
    const wishListItems = memoryProducts.filter(p => req.user.wishlist.includes(p._id));
    return res.json(wishListItems);
  }
  try {
    const { data: profile } = await supabase.from('profiles').select('wishlist').eq('id', req.user._id).single();
    const populated = await populateUserWishlist(profile);
    res.json(populated.wishlist || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/wishlist', protect, async (req, res) => {
  const { productId } = req.body;
  if (!global.isDbConnected) {
    const { memoryUsers, memoryProducts } = await import('../config/memoryStore.js');
    const user = memoryUsers.find(u => u._id === req.user._id);
    if (!user.wishlist.includes(productId)) {
      user.wishlist.push(productId);
    }
    const list = memoryProducts.filter(p => user.wishlist.includes(p._id));
    return res.json({ success: true, wishlist: list });
  }
  try {
    const { data: profile } = await supabase.from('profiles').select('wishlist').eq('id', req.user._id).single();
    let wishlist = profile.wishlist || [];
    if (!wishlist.includes(productId)) {
      wishlist.push(productId);
      await supabase.from('profiles').update({ wishlist }).eq('id', req.user._id);
    }
    const populated = await populateUserWishlist({ ...profile, wishlist });
    res.json({ success: true, wishlist: populated.wishlist });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/wishlist/:productId', protect, async (req, res) => {
  const { productId } = req.params;
  if (!global.isDbConnected) {
    const { memoryUsers, memoryProducts } = await import('../config/memoryStore.js');
    const user = memoryUsers.find(u => u._id === req.user._id);
    user.wishlist = user.wishlist.filter(id => id !== productId);
    const list = memoryProducts.filter(p => user.wishlist.includes(p._id));
    return res.json({ success: true, wishlist: list });
  }
  try {
    const { data: profile } = await supabase.from('profiles').select('wishlist').eq('id', req.user._id).single();
    let wishlist = profile.wishlist || [];
    wishlist = wishlist.filter(id => id !== productId);
    await supabase.from('profiles').update({ wishlist }).eq('id', req.user._id);
    const populated = await populateUserWishlist({ ...profile, wishlist });
    res.json({ success: true, wishlist: populated.wishlist });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Coupons APIs
router.get('/coupons', protect, async (req, res) => {
  try {
    const coupons = [
      { code: 'NEXASAVE20', discount: '20% OFF', expiry: '2026-12-31', minOrder: 1500, details: 'Valid on electronics & fashion category purchases.' },
      { code: 'UPGRADE500', discount: '₹500 Flat OFF', expiry: '2026-10-15', minOrder: 4999, details: 'Flat discount applicable on order total above ₹4,999.' },
      { code: 'WELCOME100', discount: '₹100 Flat OFF', expiry: '2026-08-30', minOrder: 500, details: 'Exclusive coupon for new signups on NexaCart.' }
    ];
    res.json({
      success: true,
      available: coupons,
      used: [
        { code: 'FESTIVE50', discount: '₹50 OFF', expiry: '2026-04-10', minOrder: 300, details: 'Festival checkout coupon.' }
      ],
      expired: [
        { code: 'LAUNCH10', discount: '10% OFF', expiry: '2026-01-01', minOrder: 100, details: 'Grand opening coupon launch.' }
      ]
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Gift Cards APIs
router.get('/giftcards', protect, async (req, res) => {
  res.json({
    success: true,
    giftCards: mockGiftCardsStore
  });
});

router.post('/giftcards/redeem', protect, async (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ message: 'Gift card code is required' });

  if (code.toUpperCase() === 'NEXAGIFT500') {
    mockGiftCardsStore.balance += 500;
    mockGiftCardsStore.purchased = mockGiftCardsStore.purchased.map(c => 
      c.code === 'NEXAGIFT500' ? { ...c, status: 'Redeemed' } : c
    );
    try {
      if (!global.isDbConnected) {
        const { memoryUsers } = await import('../config/memoryStore.js');
        const user = memoryUsers.find(u => u._id === req.user._id);
        user.walletBalance = (user.walletBalance || 0) + 500;
      } else {
        const { data: user } = await supabase.from('profiles').select('*').eq('id', req.user._id).single();
        await supabase.from('profiles').update({ wallet_balance: (Number(user.wallet_balance) || 0) + 500 }).eq('id', req.user._id);
      }
    } catch {}
    
    return res.json({ success: true, message: '₹500 successfully added to your wallet balance!', balance: mockGiftCardsStore.balance });
  }

  res.status(400).json({ message: 'Invalid or already redeemed gift card voucher code.' });
});

router.post('/giftcards/buy', protect, async (req, res) => {
  const { value, email } = req.body;
  if (!value || isNaN(value)) return res.status(400).json({ message: 'Valid gift card value is required' });

  const code = 'GIFT' + Math.random().toString(36).substr(2, 8).toUpperCase();
  const card = {
    code,
    value: Number(value),
    status: 'Active',
    sentTo: email || 'self',
    date: new Date().toISOString().split('T')[0]
  };
  mockGiftCardsStore.purchased.unshift(card);
  res.json({ success: true, message: `Gift Card ${code} purchased successfully!`, card });
});

// Rewards APIs
router.get('/rewards', protect, async (req, res) => {
  try {
    let pts = 120;
    if (!global.isDbConnected) {
      pts = req.user.loyaltyPoints;
    } else {
      const { data: user } = await supabase.from('profiles').select('loyalty_points').eq('id', req.user._id).single();
      pts = user ? user.loyalty_points : 120;
    }
    res.json({
      success: true,
      rewards: {
        points: pts,
        tier: pts > 500 ? 'Platinum' : pts > 100 ? 'Gold' : 'Silver',
        history: mockRewardsStore.history,
        achievements: mockRewardsStore.achievements
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Deals module listing endpoints
router.get('/deals/today', async (req, res) => {
  try {
    if (!global.isDbConnected) {
      const items = await getFallbackDeals('Today\'s Deals');
      return res.json(items);
    }
    const { data: items } = await supabase.from('products').select('*').or('is_flash_sale.eq.true,price.lt.200').limit(12);
    res.json(items.length > 0 ? items.map(mapProductToFrontend) : (await getFallbackDeals('Today\'s Deals')).map(mapProductToFrontend));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/deals/flash-sale', async (req, res) => {
  try {
    if (!global.isDbConnected) {
      const items = await getFallbackDeals('Flash Sale');
      return res.json(items);
    }
    const { data: items } = await supabase.from('products').select('*').eq('is_flash_sale', true).limit(12);
    res.json(items.length > 0 ? items.map(mapProductToFrontend) : (await getFallbackDeals('Flash Sale')).map(mapProductToFrontend));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/deals/best-sellers', async (req, res) => {
  try {
    if (!global.isDbConnected) {
      const items = await getFallbackDeals('Best Sellers');
      return res.json(items);
    }
    const { data: items } = await supabase.from('products').select('*').order('rating_average', { ascending: false }).limit(12);
    res.json(items.length > 0 ? items.map(mapProductToFrontend) : (await getFallbackDeals('Best Sellers')).map(mapProductToFrontend));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/deals/trending', async (req, res) => {
  try {
    if (!global.isDbConnected) {
      const items = await getFallbackDeals('Trending');
      return res.json(items);
    }
    const { data: items } = await supabase.from('products').select('*').order('created_at', { ascending: false }).limit(12);
    res.json(items.length > 0 ? items.map(mapProductToFrontend) : (await getFallbackDeals('Trending')).map(mapProductToFrontend));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/deals/clearance', async (req, res) => {
  try {
    if (!global.isDbConnected) {
      const items = await getFallbackDeals('Clearance');
      return res.json(items);
    }
    const { data: items } = await supabase.from('products').select('*').lt('price', 500).limit(12);
    res.json(items.length > 0 ? items.map(mapProductToFrontend) : (await getFallbackDeals('Clearance')).map(mapProductToFrontend));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Helper for generating custom catalog results if database lacks active products
async function getFallbackDeals(type) {
  const { memoryProducts } = await import('../config/memoryStore.js');
  if (type === 'Flash Sale') {
    return memoryProducts.filter(p => p.isFlashSale);
  }
  if (type === 'Best Sellers') {
    return [...memoryProducts].sort((a,b) => b.ratings.average - a.ratings.average);
  }
  if (type === 'Trending') {
    return [...memoryProducts].slice(0, 10);
  }
  if (type === 'Clearance') {
    return memoryProducts.filter(p => p.price < 500);
  }
  return memoryProducts;
}

export default router;
