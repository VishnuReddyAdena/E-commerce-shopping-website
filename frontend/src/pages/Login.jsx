import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useApp } from '../context/AppContext';
import { Mail, Lock, LogIn, ArrowRight, ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Login() {
  const { login, googleLogin, loading, error, setError } = useAuth();
  const { addNotification } = useApp();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isForgotPassword) {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`
        });
        if (error) throw error;
        setResetSent(true);
        addNotification('Password reset link sent to your email!', 'success');
      } catch (err) {
        setError(err.message || 'Failed to send reset link');
        addNotification(err.message || 'Failed to send reset link', 'error');
      }
      return;
    }

    try {
      const data = await login(email, password);
      if (data) {
        addNotification('Signed in successfully!', 'success');
        navigate('/');
      }
    } catch (err) {
      addNotification(err.message || 'Invalid email or password', 'error');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await googleLogin();
    } catch (err) {
      addNotification(err.message || 'Google Auth failed', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Dynamic background lights */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-blue-600/10 blur-[100px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-indigo-650/10 blur-[120px] animate-pulse pointer-events-none" />

      {/* Glassmorphic card */}
      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 sm:p-10 shadow-2xl relative z-10">
        
        {/* Branding header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 mb-4">
            <LogIn className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            {isForgotPassword ? 'Reset Password' : 'Sign in to NexaCart'}
          </h2>
          <p className="text-slate-400 text-xs mt-1.5 text-center leading-relaxed">
            {isForgotPassword 
              ? 'Enter your email to receive a password reset link.' 
              : 'Secure, modern shopping experience powered by Supabase.'
            }
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold">
            {error}
          </div>
        )}

        {isForgotPassword && resetSent ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-200">Reset Email Sent</p>
            <p className="text-xs text-slate-400">Please check your inbox at <span className="text-slate-200">{email}</span> for a link to reset your password.</p>
            <button 
              onClick={() => { setIsForgotPassword(false); setResetSent(false); setError(null); }}
              className="text-xs font-bold text-blue-400 hover:text-blue-300 underline mt-4"
            >
              Back to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider pl-1">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="name@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/25 rounded-2xl py-3 pl-11 pr-4 text-sm font-semibold text-white placeholder-slate-500 transition-all focus:outline-none"
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              </div>
            </div>

            {!isForgotPassword && (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Password</label>
                  <button
                    type="button"
                    onClick={() => { setIsForgotPassword(true); setError(null); }}
                    className="text-[10px] font-bold text-blue-400 hover:text-blue-350 hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="Enter your password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/25 rounded-2xl py-3 pl-11 pr-4 text-sm font-semibold text-white placeholder-slate-500 transition-all focus:outline-none"
                  />
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-600/10 flex items-center justify-center gap-2 mt-6 disabled:opacity-65"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {isForgotPassword ? 'Send Reset Link' : 'Sign In'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {!isForgotPassword && (
              <>
                {/* Divider */}
                <div className="relative my-6 flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/5"></div>
                  </div>
                  <span className="relative px-3 bg-slate-900/50 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider text-slate-500">Or continue with</span>
                </div>

                {/* Google Sign-in */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl py-3 text-xs font-bold text-slate-200 flex items-center justify-center gap-2.5 transition-all active:scale-[0.99]"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.213-5.147 4.213-3.414 0-6.19-2.775-6.19-6.19 0-3.414 2.776-6.19 6.19-6.19 1.487 0 2.848.533 3.914 1.424l3.056-3.056C19.06 2.054 15.82 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c5.895 0 10.743-4.237 10.743-11.24 0-.687-.06-1.354-.183-1.954H12.24z"/>
                  </svg>
                  Sign in with Google
                </button>
              </>
            )}

            <div className="text-center mt-6 text-xs text-slate-500 font-semibold">
              {isForgotPassword ? (
                <button 
                  type="button" 
                  onClick={() => { setIsForgotPassword(false); setError(null); }}
                  className="text-blue-400 hover:underline"
                >
                  Back to Sign In
                </button>
              ) : (
                <>
                  New to NexaCart?{' '}
                  <Link to="/signup" className="text-blue-400 hover:text-blue-300 underline pl-1">
                    Create free account
                  </Link>
                </>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
