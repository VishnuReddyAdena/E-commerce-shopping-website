import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useApp } from '../context/AppContext';
import { Mail, Lock, User, UserPlus, ArrowRight } from 'lucide-react';

const COUNTRIES = [
  'India', 'USA', 'UK', 'Canada', 'Australia', 'Germany', 'France', 'Japan', 'Singapore', 'UAE'
];

export default function Signup() {
  const { register, googleLogin, loading, error } = useAuth();
  const { addNotification } = useApp();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [country, setCountry] = useState('India');
  const [referralCode, setReferralCode] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(name, email, password, 'user', country, referralCode);
      addNotification('Account created successfully! Check your email for verification.', 'success');
      navigate('/login');
    } catch (err) {
      addNotification(err.message || 'Registration failed', 'error');
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
      {/* Background lights */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-blue-600/10 blur-[100px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-indigo-650/10 blur-[120px] animate-pulse pointer-events-none" />

      {/* Glassmorphic card */}
      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 sm:p-10 shadow-2xl relative z-10">
        
        {/* Branding header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 mb-4">
            <UserPlus className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Create Account</h2>
          <p className="text-slate-400 text-xs mt-1.5 text-center leading-relaxed">
            Register your profile details to unlock premium member benefits.
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider pl-1">Full Name</label>
            <div className="relative">
              <input
                type="text"
                placeholder="John Doe"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/25 rounded-2xl py-3 pl-11 pr-4 text-sm font-semibold text-white placeholder-slate-500 transition-all focus:outline-none"
              />
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            </div>
          </div>

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

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider pl-1">Password</label>
            <div className="relative">
              <input
                type="password"
                placeholder="Choose a strong password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/25 rounded-2xl py-3 pl-11 pr-4 text-sm font-semibold text-white placeholder-slate-500 transition-all focus:outline-none"
              />
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider pl-1">Country</label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full bg-white/5 border border-white/10 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/25 rounded-2xl py-3 px-4 text-sm font-semibold transition-all focus:outline-none"
              >
                {COUNTRIES.map((c) => (
                  <option key={c} value={c} className="bg-slate-900 text-white">
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider pl-1">Referral Code</label>
              <input
                type="text"
                placeholder="Optional"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                className="w-full bg-white/5 border border-white/10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/25 rounded-2xl py-3 px-4 text-sm font-semibold text-white placeholder-slate-500 transition-all focus:outline-none uppercase"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-600/10 flex items-center justify-center gap-2 mt-6 disabled:opacity-65"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                Register Account
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

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
              <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.213-5.147 4.213-3.414 0-6.19-2.775-6.19-6.19 0-3.414 2.776-6.19 6.19-6.19 1.487 0 2.848.533 3.914 1.424l3.056-3.056C19.06 2.054 15.82 1 12.24 1 6.033 1 12.24s5.033 11.24 11.24 11.24c5.895 0 10.743-4.237 10.743-11.24 0-.687-.06-1.354-.183-1.954H12.24z"/>
            </svg>
            Sign up with Google
          </button>

          <div className="text-center mt-6 text-xs text-slate-500 font-semibold">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-400 hover:text-blue-300 underline pl-1">
              Sign In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
