import { supabase } from '../lib/supabase';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || 'https://e-commerce-shopping-website-bfa8.onrender.com';

export const authService = {
  async signUp(email, password, name, role = 'user', country = 'India', referralCodeApplied = '') {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role,
          country
        }
      }
    });

    if (error) throw error;

    // Immediately trigger backend sync so MongoDB document is created
    if (data?.user) {
      try {
        await axios.post(`${BACKEND_URL}/api/auth/sync`, {
          supabaseId: data.user.id,
          email: data.user.email,
          name,
          role,
          country,
          referralCodeApplied
        });
      } catch (syncError) {
        console.error('Failed to sync user registration to MongoDB:', syncError.message);
      }
    }
    return data;
  },

  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    
    // Trigger user sync to make sure MongoDB is up to date
    if (data?.user) {
      try {
        const token = data.session?.access_token;
        await axios.post(`${BACKEND_URL}/api/auth/sync`, {
          supabaseId: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.name || '',
          role: data.user.user_metadata?.role || 'user',
          country: data.user.user_metadata?.country || 'India'
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (syncError) {
        console.error('Sync on login failed:', syncError.message);
      }
    }
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) throw error;
    return data;
  },

  async forgotPassword(email) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
    if (error) throw error;
    return data;
  },

  async resetPassword(newPassword) {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });
    if (error) throw error;
    return data;
  },

  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  }
};
