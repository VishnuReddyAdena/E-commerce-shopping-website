import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert } from 'lucide-react';
import { useApp } from '../context/AppContext';

// Layout
import AdminLayout from '../admin/layout/AdminLayout';

// Sections
import OverviewSection from '../admin/sections/OverviewSection';
import ProductsSection from '../admin/sections/ProductsSection';
import OrdersSection from '../admin/sections/OrdersSection';
import CustomersSection from '../admin/sections/CustomersSection';
import CategoriesSection from '../admin/sections/CategoriesSection';
import BrandsSection from '../admin/sections/BrandsSection';
import CouponsSection from '../admin/sections/CouponsSection';
import TicketsSection from '../admin/sections/TicketsSection';
import AnalyticsSection from '../admin/sections/AnalyticsSection';
import BannersSection from '../admin/sections/BannersSection';

const SECTIONS = {
  overview: OverviewSection,
  analytics: AnalyticsSection,
  products: ProductsSection,
  orders: OrdersSection,
  customers: CustomersSection,
  categories: CategoriesSection,
  brands: BrandsSection,
  coupons: CouponsSection,
  tickets: TicketsSection,
  banners: BannersSection,
};

export const AdminDashboard = () => {
  const { token, user, login, loading, error, setError } = useApp();
  const [activeSection, setActiveSection] = useState('overview');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Clear any existing errors on mount
  useEffect(() => {
    setError('');
  }, [setError]);

  // Access guard & Admin Login Form
  if (!token || user?.role !== 'admin') {
    const handleAdminLoginSubmit = async (e) => {
      e.preventDefault();
      await login(email, password);
    };

    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 relative overflow-hidden">
        {/* Background blobs for premium glassmorphism */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl p-8 sm:p-10 max-w-md w-full relative z-10 text-white"
        >
          <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-xl font-extrabold text-center uppercase tracking-wider">Admin Portal</h2>
          <p className="text-xs text-slate-400 text-center mt-1.5 mb-8">
            Access restricted to NexaCart administrators.
          </p>

          {error && (
            <div className="bg-red-500/15 border border-red-500/30 text-red-200 text-xs py-3 px-4 rounded-xl mb-6 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleAdminLoginSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => { setError(''); setEmail(e.target.value); }}
                placeholder="admin@nexacart.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => { setError(''); setPassword(e.target.value); }}
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-extrabold py-3.5 rounded-xl text-xs uppercase tracking-widest shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98] mt-6"
            >
              {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  const ActiveSection = SECTIONS[activeSection] || OverviewSection;

  return (
    <AdminLayout activeSection={activeSection} onNavigate={setActiveSection}>
      <ActiveSection onNavigate={setActiveSection} />
    </AdminLayout>
  );
};

export default AdminDashboard;
