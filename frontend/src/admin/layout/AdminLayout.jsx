import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import CommandPalette from './CommandPalette';

const SIDEBAR_KEY = 'admin_sidebar_collapsed';

export default function AdminLayout({ activeSection, onNavigate, children }) {
  const { adminTheme } = useApp();
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem(SIDEBAR_KEY) === 'true'; }
    catch { return false; }
  });
  const [cmdOpen, setCmdOpen] = useState(false);

  const toggleSidebar = () => {
    setCollapsed(v => {
      const next = !v;
      try { localStorage.setItem(SIDEBAR_KEY, String(next)); } catch {}
      return next;
    });
  };

  // Keyboard navigation and shortcut listeners
  useEffect(() => {
    let lastKey = '';
    let lastKeyTime = 0;

    const handler = (e) => {
      // 1. Ctrl+K or Cmd+K to toggle Command Palette
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCmdOpen(v => !v);
        return;
      }

      // Ignore shortcuts if the user is typing in form elements
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || document.activeElement?.isContentEditable) {
        return;
      }

      const now = Date.now();
      const isSequence = lastKey === 'g' && (now - lastKeyTime < 1000);

      if (isSequence) {
        if (e.key === 'd') { e.preventDefault(); onNavigate('overview'); }
        if (e.key === 'o') { e.preventDefault(); onNavigate('orders'); }
        if (e.key === 'p') { e.preventDefault(); onNavigate('products'); }
        if (e.key === 'a') { e.preventDefault(); onNavigate('analytics'); }
        if (e.key === 'c') { e.preventDefault(); onNavigate('customers'); }
        lastKey = ''; // reset sequence
      } else {
        if (e.key === 'g') {
          lastKey = 'g';
          lastKeyTime = now;
        } else if (e.key === 'c' && !e.ctrlKey && !e.metaKey) {
          // Open command palette on 'c'
          e.preventDefault();
          setCmdOpen(true);
        } else if (e.key === 'n' && activeSection === 'products') {
          // Trigger Add Product button click
          e.preventDefault();
          const addBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Add Product'));
          if (addBtn) addBtn.click();
        }
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [activeSection, onNavigate]);

  const sidebarWidth = collapsed ? 64 : 240;

  return (
    <div className={`min-h-screen theme-${adminTheme}`} style={{ transition: 'background-color 0.3s ease' }}>
      {/* Sidebar */}
      <AdminSidebar
        activeSection={activeSection}
        onNavigate={onNavigate}
        collapsed={collapsed}
        onToggle={toggleSidebar}
      />

      {/* Header */}
      <AdminHeader
        activeSection={activeSection}
        onOpenSearch={() => setCmdOpen(true)}
        collapsed={collapsed}
      />

      {/* Main content */}
      <main
        className="pt-16 min-h-screen transition-all duration-300"
        style={{
          marginLeft: sidebarWidth,
          transition: 'margin-left 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94), background-color 0.3s ease',
        }}
      >
        <div className="p-6 max-w-[1400px] mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Command Palette */}
      <CommandPalette
        isOpen={cmdOpen}
        onClose={() => setCmdOpen(false)}
        onNavigate={(section) => { onNavigate(section); setCmdOpen(false); }}
      />
    </div>
  );
}
