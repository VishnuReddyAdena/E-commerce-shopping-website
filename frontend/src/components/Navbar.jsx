import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useSelector, useDispatch } from 'react-redux';
import { 
  setKeyword, 
  setSuggestions as setReduxSuggestions, 
  setMatchingResults as setReduxMatchingResults, 
  setHistory as setReduxHistory,
  addHistoryItem, 
  clearHistory as clearReduxHistory 
} from '../store/searchSlice';
import { setActiveTab as setReduxActiveTab } from '../store/notificationsSlice';
import { setCurrency as setReduxCurrency, setCountry as setReduxCountry } from '../store/currencySlice';
import { 
  Search, ShoppingCart, Heart, LogOut, ShieldAlert, ChevronDown, Mic, Bell, 
  Trash2, CheckCircle, Menu, X, User, Package, Tag, CreditCard, Globe, 
  Settings, HelpCircle, MapPin, Gift, Award, Flame, Sparkles, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { categoriesData } from './CategoryNav';

export const Navbar = ({ onOpenAuth, onOpenCart }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Redux Global Selectors
  const user = useSelector(state => state.auth.user);
  const token = useSelector(state => state.auth.token);
  const wishlist = useSelector(state => state.wishlist.items);
  const cart = useSelector(state => state.cart.items);
  const dbNotifications = useSelector(state => state.notifications.items);
  const activeNotificationTab = useSelector(state => state.notifications.activeTab);
  const currency = useSelector(state => state.currency.currency);
  const country = useSelector(state => state.currency.country);
  const recentSearches = useSelector(state => state.search.history);
  const matchingProducts = useSelector(state => state.search.matchingProducts);
  const matchingCategories = useSelector(state => state.search.matchingCategories);
  const matchingBrands = useSelector(state => state.search.matchingBrands);
  const suggestions = useSelector(state => state.search.suggestions);
  const deals = useSelector(state => state.deals.items);

  const {
    logout,
    filters,
    setFilters,
    markNotificationRead,
    clearAllNotifications,
    backendUrl,
    setCurrency,
    setAuthOpen,
    removeFromCart,
    getSubtotal,
    adminStore,
    setAdminStore
  } = useApp();

  // Guard: redirect guests to sign-in modal
  const requireAuth = (action) => {
    if (!token) {
      navigate('/login');
      return;
    }
    action();
  };

  // Search input ref & Escape / CTRL + K keyboard shortcuts
  const searchInputRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setShowSuggestions(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Keyboard navigation within suggestions
  const [activeSuggestionIdx, setActiveSuggestionIdx] = useState(-1);

  // Sync recent searches from LocalStorage to Redux on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('recent_searches');
      if (saved) {
        dispatch(setReduxHistory(JSON.parse(saved)));
      } else {
        dispatch(setReduxHistory(["iPhone 16", "iPhone Charger", "Mechanical Keyboard"]));
      }
    } catch {
      dispatch(setReduxHistory(["iPhone 16", "iPhone Charger", "Mechanical Keyboard"]));
    }
  }, [dispatch]);

  // Search States
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  // Navigation Drops States
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedMobileCatIdx, setExpandedMobileCatIdx] = useState(null);

  const suggestionsRef = useRef(null);
  const notificationsRef = useRef(null);
  const currencyRef = useRef(null);

  const saveSearch = (term) => {
    if (!term.trim()) return;
    dispatch(addHistoryItem(term));
  };

  const clearRecentSearches = (e) => {
    e.stopPropagation();
    dispatch(clearReduxHistory());
  };

  const handleSubcategoryClick = (categoryName, subcat) => {
    setFilters((prev) => ({
      ...prev,
      category: categoryName,
      keyword: subcat
    }));
    navigate(`/shop?category=${encodeURIComponent(categoryName)}&keyword=${encodeURIComponent(subcat)}`);
  };

  const handleCategoryHeaderClick = (categoryName) => {
    setFilters((prev) => ({
      ...prev,
      category: categoryName,
      keyword: ''
    }));
    navigate(`/shop?category=${encodeURIComponent(categoryName)}`);
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (currencyRef.current && !currencyRef.current.contains(e.target)) {
        setShowCurrencyDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Fetch search suggestions and matching products dynamically from backend API and populate Redux
  useEffect(() => {
    const fetchSuggestionsAndProducts = async () => {
      if (!filters.keyword.trim()) {
        dispatch(setReduxSuggestions([]));
        dispatch(setReduxMatchingResults({ products: [], categories: [], brands: [] }));
        return;
      }
      try {
        // 1. Suggestions
        const sugRes = await fetch(`${backendUrl}/api/products/search/suggestions?keyword=${filters.keyword}`);
        if (sugRes.ok) {
          const sugData = await sugRes.json();
          dispatch(setReduxSuggestions(sugData));
        }

        // 2. Full Products matching keyword for custom suggestion details
        const prodRes = await fetch(`${backendUrl}/api/products?keyword=${filters.keyword}`);
        if (prodRes.ok) {
          const prodData = await prodRes.json();
          const cats = Array.from(new Set(prodData.map(p => p.category)));
          const brands = Array.from(new Set(prodData.map(p => p.brand)));
          dispatch(setReduxMatchingResults({
            products: prodData.slice(0, 5),
            categories: cats,
            brands: brands
          }));
        }
      } catch (err) {
        console.error('Dynamic search fetch failed:', err);
      }
    };

    const delayDebounce = setTimeout(() => {
      fetchSuggestionsAndProducts();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [filters.keyword, backendUrl, dispatch]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    dispatch(setKeyword(val));
    setFilters((prev) => ({ ...prev, keyword: val }));
    setShowSuggestions(true);
    setActiveSuggestionIdx(-1);
  };

  const handleInputKeyDown = (e) => {
    const allSuggestions = [...recentSearches, ...suggestions.map(s => s.title)];
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggestionIdx(prev => Math.min(prev + 1, allSuggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestionIdx(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      if (activeSuggestionIdx >= 0 && activeSuggestionIdx < allSuggestions.length) {
        e.preventDefault();
        const selected = allSuggestions[activeSuggestionIdx];
        handleSuggestionClick(selected);
      }
    }
  };

  const handleSuggestionClick = (title) => {
    setFilters((prev) => ({ ...prev, keyword: title }));
    saveSearch(title);
    setShowSuggestions(false);
    navigate('/shop');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (filters.keyword.trim()) {
      saveSearch(filters.keyword);
      setShowSuggestions(false);
      navigate('/shop');
    }
  };

  // Voice Search via Web Speech API
  const startVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice search is not supported in this browser. Please try Chrome/Safari.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setFilters((prev) => ({ ...prev, keyword: transcript }));
      saveSearch(transcript);
      setIsListening(false);
      navigate('/shop');
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  // Notification tab filtering logic
  const getFilteredNotifications = () => {
    if (activeNotificationTab === 'All') return dbNotifications;
    const tabLower = activeNotificationTab.toLowerCase();
    
    return dbNotifications.filter(n => {
      const title = (n.title || '').toLowerCase();
      const message = (n.message || '').toLowerCase();
      
      if (tabLower === 'orders') {
        return title.includes('order') || message.includes('order') || title.includes('delivery') || message.includes('delivery') || title.includes('ship') || message.includes('ship');
      }
      if (tabLower === 'offers') {
        return title.includes('offer') || message.includes('offer') || title.includes('sale') || message.includes('sale') || title.includes('inventory') || message.includes('inventory') || title.includes('stock') || message.includes('stock');
      }
      if (tabLower === 'coupons') {
        return title.includes('coupon') || message.includes('coupon') || title.includes('promo') || message.includes('promo') || title.includes('code') || message.includes('code');
      }
      if (tabLower === 'wishlist') {
        return title.includes('wishlist') || message.includes('wishlist') || title.includes('favorite') || message.includes('favorite');
      }
      return true;
    });
  };

  // Helper formatting for currency
  const formatPrice = (priceUSD) => {
    const numericPrice = Number(priceUSD) || 0;
    if (currency === 'INR') {
      const priceINR = Math.round(numericPrice * 83);
      return `₹${priceINR.toLocaleString('en-IN')}`;
    }
    if (currency === 'EUR') {
      const priceEUR = (numericPrice * 0.92).toFixed(2);
      return `€${Number(priceEUR).toLocaleString('en-US')}`;
    }
    return `$${numericPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const changeCountryCurrency = (country, curr) => {
    setCurrency(curr);
    if (setAdminStore) {
      setAdminStore(country);
    }
    setShowCurrencyDropdown(false);
  };

  const getCombinedSelectorLabel = () => {
    if (currency === 'INR') return '🌐 India | ₹ INR';
    if (currency === 'EUR') return '🌐 Europe | € EUR';
    return '🌐 USA | $ USD';
  };

  const cartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const unreadNotificationsCount = dbNotifications.filter(n => !n.readStatus).length;

  // Cart total subtotal calculation
  const getSubtotalValue = () => {
    return cart.reduce((acc, item) => acc + (item.productId?.price || 0) * item.quantity, 0);
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200/55 sticky top-0 z-40 w-full shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-6">
        
        {/* Left Side: Mobile Hamburger & Logo */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Hamburger Trigger */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-655 md:hidden transition-colors"
            title="Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link 
            to="/" 
            onClick={(e) => {
              if (location.pathname === '/') {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className="flex items-center gap-2 group cursor-pointer"
          >
            <span className="bg-gradient-to-tr from-blue-650 to-indigo-650 text-white w-9 h-9 rounded-2xl flex items-center justify-center font-black text-lg shadow-md group-hover:scale-105 transition-all">
              V
            </span>
            <div className="flex flex-col">
              <span className="font-extrabold text-sm tracking-tight text-slate-800 leading-none">
                Vyvora
              </span>
              <span className="text-[9px] font-bold text-indigo-600 tracking-wider uppercase mt-0.5">
                Enterprise MERN
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Large Search Bar (Highest Priority, 450px–600px width) */}
        <form onSubmit={handleSearchSubmit} ref={suggestionsRef} className="flex-grow min-w-[450px] max-w-[600px] relative hidden md:block">
          <div
            className="flex items-center bg-slate-100 rounded-2xl px-4 py-2 border border-transparent focus-within:border-blue-650 focus-within:bg-white focus-within:shadow-md transition-all w-full"
            onClick={() => { if (!token) { navigate('/login'); } }}
          >
            <Search className="w-4 h-4 text-slate-455 flex-shrink-0" />
            <input
              type="text"
              ref={searchInputRef}
              onKeyDown={handleInputKeyDown}
              placeholder="🔍 Search for products, brands and categories..."
              value={filters.keyword}
              onChange={token ? handleSearchChange : (e) => { e.preventDefault(); navigate('/login'); }}
              onFocus={() => { if (!token) { navigate('/login'); return; } setShowSuggestions(true); }}
              readOnly={!token}
              className={`w-full bg-transparent border-none py-1 px-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none ${!token ? 'cursor-pointer' : ''}`}
            />
            {/* Voice search button */}
            <button
              type="button"
              onClick={startVoiceSearch}
              className={`p-1.5 rounded-xl hover:bg-slate-200/80 text-slate-500 hover:text-slate-800 transition-colors ${
                isListening ? 'bg-red-100 text-red-655 hover:bg-red-200 animate-pulse' : ''
              }`}
              title="Voice Search"
            >
              🎤
            </button>
          </div>

          {/* Autocomplete Suggestions Panel */}
          {showSuggestions && token && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-2xl p-4 z-50 text-left max-h-[480px] overflow-y-auto no-scrollbar">
              
              {/* AI Search Banner */}
              <div 
                onClick={() => {
                  setFilters(prev => ({ ...prev, keyword: filters.keyword || "AI recommended smart choices" }));
                  saveSearch(filters.keyword || "AI recommended smart choices");
                  setShowSuggestions(false);
                  navigate('/shop');
                }}
                className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl flex items-center justify-between cursor-pointer hover:border-blue-300 transition-all group"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
                  <div>
                    <h4 className="text-[11px] font-black text-blue-900 uppercase">Try AI Semantic Search</h4>
                    <p className="text-[9px] text-blue-600 font-medium">Find products using descriptive natural language query</p>
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-blue-500 -rotate-90 group-hover:translate-x-0.5 transition-transform" />
              </div>

              {/* If keyword is empty */}
              {!filters.keyword.trim() ? (
                <div className="space-y-4">
                  {/* Recent Searches */}
                  {recentSearches.length > 0 && (
                    <div>
                      <div className="flex justify-between items-center mb-1.5 px-1">
                        <h4 className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400">Recent Searches</h4>
                        <button 
                          type="button"
                          onClick={clearRecentSearches}
                          className="text-[9px] text-slate-450 hover:text-rose-600 font-bold hover:underline"
                        >
                          Clear History
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {recentSearches.map((term, index) => {
                          const isHighlighted = activeSuggestionIdx === index;
                          return (
                            <button
                              type="button"
                              key={term}
                              onClick={() => {
                                setFilters(prev => ({ ...prev, keyword: term }));
                                saveSearch(term);
                                setShowSuggestions(false);
                                navigate('/shop');
                              }}
                              className={`px-3 py-1 text-[10px] font-semibold rounded-lg transition-colors ${
                                isHighlighted ? 'bg-blue-650 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-655'
                              }`}
                            >
                              {term}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Trending Searches */}
                  <div>
                    <h4 className="text-[9px] uppercase tracking-wider font-extrabold text-slate-405 mb-1.5 px-1">Trending Products & Terms</h4>
                    <div className="flex flex-wrap gap-2">
                      {["iPhone 16 Pro", "Mechanical Keyboard", "MacBook Pro M3", "AuraGlow Lighting Panel", "Calfskin Backpack"].map(term => (
                        <button
                          type="button"
                          key={term}
                          onClick={() => {
                            setFilters(prev => ({ ...prev, keyword: term }));
                            saveSearch(term);
                            setShowSuggestions(false);
                            navigate('/shop');
                          }}
                          className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700 text-[10px] font-semibold rounded-lg transition-colors border border-blue-100/50"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                // If typing a keyword
                <div className="space-y-4">
                  {/* Matching Products */}
                  <div>
                    <h4 className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 mb-2 px-1">Products</h4>
                    {matchingProducts.length === 0 ? (
                      <p className="text-[10px] text-slate-505 italic pl-1">No products found matching "{filters.keyword}"</p>
                    ) : (
                      <div className="grid grid-cols-1 gap-1">
                        {matchingProducts.map(p => (
                          <div
                            key={p._id}
                            onClick={() => {
                              saveSearch(filters.keyword);
                              setShowSuggestions(false);
                              navigate(`/product/${p._id}`);
                            }}
                            className="p-1.5 hover:bg-slate-50 rounded-xl flex items-center gap-3 cursor-pointer transition-colors border border-transparent hover:border-slate-100"
                          >
                            <img
                              src={p.images?.[0] || 'https://images.unsplash.com/photo-1472851294608-062f824d296e?auto=format&fit=crop&w=150&q=80'}
                              alt={p.title}
                              className="w-8 h-8 object-cover rounded-lg border border-slate-100 flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-slate-800 truncate">{p.title}</p>
                              <p className="text-[10px] text-indigo-600 font-medium mt-0.5">{p.brand} • {p.category}</p>
                            </div>
                            <span className="text-xs font-extrabold text-slate-900">{formatPrice(p.price)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Matching Categories & Brands Grid */}
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                    {/* Categories column */}
                    <div>
                      <h4 className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 mb-2 px-1">Categories</h4>
                      {matchingProducts.length === 0 ? (
                        <p className="text-[10px] text-slate-500 italic pl-1">None</p>
                      ) : (
                        <div className="space-y-1">
                          {Array.from(new Set(matchingProducts.map(p => p.category))).slice(0, 3).map(cat => (
                            <button
                              type="button"
                              key={cat}
                              onClick={() => {
                                setFilters(prev => ({ ...prev, category: cat, keyword: '' }));
                                saveSearch(filters.keyword);
                                setShowSuggestions(false);
                                navigate(`/shop?category=${encodeURIComponent(cat)}`);
                              }}
                              className="w-full text-left py-1 px-2.5 hover:bg-slate-50 text-[11px] font-bold text-slate-700 hover:text-blue-600 rounded-lg transition-colors truncate"
                            >
                              📁 {cat}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Brands column */}
                    <div>
                      <h4 className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 mb-2 px-1">Brands</h4>
                      {matchingProducts.length === 0 ? (
                        <p className="text-[10px] text-slate-500 italic pl-1">None</p>
                      ) : (
                        <div className="space-y-1">
                          {Array.from(new Set(matchingProducts.map(p => p.brand))).slice(0, 3).map(brnd => (
                            <button
                              type="button"
                              key={brnd}
                              onClick={() => {
                                setFilters(prev => ({ ...prev, brand: brnd, keyword: '' }));
                                saveSearch(filters.keyword);
                                setShowSuggestions(false);
                                navigate(`/shop?brand=${encodeURIComponent(brnd)}`);
                              }}
                              className="w-full text-left py-1 px-2.5 hover:bg-slate-50 text-[11px] font-bold text-slate-700 hover:text-blue-600 rounded-lg transition-colors truncate"
                            >
                              🏷️ {brnd}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Autocomplete Suggestions */}
                  {suggestions.length > 0 && (
                    <div className="pt-2 border-t border-slate-100">
                      <h4 className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 mb-1.5 px-1">Search Suggestions</h4>
                      <div className="grid grid-cols-2 gap-1.5">
                        {suggestions.map((s, index) => {
                          const globalIdx = recentSearches.length + index;
                          const isHighlighted = activeSuggestionIdx === globalIdx;
                          return (
                            <button
                              type="button"
                              key={s._id}
                              onClick={() => {
                                setFilters(prev => ({ ...prev, keyword: s.title }));
                                saveSearch(s.title);
                                setShowSuggestions(false);
                                navigate('/shop');
                              }}
                              className={`text-left py-1.5 px-2.5 rounded-lg transition-colors truncate border text-[10.5px] font-semibold ${
                                isHighlighted 
                                  ? 'bg-blue-650 text-white border-blue-650' 
                                  : 'hover:bg-slate-50 text-slate-655 border-slate-100'
                              }`}
                            >
                              🔍 {s.title}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </form>

        {/* Right Side Actions: Navigation items and user accounts */}
        <div className="flex items-center gap-6">
          
          {/* Deals Dropdown */}
          <div className="relative group/deals hidden lg:block">
            <button className="text-xs font-extrabold text-slate-655 hover:text-blue-650 transition-colors uppercase tracking-wider py-2 flex items-center gap-0.5 cursor-pointer whitespace-nowrap">
              <span>Deals 🔥</span>
              <ChevronDown className="w-3.5 h-3.5 mt-0.5" />
            </button>
            <div className="absolute top-full left-0 pt-2 w-48 hidden group-hover/deals:block z-50">
              <div className="bg-white text-slate-700 rounded-2xl shadow-2xl border border-slate-150 py-2.5">
                {[
                  { label: "Today's Deals", path: "/shop?tag=deal" },
                  { label: "Flash Sale", path: "/shop?isFlashSale=true" },
                  { label: "Clearance", path: "/shop?tag=clearance" },
                  { label: "Coupons", path: "/dashboard?tab=coupons" },
                  { label: "Best Sellers", path: "/shop?sortBy=rating" },
                  { label: "Trending", path: "/shop?sortBy=trending" }
                ].map(deal => (
                  <button
                    type="button"
                    key={deal.label}
                    onClick={() => {
                      if (deal.path.startsWith('/dashboard')) {
                        requireAuth(() => navigate(deal.path));
                      } else {
                        navigate(deal.path);
                      }
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 text-xs font-semibold"
                  >
                    {deal.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Combined Country/Currency Selector Dropdown */}
          <div ref={currencyRef} className="relative hidden md:block">
            <button
              onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
              className="flex items-center gap-1.5 bg-slate-100/70 hover:bg-slate-100 hover:border-slate-300 py-1.5 px-3.5 rounded-full border border-slate-205 transition-all text-[11px] font-black text-slate-700 select-none cursor-pointer whitespace-nowrap"
            >
              <span>{getCombinedSelectorLabel()}</span>
              <ChevronDown className="w-3 h-3 mt-0.5" />
            </button>

            {showCurrencyDropdown && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-white text-slate-700 rounded-2xl shadow-2xl border border-slate-150 py-2 z-50">
                {[
                  { country: 'India', currency: 'INR', label: '🌐 India | ₹ INR' },
                  { country: 'USA', currency: 'USD', label: '🌐 USA | $ USD' },
                  { country: 'Europe', currency: 'Europe', label: '🌐 Europe | € EUR' }
                ].map(opt => (
                  <button
                    type="button"
                    key={opt.label}
                    onClick={() => changeCountryCurrency(opt.country, opt.currency === 'Europe' ? 'EUR' : opt.currency)}
                    className="w-full text-left px-4 py-2.5 hover:bg-slate-55 text-xs font-bold transition-colors"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Wishlist Link with dynamic count */}
          <button
            onClick={() => requireAuth(() => navigate('/dashboard?tab=wishlist'))}
            className="flex items-center gap-1.5 text-slate-655 hover:text-blue-650 relative py-1 transition-colors font-semibold text-xs animate-none whitespace-nowrap"
          >
            <Heart className="w-4.5 h-4.5" />
            <span>Wishlist</span>
            {wishlist.length > 0 && (
              <span className="bg-amber-500 text-white font-extrabold text-[8px] px-1.5 py-0.5 rounded-full">
                {wishlist.length}
              </span>
            )}
          </button>

          {/* Cart Trigger with Hover Mini Cart Preview */}
          <div className="relative group/cart">
            <button
              onClick={() => requireAuth(() => onOpenCart())}
              className="flex items-center gap-1.5 text-slate-655 hover:text-blue-650 relative py-1 transition-colors font-semibold text-xs cursor-pointer whitespace-nowrap"
            >
              <ShoppingCart className="w-4.5 h-4.5" />
              <span>Cart</span>
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 right-[-4px] bg-blue-600 text-white font-extrabold text-[8px] w-4 h-4 rounded-full flex items-center justify-center border border-white animate-bounce">
                  {cartItemsCount}
                </span>
              )}
            </button>

            {/* Hover Mini Cart Preview Panel */}
            <div className="absolute top-full right-0 pt-2 w-80 hidden group-hover/cart:block z-50 transition-all duration-205 cursor-default text-left">
              <div className="bg-white text-slate-700 rounded-2xl shadow-2xl border border-slate-150 p-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-2">
                  <h4 className="text-xs font-black uppercase text-slate-800">Mini Cart Preview</h4>
                  <span className="text-[10px] text-slate-450 font-bold">{cartItemsCount} Items</span>
                </div>
                {cart.length === 0 ? (
                  <div className="py-6 text-center text-xs font-semibold text-slate-450">
                    Your shopping cart is empty
                  </div>
                ) : (
                  <>
                    <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto pr-1">
                      {cart.map((item) => (
                        <div key={item._id} className="py-2.5 flex items-center gap-3">
                          <img 
                            src={item.productId?.images?.[0] || 'https://images.unsplash.com/photo-1472851294608-062f824d296e?auto=format&fit=crop&w=150&q=80'} 
                            alt={item.productId?.title} 
                            className="w-10 h-10 object-cover rounded-lg border border-slate-100 flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-bold text-slate-800 truncate">{item.productId?.title}</p>
                            <p className="text-[10px] text-slate-505 font-medium mt-0.5">
                              Qty: {item.quantity} × {formatPrice(item.productId?.price || 0)}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.productId?._id)}
                            className="p-1 rounded-lg hover:bg-slate-100 text-rose-505 hover:text-rose-650 transition-colors"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-slate-100 pt-3 mt-3 space-y-3">
                      <div className="flex justify-between items-center text-xs font-black">
                        <span className="text-slate-500">Subtotal:</span>
                        <span className="text-slate-800">{formatPrice(getSubtotalValue())}</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => { onOpenCart(); }}
                          className="flex-1 text-center py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[10px] font-bold uppercase transition-colors"
                        >
                          View Cart
                        </button>
                        <button
                          type="button"
                          onClick={() => { navigate('/checkout'); }}
                          className="flex-1 text-center py-2 bg-[#2874F0] hover:bg-[#1963d2] text-white rounded-xl text-[10px] font-bold uppercase transition-colors shadow-md shadow-blue-500/10"
                        >
                          Checkout
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Notification Bell with Tabbed Dropdown */}
          {user && (
            <div ref={notificationsRef} className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="flex items-center text-slate-655 hover:text-blue-650 relative py-1 transition-colors"
              >
                <Bell className="w-4.5 h-4.5" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-rose-600 rounded-full border border-white" />
                )}
              </button>

              {showNotifications && (
                <div className="absolute top-full right-0 mt-3 w-80 bg-white rounded-2xl border border-slate-200 shadow-2xl p-4 z-50 text-left">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-2.5">
                    <h4 className="text-xs font-black uppercase text-slate-800">Inbox Notification</h4>
                    {dbNotifications.length > 0 && (
                      <button
                        onClick={clearAllNotifications}
                        className="text-[10px] text-rose-600 font-bold hover:underline flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" /> Clear All
                      </button>
                    )}
                  </div>

                  {/* Tabbed Notification Headers */}
                  <div className="flex border-b border-slate-100 mb-2 gap-1 overflow-x-auto no-scrollbar pb-1">
                    {['All', 'Orders', 'Offers', 'Coupons', 'Wishlist'].map(tab => {
                      const count = tab === 'All' ? dbNotifications.length : dbNotifications.filter(n => {
                        const t = (n.title || '').toLowerCase();
                        const m = (n.message || '').toLowerCase();
                        if (tab === 'Orders') return t.includes('order') || m.includes('order') || t.includes('delivery') || m.includes('delivery') || t.includes('ship') || m.includes('ship');
                        if (tab === 'Offers') return t.includes('offer') || m.includes('offer') || t.includes('sale') || m.includes('sale') || t.includes('inventory') || m.includes('inventory') || t.includes('stock') || m.includes('stock');
                        if (tab === 'Coupons') return t.includes('coupon') || m.includes('coupon') || t.includes('promo') || m.includes('promo') || t.includes('code') || m.includes('code');
                        if (tab === 'Wishlist') return t.includes('wishlist') || m.includes('wishlist') || t.includes('favorite') || m.includes('favorite');
                        return false;
                      }).length;
                      
                      return (
                        <button
                          type="button"
                          key={tab}
                          onClick={() => setActiveNotificationTab(tab)}
                          className={`px-2.5 py-1 text-[10px] font-black rounded-lg transition-colors whitespace-nowrap ${
                            activeNotificationTab === tab
                              ? 'bg-blue-600 text-white'
                              : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                          }`}
                        >
                          {tab} {count > 0 && `(${count})`}
                        </button>
                      );
                    })}
                  </div>

                  {/* Tab filtered notifications list */}
                  <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto pr-1">
                    {getFilteredNotifications().length === 0 ? (
                      <p className="text-[10px] text-slate-450 font-bold text-center py-6">No notifications in this category</p>
                    ) : (
                      getFilteredNotifications().map(n => (
                        <div key={n._id} className={`py-2.5 flex items-start gap-3 ${n.readStatus ? 'opacity-60' : ''}`}>
                          <div className="flex-1">
                            <p className="text-[11px] font-bold text-slate-800">{n.title}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5 font-medium leading-relaxed">{n.message}</p>
                          </div>
                          {!n.readStatus && (
                            <button
                              onClick={() => markNotificationRead(n._id)}
                              className="text-blue-600 hover:text-blue-700 p-0.5"
                              title="Mark read"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Account Dropdown (👤 Hi Vishnu / Account ▼ style, far right) */}
          {user ? (
            <div className="flex items-center gap-4 relative group cursor-pointer animate-none">
              <div className="flex items-center gap-2 hover:text-blue-650 py-1 font-bold text-xs text-slate-700 whitespace-nowrap">
                {user.avatarUrl ? (
                  <img 
                    src={user.avatarUrl} 
                    alt={user.name} 
                    className="w-5 h-5 rounded-full object-cover border border-slate-200" 
                  />
                ) : (
                  <User className="w-4 h-4 text-slate-500" />
                )}
                <div className="flex flex-col items-start leading-tight text-left">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    {`Hi ${user.name.split(' ')[0]}`}
                  </span>
                  <span className="text-[11px] font-black uppercase tracking-wide flex items-center gap-0.5">
                    Account <ChevronDown className="w-3 h-3 mt-0.5" />
                  </span>
                </div>
              </div>
              
              <div className="absolute top-full right-0 pt-2 w-52 hidden group-hover:block z-50">
                <div className="bg-white text-slate-700 rounded-2xl shadow-2xl border border-slate-150 py-2.5">
                  {user.role === 'admin' && (
                    <Link
                      to="/admin-dashboard"
                      className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 text-xs font-extrabold text-amber-700 border-b border-slate-100 mb-1"
                    >
                      <ShieldAlert className="w-4 h-4" />
                      Admin Panel
                    </Link>
                  )}
                  <Link
                    to="/dashboard?tab=profile"
                    className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 text-xs font-semibold"
                  >
                    <User className="w-4 h-4 text-blue-650" />
                    My Profile
                  </Link>
                  <Link
                    to="/dashboard?tab=orders"
                    className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 text-xs font-semibold"
                  >
                    <Package className="w-4 h-4 text-blue-655" />
                    Orders
                  </Link>
                  <Link
                    to="/dashboard?tab=returns"
                    className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 text-xs font-semibold"
                  >
                    <Package className="w-4 h-4 text-amber-600" />
                    Returns &amp; Refunds
                  </Link>
                  <Link
                    to="/dashboard?tab=wishlist"
                    className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 text-xs font-semibold"
                  >
                    <Heart className="w-4 h-4 text-rose-500" />
                    Wishlist
                  </Link>
                  <Link
                    to="/dashboard?tab=addresses"
                    className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 text-xs font-semibold"
                  >
                    <MapPin className="w-4 h-4 text-blue-650" />
                    Saved Addresses
                  </Link>
                  <Link
                    to="/dashboard?tab=coupons"
                    className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 text-xs font-semibold"
                  >
                    <Tag className="w-4 h-4 text-blue-655" />
                    Coupons
                  </Link>
                  <Link
                    to="/dashboard?tab=giftcards"
                    className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 text-xs font-semibold"
                  >
                    <CreditCard className="w-4 h-4 text-blue-650" />
                    Gift Cards
                  </Link>
                  <Link
                    to="/dashboard?tab=rewards"
                    className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 text-xs font-semibold"
                  >
                    <Award className="w-4 h-4 text-amber-500" />
                    Rewards
                  </Link>
                  <Link
                    to="/dashboard?tab=notifications"
                    className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 text-xs font-semibold"
                  >
                    <Bell className="w-4 h-4 text-indigo-505" />
                    Notifications
                  </Link>
                  <Link
                    to="/dashboard?tab=settings"
                    className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 text-xs font-semibold"
                  >
                    <Settings className="w-4 h-4 text-slate-500" />
                    Settings
                  </Link>
                  <Link
                    to="/dashboard?tab=support"
                    className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 text-xs font-semibold"
                  >
                    <HelpCircle className="w-4 h-4 text-emerald-500" />
                    Help
                  </Link>
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-slate-50 text-xs text-rose-600 font-extrabold text-left border-t border-slate-100 mt-1 pt-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4 relative group cursor-pointer animate-none">
              <div 
                onClick={() => navigate('/login')}
                className="flex items-center gap-2 hover:text-blue-650 py-1 font-bold text-xs text-slate-700 whitespace-nowrap"
              >
                <User className="w-4 h-4 text-slate-500" />
                <div className="flex flex-col items-start leading-tight text-left">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Hello</span>
                  <span className="text-[11px] font-black uppercase tracking-wide flex items-center gap-0.5">
                    Sign In <ChevronDown className="w-3 h-3 mt-0.5" />
                  </span>
                </div>
              </div>
              <div className="absolute top-full right-0 mt-2 w-48 bg-white text-slate-700 rounded-2xl shadow-2xl border border-slate-150 py-3 hidden group-hover:block z-50 text-center px-4">
                <p className="text-[10px] text-slate-455 font-extrabold uppercase mb-2">New Customer?</p>
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="w-full bg-[#2874F0] hover:bg-[#1b62d1] text-white py-2 rounded-xl text-xs font-black shadow-sm transition-all uppercase tracking-wider text-center"
                >
                  Sign In
                </button>
                <div className="border-t border-slate-100 pt-2.5 mt-2.5">
                  <button
                    type="button"
                    onClick={() => navigate('/signup')}
                    className="text-[10px] text-blue-655 font-bold hover:underline"
                  >
                    Register Now
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Dark Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900 z-50 md:hidden"
            />

            {/* Sidebar Panel */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 bottom-0 left-0 w-80 max-w-[85vw] bg-white z-50 shadow-2xl flex flex-col md:hidden"
            >
              {/* Header */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2">
                  <span className="bg-blue-650 text-white w-8 h-8 rounded-xl flex items-center justify-center font-black text-base shadow-sm">
                    V
                  </span>
                  <span className="font-bold text-sm text-slate-800">Vyvora Menu</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-200 text-slate-550"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-5">
                
                {/* 1. Mobile Search Bar */}
                <div className="relative">
                  <div className="flex items-center bg-slate-100 rounded-xl px-3 py-1.5 border border-slate-200/50 focus-within:border-blue-500 focus-within:bg-white transition-all w-full">
                    <Search className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <input
                      type="text"
                      placeholder="Search categories, items..."
                      value={filters.keyword}
                      onChange={handleSearchChange}
                      className="w-full bg-transparent border-none py-0.5 px-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
                    />
                  </div>
                </div>

                {/* 2. User info / Auth actions */}
                <div className="p-3 bg-slate-50 border border-slate-150 rounded-2xl flex flex-col gap-2.5">
                  {user ? (
                    <div>
                      <p className="text-[10px] uppercase font-extrabold text-slate-400">Signed In As</p>
                      <p className="text-xs font-bold text-slate-800 mt-0.5 truncate">{user.name}</p>
                      <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                      
                      <div className="grid grid-cols-2 gap-2 mt-3.5">
                        <Link
                          to="/dashboard?tab=orders"
                          onClick={() => setMobileMenuOpen(false)}
                          className="text-center py-1.5 px-2 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700 hover:bg-slate-100"
                        >
                          My Orders
                        </Link>
                        <button
                          onClick={() => {
                            setMobileMenuOpen(false);
                            logout();
                          }}
                          className="text-center py-1.5 px-2 bg-rose-50 border border-rose-100 rounded-lg text-[10px] font-bold text-rose-600 hover:bg-rose-100"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 py-1">
                      <p className="text-xs font-semibold text-slate-650 leading-normal">
                        Unlock discounts, checkout quickly & track order history!
                      </p>
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          navigate('/login');
                        }}
                        className="w-full bg-[#2874F0] hover:bg-[#1b62d1] text-white py-2 rounded-xl text-xs font-extrabold shadow-sm transition-colors uppercase tracking-wider text-center mt-1"
                      >
                        Sign In / Register
                      </button>
                    </div>
                  )}
                </div>

                {/* 3. Categories Accordion List */}
                <div>
                  <h4 className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 mb-2 px-1">
                    Shop Categories
                  </h4>
                  <div className="border border-slate-200/60 rounded-2xl divide-y divide-slate-100 overflow-hidden bg-white">
                    {categoriesData.map((cat, idx) => {
                      const IconComponent = cat.icon;
                      const isExpanded = expandedMobileCatIdx === idx;

                      return (
                        <div key={cat.name} className="flex flex-col">
                          {/* Accordion Trigger */}
                          <button
                            onClick={() => setExpandedMobileCatIdx(isExpanded ? null : idx)}
                            className="w-full flex items-center justify-between p-3.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors text-left"
                          >
                            <div className="flex items-center gap-2">
                              <IconComponent className="w-4 h-4 text-slate-500" />
                              <span>{cat.name}</span>
                            </div>
                            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180 text-blue-650' : ''}`} />
                          </button>

                          {/* Accordion Content */}
                          <AnimatePresence initial={false}>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.25, ease: 'easeInOut' }}
                                className="overflow-hidden bg-slate-50 border-t border-slate-100"
                              >
                                <div className="p-3 grid grid-cols-2 gap-2 max-h-56 overflow-y-auto no-scrollbar">
                                  <button
                                    onClick={() => {
                                      setMobileMenuOpen(false);
                                      handleCategoryHeaderClick(cat.name);
                                    }}
                                    className="col-span-2 text-left py-1 px-2.5 text-[10px] font-bold text-[#2874F0] hover:underline"
                                  >
                                    View All in {cat.name}
                                  </button>
                                  {cat.subcategories.map((subcat) => (
                                    <button
                                      key={subcat}
                                      onClick={() => {
                                        setMobileMenuOpen(false);
                                        handleSubcategoryClick(cat.name, subcat);
                                      }}
                                      className="text-left py-1.5 px-2.5 hover:bg-white text-[10.5px] font-semibold text-slate-650 hover:text-[#2874F0] rounded-lg transition-colors truncate"
                                    >
                                      {subcat}
                                    </button>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Wishlist & Cart Summary */}
                <div className="pt-2 border-t border-slate-150 flex flex-col gap-2 text-xs font-bold text-slate-705">
                  <button
                    onClick={() => requireAuth(() => { setMobileMenuOpen(false); navigate('/dashboard?tab=wishlist'); })}
                    className="flex justify-between items-center p-3.5 bg-white border border-slate-200/60 rounded-xl hover:bg-slate-55 text-left"
                  >
                    <span>My Wishlist</span>
                    <span className="bg-amber-500 text-white font-extrabold text-[9px] px-2 py-0.5 rounded-full">
                      {wishlist.length} items
                    </span>
                  </button>

                  <button
                    onClick={() => requireAuth(() => { setMobileMenuOpen(false); onOpenCart(); })}
                    className="flex justify-between items-center p-3.5 bg-white border border-slate-200/60 rounded-xl hover:bg-slate-55 text-left"
                  >
                    <span>My Shopping Cart</span>
                    <span className="bg-blue-600 text-white font-extrabold text-[9px] px-2 py-0.5 rounded-full">
                      {cartItemsCount} items
                    </span>
                  </button>
                </div>
                
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </nav>
  );
};

export default Navbar;
