import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Search, ShoppingCart, Heart, LogOut, ShieldAlert, ChevronDown, Mic, Bell, Trash2, CheckCircle, Menu, X, User, Package, Tag, CreditCard, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { categoriesData } from './CategoryNav';

export const Navbar = ({ onOpenAuth, onOpenCart }) => {
  const {
    user,
    logout,
    wishlist,
    cart,
    filters,
    setFilters,
    dbNotifications,
    markNotificationRead,
    clearAllNotifications,
    backendUrl,
    currency,
    setCurrency,
    token,
    setAuthOpen
  } = useApp();

  // Guard: redirect guests to sign-in modal
  const requireAuth = (action) => {
    if (!token) {
      setAuthOpen(true);
      return;
    }
    action();
  };

  const navigate = useNavigate();
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedMobileCatIdx, setExpandedMobileCatIdx] = useState(null);
  
  const suggestionsRef = useRef(null);
  const notificationsRef = useRef(null);

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
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Fetch search autocomplete suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!filters.keyword.trim()) {
        setSuggestions([]);
        return;
      }
      try {
        const response = await fetch(`${backendUrl}/api/products/search/suggestions?keyword=${filters.keyword}`);
        const data = await response.json();
        if (response.ok) {
          setSuggestions(data);
        }
      } catch (err) {
        console.error(err);
      }
    };

    const delayDebounce = setTimeout(() => {
      fetchSuggestions();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [filters.keyword, backendUrl]);

  const handleSearchChange = (e) => {
    setFilters((prev) => ({ ...prev, keyword: e.target.value }));
    setShowSuggestions(true);
    navigate('/shop');
  };

  const handleSuggestionClick = (title) => {
    setFilters((prev) => ({ ...prev, keyword: title }));
    setShowSuggestions(false);
    navigate('/shop');
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

  const cartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const unreadNotificationsCount = dbNotifications.filter(n => !n.readStatus).length;

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200/55 sticky top-0 z-40 w-full shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between gap-6">
        
        {/* Left Side: Mobile Hamburger & Logo */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Hamburger Trigger */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-650 md:hidden transition-colors"
            title="Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link to="/" className="flex items-center gap-2 group">
            <span className="bg-gradient-to-tr from-blue-650 to-indigo-650 text-white w-9 h-9 rounded-2xl flex items-center justify-center font-black text-lg shadow-md group-hover:scale-105 transition-all">
              N
            </span>
            <div className="flex flex-col">
              <span className="font-extrabold text-sm tracking-tight text-slate-800 leading-none">
                NexaCart
              </span>
              <span className="text-[9px] font-bold text-indigo-600 tracking-wider uppercase mt-0.5">
                Enterprise MERN
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Advanced Smart Search with suggestions & voice */}
        <div ref={suggestionsRef} className="flex-1 max-w-xl relative hidden md:block">
          <div
            className="flex items-center bg-slate-100 rounded-2xl px-4 py-1.5 border border-transparent focus-within:border-blue-650 focus-within:bg-white focus-within:shadow-md transition-all w-full"
            onClick={() => { if (!token) { setAuthOpen(true); } }}
          >
            <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Fuzzy search collections, category, tags..."
              value={filters.keyword}
              onChange={token ? handleSearchChange : (e) => { e.preventDefault(); setAuthOpen(true); }}
              onFocus={() => { if (!token) { setAuthOpen(true); return; } setShowSuggestions(true); }}
              readOnly={!token}
              className={`w-full bg-transparent border-none py-1 px-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none ${!token ? 'cursor-pointer' : ''}`}
            />
            {/* Voice search button */}
            <button
              onClick={startVoiceSearch}
              className={`p-1.5 rounded-xl hover:bg-slate-200/80 text-slate-500 hover:text-slate-800 transition-colors ${
                isListening ? 'bg-red-100 text-red-650 hover:bg-red-200 animate-pulse' : ''
              }`}
              title="Voice Search"
            >
              <Mic className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Autocomplete Suggestions Panel */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-2xl p-2.5 z-50">
              <p className="text-[9px] uppercase tracking-wider font-bold text-slate-400 px-3 pb-1.5 border-b border-slate-100">
                Recommended Suggestions
              </p>
              <div className="divide-y divide-slate-100 mt-1 max-h-60 overflow-y-auto">
                {suggestions.map(s => (
                  <button
                    key={s._id}
                    onClick={() => handleSuggestionClick(s.title)}
                    className="w-full text-left py-2 px-3 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex justify-between items-center rounded-lg"
                  >
                    <span>{s.title}</span>
                    <span className="text-[9px] bg-slate-100 px-2 py-0.5 text-slate-450 font-bold rounded-lg uppercase">
                      {s.category}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-5">
          {/* My Account with Dropdown */}
          <div className="relative group/account">
            <button
              onClick={() => {
                if (user) {
                  navigate('/dashboard?tab=dashboard');
                } else {
                  onOpenAuth();
                }
              }}
              className="flex items-center gap-1 hover:text-blue-650 py-1 font-bold text-xs text-slate-700 transition-colors uppercase tracking-wider cursor-pointer"
            >
              <span>My Account</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {/* Hover Dropdown */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 bg-white text-slate-700 rounded-2xl shadow-2xl border border-slate-100 py-3 hidden group-hover/account:block z-50 transition-all duration-200">
              {user ? (
                <div className="divide-y divide-slate-100/60">
                  <div className="py-1">
                    <Link
                      to="/dashboard?tab=profile"
                      className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 text-xs font-semibold"
                    >
                      <User className="w-4 h-4 text-blue-650" />
                      My Profile
                    </Link>
                    <Link
                      to="/dashboard?tab=rewards"
                      className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 text-xs font-semibold"
                    >
                      <div className="w-4 h-4 rounded-full bg-blue-650 flex items-center justify-center text-[9px] font-black text-white">⚡</div>
                      SuperCoin Zone
                    </Link>
                    <Link
                      to="/dashboard?tab=subscriptions"
                      className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 text-xs font-semibold"
                    >
                      <span className="w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center text-[8px] font-black text-white">★</span>
                      Flipkart Plus Zone
                    </Link>
                  </div>
                  <div className="py-1">
                    <Link
                      to="/dashboard?tab=orders"
                      className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 text-xs font-semibold"
                    >
                      <Package className="w-4 h-4 text-blue-650" />
                      Orders
                    </Link>
                    <Link
                      to="/dashboard?tab=wishlist"
                      className="flex items-center justify-between px-4 py-2 hover:bg-slate-50 text-xs font-semibold"
                    >
                      <div className="flex items-center gap-3">
                        <Heart className="w-4 h-4 text-blue-650" />
                        <span>Wishlist</span>
                      </div>
                      {wishlist.length > 0 && (
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-extrabold text-slate-500">
                          {wishlist.length}
                        </span>
                      )}
                    </Link>
                    <Link
                      to="/dashboard?tab=coupons"
                      className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 text-xs font-semibold"
                    >
                      <Tag className="w-4 h-4 text-blue-650" />
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
                      to="/dashboard?tab=notifications"
                      className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 text-xs font-semibold"
                    >
                      <Bell className="w-4 h-4 text-blue-650" />
                      Notifications
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="px-4 py-3 text-center space-y-2.5">
                  <p className="text-[10px] text-slate-455 font-extrabold uppercase">New Customer?</p>
                  <button
                    onClick={onOpenAuth}
                    className="w-full bg-[#2874F0] hover:bg-[#1b62d1] text-white py-2 rounded-xl text-xs font-black shadow-sm transition-all uppercase tracking-wider text-center"
                  >
                    Sign In
                  </button>
                  <div className="border-t border-slate-100 pt-2.5">
                    <button
                      onClick={onOpenAuth}
                      className="text-[10px] text-blue-650 font-bold hover:underline"
                    >
                      Register Now
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Become a Seller link */}
          <Link to="/shop" className="text-xs font-extrabold text-slate-600 hover:text-blue-650 transition-colors uppercase tracking-wider hidden lg:block">
            Shop Catalog
          </Link>

          {/* Country/Currency Selector */}
          <div className="flex items-center gap-1.5 bg-slate-100/70 hover:bg-slate-100 hover:border-slate-300 py-1.5 px-3 rounded-full border border-slate-205 transition-all select-none">
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="bg-transparent text-[11px] font-black text-slate-700 focus:outline-none cursor-pointer pr-1"
            >
              <option value="USD">USD ($)</option>
              <option value="INR">INR (₹)</option>
            </select>
          </div>

          {/* Wishlist Link */}
          {/* Wishlist link — guests redirected to sign-in */}
          <button
            onClick={() => requireAuth(() => navigate('/dashboard?tab=wishlist'))}
            className="flex items-center gap-1.5 text-slate-600 hover:text-blue-650 relative py-1"
          >
            <Heart className="w-4.5 h-4.5" />
            {wishlist.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-500 text-white font-extrabold text-[8px] w-4 h-4 rounded-full flex items-center justify-center border border-white">
                {wishlist.length}
              </span>
            )}
          </button>

          {/* Cart Trigger — guests redirected to sign-in */}
          <button
            onClick={() => requireAuth(() => onOpenCart())}
            className="flex items-center gap-1.5 text-slate-600 hover:text-blue-650 relative py-1"
          >
            <ShoppingCart className="w-4.5 h-4.5" />
            {cartItemsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-blue-600 text-white font-extrabold text-[8px] w-4 h-4 rounded-full flex items-center justify-center border border-white animate-bounce">
                {cartItemsCount}
              </span>
            )}
          </button>

          {/* Notification Bell with Dropdown */}
          {user && (
            <div ref={notificationsRef} className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="flex items-center text-slate-600 hover:text-blue-650 relative py-1"
              >
                <Bell className="w-4.5 h-4.5" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-rose-600 rounded-full border border-white" />
                )}
              </button>

              {showNotifications && (
                <div className="absolute top-full right-0 mt-3 w-80 bg-white rounded-2xl border border-slate-200 shadow-2xl p-4 z-50">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2.5 mb-2.5">
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

                  <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto pr-1">
                    {dbNotifications.length === 0 ? (
                      <p className="text-[10px] text-slate-450 font-bold text-center py-6">Your inbox is empty</p>
                    ) : (
                      dbNotifications.map(n => (
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

          {/* User Account Menu */}
          {user ? (
            <div className="flex items-center gap-4 relative group cursor-pointer">
              <div className="flex items-center gap-1 hover:text-blue-650 py-1 font-bold text-xs text-slate-700">
                <span className="max-w-[100px] truncate">{user.name}</span>
                <ChevronDown className="w-3.5 h-3.5 mt-0.5" />
              </div>
              
              {/* Dropdown Menu */}
              <div className="absolute top-full right-0 mt-2 w-48 bg-white text-slate-700 rounded-2xl shadow-2xl border border-slate-150 py-2.5 hidden group-hover:block z-50">
                {user.role === 'admin' && (
                  <Link
                    to="/admin-dashboard"
                    className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 text-xs font-extrabold text-amber-700"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    Admin Panel
                  </Link>
                )}
                <Link
                  to="/dashboard?tab=orders"
                  className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 text-xs font-semibold"
                >
                  My Orders
                </Link>
                <Link
                  to="/dashboard?tab=wallet"
                  className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 text-xs font-semibold"
                >
                  Reward Wallet
                </Link>
                <Link
                  to="/dashboard?tab=profile"
                  className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 text-xs font-semibold"
                >
                  Edit Profile
                </Link>
                <Link
                  to="/dashboard?tab=tickets"
                  className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 text-xs font-semibold"
                >
                  Help Desk Tickets
                </Link>
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2 px-4 py-2 hover:bg-slate-50 text-xs text-rose-600 font-extrabold text-left border-t border-slate-100 mt-1 pt-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="bg-white hover:bg-slate-50 text-[#2874F0] border border-slate-200/85 px-5 py-2 rounded-xl text-xs font-black shadow-sm hover:shadow-md transition-all uppercase tracking-wider"
            >
              Sign In
            </button>
          )}

          {/* Returns & Orders — replaces Sign In when logged in */}
          {user ? (
            <Link
              to="/dashboard?tab=orders"
              className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-200/85 px-4 py-2 rounded-xl text-xs font-black shadow-sm hover:shadow-md transition-all hidden lg:flex flex-col items-center leading-tight"
            >
              <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Your</span>
              <span className="text-[11px] font-black uppercase tracking-wide">Returns &amp; Orders</span>
            </Link>
          ) : null}

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
                    N
                  </span>
                  <span className="font-bold text-sm text-slate-800">NexaCart Menu</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-200 text-slate-500"
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
                      <p className="text-xs font-semibold text-slate-600 leading-normal">
                        Unlock discounts, checkout quickly & track order history!
                      </p>
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          onOpenAuth();
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
                            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180 text-blue-600' : ''}`} />
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
                <div className="pt-2 border-t border-slate-150 flex flex-col gap-2 text-xs font-bold text-slate-700">
                  <button
                    onClick={() => requireAuth(() => { setMobileMenuOpen(false); navigate('/dashboard?tab=wishlist'); })}
                    className="flex justify-between items-center p-3.5 bg-white border border-slate-200/60 rounded-xl hover:bg-slate-50 text-left"
                  >
                    <span>My Wishlist</span>
                    <span className="bg-amber-500 text-white font-extrabold text-[9px] px-2 py-0.5 rounded-full">
                      {wishlist.length} items
                    </span>
                  </button>

                  <button
                    onClick={() => requireAuth(() => { setMobileMenuOpen(false); onOpenCart(); })}
                    className="flex justify-between items-center p-3.5 bg-white border border-slate-200/60 rounded-xl hover:bg-slate-50 text-left"
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
