import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { OAuth2Client } from 'google-auth-library';
import { memoryUsers } from '../config/memoryStore.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallbacksecret', { expiresIn: '30d' });
};

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const sendEmail = async (options) => {
  console.log('\n--- MOCK EMAIL ---');
  console.log(`To: ${options.email}`);
  console.log(`Subject: ${options.subject}`);
  console.log(`Message: ${options.message}`);
  console.log('------------------\n');
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  const { name, email, password, role, referralCodeApplied, country } = req.body;

  if (!global.isDbConnected) {
    const userExists = memoryUsers.find(u => u.email === email);
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    let referrerId = null;
    if (referralCodeApplied) {
      const referrer = memoryUsers.find(u => u.referralCode === referralCodeApplied.toUpperCase());
      if (referrer) {
        referrerId = referrer._id;
        referrer.walletBalance += 50;
        referrer.loyaltyPoints += 20;
      }
    }

    const newUser = {
      _id: `user_${Math.random().toString(36).substring(2, 9)}`,
      name,
      email,
      password, // Sandbox mode uses plain text for ease
      role: role || 'user',
      country: country || 'India',
      isEmailVerified: true, // Auto verify in sandbox
      shippingAddresses: [],
      wishlist: [],
      walletBalance: referrerId ? 150 : 100,
      loyaltyPoints: 10,
      referralCode: 'REF-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
      referredBy: referrerId,
      isBanned: false
    };
    memoryUsers.push(newUser);
    return res.status(201).json({ message: 'Sandbox registration successful. Email auto-verified.' });
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(verificationToken).digest('hex');

    let referrerId = null;
    if (referralCodeApplied) {
      const referrer = await User.findOne({ referralCode: referralCodeApplied.toUpperCase() });
      if (referrer) {
        referrerId = referrer._id;
        referrer.walletBalance += 50;
        referrer.loyaltyPoints += 20;
        await referrer.save();
      }
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'user',
      country: country || 'India',
      emailVerificationToken: tokenHash,
      emailVerificationExpires: Date.now() + 24 * 60 * 60 * 1000,
      referralCode: 'REF-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
      referredBy: referrerId,
      walletBalance: referrerId ? 150 : 100
    });

    const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email/${verificationToken}`;
    const message = `Verify your email: ${verifyUrl}`;
    await sendEmail({ email: user.email, subject: 'Email Verification', message });
    res.status(201).json({ message: 'Registration successful. Verify email link sent.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify email token
// @route   POST /api/auth/verify-email
// @access  Public
export const verifyEmail = async (req, res) => {
  const { token } = req.body;
  if (!global.isDbConnected) {
    return res.json({ message: 'Email verified successfully (sandbox).' });
  }

  try {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      emailVerificationToken: tokenHash,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();
    res.json({ message: 'Email verified successfully. You can now login.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!global.isDbConnected) {
    const user = memoryUsers.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    if (user.isBanned) {
      return res.status(403).json({ message: 'Your account has been banned. Please contact support.' });
    }
    if (user.password === password) {
      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
        country: user.country || 'India',
        shippingAddresses: user.shippingAddresses,
        wishlist: user.wishlist,
        walletBalance: user.walletBalance,
        loyaltyPoints: user.loyaltyPoints,
        referralCode: user.referralCode
      });
    }
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    if (!user.isEmailVerified) {
      return res.status(403).json({ message: 'Please verify email before logging in.' });
    }
    if (user.isBanned) {
      return res.status(403).json({ message: 'Your account has been banned. Please contact support.' });
    }

    if (await user.comparePassword(password)) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
        country: user.country || 'India',
        shippingAddresses: user.shippingAddresses,
        wishlist: user.wishlist,
        walletBalance: user.walletBalance,
        loyaltyPoints: user.loyaltyPoints,
        referralCode: user.referralCode
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Google OAuth
export const googleAuth = async (req, res) => {
  return res.status(501).json({ message: 'Google OAuth not supported in sandbox failover.' });
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  if (!global.isDbConnected) {
    const user = memoryUsers.find(u => u._id === req.user._id);
    if (user) return res.json(user);
    return res.status(404).json({ message: 'User not found' });
  }

  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Forgot Password
export const forgotPassword = async (req, res) => {
  res.json({ message: 'Password reset link sent (simulated).' });
};

export const resetPassword = async (req, res) => {
  res.json({ message: 'Password has been reset (simulated).' });
};

// @desc    Add shipping address
// @route   POST /api/auth/addresses
// @access  Private
export const addShippingAddress = async (req, res) => {
  const { street, city, state, zip, country, isDefault } = req.body;

  if (!global.isDbConnected) {
    const user = memoryUsers.find(u => u._id === req.user._id);
    if (user) {
      if (isDefault) {
        user.shippingAddresses.forEach(a => a.isDefault = false);
      }
      const newAddress = {
        _id: `addr_${Math.random().toString(36).substring(2, 9)}`,
        street, city, state, zip, country, isDefault
      };
      user.shippingAddresses.push(newAddress);
      return res.status(201).json(user.shippingAddresses);
    }
    return res.status(404).json({ message: 'User not found' });
  }

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (isDefault) {
      user.shippingAddresses.forEach(addr => addr.isDefault = false);
    }
    user.shippingAddresses.push({ street, city, state, zip, country, isDefault });
    await user.save();
    res.status(201).json(user.shippingAddresses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle wishlist product
// @route   POST /api/auth/wishlist
// @access  Private
export const toggleWishlist = async (req, res) => {
  const { productId } = req.body;

  if (!global.isDbConnected) {
    const user = memoryUsers.find(u => u._id === req.user._id);
    if (user) {
      const idx = user.wishlist.indexOf(productId);
      if (idx > -1) {
        user.wishlist.splice(idx, 1);
      } else {
        user.wishlist.push(productId);
      }
      return res.json(user.wishlist);
    }
    return res.status(404).json({ message: 'User not found' });
  }

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const index = user.wishlist.indexOf(productId);
    if (index > -1) {
      user.wishlist.splice(index, 1);
    } else {
      user.wishlist.push(productId);
    }

    await user.save();
    res.json(user.wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users (Admin)
// @route   GET /api/auth/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
  if (!global.isDbConnected) {
    return res.json(memoryUsers);
  }
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Ban a user
export const banUser = async (req, res) => {
  if (!global.isDbConnected) {
    const user = memoryUsers.find(u => u._id === req.params.id);
    if (user) {
      user.isBanned = !user.isBanned;
      return res.json(user);
    }
    return res.status(404).json({ message: 'User not found' });
  }

  try {
    const user = await User.findById(req.params.id);
    if (user) {
      user.isBanned = !user.isBanned;
      const updatedUser = await user.save();
      res.json(updatedUser);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a user
export const deleteUser = async (req, res) => {
  if (!global.isDbConnected) {
    const idx = memoryUsers.findIndex(u => u._id === req.params.id);
    if (idx > -1) {
      memoryUsers.splice(idx, 1);
      return res.json({ message: 'User deleted successfully' });
    }
    return res.status(404).json({ message: 'User not found' });
  }

  try {
    const user = await User.findById(req.params.id);
    if (user) {
      await user.deleteOne();
      res.json({ message: 'User deleted successfully' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user role
export const updateUserRole = async (req, res) => {
  const { role } = req.body;
  if (!global.isDbConnected) {
    const user = memoryUsers.find(u => u._id === req.params.id);
    if (user) {
      user.role = role || user.role;
      return res.json(user);
    }
    return res.status(404).json({ message: 'User not found' });
  }

  try {
    const user = await User.findById(req.params.id);
    if (user) {
      user.role = role || user.role;
      const updatedUser = await user.save();
      res.json(updatedUser);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
