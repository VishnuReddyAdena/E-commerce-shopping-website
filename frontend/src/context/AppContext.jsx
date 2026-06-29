import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useDispatch } from 'react-redux';
import { setUser as setReduxUser, setToken as setReduxToken, clearAuth as clearReduxAuth } from '../store/authSlice';
import { setCart as setReduxCart } from '../store/cartSlice';
import { setWishlist as setReduxWishlist } from '../store/wishlistSlice';
import { setNotifications as setReduxNotifications } from '../store/notificationsSlice';
import { setCurrency as setReduxCurrency, setCountry as setReduxCountry } from '../store/currencySlice';
import { setCategories as setReduxCategories } from '../store/categoriesSlice';

const AppContext = createContext();

const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const BACKEND_URL = isLocalhost 
  ? 'http://localhost:5050' 
  : (import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || 'https://e-commerce-shopping-website-bfa8.onrender.com');

export const AppProvider = ({ children }) => {
  const dispatch = useDispatch();
  const isRegisteringRef = useRef(false);

  // Authentication State
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [authOpen, setAuthOpen] = useState(false);

  // Cart State
  const [cart, setCart] = useState([]);
  
  // Promo code discounts
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0); // value
  const [promoDiscountType, setPromoDiscountType] = useState('percent'); // 'percent' or 'fixed'
  const [promoError, setPromoError] = useState('');

  // Wishlist State (list of product IDs or product objects)
  const [wishlist, setWishlist] = useState([]);

  // Categories & Brands list
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  // Support Tickets
  const [tickets, setTickets] = useState([]);

  // Filters State
  const [filters, setFilters] = useState({
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

  // Real-time Notifications State
  const [notifications, setNotifications] = useState([]);
  const [currency, setCurrencyState] = useState('INR');

  // Load currency preference for active user
  useEffect(() => {
    const userId = user?._id || 'guest';
    const savedCurrency = localStorage.getItem(`currency_${userId}`);
    if (savedCurrency) {
      setCurrencyState(savedCurrency);
    } else {
      // Default to INR for India region, or fallback
      setCurrencyState('INR');
    }
  }, [user]);

  const setCurrency = (newCurrency) => {
    setCurrencyState(newCurrency);
    const userId = user?._id || 'guest';
    localStorage.setItem(`currency_${userId}`, newCurrency);
  };

  // Competition-Winning Admin Portal States
  const [adminStore, setAdminStore] = useState(() => localStorage.getItem('admin_store') || 'USA');
  const [adminTheme, setAdminTheme] = useState(() => localStorage.getItem('admin_theme') || 'light');
  const [liveOrders, setLiveOrders] = useState([]);
  const [auditLogs, setAuditLogs] = useState(() => {
    try {
      const saved = localStorage.getItem('admin_audit_logs');
      return saved ? JSON.parse(saved) : [
        { id: '1', action: 'System Setup', detail: 'Admin portal initial setup completed.', timestamp: new Date(Date.now() - 3600000 * 24).toISOString(), type: 'system' },
        { id: '2', action: 'Store Registered', detail: 'Store "NexaCart USA" registered successfully.', timestamp: new Date(Date.now() - 3600000 * 20).toISOString(), type: 'store' }
      ];
    } catch {
      return [];
    }
  });

  const addAuditLog = (action, detail, type = 'user') => {
    const newLog = {
      id: Math.random().toString(36).substring(2, 9),
      action,
      detail,
      timestamp: new Date().toISOString(),
      type
    };
    setAuditLogs(prev => {
      const updated = [newLog, ...prev].slice(0, 100);
      try { localStorage.setItem('admin_audit_logs', JSON.stringify(updated)); } catch {}
      return updated;
    });
  };

  const [savedViews, setSavedViews] = useState(() => {
    try {
      const saved = localStorage.getItem('admin_saved_views');
      return saved ? JSON.parse(saved) : {
        products: [
          { name: 'Low Stock Tech', filters: { keyword: '', category: 'Electronics', inStock: false, minPrice: '', maxPrice: '' } }
        ],
        orders: [
          { name: 'Pending High Value', filters: { status: 'Processing', minAmount: 150 } }
        ]
      };
    } catch {
      return { products: [], orders: [] };
    }
  });

  const saveView = (type, name, filtersConfig) => {
    setSavedViews(prev => {
      const updated = {
        ...prev,
        [type]: [...(prev[type] || []), { name, filters: filtersConfig }]
      };
      try { localStorage.setItem('admin_saved_views', JSON.stringify(updated)); } catch {}
      addAuditLog('Saved Table View', `Saved new table view "${name}" for ${type}.`, 'settings');
      return updated;
    });
  };

  // Synchronize currency based on active store (for admins only)
  useEffect(() => {
    if (user?.role === 'admin') {
      if (adminStore === 'India') {
        setCurrency('INR');
      } else if (adminStore === 'Europe') {
        setCurrency('EUR');
      } else {
        setCurrency('USD');
      }
    }
  }, [adminStore, user]);

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
    if (numericPrice % 1 !== 0) {
      return `$${numericPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `$${numericPrice.toLocaleString('en-US')}`;
  };
  const [dbNotifications, setDbNotifications] = useState([]);
  const [socket, setSocket] = useState(null);

  // App wide loading/messages
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Home banner slides — admin-editable, persisted in localStorage
  const DEFAULT_BANNERS = [
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

  const [homeBanners, setHomeBannersState] = useState(() => {
    try {
      const saved = localStorage.getItem('admin_home_banners');
      return saved ? JSON.parse(saved) : DEFAULT_BANNERS;
    } catch { return DEFAULT_BANNERS; }
  });

  const setHomeBanners = (banners) => {
    setHomeBannersState(banners);
    try { localStorage.setItem('admin_home_banners', JSON.stringify(banners)); } catch {}
  };

  // Fetch initial data
  useEffect(() => {
    fetchCategories();
    fetchBrands();
  }, []);

  // Initialize Supabase Realtime Channels
  useEffect(() => {
    // 1. Subscribe to e-commerce-realtime channel
    const realtimeChannel = supabase.channel('e-commerce-realtime');

    realtimeChannel
      .on('broadcast', { event: 'inventoryUpdate' }, ({ payload }) => {
        setCart((prevCart) => {
          return prevCart.map(item => {
            if (item.productId?._id === payload.productId) {
              const updatedProduct = { ...item.productId, inventoryCount: payload.inventoryCount };
              if (item.quantity > payload.inventoryCount && payload.inventoryCount > 0) {
                addNotification(`Stock reduced! Only ${payload.inventoryCount} units of ${payload.title} left. Your cart adjusted.`, 'warning');
                return { ...item, productId: updatedProduct, quantity: payload.inventoryCount };
              }
              return { ...item, productId: updatedProduct };
            }
            return item;
          });
        });
      })
      .on('broadcast', { event: 'orderTracking' }, ({ payload }) => {
        if (user?._id === payload.userId || user?.role === 'admin') {
          addNotification(`Order tracking update: Order #${payload.orderId?.substring(18) || payload.orderId} is now ${payload.status}!`, 'info');
        }
      });

    realtimeChannel.subscribe();

    // 2. Subscribe to e-commerce-notifications channel
    const notificationsChannel = supabase.channel('e-commerce-notifications');

    notificationsChannel
      .on('broadcast', { event: 'lowStock' }, ({ payload }) => {
        if (payload.inventoryCount === 0) {
          addNotification(`Oops! "${payload.title}" is now out of stock.`, 'error');
          setCart((prevCart) => {
            const found = prevCart.some(item => item.productId?._id === payload.productId);
            if (found) {
              addNotification(`"${payload.title}" was removed from your cart since it is out of stock.`, 'warning');
              return prevCart.filter(item => item.productId?._id !== payload.productId);
            }
            return prevCart;
          });
        } else {
          addNotification(`Hurry! "${payload.title}" is running low. Only ${payload.inventoryCount} items left in stock.`, 'info');
        }
      })
      .on('broadcast', { event: 'newOrder' }, ({ payload }) => {
        const store = localStorage.getItem('admin_store') || 'USA';
        const symbol = store === 'India' ? '₹' : store === 'Europe' ? '€' : '$';
        const factor = store === 'India' ? 83 : store === 'Europe' ? 0.92 : 1;
        const formatted = `${symbol}${Math.round(payload.totalAmount * factor).toLocaleString()}`;
        addNotification(`New order placed! Total: ${formatted}`, 'success');
        
        setLiveOrders(prev => [payload, ...prev].slice(0, 50));
        addAuditLog('New Order Received', `Order for ${formatted} placed.`, 'order');
      })
      .on('broadcast', { event: 'newCustomer' }, ({ payload }) => {
        addNotification(`New Customer Signed Up: ${payload.name}`, 'success');
      })
      .on('broadcast', { event: 'paymentSuccess' }, ({ payload }) => {
        if (user?._id === payload.userId || user?.role === 'admin') {
          addNotification(`Payment Success for Order #${payload.orderId?.substring(18) || payload.orderId}: $${payload.amount}`, 'success');
        }
      })
      .on('broadcast', { event: 'orderDelivered' }, ({ payload }) => {
        if (user?._id === payload.userId || user?.role === 'admin') {
          addNotification(`Your Order #${payload.orderId?.substring(18) || payload.orderId} has been delivered!`, 'success');
        }
      })
      .on('broadcast', { event: 'refundIssued' }, ({ payload }) => {
        if (user?._id === payload.userId || user?.role === 'admin') {
          addNotification(`Refund of $${payload.amount} issued for Order #${payload.orderId?.substring(18) || payload.orderId}.`, 'info');
        }
      });

    notificationsChannel.subscribe();

    return () => {
      supabase.removeChannel(realtimeChannel);
      supabase.removeChannel(notificationsChannel);
    };
  }, [user]);

  // Fetch cart, wishlist & db notifications on login
  useEffect(() => {
    if (token) {
      fetchCart();
      fetchWishlist();
      fetchDbNotifications();
      fetchMyTickets();
      fetchUserProfile();
    } else {
      setCart([]);
      setWishlist([]);
      setDbNotifications([]);
      setTickets([]);
    }
  }, [token]);

  // Alert Manager Helper
  const addNotification = (message, type = 'info', metadata = null) => {
    const id = Math.random().toString(36).substring(2, 9);
    setNotifications((prev) => [...prev, { id, message, type, metadata }]);
    
    // Automatically dismiss notifications
    setTimeout(() => {
      dismissNotification(id);
    }, 6000);
  };

  const dismissNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Fetch Categories & Brands
  const fetchCategories = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/categories`);
      const data = await response.json();
      if (response.ok) setCategories(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/brands`);
      const data = await response.json();
      if (response.ok) setBrands(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Profile reloading
  const fetchUserProfile = async () => {
    if (!token) return;
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setUser(data);
        localStorage.setItem('user', JSON.stringify(data));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Cart Backend Services
  const fetchCart = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setCart(data.items || []);
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
    }
  };

  const syncCartWithBackend = async (updatedItems) => {
    if (!token) return;
    try {
      await fetch(`${BACKEND_URL}/api/cart`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          items: updatedItems.filter(i => i.productId).map(i => ({
            productId: i.productId._id || i.productId.id,
            quantity: i.quantity
          }))
        })
      });
    } catch (err) {
      console.error('Error syncing cart:', err);
    }
  };

  const addToCart = (product, quantity = 1) => {
    if (product.inventoryCount <= 0) {
      addNotification(`"${product.title}" is out of stock!`, 'error');
      return;
    }

    setCart((prevCart) => {
      const productIdToFind = product._id || product.id;
      const existingItem = prevCart.find((item) => (item.productId?._id || item.productId?.id) === productIdToFind);
      let newCart;

      if (existingItem) {
        const newQty = Math.min(existingItem.quantity + quantity, product.inventoryCount);
        if (newQty === existingItem.quantity && existingItem.quantity === product.inventoryCount) {
          addNotification(`Maximum available stock (${product.inventoryCount}) already in cart.`, 'warning');
          return prevCart;
        }
        newCart = prevCart.map((item) =>
          (item.productId?._id || item.productId?.id) === productIdToFind ? { ...item, quantity: newQty } : item
        );
        addNotification('Hooray! 1 item added to the cart', 'success', { productName: product.title });
      } else {
        newCart = [...prevCart, { productId: product, quantity: Math.min(quantity, product.inventoryCount) }];
        addNotification('Hooray! 1 item added to the cart', 'success', { productName: product.title });
      }

      syncCartWithBackend(newCart);
      return newCart;
    });
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => {
      const newCart = prevCart.filter((item) => (item.productId?._id || item.productId?.id) !== productId);
      syncCartWithBackend(newCart);
      return newCart;
    });
    addNotification('Item removed from cart.', 'info');
  };

  const updateQuantity = (productId, quantity, maxStock) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    const safeQty = Math.min(quantity, maxStock);
    if (safeQty < quantity) {
      addNotification(`Only ${maxStock} items left in stock.`, 'warning');
    }
    setCart((prevCart) => {
      const newCart = prevCart.map((item) =>
        (item.productId?._id || item.productId?.id) === productId ? { ...item, quantity: safeQty } : item
      );
      syncCartWithBackend(newCart);
      return newCart;
    });
  };

  const clearCartState = async () => {
    setCart([]);
    setPromoCode('');
    setPromoDiscount(0);
    setPromoDiscountType('percent');
    if (token) {
      try {
        await fetch(`${BACKEND_URL}/api/cart`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (err) {
        console.error('Error clearing cart:', err);
      }
    }
  };

  const validatePromoCode = async (code) => {
    setPromoError('');
    try {
      const response = await fetch(`${BACKEND_URL}/api/coupons/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ code })
      });
      const data = await response.json();
      if (response.ok) {
        setPromoCode(data.code);
        setPromoDiscount(data.discountValue);
        setPromoDiscountType(data.discountType);
        addNotification(`Promo code applied: ${data.discountValue}${data.discountType === 'percent' ? '%' : '$'} off!`, 'success');
        return true;
      } else {
        setPromoError(data.message || 'Invalid coupon code');
        return false;
      }
    } catch (err) {
      setPromoError('Connection issue verifying coupon');
      return false;
    }
  };

  // Wishlist Functions
  const fetchWishlist = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setWishlist(data.wishlist || []);
      }
    } catch (err) {
      console.error('Error fetching wishlist:', err);
    }
  };

  const toggleWishlist = async (productId) => {
    if (!token) {
      addNotification('Please login to save favorites!', 'warning');
      return;
    }
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/wishlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ productId })
      });
      const data = await response.json();
      if (response.ok) {
        setWishlist(data);
        const inWishlist = data.includes(productId);
        addNotification(
          inWishlist ? 'Saved to Wishlist!' : 'Removed from Wishlist.',
          inWishlist ? 'success' : 'info'
        );
      }
    } catch (err) {
      console.error('Error toggling wishlist:', err);
    }
  };

  // Database notifications
  const fetchDbNotifications = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) setDbNotifications(data);
    } catch (err) {
      console.error(err);
    }
  };

  const markNotificationRead = async (id) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        setDbNotifications(prev => prev.map(n => n._id === id ? { ...n, readStatus: true } : n));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const clearAllNotifications = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/notifications`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        setDbNotifications([]);
        addNotification('All notifications cleared', 'info');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Support Tickets Services
  const fetchMyTickets = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/tickets/mytickets`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) setTickets(data);
    } catch (err) {
      console.error(err);
    }
  };

  const createTicket = async (subject, description) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/tickets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ subject, description })
      });
      const data = await response.json();
      if (response.ok) {
        setTickets(prev => [data, ...prev]);
        addNotification('Support ticket raised successfully!', 'success');
        return true;
      }
    } catch (err) {
      console.error(err);
    }
    return false;
  };

  const replyToTicket = async (ticketId, messageText) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/tickets/${ticketId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ text: messageText })
      });
      const data = await response.json();
      if (response.ok) {
        setTickets(prev => prev.map(t => t._id === ticketId ? data : t));
        return data;
      }
    } catch (err) {
      console.error(err);
    }
    return null;
  };

  // Initial Session Hook Setup
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setToken(session.access_token);
        localStorage.setItem('token', session.access_token);
        fetchMongoDBUser(session.user, session.access_token);
        setAuthOpen(false);
      } else {
        setUser(null);
        setToken('');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (isRegisteringRef.current) {
        return;
      }
      if (session?.user) {
        setToken(session.access_token);
        localStorage.setItem('token', session.access_token);
        await fetchMongoDBUser(session.user, session.access_token);
        setAuthOpen(false);
      } else {
        setUser(null);
        setToken('');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchMongoDBUser = async (supabaseUser, accessToken) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      let data = await response.json();
      if (response.ok) {
        if (supabaseUser.app_metadata?.provider === 'google') {
          data = { ...data, role: 'user' };
        }
        setUser(data);
        localStorage.setItem('user', JSON.stringify(data));
      } else {
        throw new Error(data.message || 'Profile load failed');
      }
    } catch (err) {
      console.error('Failed to sync user with MongoDB:', err.message);
      const fallbackUser = {
        _id: supabaseUser.id,
        supabaseId: supabaseUser.id,
        email: supabaseUser.email,
        name: supabaseUser.user_metadata?.name || 'Customer',
        role: supabaseUser.user_metadata?.role || 'user',
        country: supabaseUser.user_metadata?.country || 'India',
        walletBalance: 100,
        loyaltyPoints: 10,
        shippingAddresses: [],
        wishlist: []
      };
      setUser(fallbackUser);
      localStorage.setItem('user', JSON.stringify(fallbackUser));
    }
  };

  // Authentication services
  const login = async (email, password) => {
    setLoading(true);
    setError('');

    const isFromAdminPortal = window.location.pathname.startsWith('/admin-dashboard') || window.location.pathname.startsWith('/admin');
    if (email === 'vishnubhai123@gmail.com') {
      if (!isFromAdminPortal) {
        setError('Admin logins are restricted to the Admin Portal.');
        setLoading(false);
        return false;
      }
    } else {
      if (isFromAdminPortal) {
        setError('Only Administrator credentials can access the Admin Portal.');
        setLoading(false);
        return false;
      }
    }
    
    // Developer bypass for admin credentials
    if (email === 'vishnubhai123@gmail.com' && password === 'vishnu123@') {
      try {
        const mockToken = 'mock-admin-token';
        setToken(mockToken);
        localStorage.setItem('token', mockToken);
        
        // Fetch MongoDB user using the mock token
        const response = await fetch(`${BACKEND_URL}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${mockToken}` }
        });
        const data = await response.json();
        if (response.ok) {
          setUser(data);
          localStorage.setItem('user', JSON.stringify(data));
          addNotification(`Signed in successfully as Admin!`, 'success');
          setAuthOpen(false);
          setLoading(false);
          return true;
        } else {
          throw new Error(data.message || 'Profile load failed');
        }
      } catch (err) {
        // Fallback if backend is down or errors out
        const fallbackUser = {
          _id: 'mock-admin-id',
          supabaseId: 'mock-admin-id',
          email: 'vishnubhai123@gmail.com',
          name: 'Vishnu Admin',
          role: 'admin',
          country: 'India',
          walletBalance: 100,
          loyaltyPoints: 10,
          shippingAddresses: [],
          wishlist: []
        };
        setUser(fallbackUser);
        localStorage.setItem('user', JSON.stringify(fallbackUser));
        addNotification(`Signed in successfully as Admin (Offline Fallback)!`, 'success');
        setAuthOpen(false);
        setLoading(false);
        return true;
      }
    }

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (authError) throw authError;
      addNotification(`Signed in successfully!`, 'success');
      return true;
    } catch (err) {
      setError(err.message || 'Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password, role = 'user', referralCodeApplied = '', country = 'India') => {
    setLoading(true);
    setError('');
    isRegisteringRef.current = true;
    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, role, country }
        }
      });
      if (authError) throw authError;

      // Sync with backend MongoDB
      if (data?.user) {
        await fetch(`${BACKEND_URL}/api/auth/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            supabaseId: data.user.id,
            email: data.user.email,
            name,
            role,
            country,
            referralCodeApplied
          })
        });
      }

      // Clear any auto-login session created by Supabase signUp
      await supabase.auth.signOut();

      addNotification(`Registration successful! Please check your email for verification.`, 'success');
      return true;
    } catch (err) {
      setError(err.message || 'Registration failed');
      return false;
    } finally {
      isRegisteringRef.current = false;
      setLoading(false);
    }
  };

  const googleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const { data, error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (authError) throw authError;
      return true;
    } catch (err) {
      setError(err.message || 'Google Auth failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setToken('');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setCart([]);
    setWishlist([]);
    setTickets([]);
    setDbNotifications([]);
    addNotification('Logged out successfully.', 'info');
  };

  const addAddress = async (address) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/addresses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(address)
      });
      const data = await response.json();
      if (response.ok) {
        const updatedUser = { ...user, shippingAddresses: data };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        addNotification('Address added successfully!', 'success');
        return true;
      }
    } catch (err) {
      console.error(err);
    }
    return false;
  };

  // Calculations
  const getSubtotal = () => {
    return cart.reduce((acc, item) => acc + (item.productId?.price || 0) * item.quantity, 0);
  };

  const getDiscountAmount = () => {
    if (promoDiscountType === 'percent') {
      return (getSubtotal() * promoDiscount) / 100;
    } else {
      return Math.min(getSubtotal(), promoDiscount);
    }
  };

  const getTotal = () => {
    return getSubtotal() - getDiscountAmount();
  };

  useEffect(() => {
    dispatch(setReduxUser(user));
  }, [user, dispatch]);

  useEffect(() => {
    dispatch(setReduxToken(token));
  }, [token, dispatch]);

  useEffect(() => {
    dispatch(setReduxCart(cart));
  }, [cart, dispatch]);

  useEffect(() => {
    dispatch(setReduxWishlist(wishlist));
  }, [wishlist, dispatch]);

  useEffect(() => {
    dispatch(setReduxNotifications(dbNotifications));
  }, [dbNotifications, dispatch]);

  useEffect(() => {
    dispatch(setReduxCurrency(currency));
  }, [currency, dispatch]);

  useEffect(() => {
    dispatch(setReduxCountry(adminStore || 'India'));
  }, [adminStore, dispatch]);

  useEffect(() => {
    dispatch(setReduxCategories(categories));
  }, [categories, dispatch]);

  return (
    <AppContext.Provider
      value={{
        user,
        token,
        cart,
        wishlist,
        categories,
        brands,
        tickets,
        filters,
        currency,
        setCurrency,
        formatPrice,
        notifications,
        dbNotifications,
        loading,
        error,
        setError,
        promoCode,
        promoDiscount,
        promoDiscountType,
        promoError,
        socket,
        setFilters,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart: clearCartState,
        validatePromoCode,
        toggleWishlist,
        login,
        googleLogin,
        register,
        logout,
        addAddress,
        dismissNotification,
        addNotification,
        getSubtotal,
        getDiscountAmount,
        getTotal,
        fetchUserProfile,
        fetchDbNotifications,
        markNotificationRead,
        clearAllNotifications,
        createTicket,
        replyToTicket,
        fetchMyTickets,
        authOpen,
        setAuthOpen,
        homeBanners,
        setHomeBanners,
        adminStore,
        setAdminStore,
        adminTheme,
        setAdminTheme,
        liveOrders,
        setLiveOrders,
        auditLogs,
        addAuditLog,
        savedViews,
        saveView,
        backendUrl: BACKEND_URL
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
