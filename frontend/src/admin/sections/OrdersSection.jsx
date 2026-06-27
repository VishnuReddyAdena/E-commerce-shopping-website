import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Truck, CheckCircle, ClipboardList, Filter, 
  Layout, List, Save, ChevronLeft, ChevronRight, X 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import { TableRowSkeleton } from '../components/SkeletonLoader';

const STATUS_FILTERS = ['All', 'Processing', 'Shipped', 'Delivered'];
const KANBAN_COLUMNS = [
  { id: 'Processing', label: 'Processing ⚙️', borderClass: 'border-blue-200 bg-blue-50/20' },
  { id: 'Shipped', label: 'Shipped 🚚', borderClass: 'border-violet-200 bg-violet-50/20' },
  { id: 'Delivered', label: 'Delivered ✅', borderClass: 'border-emerald-200 bg-emerald-50/20' }
];

const MOCK_ORDERS = [
  {
    _id: 'ord_mock_101',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    totalAmount: 149.00,
    orderStatus: 'Processing',
    paymentStatus: 'paid',
    userId: { name: 'Sarah Jenkins', email: 'sarah@example.com' },
    items: [ { productId: 'p1', title: 'Modular RGB Lights', quantity: 1 } ]
  },
  {
    _id: 'ord_mock_102',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    totalAmount: 299.99,
    orderStatus: 'Shipped',
    paymentStatus: 'paid',
    userId: { name: 'Alex Rivera', email: 'alex@example.com' },
    items: [ { productId: 'p2', title: 'Holographic Headphones', quantity: 1 } ]
  },
  {
    _id: 'ord_mock_103',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    totalAmount: 89.50,
    orderStatus: 'Delivered',
    paymentStatus: 'paid',
    userId: { name: 'Emily Chen', email: 'emily@example.com' },
    items: [ { productId: 'p3', title: 'EcoVibe Linen Hoodie', quantity: 1 } ]
  },
  {
    _id: 'ord_mock_104',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    totalAmount: 120.00,
    orderStatus: 'Delivered',
    paymentStatus: 'paid',
    userId: { name: 'Yuki Tanaka', email: 'yuki@example.com' },
    items: [ { productId: 'p4', title: 'Supreme Keyboard V2', quantity: 1 } ]
  }
];

export default function OrdersSection() {
  const { token, backendUrl, addNotification, savedViews, saveView, formatPrice } = useApp();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'kanban'

  // Saved views modal
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [viewName, setViewName] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/orders`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) setOrders(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`${backendUrl}/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        addNotification(`Order status updated to ${newStatus}`, 'success');
        fetchOrders();
      }
    } catch (err) { console.error(err); }
  };

  const displayOrders = orders.length > 0 ? orders : MOCK_ORDERS;

  const filtered = displayOrders.filter(o => {
    const matchesStatus = statusFilter === 'All' || o.orderStatus === statusFilter;
    const matchesSearch = search === '' ||
      o._id.includes(search) ||
      o.userId?.name?.toLowerCase().includes(search.toLowerCase()) ||
      o.userId?.email?.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const counts = {
    All: displayOrders.length,
    Processing: displayOrders.filter(o => o.orderStatus === 'Processing').length,
    Shipped: displayOrders.filter(o => o.orderStatus === 'Shipped').length,
    Delivered: displayOrders.filter(o => o.orderStatus === 'Delivered').length,
  };

  const handleSaveView = () => {
    if (!viewName.trim()) return;
    saveView('orders', viewName, { search, statusFilter });
    setViewName('');
    setShowSaveModal(false);
    addNotification(`View "${viewName}" saved successfully`, 'success');
  };

  return (
    <div className="space-y-5">
      {/* Toolbar & View toggles */}
      <div className="flex items-center justify-between flex-wrap gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search order ID, customer..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 font-semibold"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Saved Views selector */}
          {savedViews?.orders?.length > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">Views:</span>
              <select
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'default') {
                    setSearch('');
                    setStatusFilter('All');
                  } else {
                    const match = savedViews.orders.find(v => v.name === val);
                    if (match) {
                      setSearch(match.filters.search || '');
                      setStatusFilter(match.filters.statusFilter || 'All');
                    }
                  }
                }}
                className="px-2 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
              >
                <option value="default">Default Views</option>
                {savedViews.orders.map(v => (
                  <option key={v.name} value={v.name}>{v.name}</option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={() => setShowSaveModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-650 hover:bg-slate-55 text-xs font-semibold bg-white"
            title="Save Filter Configurations"
          >
            <Save className="w-3.5 h-3.5 text-slate-500" />
            Save View
          </button>

          {/* Toggle View Mode */}
          <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden p-0.5 bg-slate-50">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${viewMode === 'table' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <List className="w-3.5 h-3.5" />
              Table
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${viewMode === 'kanban' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <Layout className="w-3.5 h-3.5" />
              Kanban
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'table' ? (
        <>
          {/* Status tabs */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {STATUS_FILTERS.map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  statusFilter === s
                    ? 'bg-[#2563EB] text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-350'
                }`}
              >
                {s}
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${statusFilter === s ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  {counts[s]}
                </span>
              </button>
            ))}
          </div>

          {/* Table list */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="text-left px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Order ID</th>
                    <th className="text-left px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Customer</th>
                    <th className="text-left px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Items</th>
                    <th className="text-left px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Amount</th>
                    <th className="text-left px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                    <th className="text-left px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Date</th>
                    <th className="text-right px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <TableRowSkeleton cols={7} rows={6} />
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7}>
                        <EmptyState
                          icon={ClipboardList}
                          title="No orders found"
                          description={statusFilter !== 'All' ? `No ${statusFilter} orders` : 'No orders yet'}
                        />
                      </td>
                    </tr>
                  ) : (
                    filtered.map((order) => (
                      <motion.tr
                        key={order._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="border-b border-slate-50 transition-colors"
                      >
                        <td className="px-5 py-3.5">
                          <span className="font-mono text-[11px] font-semibold text-slate-700 bg-slate-50 border border-slate-100 px-2 py-1 rounded-lg">
                            #{order._id.startsWith('ord_sim_') ? order._id.slice(-5).toUpperCase() : order._id.slice(-8).toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 flex-shrink-0">
                              {order.userId?.name?.[0]?.toUpperCase() || '?'}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-slate-800 truncate">{order.userId?.name || 'Guest'}</p>
                              <p className="text-[10px] text-slate-400 truncate max-w-[120px]">{order.userId?.email || ''}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="text-xs text-slate-650 font-medium">{order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <p className="text-xs font-bold text-slate-900">{formatPrice(order.totalAmount)}</p>
                          <p className="text-[9px] text-slate-400 capitalize">{order.paymentStatus}</p>
                        </td>
                        <td className="px-4 py-3.5">
                          <StatusBadge status={order.orderStatus} />
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="text-[11px] text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          {order.orderStatus === 'Processing' && (
                            <button
                              onClick={() => handleUpdateStatus(order._id, 'Shipped')}
                              className="flex items-center gap-1.5 text-[10px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1.5 rounded-lg ml-auto transition-colors"
                            >
                              <Truck className="w-3 h-3" /> Ship
                            </button>
                          )}
                          {order.orderStatus === 'Shipped' && (
                            <button
                              onClick={() => handleUpdateStatus(order._id, 'Delivered')}
                              className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1.5 rounded-lg ml-auto transition-colors"
                            >
                              <CheckCircle className="w-3 h-3" /> Deliver
                            </button>
                          )}
                          {order.orderStatus === 'Delivered' && (
                            <span className="text-[10px] text-emerald-600 font-semibold">✓ Complete</span>
                          )}
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Kanban Board View */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {KANBAN_COLUMNS.map(col => {
            const colOrders = filtered.filter(o => o.orderStatus === col.id);
            return (
              <div 
                key={col.id} 
                className={`rounded-2xl border p-4 flex flex-col min-h-[480px] shadow-sm relative ${col.borderClass}`}
              >
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
                  <h4 className="text-xs font-bold text-slate-750">{col.label}</h4>
                  <span className="text-[10px] font-bold bg-white text-slate-500 border border-slate-200 rounded-full px-2 py-0.5 shadow-sm">
                    {colOrders.length}
                  </span>
                </div>

                <div className="flex-1 space-y-3.5 overflow-y-auto no-scrollbar">
                  {colOrders.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 py-16 space-y-2">
                      <ClipboardList className="w-8 h-8 text-slate-250" />
                      <p className="text-[11px] font-bold text-slate-450">No pipeline cards</p>
                    </div>
                  ) : (
                    colOrders.map(order => (
                      <motion.div
                        key={order._id}
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-xl border border-slate-200 p-3.5 space-y-3 shadow hover:shadow-md transition-shadow relative overflow-hidden"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-[10px] font-bold text-slate-400">
                            #{order._id.startsWith('ord_sim_') ? order._id.slice(-5).toUpperCase() : order._id.slice(-8).toUpperCase()}
                          </span>
                          <span className="text-[9px] text-slate-400 font-medium">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <div>
                          <p className="text-xs font-bold text-slate-800">{order.userId?.name || 'Guest'}</p>
                          <p className="text-[10px] text-slate-450 truncate mt-0.5">{order.userId?.email || ''}</p>
                        </div>

                        <div className="flex items-center justify-between border-t border-slate-50 pt-2.5">
                          <div>
                            <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wide">Grand Total</p>
                            <span className="text-xs font-extrabold text-blue-600">{formatPrice(order.totalAmount)}</span>
                          </div>

                          {/* Transition buttons */}
                          <div className="flex items-center gap-1.5">
                            {col.id === 'Shipped' && (
                              <button
                                onClick={() => handleUpdateStatus(order._id, 'Processing')}
                                className="w-6 h-6 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-500 border border-slate-200 flex items-center justify-center transition-colors"
                                title="Revert status to Processing"
                              >
                                <ChevronLeft className="w-3.5 h-3.5" />
                              </button>
                            )}
                            
                            {col.id === 'Processing' && (
                              <button
                                onClick={() => handleUpdateStatus(order._id, 'Shipped')}
                                className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold transition-all shadow-sm flex items-center gap-1"
                                title="Ship Order"
                              >
                                <span>Ship</span>
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            )}

                            {col.id === 'Shipped' && (
                              <button
                                onClick={() => handleUpdateStatus(order._id, 'Delivered')}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold transition-all shadow-sm flex items-center gap-1"
                                title="Deliver Order"
                              >
                                <span>Deliver</span>
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            )}

                            {col.id === 'Delivered' && (
                              <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">Complete ✓</span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Save View Modal dialog */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowSaveModal(false)} />
          <div className="relative w-full max-w-sm bg-white rounded-2xl border border-slate-200 shadow-2xl p-5 z-50 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-50 pb-2">
              <h3 className="text-xs font-bold text-slate-800">Save Filter Configuration</h3>
              <button onClick={() => setShowSaveModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div>
              <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Named Table View</label>
              <input
                type="text"
                placeholder="e.g. Processing High Value"
                value={viewName}
                onChange={e => setViewName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none font-semibold text-slate-850"
              />
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={handleSaveView}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl"
              >
                Save view configs
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
