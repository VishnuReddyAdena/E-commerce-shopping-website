import express from 'express';
import {
  registerUser,
  loginUser,
  syncUser,
  getUserProfile,
  updateUserProfile,
  forgotPassword,
  resetPassword,
  googleAuth,
  verifyEmail,
  addShippingAddress,
  toggleWishlist,
  getAllUsers,
  banUser,
  deleteUser,
  updateUserRole
} from '../controllers/authController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/sync', syncUser);
router.post('/google', googleAuth);
router.post('/verify-email', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Customer profile routes
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);
  
router.post('/addresses', protect, addShippingAddress);
router.post('/wishlist', protect, toggleWishlist);

// Admin user management routes
router.route('/users')
  .get(protect, admin, getAllUsers);

router.route('/users/:id')
  .delete(protect, admin, deleteUser);

router.route('/users/:id/ban')
  .put(protect, admin, banUser);

router.route('/users/:id/role')
  .put(protect, admin, updateUserRole);

export default router;
