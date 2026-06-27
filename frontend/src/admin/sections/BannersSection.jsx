import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Image, Eye, ArrowUp, ArrowDown, Palette, Link, FileText } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import AdminModal from '../components/AdminModal';

const GRADIENT_PRESETS = [
  { label: 'Ocean Night', value: 'bg-gradient-to-tr from-blue-700 via-indigo-900 to-slate-900' },
  { label: 'Violet Storm', value: 'bg-gradient-to-tr from-purple-700 via-indigo-900 to-slate-900' },
  { label: 'Amber Sunset', value: 'bg-gradient-to-tr from-amber-600 via-orange-800 to-slate-900' },
  { label: 'Emerald Forest', value: 'bg-gradient-to-tr from-emerald-600 via-teal-800 to-slate-900' },
  { label: 'Rose Dusk', value: 'bg-gradient-to-tr from-rose-600 via-pink-800 to-slate-900' },
  { label: 'Cyan Ice', value: 'bg-gradient-to-tr from-cyan-600 via-blue-800 to-slate-900' },
  { label: 'Slate Pro', value: 'bg-gradient-to-tr from-slate-600 via-slate-800 to-slate-950' },
  { label: 'Gold Rush', value: 'bg-gradient-to-tr from-yellow-500 via-orange-700 to-red-900' },
];

function BannerPreview({ banner }) {
  return (
    <div className={`relative w-full h-32 rounded-xl overflow-hidden ${banner.bg}`}
      style={banner.bgImage ? { backgroundImage: `url('${banner.bgImage}')`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
      <div className={`absolute inset-0 ${banner.bgImage ? 'bg-black/40' : ''} flex flex-col justify-center px-5`}>
        <span className="text-[8px] font-black uppercase tracking-widest bg-amber-500 text-white px-2 py-0.5 rounded-full w-fit">{banner.tag || 'Tag'}</span>
        <p className="text-sm font-bold text-white mt-1.5 leading-snug max-w-[70%] line-clamp-2">{banner.title || 'Banner Title'}</p>
        <p className="text-[10px] text-slate-200 mt-1 max-w-[60%] line-clamp-1">{banner.subtitle || 'Subtitle text'}</p>
        <div className="mt-2 bg-white text-slate-800 font-bold text-[8px] uppercase tracking-wider px-3 py-1 rounded-lg w-fit">
          {banner.cta || 'Explore Catalog'}
        </div>
      </div>
    </div>
  );
}

const EMPTY_FORM = {
  title: '',
  subtitle: '',
  tag: '',
  bg: GRADIENT_PRESETS[0].value,
  bgImage: '',
  cta: 'Explore Catalog',
  link: '/shop',
};

const PRESET_TEMPLATES = [
  {
    name: 'Borosilicate Glass cups set ☕',
    title: 'Exquisite Fluted glass Origami cup set',
    subtitle: 'Retro ribbed cups, perfect for iced coffees and everyday table aesthetics.',
    tag: 'Cup Collection',
    bg: 'bg-gradient-to-tr from-blue-700 via-indigo-900 to-slate-900',
    bgImage: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&q=80',
    cta: 'Explore Cups',
    link: '/shop?category=Drinkware'
  },
  {
    name: 'Holographic Studio Headphones 🎧',
    title: 'Holographic Nexa Acoustic headphones',
    subtitle: 'Premium acoustic driver configuration with custom glassmorphic side panels.',
    tag: 'Studio Gear',
    bg: 'bg-gradient-to-tr from-purple-700 via-indigo-900 to-slate-900',
    bgImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    cta: 'Shop headphones',
    link: '/shop?category=Electronics'
  },
  {
    name: 'Modular Ambient Studio lights 💡',
    title: 'Luminous Modular RGB smart lighting panels',
    subtitle: 'Sleek studio wall lighting blocks synced with audio frequency response.',
    tag: 'Smart lighting',
    bg: 'bg-gradient-to-tr from-amber-600 via-orange-800 to-slate-900',
    bgImage: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80',
    cta: 'Configure lights',
    link: '/shop'
  },
  {
    name: 'Sustainable heavy cotton Hoodie 👕',
    title: 'Sustainable EcoVibe organic cotton Hoodies',
    subtitle: 'Comfortable dropshoulder heavy fleeces designed for cozy lifestyles.',
    tag: 'Eco Apparels',
    bg: 'bg-gradient-to-tr from-rose-600 via-pink-800 to-slate-900',
    bgImage: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
    cta: 'Browse fleece',
    link: '/shop'
  }
];

export default function BannersSection() {
  const { homeBanners, setHomeBanners, addNotification } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editingIdx, setEditingIdx] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [previewExpand, setPreviewExpand] = useState(null);
  const [bannerMode, setBannerMode] = useState('custom'); // 'default' or 'custom'

  const openAdd = () => {
    setEditingIdx(null);
    setBannerMode('custom');
    setForm({ ...EMPTY_FORM, id: Date.now() });
    setShowModal(true);
  };

  const openEdit = (idx) => {
    setEditingIdx(idx);
    const b = homeBanners[idx];
    setBannerMode(b.bgImage && PRESET_TEMPLATES.some(t => t.bgImage === b.bgImage) ? 'default' : 'custom');
    setForm({
      title: b.title || '',
      subtitle: b.subtitle || '',
      tag: b.tag || '',
      bg: b.bg || GRADIENT_PRESETS[0].value,
      bgImage: b.bgImage || '',
      cta: b.cta || 'Explore Catalog',
      link: b.link || '/shop',
      id: b.id,
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.title.trim()) {
      addNotification('Banner title is required', 'error');
      return;
    }
    const newBanner = { ...form, id: form.id || Date.now() };
    const updated = [...homeBanners];
    if (editingIdx !== null) {
      updated[editingIdx] = newBanner;
      addNotification('Banner updated!', 'success');
    } else {
      updated.push(newBanner);
      addNotification('Banner added!', 'success');
    }
    setHomeBanners(updated);
    setShowModal(false);
  };

  const handleDelete = (idx) => {
    if (homeBanners.length <= 1) {
      addNotification('At least one banner is required.', 'error');
      return;
    }
    const updated = homeBanners.filter((_, i) => i !== idx);
    setHomeBanners(updated);
    addNotification('Banner removed.', 'info');
  };

  const move = (idx, dir) => {
    const updated = [...homeBanners];
    const target = idx + dir;
    if (target < 0 || target >= updated.length) return;
    [updated[idx], updated[target]] = [updated[target], updated[idx]];
    setHomeBanners(updated);
  };

  const field = (label, key, placeholder = '', disabled = false, type = 'text') => (
    <div>
      <label className="block text-[11px] font-medium text-slate-650 mb-1">{label}</label>
      <input
        type={type}
        disabled={disabled}
        placeholder={placeholder}
        value={form[key]}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        className={`w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
      />
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Hero Banner Slider</h2>
          <p className="text-[11px] text-slate-400 mt-0.5">{homeBanners.length} banners — changes appear live on the homepage</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" /> Add Banner
        </button>
      </div>

      {/* Live preview strip */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Eye className="w-3.5 h-3.5 text-slate-500" />
          <p className="text-[11px] font-semibold text-slate-650 uppercase tracking-wide">Homepage Preview</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {homeBanners.map((b, i) => (
            <div key={b.id || i} className="relative group">
              <BannerPreview banner={b} />
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <button onClick={() => openEdit(i)} className="w-6 h-6 bg-white/90 rounded-lg flex items-center justify-center text-blue-600 shadow-sm">
                  <Edit2 className="w-3 h-3" />
                </button>
                <button onClick={() => handleDelete(i)} className="w-6 h-6 bg-white/90 rounded-lg flex items-center justify-center text-rose-600 shadow-sm">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
              <div className="absolute bottom-2 left-2 flex gap-1">
                {i > 0 && (
                  <button onClick={() => move(i, -1)} className="w-5 h-5 bg-white/80 rounded flex items-center justify-center text-slate-600">
                    <ArrowUp className="w-2.5 h-2.5" />
                  </button>
                )}
                {i < homeBanners.length - 1 && (
                  <button onClick={() => move(i, 1)} className="w-5 h-5 bg-white/80 rounded flex items-center justify-center text-slate-600">
                    <ArrowDown className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>
              <p className="text-[9px] font-semibold text-slate-500 text-center mt-1.5">Slide {i + 1}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Banners list */}
      <div className="space-y-3">
        {homeBanners.map((b, idx) => (
          <motion.div
            key={b.id || idx}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 p-4"
          >
            {/* Mini preview */}
            <div className={`flex-shrink-0 w-20 h-14 rounded-xl overflow-hidden ${b.bg}`}
              style={b.bgImage ? { backgroundImage: `url('${b.bgImage}')`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
              <div className={`w-full h-full ${b.bgImage ? 'bg-black/30' : ''} flex items-end p-1.5`}>
                <span className="text-white text-[7px] font-bold line-clamp-1">{b.title}</span>
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-900 truncate">{b.title}</p>
              <p className="text-[10px] text-slate-400 truncate mt-0.5">{b.subtitle}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[9px] font-semibold text-amber-750 bg-amber-50 border border-amber-100 rounded-full px-2 py-0.5">{b.tag}</span>
                <span className="text-[9px] text-slate-400 font-medium">{b.link || '/shop'}</span>
              </div>
            </div>

            {/* Position controls */}
            <div className="flex flex-col gap-1 flex-shrink-0">
              <button onClick={() => move(idx, -1)} disabled={idx === 0}
                className="w-6 h-6 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                <ArrowUp className="w-3 h-3" />
              </button>
              <button onClick={() => move(idx, 1)} disabled={idx === homeBanners.length - 1}
                className="w-6 h-6 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                <ArrowDown className="w-3 h-3" />
              </button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button onClick={() => openEdit(idx)}
                className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all">
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => handleDelete(idx)}
                className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:border-rose-300 hover:text-rose-600 hover:bg-rose-50 transition-all">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Edit/Add Modal */}
      <AdminModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingIdx !== null ? 'Edit Banner' : 'Add New Banner'}
        size="lg"
        footer={
          <>
            <button onClick={() => setShowModal(false)} className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 rounded-xl border border-slate-200">Cancel</button>
            <button onClick={handleSave} className="px-5 py-2 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all">
              {editingIdx !== null ? 'Update Banner' : 'Add Banner'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          {/* Live preview in modal */}
          <div>
            <label className="block text-[11px] font-medium text-slate-650 mb-2">Live Preview</label>
            <BannerPreview banner={form} />
          </div>

          {/* Banner Configuration Mode selector */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs font-bold text-slate-700">Banner Config Mode</span>
            <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setBannerMode('default');
                  const t = PRESET_TEMPLATES[0];
                  setForm(f => ({ ...f, ...t }));
                }}
                className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all ${bannerMode === 'default' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
              >
                Default Templates
              </button>
              <button
                type="button"
                onClick={() => setBannerMode('custom')}
                className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all ${bannerMode === 'custom' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
              >
                Customize Banner
              </button>
            </div>
          </div>

          {bannerMode === 'default' && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
              <label className="block text-[10px] font-bold text-slate-450 uppercase">Apply Curated Default Template</label>
              <select
                onChange={(e) => {
                  const val = e.target.value;
                  const selected = PRESET_TEMPLATES.find(t => t.name === val);
                  if (selected) {
                    setForm(f => ({ ...f, ...selected }));
                  }
                }}
                className="w-full px-3 py-2 text-xs border border-slate-200 bg-white rounded-lg font-semibold text-slate-700 outline-none"
              >
                {PRESET_TEMPLATES.map(t => (
                  <option key={t.name} value={t.name}>{t.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {field('Banner Title *', 'title', 'e.g. Premium Headphones Launch', bannerMode === 'default')}
            {field('Tag Badge', 'tag', 'e.g. Limited Edition', bannerMode === 'default')}
          </div>
          {field('Subtitle / Description', 'subtitle', 'Short promotional tagline...', bannerMode === 'default')}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {field('CTA Button Text', 'cta', 'Explore Catalog', bannerMode === 'default')}
            {field('CTA Link', 'link', '/shop or /shop?category=Electronics', bannerMode === 'default')}
          </div>
          
          <div className="space-y-1">
            {field('Background Image URL', 'bgImage', 'Input any image URL (PNG, JPG, GIF, WebP, SVG)...', bannerMode === 'default')}
            <p className="text-[10px] text-slate-400 font-medium">You can add any web image URL (including animations, vectors, or graphics) as the slide banner background.</p>
          </div>

          {/* Gradient Presets */}
          {bannerMode === 'custom' && (
            <div>
              <label className="block text-[11px] font-medium text-slate-650 mb-2 flex items-center gap-1.5">
                <Palette className="w-3 h-3" /> Background Gradient Fallback
              </label>
              <div className="grid grid-cols-4 gap-2">
                {GRADIENT_PRESETS.map(preset => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, bg: preset.value }))}
                    className={`relative h-12 rounded-xl overflow-hidden border-2 transition-all ${form.bg === preset.value ? 'border-blue-500 scale-105 shadow-md' : 'border-transparent hover:border-slate-300'} ${preset.value}`}
                  >
                    {form.bg === preset.value && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-3 h-3 rounded-full bg-white" />
                      </div>
                    )}
                    <span className="absolute bottom-0 left-0 right-0 text-[8px] text-white/80 font-medium text-center pb-0.5 bg-black/20">
                      {preset.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </AdminModal>
    </div>
  );
}
