import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, X, ArrowRight, ShoppingBag, ClipboardList, 
  Users, Ticket, Tag, Award, LayoutDashboard, BarChart3, 
  ImagePlay, Package, Terminal 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

const ALL_PAGES = [
  { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard, group: 'Pages' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, group: 'Pages' },
  { id: 'products', label: 'Products Catalog', icon: ShoppingBag, group: 'Pages' },
  { id: 'orders', label: 'Orders Management', icon: ClipboardList, group: 'Pages' },
  { id: 'customers', label: 'Customer Management', icon: Users, group: 'Pages' },
  { id: 'categories', label: 'Categories', icon: Tag, group: 'Pages' },
  { id: 'brands', label: 'Brands', icon: Award, group: 'Pages' },
  { id: 'coupons', label: 'Coupons & Promos', icon: Ticket, group: 'Pages' },
  { id: 'banners', label: 'Banner Manager', icon: ImagePlay, group: 'Pages' },
  { id: 'tickets', label: 'Support Tickets', icon: Package, group: 'Pages' },
];

export default function CommandPalette({ isOpen, onClose, onNavigate }) {
  const { backendUrl, token, setAdminTheme, addAuditLog, addNotification } = useApp();
  const [query, setQuery] = useState('');
  const [cursor, setCursor] = useState(0);
  const [dbProducts, setDbProducts] = useState([]);
  const [dbOrders, setDbOrders] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setCursor(0);
      setTimeout(() => inputRef.current?.focus(), 50);

      // Load products and orders for search indexing
      const loadIndex = async () => {
        try {
          const [pRes, oRes] = await Promise.all([
            fetch(`${backendUrl}/api/products`),
            fetch(`${backendUrl}/api/orders`, { headers: { Authorization: `Bearer ${token}` } })
          ]);
          if (pRes.ok) {
            const pData = await pRes.json();
            setDbProducts(pData);
          }
          if (oRes.ok) {
            const oData = await oRes.json();
            setDbOrders(oData);
          }
        } catch (err) {
          console.error('Error loading search index for command palette:', err);
        }
      };
      loadIndex();
    }
  }, [isOpen, backendUrl, token]);

  const getResults = () => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      return { pages: ALL_PAGES, products: [], orders: [], commands: [] };
    }

    if (trimmed.startsWith('/')) {
      const COMMANDS = [
        { id: 'cmd_light', label: 'Switch to Light Theme', code: '/theme light', icon: Terminal, action: () => { setAdminTheme('light'); localStorage.setItem('admin_theme', 'light'); addAuditLog('Theme Customization', 'Updated theme to Default Light via Command Palette.', 'settings'); } },
        { id: 'cmd_dark', label: 'Switch to Dark Theme', code: '/theme dark', icon: Terminal, action: () => { setAdminTheme('dark'); localStorage.setItem('admin_theme', 'dark'); addAuditLog('Theme Customization', 'Updated theme to Premium Dark via Command Palette.', 'settings'); } },
        { id: 'cmd_slate', label: 'Switch to Slate Glass Theme', code: '/theme glass-slate', icon: Terminal, action: () => { setAdminTheme('glass-slate'); localStorage.setItem('admin_theme', 'glass-slate'); addAuditLog('Theme Customization', 'Updated theme to Slate Glass via Command Palette.', 'settings'); } },
        { id: 'cmd_emerald', label: 'Switch to Emerald Glass Theme', code: '/theme glass-emerald', icon: Terminal, action: () => { setAdminTheme('glass-emerald'); localStorage.setItem('admin_theme', 'glass-emerald'); addAuditLog('Theme Customization', 'Updated theme to Emerald Glass via Command Palette.', 'settings'); } },
        { id: 'cmd_purple', label: 'Switch to Royal Purple Theme', code: '/theme glass-purple', icon: Terminal, action: () => { setAdminTheme('glass-purple'); localStorage.setItem('admin_theme', 'glass-purple'); addAuditLog('Theme Customization', 'Updated theme to Royal Purple via Command Palette.', 'settings'); } },
        { id: 'cmd_add', label: 'Open Add Product Dialog', code: '/add', icon: Terminal, action: () => { onNavigate('products'); setTimeout(() => { const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Add Product')); if (btn) btn.click(); }, 300); } },
        { id: 'cmd_refresh', label: 'Refresh Dashboard Statistics', code: '/refresh', icon: Terminal, action: () => { addNotification('Dashboard stats refresh requested.', 'info'); window.location.reload(); } }
      ];
      return {
        pages: [],
        products: [],
        orders: [],
        commands: COMMANDS.filter(c => c.code.includes(trimmed))
      };
    }

    const filteredPages = ALL_PAGES.filter(p => p.label.toLowerCase().includes(trimmed));
    const filteredProducts = dbProducts
      .filter(p => p.title?.toLowerCase().includes(trimmed) || p.category?.toLowerCase().includes(trimmed) || p.brand?.toLowerCase().includes(trimmed))
      .slice(0, 5)
      .map(p => ({ id: p._id, label: p.title, icon: ShoppingBag, group: 'Products', type: 'product' }));
    const filteredOrders = dbOrders
      .filter(o => o._id?.toLowerCase().includes(trimmed) || o.userId?.name?.toLowerCase().includes(trimmed))
      .slice(0, 5)
      .map(o => ({ id: o._id, label: `Order #${o._id?.slice(-6)} - ${o.userId?.name || 'Customer'}`, icon: ClipboardList, group: 'Orders', type: 'order' }));

    return { pages: filteredPages, products: filteredProducts, orders: filteredOrders, commands: [] };
  };

  const results = getResults();
  const flatResults = [
    ...results.pages.map(p => ({ ...p, itemType: 'page' })),
    ...results.commands.map(c => ({ ...c, itemType: 'command' })),
    ...results.products.map(p => ({ ...p, itemType: 'product' })),
    ...results.orders.map(o => ({ ...o, itemType: 'order' }))
  ];

  const executeAction = (item) => {
    if (item.itemType === 'page') {
      onNavigate(item.id);
    } else if (item.itemType === 'command') {
      item.action();
    } else if (item.itemType === 'product') {
      onNavigate('products');
    } else if (item.itemType === 'order') {
      onNavigate('orders');
    }
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setCursor(c => Math.min(c + 1, flatResults.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setCursor(c => Math.max(c - 1, 0)); }
    if (e.key === 'Enter' && flatResults[cursor]) {
      executeAction(flatResults[cursor]);
    }
    if (e.key === 'Escape') onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="cp-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[300] bg-slate-900/50 backdrop-blur-sm"
          />
          <div className="fixed inset-0 z-[301] flex items-start justify-center pt-[15vh] px-4 pointer-events-none">
            <motion.div
              key="cp-panel"
              initial={{ opacity: 0, scale: 0.94, y: -12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: -12 }}
              transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="w-full max-w-lg pointer-events-auto bg-white/95 backdrop-blur-2xl rounded-2xl border border-slate-200/80 overflow-hidden"
              style={{ boxShadow: '0 32px 80px -8px rgba(0,0,0,0.2)' }}
            >
              {/* Search input */}
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100">
                <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={e => { setQuery(e.target.value); setCursor(0); }}
                  onKeyDown={handleKeyDown}
                  placeholder="Search pages, products, orders or type '/' for commands..."
                  className="flex-1 text-sm text-slate-800 placeholder-slate-400 bg-transparent outline-none"
                />
                {query && (
                  <button onClick={() => setQuery('')} className="text-slate-400 hover:text-slate-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <kbd className="text-[9px] font-medium bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-slate-400">ESC</kbd>
              </div>

              {/* Results */}
              <div className="max-h-72 overflow-y-auto py-2">
                {flatResults.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">No results for "{query}"</div>
                ) : (
                  <>
                    <p className="px-4 py-1 text-[9px] font-semibold text-slate-400 uppercase tracking-widest">
                      {query.startsWith('/') ? 'Slash Commands' : 'Search Results'}
                    </p>
                    {flatResults.map((item, i) => (
                      <button
                        key={`${item.itemType}_${item.id}`}
                        onClick={() => executeAction(item)}
                        onMouseEnter={() => setCursor(i)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${cursor === i ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'}`}
                      >
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${cursor === i ? 'bg-blue-100' : 'bg-slate-100'}`}>
                          <item.icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-grow min-w-0">
                          <p className="text-sm font-medium truncate">{item.label}</p>
                          {item.group && (
                            <p className="text-[10px] text-slate-400 font-medium">{item.group}</p>
                          )}
                        </div>
                        {cursor === i && <ArrowRight className="w-3.5 h-3.5 flex-shrink-0" />}
                      </button>
                    ))}
                  </>
                )}
              </div>

              {/* Footer hints */}
              <div className="px-4 py-2.5 border-t border-slate-100 flex items-center gap-4">
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <kbd className="bg-slate-100 border border-slate-200 rounded px-1 py-0.5 text-[9px]">↑↓</kbd> Navigate
                </span>
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <kbd className="bg-slate-100 border border-slate-200 rounded px-1 py-0.5 text-[9px]">↵</kbd> Open
                </span>
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <kbd className="bg-slate-100 border border-slate-200 rounded px-1 py-0.5 text-[9px]">esc</kbd> Close
                </span>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
