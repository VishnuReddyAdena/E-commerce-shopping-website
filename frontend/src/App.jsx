import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import CartDrawer from './components/CartDrawer';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import CheckoutForm from './components/CheckoutForm';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import VerifyEmail from './pages/VerifyEmail';
import LiveChat from './components/LiveChat';
import ProductCompare from './components/ProductCompare';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { X, Bell, CheckCircle, Lock, ShoppingBag, Star, Shield } from 'lucide-react';
import CategoryNav from './components/CategoryNav';

const NotificationToastContainer = () => {
  const { notifications, dismissNotification } = useApp();

  return (
    <div className="fixed top-24 right-6 z-[9999] w-full max-w-sm flex flex-col gap-2.5 pointer-events-none">
      {notifications.map((n) => (
        <div
          key={n.id}
          className={`pointer-events-auto p-4 rounded-2xl border shadow-xl flex items-center gap-3.5 transition-all duration-300 transform translate-y-0 animate-in slide-in-from-right-10 ${
            n.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : n.type === 'warning'
              ? 'bg-amber-50 border-amber-250 text-amber-850'
              : n.type === 'success'
              ? 'bg-white border-slate-200 text-slate-800 shadow-2xl'
              : 'bg-white/95 backdrop-blur-md border-slate-200 text-slate-800'
          }`}
        >
          {n.type === 'success' ? (
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white border border-emerald-600/10 shadow-sm">
              <CheckCircle className="w-4.5 h-4.5 fill-emerald-500 text-white" />
            </div>
          ) : (
            <div className="p-1 rounded-xl bg-white bg-opacity-60 border border-slate-100 flex-shrink-0">
              <Bell className="w-4 h-4 text-blue-600 animate-bounce" />
            </div>
          )}
          <div className="flex-1 text-xs leading-relaxed text-slate-700">
            {n.type === 'success' && n.metadata?.productName ? (
              <div className="flex flex-col gap-0.5">
                <span className="font-bold text-slate-900">{n.message}</span>
                <span className="font-normal text-slate-500 italic text-[11px]">"{n.metadata.productName}"</span>
              </div>
            ) : (
              <span className="font-bold">{n.message}</span>
            )}
          </div>
          <button
            onClick={() => dismissNotification(n.id)}
            className="text-slate-400 hover:text-slate-800 p-0.5 flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

// ─── Global Auth Gate ────────────────────────────────────────────────────────
// Blocks all page content for guests; forces them to log in first.
const AuthGate = ({ children }) => {
  const { token, authOpen, setAuthOpen } = useApp();
  const location = useLocation();

  // Email verification link is the only public route
  const isPublicRoute = location.pathname.startsWith('/verify-email');

  // Auto-open auth modal for guests on every non-public route
  useEffect(() => {
    if (!token && !isPublicRoute) {
      setAuthOpen(true);
    }
  }, [token, isPublicRoute, setAuthOpen]);

  // Show full-screen gate for guests
  if (!token && !isPublicRoute) {
    return (
      <div className="min-h-screen flex flex-col relative">
        {/* Blurred/locked page preview */}
        <div className="flex-grow select-none pointer-events-none filter blur-sm opacity-30 overflow-hidden max-h-screen">
          {children}
        </div>

        {/* Overlay prompt */}
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="relative bg-white rounded-[28px] shadow-2xl border border-slate-200/80 p-10 max-w-sm w-full text-center flex flex-col items-center gap-5 animate-in fade-in zoom-in-95">
            {/* Icon */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg">
              <Lock className="w-8 h-8 text-white" />
            </div>

            {/* Branding */}
            <div>
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="bg-gradient-to-tr from-blue-650 to-indigo-650 text-white w-7 h-7 rounded-xl flex items-center justify-center font-black text-sm shadow-md">N</span>
                <span className="font-extrabold text-base text-slate-800">NexaCart</span>
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight mt-2">Sign in to continue</h2>
              <p className="text-xs text-slate-500 font-medium mt-1.5 leading-relaxed">
                You need to be logged in to browse, search, and shop on NexaCart.
              </p>
            </div>

            {/* Perks */}
            <div className="w-full grid grid-cols-3 gap-3 text-center">
              {[
                { icon: ShoppingBag, label: 'Shop & Browse', color: 'text-blue-600 bg-blue-50' },
                { icon: Star, label: 'Earn Rewards', color: 'text-amber-600 bg-amber-50' },
                { icon: Shield, label: 'Secure Orders', color: 'text-emerald-600 bg-emerald-50' },
              ].map(({ icon: Icon, label, color }) => (
                <div key={label} className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[9px] font-bold text-slate-600 uppercase tracking-wide leading-tight">{label}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <button
              onClick={() => setAuthOpen(true)}
              className="w-full bg-[#2874F0] hover:bg-[#1963d2] active:scale-[0.98] text-white py-3.5 rounded-2xl text-sm font-extrabold shadow-lg hover:shadow-xl transition-all uppercase tracking-widest"
            >
              Sign In / Register
            </button>

            <p className="text-[10px] text-slate-400 font-medium">
              New here? Registration is free &amp; instant.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

const MainLayout = () => {
  const { authOpen, setAuthOpen, token, user } = useApp();
  const [cartOpen, setCartOpen] = useState(false);
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith('/admin-dashboard') || location.pathname.startsWith('/admin');
  const showCategoryNav = !isAdminRoute && !location.pathname.startsWith('/checkout');

  // When the auth modal is closed by a guest (e.g. clicking backdrop), re-open it
  const handleCloseAuth = () => {
    if (!token) {
      // Don't allow guest to close — re-open immediately unless on verify-email
      const isPublicRoute = location.pathname.startsWith('/verify-email');
      if (!isPublicRoute) return; // block close for guests
    }
    setAuthOpen(false);
  };

  // Admin portal uses its own full-screen layout — render without global shell
  if (isAdminRoute) {
    return (
      <>
        <NotificationToastContainer />
        <AuthGate>
          <Routes>
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/admin" element={<Navigate to="/admin-dashboard" replace />} />
          </Routes>
        </AuthGate>
        <AuthModal isOpen={authOpen} onClose={handleCloseAuth} />
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative pb-16">

      <Navbar onOpenAuth={() => setAuthOpen(true)} onOpenCart={() => setCartOpen(true)} />

      {showCategoryNav && <CategoryNav />}

      {/* Dynamic WebSocket Notifications Portal */}
      <NotificationToastContainer />

      <main className="flex-grow">
        <AuthGate>
          <Routes>
            <Route path="/" element={user?.role === 'admin' ? <Navigate to="/admin-dashboard" replace /> : <Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/checkout" element={<CheckoutForm />} />
            <Route path="/dashboard" element={user?.role === 'admin' ? <Navigate to="/admin-dashboard" replace /> : <Dashboard />} />
            <Route path="/account" element={user?.role === 'admin' ? <Navigate to="/admin-dashboard" replace /> : <Dashboard />} />
            <Route path="/verify-email/:token" element={<VerifyEmail />} />
          </Routes>
        </AuthGate>
      </main>

      <AuthModal isOpen={authOpen} onClose={handleCloseAuth} />
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />

      {/* Floating Utilities */}
      <LiveChat />
      <ProductCompare />
    </div>
  );
};

function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || 'dummy-client-id.apps.googleusercontent.com'}>
      <AppProvider>
        <Router>
          <MainLayout />
        </Router>
      </AppProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
