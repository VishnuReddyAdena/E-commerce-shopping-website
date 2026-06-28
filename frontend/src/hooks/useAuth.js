import { useState } from 'react';
import { authService } from '../services/auth';

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.signIn(email, password);
      return data;
    } catch (err) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password, role = 'user', country = 'India', referralCodeApplied = '') => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.signUp(email, password, name, role, country, referralCodeApplied);
      return data;
    } catch (err) {
      setError(err.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    setError(null);
    try {
      await authService.signOut();
    } catch (err) {
      setError(err.message || 'Logout failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.signInWithGoogle();
      return data;
    } catch (err) {
      setError(err.message || 'Google login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (email) => {
    setLoading(true);
    setError(null);
    try {
      await authService.forgotPassword(email);
    } catch (err) {
      setError(err.message || 'Forgot password request failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (newPassword) => {
    setLoading(true);
    setError(null);
    try {
      await authService.resetPassword(newPassword);
    } catch (err) {
      setError(err.message || 'Reset password failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    login,
    register,
    logout,
    googleLogin,
    forgotPassword,
    resetPassword,
    loading,
    error,
    setError
  };
}
