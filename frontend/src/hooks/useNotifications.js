import { useRealtime } from './useRealtime';

/**
 * Hook to automatically listen to notification events from the server and trigger UI toasts.
 * @param {Function} addNotification - The toast notifier function from AppContext
 * @param {Object} currentUser - Currently logged in user (to filter notifications if necessary)
 */
export function useNotifications(addNotification, currentUser) {
  useRealtime('e-commerce-notifications', {
    lowStock: (payload) => {
      // Only show to admins/managers
      if (currentUser?.role === 'admin' || currentUser?.role === 'manager' || currentUser?.role === 'super-admin' || currentUser?.role === 'super_admin') {
        addNotification(`Low Stock Alert: ${payload.title} has only ${payload.inventoryCount} units left!`, 'warning');
      }
    },
    newCustomer: (payload) => {
      if (currentUser?.role === 'admin' || currentUser?.role === 'manager' || currentUser?.role === 'super-admin' || currentUser?.role === 'super_admin') {
        addNotification(`New Customer Registered: ${payload.name} (${payload.email})`, 'success');
      }
    },
    paymentSuccess: (payload) => {
      // Show to the specific customer who placed it, or admins
      if (currentUser?._id === payload.userId || currentUser?.role === 'admin' || currentUser?.role === 'super-admin' || currentUser?.role === 'super_admin') {
        addNotification(`Payment Successful for Order #${payload.orderId?.substring(18) || payload.orderId}! Amount: $${payload.amount}`, 'success');
      }
    },
    orderDelivered: (payload) => {
      if (currentUser?._id === payload.userId || currentUser?.role === 'admin' || currentUser?.role === 'super-admin' || currentUser?.role === 'super_admin') {
        addNotification(`Order #${payload.orderId?.substring(18) || payload.orderId} has been successfully delivered!`, 'success');
      }
    },
    refundIssued: (payload) => {
      if (currentUser?._id === payload.userId || currentUser?.role === 'admin' || currentUser?.role === 'super-admin' || currentUser?.role === 'super_admin') {
        addNotification(`Refund of $${payload.amount} issued for Order #${payload.orderId?.substring(18) || payload.orderId}.`, 'info');
      }
    },
    newOrder: (payload) => {
      if (currentUser?.role === 'admin' || currentUser?.role === 'manager' || currentUser?.role === 'super-admin' || currentUser?.role === 'super_admin') {
        addNotification(`New Order Placed! Total: $${payload.totalAmount}`, 'success');
      }
    }
  });
}
