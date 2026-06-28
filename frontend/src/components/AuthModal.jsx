import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Mail, Lock, User, Key, Chrome, Github, Globe } from 'lucide-react';

const AuthModal = ({ isOpen, onClose }) => {
  const { login, register, googleLogin, loading, error, setError, addNotification, token } = useApp();
  const isGuest = !token; // Guests cannot dismiss the modal
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [country, setCountry] = useState('India');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isForgotPassword) {
      // Mock forgot password trigger
      try {
        const res = await fetch('http://localhost:5000/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        const data = await res.json();
        if (res.ok) {
          addNotification(data.message, 'success');
          setIsForgotPassword(false);
        } else {
          addNotification(data.message, 'error');
        }
      } catch (err) {
        addNotification('Server error', 'error');
      }
      return;
    }

    if (isLoginTab) {
      const success = await login(email, password);
      if (success) onClose();
    } else {
      const success = await register(name, email, password, 'user', '', country);
      if (success) {
        // After signup, redirect to Sign In tab — user must login manually
        setIsLoginTab(true);
        setName('');
        setPassword('');
        // Keep the email pre-filled for convenience
      }
    }
  };

  const handleSocialLogin = (platform) => {
    addNotification(`Signing in with ${platform} (Simulated Social OAuth Flow)...`, 'info');
    setTimeout(() => {
      // Set mock user values based on social login
      login('vishnubhai123@gmail.com', 'vishnu123@'); // seed logins or mock success
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark blur overlay — click only closes if user is logged in */}
      <div 
        onClick={isGuest ? undefined : onClose}
        className={`absolute inset-0 bg-slate-900/60 backdrop-blur-md ${isGuest ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      />
      
      {/* Highlighted Modal card panel */}
      <div className="relative w-full max-w-md bg-white border border-slate-200/80 shadow-3xl rounded-[28px] p-8 transition-all duration-300 animate-in fade-in zoom-in-95">
        
        {/* Close Button — hidden for guests */}
        {!isGuest && (
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {isForgotPassword ? (
          <div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Forgot Password</h3>
            <p className="text-sm text-slate-600 mb-6">Enter your registered email and we'll send instructions to reset your password.</p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <input
                  type="email"
                  placeholder="Enter your email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#2874F0] focus:ring-1 focus:ring-[#2874F0]/20 rounded-xl py-3 pl-11 pr-4 text-sm font-semibold text-slate-900 placeholder-slate-400 transition-all"
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-[#2874F0] hover:bg-[#1963d2] text-white py-3 flex items-center justify-center rounded-xl font-extrabold text-sm tracking-wide transition-all shadow-md hover:shadow-lg"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Send Reset Link'
                )}
              </button>

              <button 
                type="button" 
                onClick={() => setIsForgotPassword(false)}
                className="w-full text-center text-sm font-semibold text-blue-600 hover:underline mt-2"
              >
                Back to Sign In
              </button>
            </form>
          </div>
        ) : (
          <div>
            {/* Tabs */}
            <div className="flex border-b border-slate-200 mb-6 pb-2">
              <button
                onClick={() => { setIsLoginTab(true); setError(''); }}
                className={`flex-1 pb-2 text-center font-bold text-lg transition-all ${
                  isLoginTab ? 'text-[#2874F0] border-b-2 border-[#2874F0]' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setIsLoginTab(false); setError(''); }}
                className={`flex-1 pb-2 text-center font-bold text-lg transition-all ${
                  !isLoginTab ? 'text-[#2874F0] border-b-2 border-[#2874F0]' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Sign Up
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-100 border border-rose-300 text-rose-800 text-xs font-semibold">
                {error}
              </div>
            )}

            {/* Main Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLoginTab && (
                <>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Full Name"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#2874F0] focus:ring-1 focus:ring-[#2874F0]/20 rounded-xl py-3 pl-11 pr-4 text-sm font-semibold text-slate-900 placeholder-slate-400 transition-all"
                    />
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  </div>

                  <div className="relative">
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-205 focus:bg-white focus:border-[#2874F0] focus:ring-1 focus:ring-[#2874F0]/20 rounded-xl py-3 pl-11 pr-4 text-sm font-semibold text-slate-900 focus:outline-none transition-all cursor-pointer"
                    >
                      <option value="India">India (Rupees ₹)</option>
                      <option value="USA">Foreign Country (Dollars $)</option>
                    </select>
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  </div>
                </>
              )}

              <div className="relative">
                <input
                  type="email"
                  placeholder="Email Address"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#2874F0] focus:ring-1 focus:ring-[#2874F0]/20 rounded-xl py-3 pl-11 pr-4 text-sm font-semibold text-slate-900 placeholder-slate-400 transition-all"
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              </div>

              <div className="relative">
                <input
                  type="password"
                  placeholder="Password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#2874F0] focus:ring-1 focus:ring-[#2874F0]/20 rounded-xl py-3 pl-11 pr-4 text-sm font-semibold text-slate-900 placeholder-slate-400 transition-all"
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              </div>

              {isLoginTab && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => setIsForgotPassword(true)}
                    className="text-xs text-blue-600 hover:underline font-semibold"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-[#2874F0] hover:bg-[#1963d2] text-white py-3 flex items-center justify-center rounded-xl font-extrabold text-sm tracking-wide transition-all shadow-md hover:shadow-lg"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  isLoginTab ? 'Sign In' : 'Create Account'
                )}
              </button>
            </form>

            {/* Social Oauth options */}
            <div className="mt-6">
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-300"></div>
                <span className="flex-shrink mx-4 text-slate-500 text-xs font-semibold uppercase tracking-wider">Or continue with</span>
                <div className="flex-grow border-t border-slate-300"></div>
              </div>

              <div className="flex justify-center mt-4 w-full">
                <button
                  type="button"
                  onClick={async () => {
                    const success = await googleLogin();
                    if (success) onClose();
                  }}
                  className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl py-3 text-xs font-bold text-slate-700 flex items-center justify-center gap-2.5 transition-all active:scale-[0.99]"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.213-5.147 4.213-3.414 0-6.19-2.775-6.19-6.19 0-3.414 2.776-6.19 6.19-6.19 1.487 0 2.848.533 3.914 1.424l3.056-3.056C19.06 2.054 15.82 1 12.24 1 6.033 1 12.24s5.033 11.24 11.24 11.24c5.895 0 10.743-4.237 10.743-11.24 0-.687-.06-1.354-.183-1.954H12.24z"/>
                  </svg>
                  Continue with Google
                </button>
              </div>
            </div>

            {/* Helper Credentials Tip */}
            {isLoginTab && (
              <div className="mt-6 p-3 rounded-xl bg-blue-50 bg-opacity-60 border border-blue-200 text-[11px] text-slate-700 font-medium">
                <span className="font-bold text-blue-800">Quick Test Credentials:</span><br/>
                • Admin: <code className="bg-slate-200 px-1 rounded select-all">vishnubhai123@gmail.com</code> / <code className="bg-slate-200 px-1 rounded select-all">vishnu123@</code>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
