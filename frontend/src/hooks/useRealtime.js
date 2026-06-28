import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Hook to listen to Supabase Realtime Broadcast events.
 * @param {string} channelName - Name of the channel to subscribe to (e.g., 'e-commerce-realtime')
 * @param {Object} eventHandlers - Key-value pair of event name and callback function, e.g., { inventoryUpdate: (payload) => {} }
 */
export function useRealtime(channelName = 'e-commerce-realtime', eventHandlers = {}) {
  const channelRef = useRef(null);

  useEffect(() => {
    // Initialize channel
    const channel = supabase.channel(channelName);
    channelRef.current = channel;

    // Attach all handlers dynamically
    Object.entries(eventHandlers).forEach(([eventName, handler]) => {
      channel.on('broadcast', { event: eventName }, ({ payload }) => {
        handler(payload);
      });
    });

    // Subscribe to channel
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log(`Supabase Realtime subscribed to channel: ${channelName}`);
      }
    });

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        console.log(`Supabase Realtime unsubscribed from channel: ${channelName}`);
      }
    };
  }, [channelName, JSON.stringify(Object.keys(eventHandlers))]);

  /**
   * Broadcast message to all subscribers of this channel
   * @param {string} eventName 
   * @param {Object} payload 
   */
  const broadcast = async (eventName, payload) => {
    if (channelRef.current) {
      return await channelRef.current.send({
        type: 'broadcast',
        event: eventName,
        payload
      });
    }
  };

  return { broadcast };
}
