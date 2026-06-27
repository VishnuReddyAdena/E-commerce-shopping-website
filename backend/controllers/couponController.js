import Coupon from '../models/Coupon.js';
import { memoryCoupons } from '../config/memoryStore.js';

// @desc    Get all coupons (Admin)
// @route   GET /api/coupons
// @access  Private/Admin
export const getCoupons = async (req, res) => {
  if (!global.isDbConnected) {
    return res.json(memoryCoupons);
  }
  try {
    const coupons = await Coupon.find({});
    res.json(coupons);
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
    const couponExists = await Coupon.findOne({ code: code.toUpperCase() });
    if (couponExists) {
      return res.status(400).json({ message: 'Coupon code already exists' });
    }

    const coupon = new Coupon({
      code: code.toUpperCase(),
      discountType,
      discountValue,
      expiryDate,
      usageLimit
    });

    const createdCoupon = await coupon.save();
    res.status(201).json(createdCoupon);
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
    const coupon = await Coupon.findById(req.params.id);
    if (coupon) {
      await coupon.deleteOne();
      res.json({ message: 'Coupon removed' });
    } else {
      res.status(404).json({ message: 'Coupon not found' });
    }
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

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      return res.status(404).json({ message: 'Invalid coupon code' });
    }

    if (new Date() > new Date(coupon.expiryDate)) {
      return res.status(400).json({ message: 'Coupon has expired' });
    }

    if (coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ message: 'Coupon usage limit has been reached' });
    }

    res.json({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
