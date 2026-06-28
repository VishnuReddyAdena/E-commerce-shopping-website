import { supabase } from '../config/supabase.js';
import { memoryCoupons } from '../config/memoryStore.js';

// Map Postgres row to Mongoose structure
const mapCouponToFrontend = (coup) => {
  if (!coup) return null;
  return {
    _id: coup.id,
    id: coup.id,
    code: coup.code,
    discountType: coup.type,
    discountValue: Number(coup.value) || 0,
    isActive: coup.is_active !== undefined ? coup.is_active : true,
    expiryDate: coup.expiry_date,
    usageLimit: coup.usage_limit || 9999,
    usedCount: coup.used_count || 0,
    createdAt: coup.created_at
  };
};

// @desc    Get all coupons (Admin)
// @route   GET /api/coupons
// @access  Private/Admin
export const getCoupons = async (req, res) => {
  if (!global.isDbConnected) {
    return res.json(memoryCoupons);
  }
  try {
    const { data: coupons, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(coupons.map(mapCouponToFrontend));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a coupon (Admin)
// @route   POST /api/coupons
// @access  Private/Admin
export const createCoupon = async (req, res) => {
  const { code, discountType, discountValue, expiryDate, usageLimit } = req.body;

  if (!global.isDbConnected) {
    const couponExists = memoryCoupons.find(c => c.code === code.toUpperCase());
    if (couponExists) {
      return res.status(400).json({ message: 'Coupon code already exists' });
    }
    const created = {
      _id: `coup_${Math.random().toString(36).substring(2, 9)}`,
      code: code.toUpperCase(),
      discountType,
      discountValue,
      expiryDate: new Date(expiryDate),
      usageLimit: Number(usageLimit),
      usedCount: 0
    };
    memoryCoupons.push(created);
    return res.status(201).json(created);
  }

  try {
    const { data: couponExists } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase())
      .maybeSingle();

    if (couponExists) {
      return res.status(400).json({ message: 'Coupon code already exists' });
    }

    const { data: createdCoupon, error } = await supabase
      .from('coupons')
      .insert({
        code: code.toUpperCase(),
        type: discountType,
        value: Number(discountValue),
        expiry_date: expiryDate
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(mapCouponToFrontend(createdCoupon));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a coupon (Admin)
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
export const deleteCoupon = async (req, res) => {
  if (!global.isDbConnected) {
    const idx = memoryCoupons.findIndex(c => c._id === req.params.id);
    if (idx > -1) {
      memoryCoupons.splice(idx, 1);
      return res.json({ message: 'Coupon removed (sandbox)' });
    }
    return res.status(404).json({ message: 'Coupon not found' });
  }

  try {
    const { error } = await supabase
      .from('coupons')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ message: 'Coupon removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Validate a coupon code during checkout
// @route   POST /api/coupons/validate
// @access  Private
export const validateCoupon = async (req, res) => {
  const { code } = req.body;

  if (!global.isDbConnected) {
    const coupon = memoryCoupons.find(c => c.code === code.toUpperCase());
    if (!coupon) {
      return res.status(404).json({ message: 'Invalid coupon code (sandbox)' });
    }
    if (new Date() > new Date(coupon.expiryDate)) {
      return res.status(400).json({ message: 'Coupon has expired (sandbox)' });
    }
    if (coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ message: 'Coupon limit reached' });
    }
    return res.json({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue
    });
  }

  try {
    if (!code) {
      return res.status(400).json({ message: 'Coupon code is required' });
    }

    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase())
      .maybeSingle();

    if (error) throw error;

    if (!coupon) {
      return res.status(404).json({ message: 'Invalid coupon code' });
    }

    if (new Date() > new Date(coupon.expiry_date)) {
      return res.status(400).json({ message: 'Coupon has expired' });
    }

    const usedCount = coupon.used_count || 0;
    const usageLimit = coupon.usage_limit || 9999;
    if (usedCount >= usageLimit) {
      return res.status(400).json({ message: 'Coupon usage limit has been reached' });
    }

    res.json({
      code: coupon.code,
      discountType: coupon.type,
      discountValue: Number(coupon.value)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
