import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { backendUrl, addNotification } = useApp();
  
  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
  const [message, setMessage] = useState('Verifying your email address...');
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const verifyToken = async () => {
      try {
        const response = await fetch(`${backendUrl}/api/auth/verify-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage(data.message || 'Email verified successfully! You can now log in.');
          addNotification('Email verified successfully!', 'success');
          // Optionally auto-redirect after a few seconds
          setTimeout(() => {
            navigate('/');
          }, 4000);
        } else {
          setStatus('error');
          setMessage(data.message || 'Verification failed or token expired.');
        }
      } catch (err) {
        setStatus('error');
        setMessage('Network error. Please try again later.');
      }
    };

    verifyToken();
  }, [token, backendUrl, navigate, addNotification]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center space-y-6">
        
        {status === 'loading' && (
          <div className="flex flex-col items-center justify-center space-y-4 text-slate-500">
            <Loader2 className="w-16 h-16 animate-spin text-blue-650" />
            <h2 className="text-xl font-bold text-slate-800">Verifying...</h2>
            <p className="text-sm font-medium">{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-2">
              <CheckCircle className="w-12 h-12 text-emerald-500" />
            </div>
            <h2 className="text-2xl font-black text-slate-800">Verified!</h2>
            <p className="text-sm font-medium text-slate-600 leading-relaxed">{message}</p>
            <p className="text-xs text-slate-400 font-semibold italic mt-4">Redirecting you to home...</p>
            <Link to="/" className="w-full mt-4 block py-3 bg-blue-600 text-white rounded-2xl font-bold shadow-sm hover:bg-blue-700 transition-colors">
              Go to Home Now
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mb-2">
              <XCircle className="w-12 h-12 text-rose-500" />
            </div>
            <h2 className="text-2xl font-black text-slate-800">Verification Failed</h2>
            <p className="text-sm font-medium text-slate-600 leading-relaxed">{message}</p>
            <Link to="/" className="w-full mt-4 block py-3 border border-slate-300 text-slate-700 rounded-2xl font-bold shadow-sm hover:bg-slate-50 transition-colors">
              Return Home
            </Link>
          </div>
        )}

      </div>
    </div>
  );
};

export default VerifyEmail;
