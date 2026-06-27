import express from 'express';
import { getMyNotifications, markNotificationAsRead, clearNotifications } from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getMyNotifications)
  .delete(protect, clearNotifications);

router.route('/:id/read')
  .put(protect, markNotificationAsRead);

export default router;
