import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Bell, ChevronDown, LogOut, User, Settings, Shield, X, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const sectionTitles = {
  overview: 'Dashboard Overview',
  analytics: 'Analytics',
  products: 'Products',
  categories: 'Categories',
  brands: 'Brands',
  orders: 'Orders',
  customers: 'Customers',
  coupons: 'Coupons',
  tickets: 'Support Tickets',
  banners: 'Banner Manager',
};

export default function AdminHeader({ activeSection, onOpenSearch, collapsed }) {
  const { 
    user, logout, dbNotifications, markNotificationRead, clearAllNotifications,
    adminStore, setAdminStore, adminTheme, setAdminTheme, addAuditLog
  } = useApp();
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showStore, setShowStore] = useState(false);
  const [showTheme, setShowTheme] = useState(false);

  const profileRef = useRef(null);
  const notifsRef = useRef(null);
  const storeRef = useRef(null);
  const themeRef = useRef(null);

  const unreadCount = dbNotifications?.filter(n => !n.readStatus).length || 0;

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
      if (notifsRef.current && !notifsRef.current.contains(e.target)) setShowNotifs(false);
      if (storeRef.current && !storeRef.current.contains(e.target)) setShowStore(false);
      if (themeRef.current && !themeRef.current.contains(e.target)) setShowTheme(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const sidebarWidth = collapsed ? 64 : 240;

  return (
    <header
      className="fixed top-0 right-0 h-16 z-20 bg-white/80 backdrop-blur-xl border-b border-slate-100/80 flex items-center px-5 gap-4"
      style={{
        left: sidebarWidth,
        transition: 'left 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        boxShadow: '0 1px 12px -2px rgba(0,0,0,0.06)',
      }}
    >
      {/* Page title / breadcrumb */}
      <div className="flex-1 min-w-0">
        <h1 className="text-sm font-semibold text-slate-900 truncate">
          {sectionTitles[activeSection] || 'Admin'}
        </h1>
        <p className="text-[10px] text-slate-400 font-medium">
          Vyvora &rsaquo; {sectionTitles[activeSection] || 'Admin'}
        </p>
      </div>

      {/* Center: Search trigger */}
      <button
        onClick={onOpenSearch}
        className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-400 text-xs hover:border-slate-300 hover:bg-white transition-all group w-52"
      >
        <Search className="w-3.5 h-3.5 flex-shrink-0" />
        <span className="flex-1 text-left">Search anything...</span>
        <kbd className="text-[9px] font-medium bg-white border border-slate-200 px-1.5 py-0.5 rounded-md text-slate-400 group-hover:border-slate-300">⌘K</kbd>
      </button>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        {/* Mobile search */}
        <button
          onClick={onOpenSearch}
          className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Store Switcher */}
        <div ref={storeRef} className="relative">
          <button
            onClick={() => setShowStore(v => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 bg-white text-xs hover:bg-slate-50 transition-all font-semibold"
          >
            <span>🏪 {adminStore}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>
          
          <AnimatePresence>
            {showStore && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-44 bg-white rounded-2xl border border-slate-250 shadow-2xl overflow-hidden z-50 py-1"
              >
                {[
                  { name: 'USA', label: 'Vyvora USA ($)', flag: '🇺🇸' },
                  { name: 'India', label: 'Vyvora India (₹)', flag: '🇮🇳' },
                  { name: 'Europe', label: 'Vyvora Europe (€)', flag: '🇪🇺' }
                ].map((s) => (
                  <button
                    key={s.name}
                    onClick={() => {
                      setAdminStore(s.name);
                      localStorage.setItem('admin_store', s.name);
                      addAuditLog('Store Switch', `Switched active store view to Vyvora ${s.name}.`, 'settings');
                      setShowStore(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2 text-xs text-left transition-colors hover:bg-slate-50 ${adminStore === s.name ? 'text-blue-600 font-bold bg-blue-50/40' : 'text-slate-650 font-medium'}`}
                  >
                    <span>{s.flag} {s.label}</span>
                    {adminStore === s.name && <Check className="w-3 h-3 text-blue-600 flex-shrink-0" />}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Theme Selector */}
        <div ref={themeRef} className="relative">
          <button
            onClick={() => setShowTheme(v => !v)}
            className="w-9 h-9 rounded-xl flex items-center justify-center border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
            title="Theme Customizer"
          >
            <Settings className="w-4 h-4 text-slate-600 animate-hover-spin" />
          </button>
          
          <AnimatePresence>
            {showTheme && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden z-50 py-1"
              >
                <div className="px-3 py-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Layout Theme</div>
                {[
                  { id: 'light', label: 'Default Light', colorClass: 'bg-slate-100 border-slate-200' },
                  { id: 'dark', label: 'Premium Dark', colorClass: 'bg-slate-900 border-slate-950' },
                  { id: 'glass-slate', label: 'Glass Slate', colorClass: 'bg-slate-700 border-slate-800' },
                  { id: 'glass-emerald', label: 'Glass Emerald', colorClass: 'bg-emerald-600 border-emerald-700' },
                  { id: 'glass-purple', label: 'Royal Purple', colorClass: 'bg-indigo-600 border-indigo-700' }
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setAdminTheme(t.id);
                      localStorage.setItem('admin_theme', t.id);
                      addAuditLog('Theme Customization', `Updated admin layout theme to ${t.label}.`, 'settings');
                      setShowTheme(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3.5 py-2 text-xs text-left transition-colors hover:bg-slate-50 ${adminTheme === t.id ? 'text-blue-600 font-bold bg-blue-50/40' : 'text-slate-650 font-medium'}`}
                  >
                    <div className={`w-3 h-3 rounded-full border ${t.colorClass} flex-shrink-0`} />
                    <span className="flex-grow">{t.label}</span>
                    {adminTheme === t.id && <Check className="w-3 h-3 text-blue-600 flex-shrink-0" />}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Notifications */}
        <div ref={notifsRef} className="relative">
          <button
            onClick={() => setShowNotifs(v => !v)}
            className="relative w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#EF4444] border border-white" />
            )}
          </button>

          <AnimatePresence>
            {showNotifs && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.18 }}
                className="absolute right-0 top-full mt-2 w-80 bg-white/95 backdrop-blur-xl rounded-2xl border border-slate-200/80 shadow-2xl overflow-hidden z-50"
                style={{ boxShadow: '0 20px 60px -8px rgba(0,0,0,0.15)' }}
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                  <h3 className="text-xs font-semibold text-slate-800">Notifications</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={clearAllNotifications}
                      className="text-[10px] text-blue-600 font-medium hover:text-blue-700"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto">
                  {dbNotifications?.length === 0 ? (
                    <div className="py-10 text-center text-xs text-slate-400 font-medium">
                      No notifications
                    </div>
                  ) : (
                    dbNotifications?.slice(0, 8).map((notif) => (
                      <div
                        key={notif._id}
                        onClick={() => markNotificationRead(notif._id)}
                        className={`flex items-start gap-3 px-4 py-3 border-b border-slate-50 cursor-pointer hover:bg-slate-50/80 transition-colors ${!notif.readStatus ? 'bg-blue-50/40' : ''}`}
                      >
                        <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5 ${!notif.readStatus ? 'bg-blue-100' : 'bg-slate-100'}`}>
                          {notif.readStatus
                            ? <Check className="w-3 h-3 text-slate-400" />
                            : <Bell className="w-3 h-3 text-blue-500" />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-slate-700 leading-snug">{notif.message}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{new Date(notif.createdAt).toLocaleDateString()}</p>
                        </div>
                        {!notif.readStatus && (
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => setShowProfile(v => !v)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#2563EB] to-[#7C3AED] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {user?.name?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="hidden md:block text-left min-w-0">
              <p className="text-xs font-semibold text-slate-800 leading-tight truncate max-w-[80px]">{user?.name || 'Admin'}</p>
              <p className="text-[9px] text-slate-400 capitalize">{user?.role || 'admin'}</p>
            </div>
            <ChevronDown className="w-3 h-3 text-slate-400 hidden md:block" />
          </button>

          <AnimatePresence>
            {showProfile && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.18 }}
                className="absolute right-0 top-full mt-2 w-52 bg-white/95 backdrop-blur-xl rounded-2xl border border-slate-200/80 shadow-2xl overflow-hidden z-50"
                style={{ boxShadow: '0 20px 60px -8px rgba(0,0,0,0.15)' }}
              >
                {/* User info */}
                <div className="px-4 py-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#7C3AED] flex items-center justify-center text-white text-sm font-bold">
                      {user?.name?.[0]?.toUpperCase() || 'A'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-900 truncate">{user?.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <span className="text-[9px] font-semibold uppercase tracking-widest text-violet-600 bg-violet-50 border border-violet-100 px-2 py-0.5 rounded-full">
                      {user?.role}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="py-1.5">
                  <button className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-slate-600 hover:bg-slate-50 transition-colors">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    My Profile
                  </button>
                  <button className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-slate-600 hover:bg-slate-50 transition-colors">
                    <Shield className="w-3.5 h-3.5 text-slate-400" />
                    Security
                  </button>
                  <button className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-slate-600 hover:bg-slate-50 transition-colors">
                    <Settings className="w-3.5 h-3.5 text-slate-400" />
                    Settings
                  </button>
                </div>

                <div className="border-t border-slate-100 py-1.5">
                  <button
                    onClick={() => { logout(); setShowProfile(false); }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
