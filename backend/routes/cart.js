import express from 'express';
import { getCart, updateCart, clearCart } from '../controllers/cartController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getCart)
  .put(updateCart)
  .delete(clearCart);

export default router;
