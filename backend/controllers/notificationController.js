import { supabase } from '../config/supabase.js';
import { memoryNotifications } from '../config/memoryStore.js';

// Map Postgres row to Mongoose structure
const mapNotificationToFrontend = (n) => {
  if (!n) return null;
  return {
    _id: n.id,
    id: n.id,
    userId: n.user_id,
    title: n.title,
    message: n.message,
    type: n.type,
    readStatus: n.is_read,
    createdAt: n.created_at
  };
};

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
export const getMyNotifications = async (req, res) => {
  if (!global.isDbConnected) {
    const list = memoryNotifications.filter(n => n.userId === req.user._id);
    return res.json(list.reverse());
  }

  try {
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', req.user._id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(notifications.map(mapNotificationToFrontend));
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
    const { data: notification, error: findError } = await supabase
      .from('notifications')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (findError) throw findError;
    if (notification) {
      if (notification.user_id !== req.user._id) {
        return res.status(403).json({ message: 'Not authorized' });
      }
      
      const { data: updated, error: updateError } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', req.params.id)
        .select()
        .single();

      if (updateError) throw updateError;
      
      res.json(mapNotificationToFrontend(updated));
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
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', req.user._id);

    if (error) throw error;
    
    res.json({ message: 'Notifications cleared' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
