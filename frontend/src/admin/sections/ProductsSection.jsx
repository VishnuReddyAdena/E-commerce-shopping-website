import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, Package, Star, Grid, List, ImagePlus, X, Eye, RefreshCw, Save, ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import AdminModal from '../components/AdminModal';
import EmptyState from '../components/EmptyState';
import { TableRowSkeleton } from '../components/SkeletonLoader';

function StockBadge({ count }) {
  if (count <= 0) return <span className="text-[9px] font-semibold text-rose-600 bg-rose-50 border border-rose-100 rounded-full px-2 py-0.5">Out of Stock</span>;
  if (count <= 5) return <span className="text-[9px] font-semibold text-amber-600 bg-amber-50 border border-amber-100 rounded-full px-2 py-0.5">Low: {count}</span>;
  return <span className="text-[9px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-full px-2 py-0.5">{count} in stock</span>;
}

const EMPTY_FORM = {
  title: '',
  description: '',
  price: '',
  category: '',
  brand: '',
  images: [''],       // support multiple images
  inventoryCount: 10,
  colors: '',
  sizes: '',
  isFlashSale: false,
  flashSalePrice: '',
};

export default function ProductsSection() {
  const { token, backendUrl, categories, brands, addNotification, savedViews, saveView } = useApp();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [viewMode, setViewMode] = useState('table');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [brokenImages, setBrokenImages] = useState({});
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [viewName, setViewName] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    setCurrentPage(1);
  }, [search, categoryFilter]);

  const handleSaveView = () => {
    if (!viewName.trim()) return;
    saveView('products', viewName, { search, categoryFilter });
    setViewName('');
    setShowSaveModal(false);
    addNotification(`View "${viewName}" saved successfully`, 'success');
  };

  const handleImageError = (id) => {
    setBrokenImages(prev => ({ ...prev, [id]: true }));
  };

  // unique category list from products
  const uniqueCategories = [...new Set(products.map(p => p.category).filter(Boolean))];

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/products`);
      const data = await res.json();
      if (res.ok) setProducts(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, []);

  const openAdd = () => {
    setEditingProduct(null);
    setForm({ ...EMPTY_FORM, brand: brands[0]?.name || '' });
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditingProduct(p);
    setForm({
      title: p.title || '',
      description: p.description || '',
      price: p.price || '',
      category: p.category || '',
      brand: p.brand || '',
      images: p.images?.length ? [...p.images] : [''],
      inventoryCount: p.inventoryCount ?? 10,
      colors: Array.isArray(p.colors) ? p.colors.join(', ') : (p.colors || ''),
      sizes: Array.isArray(p.sizes) ? p.sizes.join(', ') : (p.sizes || ''),
      isFlashSale: p.isFlashSale || false,
      flashSalePrice: p.flashSalePrice || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.price || !form.category) {
      addNotification('Title, price, and category are required.', 'error');
      return;
    }
    setSaving(true);

    // Sanitize images: filter empty strings, fallback to placeholder
    const cleanImages = form.images.filter(img => img.trim() !== '');
    if (cleanImages.length === 0) {
      cleanImages.push('https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80');
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      category: form.category,
      brand: form.brand || 'Generic',
      inventoryCount: Number(form.inventoryCount) || 0,
      images: cleanImages,
      colors: form.colors ? form.colors.split(',').map(c => c.trim()).filter(Boolean) : [],
      sizes: form.sizes ? form.sizes.split(',').map(s => s.trim()).filter(Boolean) : [],
      isFlashSale: form.isFlashSale,
      flashSalePrice: form.flashSalePrice ? Number(form.flashSalePrice) : undefined,
    };

    try {
      const url = editingProduct
        ? `${backendUrl}/api/products/${editingProduct._id}`
        : `${backendUrl}/api/products`;
      const method = editingProduct ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        addNotification(editingProduct ? '✓ Product updated successfully!' : '✓ Product created successfully!', 'success');
        setShowModal(false);
        fetchProducts();
      } else {
        addNotification(data.message || 'Failed to save product', 'error');
      }
    } catch (err) {
      addNotification('Network error', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"?`)) return;
    try {
      const res = await fetch(`${backendUrl}/api/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        addNotification('Product deleted.', 'info');
        fetchProducts();
      }
    } catch (err) { console.error(err); }
  };

  // Image field helpers
  const addImageField = () => setForm(f => ({ ...f, images: [...f.images, ''] }));
  const removeImageField = (i) => setForm(f => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }));
  const updateImage = (i, val) => setForm(f => ({ ...f, images: f.images.map((img, idx) => idx === i ? val : img) }));

  const filtered = products.filter(p => {
    const matchSearch = !search || p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.toLowerCase().includes(search.toLowerCase()) ||
      p.brand?.toLowerCase().includes(search.toLowerCase());
    const matchCat = !categoryFilter || p.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedProducts = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const InputField = ({ label, value, onChange, type = 'text', placeholder = '', required = false }) => (
    <div>
      <label className="block text-[11px] font-medium text-slate-600 mb-1">{label}{required && <span className="text-rose-500 ml-0.5">*</span>}</label>
      <input
        type={type}
        placeholder={placeholder || label}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
      />
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex-1 relative min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by title, category, brand..."
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
          />
        </div>

        {/* Saved Views selector */}
        {savedViews?.products?.length > 0 && (
          <div className="flex items-center gap-1">
            <select
              onChange={(e) => {
                const val = e.target.value;
                if (val === 'default') {
                  setSearch('');
                  setCategoryFilter('');
                } else {
                  const match = savedViews.products.find(v => v.name === val);
                  if (match) {
                    setSearch(match.filters.search || '');
                    setCategoryFilter(match.filters.categoryFilter || '');
                  }
                }
              }}
              className="px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 font-semibold"
            >
              <option value="default">Default Views</option>
              {savedViews.products.map(v => (
                <option key={v.name} value={v.name}>{v.name}</option>
              ))}
            </select>
          </div>
        )}

        <button
          onClick={() => setShowSaveModal(true)}
          className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-200 text-slate-650 hover:bg-slate-50 text-xs font-semibold bg-white shadow-sm transition-all"
          title="Save View"
        >
          <Save className="w-3.5 h-3.5 text-slate-500" />
          Save View
        </button>

        {/* Category filter */}
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 max-w-[160px]"
        >
          <option value="">All Categories</option>
          {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        {/* View toggle */}
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1">
          <button onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-slate-100 text-slate-700' : 'text-slate-400 hover:text-slate-600'}`}>
            <List className="w-4 h-4" />
          </button>
          <button onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-slate-100 text-slate-700' : 'text-slate-400 hover:text-slate-600'}`}>
            <Grid className="w-4 h-4" />
          </button>
        </div>

        <button onClick={fetchProducts} className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors" title="Refresh">
          <RefreshCw className="w-4 h-4" />
        </button>

        <button onClick={openAdd}
          className="flex items-center gap-2 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-all">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
        <span><span className="font-bold text-slate-900">{filtered.length}</span> of {products.length} products</span>
        <span>·</span>
        <span><span className="font-bold text-amber-600">{products.filter(p => p.inventoryCount <= 5 && p.inventoryCount > 0).length}</span> low stock</span>
        <span>·</span>
        <span><span className="font-bold text-rose-600">{products.filter(p => p.inventoryCount <= 0).length}</span> out of stock</span>
        <span>·</span>
        <span><span className="font-bold text-violet-600">{products.filter(p => p.isFlashSale).length}</span> on sale</span>
      </div>

      {/* TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  {['Product', 'Category / Brand', 'Price', 'Stock', 'Rating', 'Actions'].map(h => (
                    <th key={h} className={`py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wide ${h === 'Actions' ? 'text-right px-5' : 'text-left px-4'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <TableRowSkeleton cols={6} rows={7} />
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <EmptyState
                        icon={Package}
                        title={search ? `No results for "${search}"` : 'No products found'}
                        description="Add your first product to get started"
                        action={openAdd}
                        actionLabel="Add Product"
                      />
                    </td>
                  </tr>
                ) : (
                  paginatedProducts.map(p => (
                    <motion.tr
                      key={p._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      whileHover={{ backgroundColor: 'rgba(248,250,252,0.9)' }}
                      className="border-b border-slate-50 transition-colors"
                    >
                      {/* Product cell */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {p.images?.[0] && !brokenImages[p._id] ? (
                              <img
                                src={p.images[0]}
                                alt={p.title}
                                className="w-full h-full object-contain p-1"
                                onError={() => handleImageError(p._id)}
                              />
                            ) : (
                              <Package className="w-5 h-5 text-slate-300" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-900 truncate max-w-[200px]">{p.title}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[200px]">{p.description?.slice(0, 40)}...</p>
                          </div>
                        </div>
                      </td>
                      {/* Category/Brand */}
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <span className="text-[10px] font-medium text-violet-700 bg-violet-50 border border-violet-100 rounded-full px-2 py-0.5 block w-fit">{p.category}</span>
                          <span className="text-[10px] text-slate-400">{p.brand}</span>
                        </div>
                      </td>
                      {/* Price */}
                      <td className="px-4 py-3">
                        <p className="text-xs font-bold text-slate-900">${Number(p.price).toFixed(2)}</p>
                        {p.isFlashSale && p.flashSalePrice && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className="text-[9px] line-through text-slate-400">${p.price}</span>
                            <span className="text-[9px] font-bold text-rose-600">${p.flashSalePrice}</span>
                          </div>
                        )}
                      </td>
                      {/* Stock */}
                      <td className="px-4 py-3">
                        <StockBadge count={p.inventoryCount} />
                      </td>
                      {/* Rating */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          <span className="text-[11px] font-semibold text-slate-700">{p.ratings?.average?.toFixed(1) || '0.0'}</span>
                          <span className="text-[10px] text-slate-400">({p.ratings?.count || 0})</span>
                        </div>
                      </td>
                      {/* Actions */}
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => openEdit(p)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center border border-slate-200 text-slate-500 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all" title="Edit">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDelete(p._id, p.title)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center border border-slate-200 text-slate-500 hover:border-rose-300 hover:text-rose-600 hover:bg-rose-50 transition-all" title="Delete">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* GRID VIEW */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3 animate-pulse">
                <div className="h-32 bg-slate-100 rounded-xl" />
                <div className="h-4 bg-slate-100 rounded-lg w-3/4" />
                <div className="h-3 bg-slate-100 rounded-lg w-1/2" />
              </div>
            ))
            : paginatedProducts.map(p => (
              <motion.div
                key={p._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -2, boxShadow: '0 8px 24px -4px rgba(0,0,0,0.1)' }}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden group"
              >
                <div className="h-36 bg-slate-50 flex items-center justify-center p-4 relative">
                  {p.images?.[0] && !brokenImages[p._id] ? (
                    <img src={p.images[0]} alt={p.title} className="h-full w-full object-contain"
                      onError={() => handleImageError(p._id)} />
                  ) : (
                    <Package className="w-12 h-12 text-slate-200" />
                  )}
                  {p.isFlashSale && (
                    <span className="absolute top-2 left-2 text-[9px] font-bold text-white bg-rose-500 px-1.5 py-0.5 rounded-lg">SALE</span>
                  )}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <button onClick={() => openEdit(p)} className="w-6 h-6 bg-white rounded-lg shadow-sm flex items-center justify-center text-blue-600 border border-blue-100 hover:bg-blue-50">
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button onClick={() => handleDelete(p._id, p.title)} className="w-6 h-6 bg-white rounded-lg shadow-sm flex items-center justify-center text-rose-600 border border-rose-100 hover:bg-rose-50">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  <p className="text-xs font-semibold text-slate-900 leading-tight truncate">{p.title}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-violet-700 bg-violet-50 rounded-full px-2 py-0.5 font-medium truncate max-w-[80px]">{p.category}</span>
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-900">${Number(p.price).toFixed(2)}</span>
                      {p.isFlashSale && p.flashSalePrice && (
                        <span className="ml-1 text-[9px] font-bold text-rose-600">${p.flashSalePrice}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <StockBadge count={p.inventoryCount} />
                    <div className="flex items-center gap-0.5">
                      <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                      <span className="text-[10px] font-medium text-slate-600">{p.ratings?.average?.toFixed(1) || '0.0'}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
        </div>
      )}

      {/* ========= ADD / EDIT MODAL ========= */}
      <AdminModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingProduct ? `Edit: ${editingProduct.title?.slice(0, 40)}` : 'Add New Product'}
        size="xl"
        footer={
          <>
            <button onClick={() => setShowModal(false)} className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 rounded-xl border border-slate-200">Cancel</button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="px-5 py-2 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm disabled:opacity-60 transition-all"
            >
              {saving ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
            </button>
          </>
        }
      >
        <div className="space-y-5">
          {/* Image preview + inputs */}
          <div className="bg-slate-50 rounded-xl border border-slate-100 p-4 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <ImagePlus className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wide">Product Images</span>
            </div>

            {/* Image previews */}
            {form.images.filter(img => img.trim()).length > 0 && (
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {form.images.filter(img => img.trim()).map((img, i) => (
                  <div key={i} className="flex-shrink-0 w-20 h-20 rounded-xl border border-slate-200 bg-white overflow-hidden">
                    <img src={img} alt="" className="w-full h-full object-contain p-1"
                      onError={e => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/80?text=Error';
                      }} />
                  </div>
                ))}
              </div>
            )}

            {/* Image URL inputs */}
            {form.images.map((img, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="url"
                  placeholder={`Image URL ${i + 1}`}
                  value={img}
                  onChange={e => updateImage(i, e.target.value)}
                  className="flex-1 px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                />
                {form.images.length > 1 && (
                  <button onClick={() => removeImageField(i)}
                    className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-rose-500 hover:bg-rose-50 transition-colors flex-shrink-0">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
            <button onClick={addImageField}
              className="flex items-center gap-1.5 text-[11px] font-medium text-blue-600 hover:text-blue-700 transition-colors">
              <Plus className="w-3 h-3" /> Add Another Image URL
            </button>
          </div>

          {/* Core info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField label="Product Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
            <InputField label="Price (USD)" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} type="number" placeholder="29.99" required />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">Category <span className="text-rose-500">*</span></label>
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                required
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
              >
                <option value="">Select Category</option>
                {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">Brand</label>
              <select
                value={form.brand}
                onChange={e => setForm(f => ({ ...f, brand: e.target.value }))}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
              >
                <option value="Generic">Generic</option>
                {brands.map(b => <option key={b._id} value={b.name}>{b.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">Description <span className="text-rose-500">*</span></label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={3}
              required
              placeholder="Detailed product description..."
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <InputField label="Stock Count" value={form.inventoryCount} onChange={e => setForm(f => ({ ...f, inventoryCount: e.target.value }))} type="number" placeholder="10" />
            <InputField label="Colors (comma separated)" value={form.colors} onChange={e => setForm(f => ({ ...f, colors: e.target.value }))} placeholder="Red, Blue, Black" />
            <InputField label="Sizes (comma separated)" value={form.sizes} onChange={e => setForm(f => ({ ...f, sizes: e.target.value }))} placeholder="S, M, L, XL" />
          </div>

          {/* Flash Sale */}
          <div className={`rounded-xl border p-4 transition-colors ${form.isFlashSale ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-200'}`}>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <div
                onClick={() => setForm(f => ({ ...f, isFlashSale: !f.isFlashSale }))}
                className={`w-9 h-5 rounded-full transition-colors relative flex-shrink-0 ${form.isFlashSale ? 'bg-rose-500' : 'bg-slate-300'}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isFlashSale ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-800">Flash Sale</p>
                <p className="text-[10px] text-slate-500">Mark this product as a flash sale deal on the homepage</p>
              </div>
            </label>
            <AnimatePresence>
              {form.isFlashSale && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 overflow-hidden"
                >
                  <InputField
                    label="Flash Sale Price (USD)"
                    value={form.flashSalePrice}
                    onChange={e => setForm(f => ({ ...f, flashSalePrice: e.target.value }))}
                    type="number"
                    placeholder="e.g. 24.99"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </AdminModal>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white border border-slate-100 rounded-2xl p-4 shadow-sm mt-4">
          <p className="text-xs text-slate-500">
            Showing <span className="font-bold text-slate-900">{Math.min(filtered.length, (currentPage - 1) * itemsPerPage + 1)}</span> to{' '}
            <span className="font-bold text-slate-900">{Math.min(filtered.length, currentPage * itemsPerPage)}</span> of{' '}
            <span className="font-bold text-slate-900">{filtered.length}</span> products
          </p>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center disabled:opacity-40 disabled:hover:bg-white text-slate-600 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => {
              let pageNum = idx + 1;
              if (currentPage > 3) {
                pageNum = currentPage - 3 + idx;
              }
              if (pageNum > totalPages) return null;
              
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                    currentPage === pageNum
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center disabled:opacity-40 disabled:hover:bg-white text-slate-650 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
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
                placeholder="e.g. Out of stock electronics"
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
