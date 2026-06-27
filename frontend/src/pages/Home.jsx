import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useApp } from '../context/AppContext';
import ProductCard from '../components/ProductCard';
import {
  ChevronLeft, ChevronRight, Sparkles, Flame, Eye, Clock,
  Award, Compass, Laptop, Smartphone, Tv2, Shirt, User2, Users, Baby, Sparkle
} from 'lucide-react';

// Fisher-Yates shuffle helper
const shuffleArray = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// Category icon map
const CATEGORY_ICONS = {
  'Electronics': Laptop,
  'Mobiles & Tablets': Smartphone,
  'TVs & Appliances': Tv2,
  'Fashion': Shirt,
  'Men': User2,
  'Women': Users,
  'Kids & Baby': Baby,
  'Beauty & Personal Care': Sparkle,
};

const CATEGORY_COLORS = {
  'Electronics': 'from-blue-500/10 via-white/5 to-white/5',
  'Mobiles & Tablets': 'from-violet-500/10 via-white/5 to-white/5',
  'TVs & Appliances': 'from-cyan-500/10 via-white/5 to-white/5',
  'Fashion': 'from-pink-500/10 via-white/5 to-white/5',
  'Men': 'from-indigo-500/10 via-white/5 to-white/5',
  'Women': 'from-rose-500/10 via-white/5 to-white/5',
  'Kids & Baby': 'from-amber-500/10 via-white/5 to-white/5',
  'Beauty & Personal Care': 'from-emerald-500/10 via-white/5 to-white/5',
};

const CATEGORY_BADGE_COLORS = {
  'Electronics': 'bg-blue-100 text-blue-700',
  'Mobiles & Tablets': 'bg-violet-100 text-violet-700',
  'TVs & Appliances': 'bg-cyan-100 text-cyan-700',
  'Fashion': 'bg-pink-100 text-pink-700',
  'Men': 'bg-indigo-100 text-indigo-700',
  'Women': 'bg-rose-100 text-rose-700',
  'Kids & Baby': 'bg-amber-100 text-amber-700',
  'Beauty & Personal Care': 'bg-emerald-100 text-emerald-700',
};

export const Home = () => {
  const { backendUrl, categories, user, homeBanners } = useApp();
  const navigate = useNavigate();

  const recentlyViewed = useSelector(state => state.recentlyViewed.items);

  const [products, setProducts] = useState([]);
  const [personalized, setPersonalized] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeBannerIdx, setActiveBannerIdx] = useState(0);

  // Countdown timer for Flash Sale
  const [timeLeft, setTimeLeft] = useState(14400);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 14400));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const mins = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  };

  const banners = [
    {
      id: 1,
      title: 'Holographic Nexa Edition Headphones',
      subtitle: 'Premium acoustic driver configuration and custom glassmorphism panels. Flat 25% Off.',
      bg: 'bg-gradient-to-tr from-blue-700 via-indigo-900 to-slate-900',
      tag: 'Limited Collector Edition'
    },
    {
      id: 2,
      title: 'Luminous RGB Modular Lighting Panels',
      subtitle: 'Upgrade your smart studio lighting and audio-sensory response integrations. Start at $149.',
      bg: 'bg-gradient-to-tr from-purple-700 via-indigo-900 to-slate-900',
      tag: 'Super Ambient Deal'
    },
    {
      id: 3,
      title: 'EcoVibe Dropshoulder Linen Hoodies',
      subtitle: '100% Organic heavy fleece fabrics. Sustainable styling for your daily lifestyle.',
      bg: 'bg-gradient-to-tr from-amber-600 via-orange-800 to-slate-900',
      tag: 'Organic Fashion Block'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveBannerIdx(prev => (prev + 1) % homeBanners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [homeBanners.length]);

  useEffect(() => {
    const loadHomeData = async () => {
      setLoading(true);
      try {
        const productsRes = await fetch(`${backendUrl}/api/products`);
        const productsData = await productsRes.json();
        if (productsRes.ok) setProducts(productsData);

        const headers = {};
        const savedToken = localStorage.getItem('token');
        if (savedToken) headers['Authorization'] = `Bearer ${savedToken}`;
        const personalRes = await fetch(`${backendUrl}/api/products/user/personalized`, { headers });
        const personalData = await personalRes.json();
        if (personalRes.ok) setPersonalized(personalData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadHomeData();
  }, [backendUrl, user]);

  const handleCategoryClick = (catName) => {
    navigate(`/shop?category=${encodeURIComponent(catName)}`);
  };

  // Group products by category (shuffled within each group)
  const categoryGroups = useMemo(() => {
    const groups = {};
    products.forEach(p => {
      const cat = p.category || 'Other';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(p);
    });
    return Object.entries(groups).map(([cat, items]) => ({
      category: cat,
      items: shuffleArray(items)
    }));
  }, [products]);

  // Random mix of all products for the Explore All shelf
  const randomAllProducts = useMemo(() => shuffleArray(products).slice(0, 8), [products]);

  const getFlashSales = () => products.filter(p => p.isFlashSale || p.price > 180).slice(0, 4);
  const getNewLaunches = () => products.slice().reverse().slice(0, 4);
  const getBestsellers = () => products.slice().sort((a, b) => (b.ratings?.count || 0) - (a.ratings?.count || 0)).slice(0, 4);

  return (
    <div className="w-full pb-16 space-y-10 animate-fade-in">
      <div className="max-w-7xl mx-auto px-6 pt-6 space-y-10">

        {/* Hero Banner Carousel */}
        <div className="relative w-full h-80 sm:h-96 rounded-[32px] overflow-hidden shadow-xl group border border-slate-200/40">
          {homeBanners.map((ban, idx) => (
            <div
              key={ban.id}
              className={`absolute inset-0 w-full h-full p-8 sm:p-16 flex flex-col justify-center text-white transition-opacity duration-700 ease-in-out ${
                idx === activeBannerIdx ? 'opacity-100 z-10' : 'opacity-0 z-0'
              } ${ban.bg}`}
              style={ban.bgImage ? { backgroundImage: `url('${ban.bgImage}')`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
            >
              <span className="text-[9px] bg-amber-500 text-white font-black tracking-widest uppercase px-3 py-1 rounded-full w-fit shadow-sm">
                {ban.tag}
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mt-4 max-w-xl leading-tight">
                {ban.title}
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-slate-200 mt-2 max-w-md">
                {ban.subtitle}
              </p>
              <Link
                to={ban.link || '/shop'}
                className="mt-8 bg-white text-slate-800 font-extrabold py-3 px-8 text-xs rounded-2xl shadow-lg hover:shadow-xl hover:scale-103 transition-all w-fit uppercase tracking-widest"
              >
                {ban.cta || 'Explore Catalog'}
              </Link>
            </div>
          ))}
          <button
            onClick={() => setActiveBannerIdx((activeBannerIdx - 1 + homeBanners.length) % homeBanners.length)}
            className="absolute left-6 top-1/2 -translate-y-1/2 p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-2xl z-20 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs border border-white/10"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveBannerIdx((activeBannerIdx + 1) % homeBanners.length)}
            className="absolute right-6 top-1/2 -translate-y-1/2 p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-2xl z-20 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs border border-white/10"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          {/* Banner dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {homeBanners.map((_, i) => (
              <button key={i} onClick={() => setActiveBannerIdx(i)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${ i === activeBannerIdx ? 'bg-white w-5' : 'bg-white/40'}`}
              />
            ))}
          </div>
        </div>

        {/* Flash Sale Section */}
        {products.length > 0 && (
          <div className="glass-card bg-gradient-to-r from-red-500/5 via-white/5 to-white/5 border border-slate-200/50 p-6 shadow-sm">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4.5 mb-6 flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600">
                  <Flame className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-800 tracking-tight">Flash Sale</h3>
                  <p className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">Hurry up! Offers end in</p>
                </div>
                <div className="flex items-center gap-1.5 bg-rose-600 text-white font-mono font-black text-xs px-3 py-1.5 rounded-xl shadow-sm ml-2">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{formatTime(timeLeft)}</span>
                </div>
              </div>
              <Link to="/shop?isFlashSale=true" className="text-xs font-black uppercase tracking-wider text-blue-600 hover:underline">
                View All Deals
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {getFlashSales().map(p => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </div>
        )}

        {/* AI Curated Picks */}
        {personalized.length > 0 && (
          <div className="glass-card bg-gradient-to-r from-blue-500/5 via-white/5 to-white/5 border border-slate-200/50 p-6 shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4.5 mb-6">
              <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 animate-pulse">
                <Sparkles className="w-5 h-5 fill-current" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-800 tracking-tight">AI Curated Picks</h3>
                <p className="text-[10px] text-indigo-650 font-bold uppercase tracking-wider">Personalized recommendations just for you</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {personalized.slice(0, 4).map(p => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </div>
        )}

        {/* Explore All — Random Mix */}
        {randomAllProducts.length > 0 && (
          <div className="glass-card bg-gradient-to-r from-slate-500/5 via-white/5 to-white/5 border border-slate-200/50 p-6 shadow-sm">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6 flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-800 tracking-tight">Explore All Products</h3>
                  <p className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">Handpicked across all categories</p>
                </div>
              </div>
              <Link to="/shop" className="text-xs font-black uppercase tracking-wider text-blue-600 hover:underline">
                View Full Catalog &rarr;
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {randomAllProducts.map(p => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </div>
        )}

        {/* Category Sections — All Categories with their shuffled products */}
        {categoryGroups.map(({ category, items }) => {
          if (items.length === 0) return null;
          const IconComp = CATEGORY_ICONS[category] || Sparkle;
          const colorGrad = CATEGORY_COLORS[category] || 'from-slate-500/5 via-white/5 to-white/5';
          const badgeColor = CATEGORY_BADGE_COLORS[category] || 'bg-slate-100 text-slate-700';
          const displayItems = items.slice(0, 4);

          return (
            <div
              key={category}
              className={`glass-card bg-gradient-to-r ${colorGrad} border border-slate-200/50 p-6 shadow-sm`}
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6 flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${badgeColor}`}>
                    <IconComp className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-800 tracking-tight">{category}</h3>
                    <p className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">
                      {items.length} product{items.length !== 1 ? 's' : ''} available
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleCategoryClick(category)}
                  className="text-xs font-black uppercase tracking-wider text-blue-600 hover:underline"
                >
                  View All &rarr;
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {displayItems.map(p => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>
            </div>
          );
        })}

        {/* New Arrivals & Bestsellers */}
        {products.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="glass-card p-6 shadow-sm border border-slate-200/50">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3.5 mb-5">
                <div className="flex items-center gap-2.5">
                  <Compass className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-800">Newly Launched</h3>
                </div>
                <Link to="/shop" className="text-[10px] font-black uppercase text-blue-600 hover:underline">See catalog</Link>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {getNewLaunches().slice(0, 2).map(p => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>
            </div>

            <div className="glass-card p-6 shadow-sm border border-slate-200/50">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3.5 mb-5">
                <div className="flex items-center gap-2.5">
                  <Award className="w-4 h-4 text-amber-500" />
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-800">Best Sellers</h3>
                </div>
                <Link to="/shop" className="text-[10px] font-black uppercase text-blue-600 hover:underline">See catalog</Link>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {getBestsellers().slice(0, 2).map(p => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Recently Viewed */}
        {recentlyViewed.length > 0 && (
          <div className="glass-card p-6 shadow-sm border border-slate-200/50 bg-slate-50/30">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3.5 mb-5">
              <Eye className="w-4.5 h-4.5 text-slate-500" />
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-800">Recently Viewed</h3>
            </div>
            <div className="flex gap-4 overflow-x-auto no-scrollbar py-1">
              {recentlyViewed.map(p => (
                <div key={p._id} className="w-56 flex-shrink-0">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Home;
