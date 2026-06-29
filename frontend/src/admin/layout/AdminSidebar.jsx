import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  ShoppingBag,
  Tag,
  Award,
  ClipboardList,
  Users,
  Ticket,
  BarChart3,
  Settings,
  ChevronRight,
  Zap,
  Package,
  PanelLeftClose,
  PanelLeftOpen,
  ImagePlay,
} from 'lucide-react';

const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [
      { id: 'overview', icon: LayoutDashboard, label: 'Dashboard' },
      { id: 'analytics', icon: BarChart3, label: 'Analytics' },
    ],
  },
  {
    label: 'Catalog',
    items: [
      { id: 'products', icon: ShoppingBag, label: 'Products' },
      { id: 'categories', icon: Tag, label: 'Categories' },
      { id: 'brands', icon: Award, label: 'Brands' },
    ],
  },
  {
    label: 'Commerce',
    items: [
      { id: 'orders', icon: ClipboardList, label: 'Orders' },
      { id: 'customers', icon: Users, label: 'Customers' },
      { id: 'coupons', icon: Ticket, label: 'Coupons' },
    ],
  },
  {
    label: 'Content',
    items: [
      { id: 'banners', icon: ImagePlay, label: 'Banners' },
    ],
  },
  {
    label: 'Support',
    items: [
      { id: 'tickets', icon: Package, label: 'Tickets' },
    ],
  },
];

export default function AdminSidebar({ activeSection, onNavigate, collapsed, onToggle }) {
  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="fixed left-0 top-0 h-full z-30 flex flex-col bg-white/90 backdrop-blur-2xl border-r border-slate-100/80 overflow-hidden"
      style={{ boxShadow: '4px 0 24px -4px rgba(0,0,0,0.06)' }}
    >
      {/* Logo area */}
      <div className="flex items-center h-16 px-4 border-b border-slate-100/80 flex-shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Logo icon */}
          <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#7C3AED] flex items-center justify-center shadow-md">
            <Zap className="w-4 h-4 text-white" fill="white" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
                className="min-w-0"
              >
                <p className="text-sm font-bold text-slate-900 leading-tight tracking-tight">Vyvora</p>
                <p className="text-[9px] font-medium text-slate-400 uppercase tracking-widest">Admin Portal</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-2 space-y-0.5 no-scrollbar">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-2">
            {/* Group label */}
            <AnimatePresence>
              {!collapsed && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="px-3 mb-1 text-[9px] font-semibold text-slate-400 uppercase tracking-widest"
                >
                  {group.label}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Nav items */}
            {group.items.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <motion.button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  whileHover={{ x: collapsed ? 0 : 2 }}
                  whileTap={{ scale: 0.97 }}
                  title={collapsed ? item.label : undefined}
                  className={`relative w-full flex items-center gap-3 rounded-xl transition-all duration-150 group
                    ${collapsed ? 'justify-center px-0 py-2.5' : 'px-3 py-2.5'}
                    ${isActive
                      ? 'bg-[#2563EB]/10 text-[#2563EB]'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                    }`}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute left-0 w-0.5 h-5 bg-[#2563EB] rounded-full"
                      style={{ top: 'calc(50% - 10px)' }}
                    />
                  )}

                  {/* Icon */}
                  <item.icon
                    className={`flex-shrink-0 w-4.5 h-4.5 transition-colors ${isActive ? 'text-[#2563EB]' : 'text-slate-400 group-hover:text-slate-600'}`}
                    strokeWidth={isActive ? 2.2 : 1.8}
                    style={{ width: 18, height: 18 }}
                  />

                  {/* Label */}
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -6 }}
                        transition={{ duration: 0.18 }}
                        className={`text-[13px] font-medium leading-none flex-1 text-left ${isActive ? 'font-semibold text-[#2563EB]' : ''}`}
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {/* Chevron for active */}
                  {!collapsed && isActive && (
                    <ChevronRight className="w-3.5 h-3.5 text-[#2563EB] flex-shrink-0" />
                  )}
                </motion.button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Collapse toggle */}
      <div className="px-2 py-3 border-t border-slate-100/80 flex-shrink-0">
        <button
          onClick={onToggle}
          className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors ${collapsed ? 'justify-center' : ''}`}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed
            ? <PanelLeftOpen style={{ width: 18, height: 18 }} strokeWidth={1.8} />
            : <PanelLeftClose style={{ width: 18, height: 18 }} strokeWidth={1.8} />
          }
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-[12px] font-medium"
              >
                Collapse
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
}
