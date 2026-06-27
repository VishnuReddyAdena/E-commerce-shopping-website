import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Tag, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import AdminModal from '../components/AdminModal';
import EmptyState from '../components/EmptyState';

export default function CategoriesSection() {
  const { token, backendUrl, categories, addNotification } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', image: '', parentCategory: '' });

  // We need to reload categories after adding — use local state for optimistic UI
  const [localCats, setLocalCats] = useState(null);
  const displayCats = localCats ?? categories;

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/categories`);
      const data = await res.json();
      if (res.ok) setLocalCats(data);
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${backendUrl}/api/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          image: form.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80',
          parentCategory: form.parentCategory || undefined
        })
      });
      if (res.ok) {
        addNotification('Category created!', 'success');
        setShowModal(false);
        setForm({ name: '', description: '', image: '', parentCategory: '' });
        fetchCategories();
      }
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete category "${name}"?`)) return;
    try {
      const res = await fetch(`${backendUrl}/api/categories/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        addNotification('Category deleted successfully.', 'info');
        fetchCategories();
      } else {
        const data = await res.json();
        addNotification(data.message || 'Failed to delete category', 'error');
      }
    } catch (err) {
      console.error(err);
      addNotification('Network error', 'error');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500">{displayCats.length} categories</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {displayCats.length === 0 ? (
        <EmptyState
          icon={Tag}
          title="No categories yet"
          description="Create your first category to organize your products"
          action={() => setShowModal(true)}
          actionLabel="Add Category"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayCats.map((cat, i) => (
            <motion.div
              key={cat._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ y: -2, boxShadow: '0 8px 24px -4px rgba(0,0,0,0.1)' }}
              className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-4 shadow-sm cursor-default relative group"
            >
              <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-contain p-2"
                  onError={e => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = '<span class="text-2xl">📦</span>';
                  }}
                />
              </div>
              <div className="flex-1 min-w-0 pr-6">
                <h4 className="text-sm font-semibold text-slate-900 truncate">{cat.name}</h4>
                <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                  {cat.description || 'No description'}
                </p>
                {cat.parentCategory && (
                  <span className="inline-block mt-1.5 text-[9px] font-semibold uppercase tracking-wide text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">
                    Sub: {cat.parentCategory?.name || 'Parent'}
                  </span>
                )}
              </div>
              <button
                onClick={() => handleDelete(cat._id, cat.name)}
                className="absolute top-2 right-2 w-7 h-7 rounded-lg flex items-center justify-center border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-all"
                title="Delete Category"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </div>
      )}


      <AdminModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Create Category"
        size="sm"
        footer={
          <>
            <button onClick={() => setShowModal(false)} className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 rounded-xl border border-slate-200 transition-colors">Cancel</button>
            <button form="cat-form" type="submit" disabled={saving} className="px-5 py-2 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm disabled:opacity-60">
              {saving ? 'Saving...' : 'Create Category'}
            </button>
          </>
        }
      >
        <form id="cat-form" onSubmit={handleSubmit} className="space-y-3">
          {[
            { label: 'Category Name *', key: 'name', placeholder: 'e.g. Electronics' },
            { label: 'Image URL', key: 'image', placeholder: 'https://...' },
            { label: 'Description', key: 'description', placeholder: 'Short description' },
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
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">Parent Category (optional)</label>
            <select
              value={form.parentCategory}
              onChange={e => setForm(f => ({ ...f, parentCategory: e.target.value }))}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
            >
              <option value="">Root Category</option>
              {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
