import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate, useNavigate } from 'react-router-dom';
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
import ResetPassword from './pages/ResetPassword';
import LiveChat from './components/LiveChat';
import ProductCompare from './components/ProductCompare';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
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
  const { token } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  // Email verification link, login, signup, reset-password, and admin routes are public to their respective portals
  const isPublicRoute = 
    location.pathname.startsWith('/verify-email') || 
    location.pathname.startsWith('/login') || 
    location.pathname.startsWith('/signup') ||
    location.pathname.startsWith('/reset-password') ||
    location.pathname.startsWith('/admin-dashboard') ||
    location.pathname.startsWith('/admin');

  // Show normal scrollable landing page for guests, but intercept clicks on interactive items to prompt sign in
  if (!token && !isPublicRoute) {
    return (
      <div 
        onClickCapture={(e) => {
          const target = e.target;
          // Check if the clicked element or its parent is interactive (buttons, links, inputs, cursor-pointer items)
          const isInteractive = target.closest('a, button, input, select, textarea, [role="button"], .cursor-pointer, .product-card');
          
          if (isInteractive) {
            e.preventDefault();
            e.stopPropagation();
            navigate('/login');
          }
        }}
        className="w-full relative"
      >
        {children}
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
      // Don't allow guest to close — re-open immediately unless on public routes
      const isPublicRoute = 
        location.pathname.startsWith('/verify-email') || 
        location.pathname.startsWith('/login') || 
        location.pathname.startsWith('/signup');
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
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/checkout" element={<CheckoutForm />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/account" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/login" element={token ? <Navigate to="/" replace /> : <Login />} />
            <Route path="/signup" element={token ? <Navigate to="/" replace /> : <Signup />} />
            <Route path="/verify-email/:token" element={<VerifyEmail />} />
            <Route path="/reset-password" element={<ResetPassword />} />
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
    <AppProvider>
      <Router>
        <MainLayout />
      </Router>
    </AppProvider>
  );
}

export default App;
