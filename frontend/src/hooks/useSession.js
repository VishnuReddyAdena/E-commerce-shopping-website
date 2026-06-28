import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5050';

export function useSession() {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setToken(session?.access_token || null);
      if (session?.user) {
        fetchMongoDBUser(session.user, session.access_token);
      } else {
        setLoading(false);
      }
    });

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      setSession(newSession);
      setToken(newSession?.access_token || null);
      
      if (newSession?.user) {
        await fetchMongoDBUser(newSession.user, newSession.access_token);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchMongoDBUser = async (supabaseUser, accessToken) => {
    try {
      // Get synced MongoDB user details
      const response = await axios.get(`${BACKEND_URL}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      setUser(response.data);
    } catch (err) {
      console.error('Failed to load user profile from backend MongoDB:', err.message);
      // Fallback to supabase user metadata if backend fails
      setUser({
        _id: supabaseUser.id,
        supabaseId: supabaseUser.id,
        email: supabaseUser.email,
        name: supabaseUser.user_metadata?.name || 'Customer',
        role: supabaseUser.user_metadata?.role || 'user',
        country: supabaseUser.user_metadata?.country || 'India',
        walletBalance: 100,
        loyaltyPoints: 10,
        shippingAddresses: [],
        wishlist: []
      });
    } finally {
      setLoading(false);
    }
  };

  return { session, user, setUser, token, loading };
}
