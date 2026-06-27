import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import ProductCard from '../components/ProductCard';
import { SlidersHorizontal, Grid, List, RefreshCw, Star } from 'lucide-react';

export const Shop = () => {
  const { categories, brands, filters, setFilters, backendUrl } = useApp();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  // Local filter states
  const [selectedCategory, setSelectedCategory] = useState(filters.category || '');
  const [selectedBrand, setSelectedBrand] = useState(filters.brand || '');
  const [minPrice, setMinPrice] = useState(filters.minPrice || '');
  const [maxPrice, setMaxPrice] = useState(filters.maxPrice || '');
  const [selectedRating, setSelectedRating] = useState(filters.rating || 0);
  const [inStock, setInStock] = useState(filters.inStock || false);
  const [isFlashSale, setIsFlashSale] = useState(filters.isFlashSale || false);
  const [sortBy, setSortBy] = useState(filters.sortBy || 'newest');

  // Trigger filters load from App Context
  useEffect(() => {
    setSelectedCategory(filters.category);
    setSelectedBrand(filters.brand);
  }, [filters.category, filters.brand]);

  // Fetch products based on filters
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters.keyword) queryParams.append('keyword', filters.keyword);
      if (selectedCategory) queryParams.append('category', selectedCategory);
      if (selectedBrand) queryParams.append('brand', selectedBrand);
      if (minPrice) queryParams.append('minPrice', minPrice);
      if (maxPrice) queryParams.append('maxPrice', maxPrice);
      if (selectedRating) queryParams.append('rating', selectedRating);
      if (inStock) queryParams.append('inStock', 'true');
      if (isFlashSale) queryParams.append('isFlashSale', 'true');
      queryParams.append('sortBy', sortBy);

      const response = await fetch(`${backendUrl}/api/products?${queryParams.toString()}`);
      const data = await response.json();
      if (response.ok) {
        setProducts(data);
      }
    } catch (err) {
      console.error('Error fetching shop products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [filters.keyword, selectedCategory, selectedBrand, minPrice, maxPrice, selectedRating, inStock, isFlashSale, sortBy]);

  const handleClearFilters = () => {
    setSelectedCategory('');
    setSelectedBrand('');
    setMinPrice('');
    setMaxPrice('');
    setSelectedRating(0);
    setInStock(false);
    setIsFlashSale(false);
    setSortBy('newest');
    setFilters({
      keyword: '',
      category: '',
      brand: '',
      minPrice: '',
      maxPrice: '',
      rating: 0,
      inStock: false,
      sortBy: 'newest',
      colors: '',
      sizes: '',
      isFlashSale: false
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 animate-fade-in">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Filters Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="glass-card bg-white/70 p-6 border border-slate-200/50 shadow-sm sticky top-24">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-xs font-black uppercase text-slate-800 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-blue-650" />
                Filters
              </h3>
              <button
                onClick={handleClearFilters}
                className="text-[10px] text-blue-650 hover:text-blue-700 font-extrabold uppercase hover:underline"
              >
                Clear All
              </button>
            </div>

            {/* Keyword Banner indication */}
            {filters.keyword && (
              <div className="mb-4 p-2 bg-blue-50 border border-blue-150 rounded-xl text-[10px] font-bold text-blue-700 flex justify-between items-center">
                <span>Search: "{filters.keyword}"</span>
                <button onClick={() => setFilters(prev => ({ ...prev, keyword: '' }))} className="text-slate-400 hover:text-slate-700">×</button>
              </div>
            )}

            {/* Category Select */}
            <div className="space-y-2 mb-4">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-450 block">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full border border-slate-200 rounded-xl py-2 px-3 text-xs bg-white focus:outline-none focus:border-blue-600 font-semibold"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Brand Select */}
            <div className="space-y-2 mb-4">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-450 block">Brand</label>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full border border-slate-200 rounded-xl py-2 px-3 text-xs bg-white focus:outline-none focus:border-blue-600 font-semibold"
              >
                <option value="">All Brands</option>
                {brands.map(b => (
                  <option key={b._id} value={b.name}>{b.name}</option>
                ))}
              </select>
            </div>

            {/* Price range */}
            <div className="space-y-2 mb-4">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-450 block">Price Range</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl py-1.5 px-3 text-xs focus:outline-none focus:border-blue-605"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl py-1.5 px-3 text-xs focus:outline-none focus:border-blue-605"
                />
              </div>
            </div>

            {/* Rating select */}
            <div className="space-y-2 mb-4">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-450 block">Minimum Rating</label>
              <div className="flex flex-col gap-1">
                {[4, 3, 2].map((num) => (
                  <button
                    key={num}
                    onClick={() => setSelectedRating(selectedRating === num ? 0 : num)}
                    className={`flex items-center gap-1.5 py-1 px-2.5 rounded-lg text-xs font-semibold border text-left transition-colors ${
                      selectedRating === num
                        ? 'bg-amber-50 border-amber-300 text-amber-800'
                        : 'border-transparent text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{num}★ & Above</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Availability */}
            <div className="space-y-2 mb-4">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-450 block">Availability</label>
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-650 cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStock}
                  onChange={(e) => setInStock(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span>Exclude Out of Stock</span>
              </label>
            </div>

            {/* Flash deals */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-450 block">Special Offer</label>
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-650 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFlashSale}
                  onChange={(e) => setIsFlashSale(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span>Flash Sales Only</span>
              </label>
            </div>

          </div>
        </div>

        {/* Catalog List */}
        <div className="flex-grow space-y-6">
          {/* Header toolbar */}
          <div className="flex justify-between items-center bg-white/70 backdrop-blur-md border border-slate-200/50 p-4 rounded-3xl shadow-sm gap-4 flex-wrap">
            <div className="text-xs font-extrabold text-slate-600">
              Found {products.length} Products
            </div>
            
            <div className="flex items-center gap-4.5">
              {/* Sorting */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Sort By</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-slate-200 rounded-xl py-1.5 px-3 text-xs bg-white focus:outline-none text-slate-700 font-semibold"
                >
                  <option value="newest">Newly Launched</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="popular">Bestsellers</option>
                </select>
              </div>

              {/* Grid/List switch */}
              <div className="flex border border-slate-200 rounded-xl overflow-hidden bg-white">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 ${viewMode === 'grid' ? 'bg-slate-100 text-blue-600' : 'text-slate-450 hover:text-slate-800'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 ${viewMode === 'list' ? 'bg-slate-100 text-blue-600' : 'text-slate-450 hover:text-slate-800'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Catalog grid */}
          {loading ? (
            <div className="h-64 flex items-center justify-center gap-2 text-slate-500 font-bold text-xs">
              <RefreshCw className="w-4 h-4 animate-spin text-blue-650" /> Fetching catalogue...
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white/70 border border-slate-200/50 rounded-3xl p-12 text-center text-xs font-semibold text-slate-450">
              No products found matching your current filter specifications. Try broadening your criteria.
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
              {products.map(p => (
                <ProductCard key={p._id} product={p} viewMode={viewMode} />
              ))}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default Shop;
