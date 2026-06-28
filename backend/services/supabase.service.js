import { supabase } from '../config/supabase.js';

export const realtimeService = {
  /**
   * Broadcast an event through a Supabase Channel
   * @param {string} channelName - Name of the channel (e.g. 'e-commerce-realtime', 'e-commerce-notifications')
   * @param {string} eventName - Name of the event (e.g. 'inventoryUpdate', 'newOrder')
   * @param {Object} payload - The data payload to send
   */
  async broadcastEvent(channelName, eventName, payload) {
    try {
      const channel = supabase.channel(channelName);
      
      // Subscribe to the channel
      channel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.send({
            type: 'broadcast',
            event: eventName,
            payload
          });
          // Clean up the channel after sending
          supabase.removeChannel(channel);
        }
      });
      
      console.log(`[Supabase Realtime] Broadcasted ${eventName} to channel ${channelName}`);
    } catch (err) {
      console.error(`[Supabase Realtime Error] Broadcast failed:`, err.message);
    }
  }
};
