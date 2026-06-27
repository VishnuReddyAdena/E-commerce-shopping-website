import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Award, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import AdminModal from '../components/AdminModal';
import EmptyState from '../components/EmptyState';

export default function BrandsSection() {
  const { token, backendUrl, brands, addNotification } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [localBrands, setLocalBrands] = useState(null);
  const displayBrands = localBrands ?? brands;

  const [form, setForm] = useState({ name: '', description: '', logo: '' });

  const fetchBrands = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/brands`);
      const data = await res.json();
      if (res.ok) setLocalBrands(data);
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${backendUrl}/api/brands`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: form.name, description: form.description, logo: form.logo || '/placeholder-brand.jpg' })
      });
      if (res.ok) {
        addNotification('Brand added!', 'success');
        setShowModal(false);
        setForm({ name: '', description: '', logo: '' });
        fetchBrands();
      }
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete brand "${name}"?`)) return;
    try {
      const res = await fetch(`${backendUrl}/api/brands/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        addNotification('Brand deleted successfully.', 'info');
        fetchBrands();
      } else {
        const data = await res.json();
        addNotification(data.message || 'Failed to delete brand', 'error');
      }
    } catch (err) {
      console.error(err);
      addNotification('Network error', 'error');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">{displayBrands.length} brands registered</p>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" /> Add Brand
        </button>
      </div>

      {displayBrands.length === 0 ? (
        <EmptyState
          icon={Award}
          title="No brands yet"
          description="Add your first brand to categorize products by manufacturer"
          action={() => setShowModal(true)}
          actionLabel="Add Brand"
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {displayBrands.map((brand, i) => (
            <motion.div
              key={brand._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ y: -3, boxShadow: '0 12px 32px -4px rgba(0,0,0,0.12)' }}
              className="bg-white rounded-2xl border border-slate-100 p-4 flex flex-col items-center text-center gap-3 shadow-sm group cursor-default relative"
            >
              <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden">
                <img
                  src={brand.logo}
                  alt={brand.name}
                  className="w-full h-full object-contain p-2"
                  onError={e => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = `<div class="text-xl font-black text-slate-300">${brand.name?.[0] || '?'}</div>`;
                  }}
                />
              </div>
              <div className="min-w-0 w-full pr-1">
                <h4 className="text-sm font-semibold text-slate-900 truncate">{brand.name}</h4>
                <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                  {brand.description || 'No description'}
                </p>
              </div>
              <button
                onClick={() => handleDelete(brand._id, brand.name)}
                className="absolute top-2 right-2 w-6 h-6 rounded-lg bg-white/95 border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                title="Delete Brand"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </motion.div>
          ))}
        </div>
      )}


      <AdminModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Add Brand"
        size="sm"
        footer={
          <>
            <button onClick={() => setShowModal(false)} className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 rounded-xl border border-slate-200">Cancel</button>
            <button form="brand-form" type="submit" disabled={saving} className="px-5 py-2 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm disabled:opacity-60">
              {saving ? 'Saving...' : 'Add Brand'}
            </button>
          </>
        }
      >
        <form id="brand-form" onSubmit={handleSubmit} className="space-y-3">
          {[
            { label: 'Brand Name *', key: 'name', placeholder: 'e.g. Samsung' },
            { label: 'Logo URL', key: 'logo', placeholder: 'https://...' },
            { label: 'Description', key: 'description', placeholder: 'Brief brand description' },
          ].map(({ label, key, placeholder }) => (
            <div key={key}>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">{label}</label>
              <input
                type="text"
                placeholder={placeholder}
                value={form[key]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                required={key === 'name'}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
              />
            </div>
          ))}
        </form>
      </AdminModal>
    </div>
  );
}
