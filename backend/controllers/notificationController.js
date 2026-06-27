import Notification from '../models/Notification.js';
import { memoryNotifications } from '../config/memoryStore.js';

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
export const getMyNotifications = async (req, res) => {
  if (!global.isDbConnected) {
    const list = memoryNotifications.filter(n => n.userId === req.user._id);
    return res.json(list.reverse());
  }

  try {
    const notifications = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark a notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
export const markNotificationAsRead = async (req, res) => {
  if (!global.isDbConnected) {
    const notif = memoryNotifications.find(n => n._id === req.params.id);
    if (notif) {
      notif.readStatus = true;
      return res.json(notif);
    }
    return res.status(404).json({ message: 'Notification not found' });
  }

  try {
    const notification = await Notification.findById(req.params.id);
    if (notification) {
      if (notification.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized' });
      }
      notification.readStatus = true;
      const updated = await notification.save();
      res.json(updated);
    } else {
      res.status(404).json({ message: 'Notification not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Clear all user notifications
// @route   DELETE /api/notifications
// @access  Private
export const clearNotifications = async (req, res) => {
  if (!global.isDbConnected) {
    const kept = memoryNotifications.filter(n => n.userId !== req.user._id);
    memoryNotifications.length = 0;
    kept.forEach(n => memoryNotifications.push(n));
    return res.json({ message: 'Notifications cleared (sandbox)' });
  }

  try {
    await Notification.deleteMany({ userId: req.user._id });
    res.json({ message: 'Notifications cleared' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
