import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { authService } from '../services/auth';
import { useApp } from '../context/AppContext';

const ResetPassword = () => {
  const navigate = useNavigate();
  const { addNotification } = useApp();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle', 'submitting', 'success', 'error'
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) {
      addNotification('Password is required', 'error');
      return;
    }
    if (password !== confirmPassword) {
      addNotification('Passwords do not match', 'error');
      return;
    }

    setStatus('submitting');
    try {
      await authService.resetPassword(password);
      setStatus('success');
      setMessage('Your password has been successfully reset! You can now log in.');
      addNotification('Password reset successfully!', 'success');
      setTimeout(() => {
        navigate('/');
      }, 4000);
    } catch (err) {
      setStatus('error');
      setMessage(err.message || 'Failed to reset password. The link may have expired.');
      addNotification(err.message || 'Failed to reset password', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-sm border border-slate-200 p-8 text-center space-y-6">
        
        {status === 'idle' && (
          <div className="space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-650 flex items-center justify-center mx-auto">
              <Lock className="w-8 h-8" />
            </div>
            
            <div>
              <h2 className="text-2xl font-black text-slate-800">Set New Password</h2>
              <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
                Please enter a secure new password for your account.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">New Password</label>
                <input
                  type="password"
                  placeholder="Minimum 6 characters"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-250 focus:bg-white focus:border-[#2874F0] focus:ring-1 focus:ring-[#2874F0]/20 rounded-xl py-3 px-4 text-sm font-semibold text-slate-900 placeholder-slate-400 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Confirm New Password</label>
                <input
                  type="password"
                  placeholder="Repeat new password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-250 focus:bg-white focus:border-[#2874F0] focus:ring-1 focus:ring-[#2874F0]/20 rounded-xl py-3 px-4 text-sm font-semibold text-slate-900 placeholder-slate-400 transition-all"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-extrabold text-sm shadow-md transition-colors uppercase tracking-wider"
              >
                Reset Password
              </button>
            </form>
          </div>
        )}

        {status === 'submitting' && (
          <div className="flex flex-col items-center justify-center space-y-4 text-slate-500 py-10">
            <Loader2 className="w-16 h-16 animate-spin text-blue-650" />
            <h2 className="text-xl font-bold text-slate-800">Updating Password...</h2>
            <p className="text-sm font-medium">Updating your credentials securely.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center justify-center space-y-4 py-6">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-2">
              <CheckCircle className="w-12 h-12 text-emerald-500" />
            </div>
            <h2 className="text-2xl font-black text-slate-800">Password Reset!</h2>
            <p className="text-sm font-medium text-slate-600 leading-relaxed">{message}</p>
            <p className="text-xs text-slate-400 font-semibold italic mt-4">Redirecting you to home page...</p>
            <Link to="/" className="w-full mt-4 block py-3 bg-blue-600 text-white rounded-2xl font-bold shadow-sm hover:bg-blue-700 transition-colors">
              Go to Login
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center justify-center space-y-4 py-6">
            <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mb-2">
              <XCircle className="w-12 h-12 text-rose-500" />
            </div>
            <h2 className="text-2xl font-black text-slate-800">Reset Failed</h2>
            <p className="text-sm font-medium text-slate-600 leading-relaxed">{message}</p>
            <Link to="/" className="w-full mt-4 block py-3 border border-slate-300 text-slate-700 rounded-2xl font-bold shadow-sm hover:bg-slate-50 transition-colors">
              Return to Website
            </Link>
          </div>
        )}

      </div>
    </div>
  );
};

export default ResetPassword;
