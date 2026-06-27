import React, { useState } from 'react';
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
  const { token, user } = useApp();
  const [activeSection, setActiveSection] = useState('overview');

  // Access guard
  if (!token || user?.role !== 'admin') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200 shadow-xl p-10 max-w-sm w-full text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center mx-auto mb-5">
            <ShieldAlert className="w-8 h-8 text-amber-500" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Access Restricted</h2>
          <p className="text-sm text-slate-500 mt-2 leading-relaxed">
            Administrator credentials are required to access this portal.
          </p>
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
