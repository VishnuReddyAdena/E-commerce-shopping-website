import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Ticket, Percent, DollarSign, Calendar, Users } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import AdminModal from '../components/AdminModal';
import EmptyState from '../components/EmptyState';

export default function CouponsSection() {
  const { token, backendUrl, addNotification } = useApp();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ code: '', discountType: 'percent', discountValue: 15, expiryDate: '', usageLimit: 100 });

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/coupons`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) setCoupons(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCoupons(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${backendUrl}/api/coupons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, discountValue: Number(form.discountValue), usageLimit: Number(form.usageLimit) })
      });
      if (res.ok) {
        addNotification('Coupon created!', 'success');
        setShowModal(false);
        setForm({ code: '', discountType: 'percent', discountValue: 15, expiryDate: '', usageLimit: 100 });
        fetchCoupons();
      }
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${backendUrl}/api/coupons/${id}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) { addNotification('Coupon deleted.', 'info'); fetchCoupons(); }
    } catch (err) { console.error(err); }
  };

  const isExpired = (date) => new Date(date) < new Date();

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">{coupons.length} active coupons</p>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" /> Create Coupon
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 space-y-3 animate-pulse">
              <div className="h-8 bg-slate-100 rounded-xl w-1/2" />
              <div className="h-4 bg-slate-100 rounded-lg" />
              <div className="h-4 bg-slate-100 rounded-lg w-3/4" />
            </div>
          ))}
        </div>
      ) : coupons.length === 0 ? (
        <EmptyState
          icon={Ticket}
          title="No coupons yet"
          description="Create discount coupons to reward your customers"
          action={() => setShowModal(true)}
          actionLabel="Create Coupon"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {coupons.map((coupon, i) => {
            const usagePercent = Math.min((coupon.usedCount / coupon.usageLimit) * 100, 100);
            const expired = isExpired(coupon.expiryDate);
            return (
              <motion.div
                key={coupon._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${expired ? 'border-slate-200 opacity-60' : 'border-slate-100'}`}
              >
                {/* Top stripe */}
                <div className={`h-1 ${coupon.discountType === 'percent' ? 'bg-gradient-to-r from-violet-500 to-blue-500' : 'bg-gradient-to-r from-emerald-500 to-teal-500'}`} />

                <div className="p-5 space-y-3">
                  {/* Code + delete */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-slate-900 bg-slate-50 border border-slate-200 px-3 py-1 rounded-xl">
                          {coupon.code}
                        </span>
                        {expired && (
                          <span className="text-[9px] font-bold text-rose-600 bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded-full">EXPIRED</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(coupon._id)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-all flex-shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Discount info */}
                  <div className="flex items-center gap-1.5">
                    {coupon.discountType === 'percent'
                      ? <Percent className="w-3.5 h-3.5 text-violet-500" />
                      : <DollarSign className="w-3.5 h-3.5 text-emerald-500" />}
                    <span className="text-lg font-bold text-slate-900">
                      {coupon.discountValue}{coupon.discountType === 'percent' ? '%' : '$'} Off
                    </span>
                  </div>

                  {/* Meta */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                      <Calendar className="w-3 h-3" />
                      Expires {new Date(coupon.expiryDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                      <Users className="w-3 h-3" />
                      {coupon.usedCount} / {coupon.usageLimit} uses
                    </div>
                  </div>

                  {/* Usage progress bar */}
                  <div>
                    <div className="flex justify-between text-[9px] font-medium text-slate-400 mb-1">
                      <span>Usage</span>
                      <span>{Math.round(usagePercent)}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${usagePercent >= 90 ? 'bg-rose-400' : usagePercent >= 60 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                        style={{ width: `${usagePercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <AdminModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Create Coupon"
        size="sm"
        footer={
          <>
            <button onClick={() => setShowModal(false)} className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 rounded-xl border border-slate-200">Cancel</button>
            <button form="coupon-form" type="submit" disabled={saving} className="px-5 py-2 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm disabled:opacity-60">
              {saving ? 'Creating...' : 'Create Coupon'}
            </button>
          </>
        }
      >
        <form id="coupon-form" onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">Coupon Code *</label>
            <input type="text" placeholder="e.g. SAVE20" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} required
              className="w-full px-3 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 uppercase" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">Discount Type</label>
              <select value={form.discountType} onChange={e => setForm(f => ({ ...f, discountType: e.target.value }))}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400">
                <option value="percent">Percentage (%)</option>
                <option value="fixed">Fixed ($)</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">Discount Value *</label>
              <input type="number" placeholder="15" value={form.discountValue} onChange={e => setForm(f => ({ ...f, discountValue: e.target.value }))} required
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">Expiry Date *</label>
              <input type="date" value={form.expiryDate} onChange={e => setForm(f => ({ ...f, expiryDate: e.target.value }))} required
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">Usage Limit</label>
              <input type="number" placeholder="100" value={form.usageLimit} onChange={e => setForm(f => ({ ...f, usageLimit: e.target.value }))}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
            </div>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
