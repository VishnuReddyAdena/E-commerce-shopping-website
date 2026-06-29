import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { jsPDF } from 'jspdf';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import {
  LayoutDashboard,
  User,
  ShoppingBag,
  Heart,
  Wallet,
  Award,
  Bell,
  Star,
  RefreshCw,
  Gift,
  Share2,
  HelpCircle,
  Lock,
  Globe,
  Settings,
  LogOut,
  ChevronRight,
  ChevronDown,
  Check,
  X,
  ShieldAlert,
  Download,
  Clipboard,
  Plus,
  Trash2,
  Edit,
  CheckCircle,
  Send,
  MapPin,
  Eye,
  ShoppingCart,
  Map,
  CreditCard,
  Clock,
  Activity,
  ShieldCheck,
  Tag
} from 'lucide-react';

export const Dashboard = () => {
  const {
    user,
    token,
    wishlist,
    toggleWishlist,
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    addAddress,
    addNotification,
    tickets,
    createTicket,
    replyToTicket,
    fetchMyTickets,
    logout,
    getSubtotal,
    getDiscountAmount,
    getTotal,
    validatePromoCode,
    promoCode,
    promoDiscount,
    promoDiscountType,
    promoError,
    backendUrl,
    formatPrice
  } = useApp();

  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'dashboard';
  const navigate = useNavigate();
  const dbNotifications = useSelector(state => state.notifications.items);

  // Redirect to Home if not logged in
  useEffect(() => {
    if (!token) {
      addNotification('Please Sign In to access My Account details.', 'warning');
      navigate('/');
    }
  }, [token, navigate]);

  // Orders State
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [selectedOrderToTrack, setSelectedOrderToTrack] = useState(null);

  // Wishlist State
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [loadingWishlist, setLoadingWishlist] = useState(false);

  // Address fields
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [country, setCountry] = useState('India');
  const [isDefault, setIsDefault] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);

  // Support Ticket creation states
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketDesc, setTicketDesc] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');

  // Profile Management State (Simulated details synced in Session/LocalStorage)
  const [profileForm, setProfileForm] = useState(() => {
    const saved = localStorage.getItem('profileForm');
    return saved ? JSON.parse(saved) : {
      username: 'vishnu_nexa',
      phone: '+91 98765 43210',
      altPhone: '+91 99887 76655',
      gender: 'Male',
      dob: '1995-08-15',
      language: 'English',
      bio: 'E-commerce enthusiast & reviewer.',
      pincode: '560001',
      city: 'Bengaluru',
      state: 'Karnataka',
      country: 'India',
      profilePic: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'
    };
  });

  // Save changes to Simulated Profile
  const handleSaveProfile = (e) => {
    e.preventDefault();
    localStorage.setItem('profileForm', JSON.stringify(profileForm));
    addNotification('Profile details updated successfully!', 'success');
  };

  // Login & Security State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const getPasswordStrength = () => {
    if (!newPassword) return { score: 0, label: 'None', color: 'bg-slate-200' };
    let score = 0;
    if (newPassword.length >= 8) score++;
    if (/[A-Z]/.test(newPassword)) score++;
    if (/[0-9]/.test(newPassword)) score++;
    if (/[^A-Za-z0-9]/.test(newPassword)) score++;
    
    switch (score) {
      case 1: return { score: 25, label: 'Weak', color: 'bg-rose-500' };
      case 2: return { score: 50, label: 'Fair', color: 'bg-amber-500' };
      case 3: return { score: 75, label: 'Good', color: 'bg-indigo-500' };
      case 4: return { score: 100, label: 'Strong', color: 'bg-emerald-500' };
      default: return { score: 0, label: 'None', color: 'bg-slate-200' };
    }
  };

  // Coupons State
  const [couponInput, setCouponInput] = useState('');

  // Wallet Recharge State
  const [rechargeAmount, setRechargeAmount] = useState('');

  // Premium dynamic state loaders
  const [profileData, setProfileData] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const [couponsData, setCouponsData] = useState({ available: [], used: [], expired: [] });
  const [loadingCoupons, setLoadingCoupons] = useState(false);

  const [giftCardsData, setGiftCardsData] = useState({ balance: 0, purchased: [], received: [] });
  const [loadingGiftCards, setLoadingGiftCards] = useState(false);

  const [rewardsData, setRewardsData] = useState({ points: 0, tier: 'Silver', history: [], achievements: [] });
  const [loadingRewards, setLoadingRewards] = useState(false);

  const [returnsData, setReturnsData] = useState([]);
  const [loadingReturns, setLoadingReturns] = useState(false);

  const [activeCouponTab, setActiveCouponTab] = useState('available'); // 'available' | 'used' | 'expired'
  const [redeemCardCode, setRedeemCardCode] = useState('');
  const [giftCardValue, setGiftCardValue] = useState('');
  const [giftCardEmail, setGiftCardEmail] = useState('');

  const fetchProfileData = async () => {
    if (!token) return;
    setLoadingProfile(true);
    try {
      const res = await fetch(`${backendUrl}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProfileData(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingProfile(false);
    }
  };

  const fetchCoupons = async () => {
    if (!token) return;
    setLoadingCoupons(true);
    try {
      const res = await fetch(`${backendUrl}/api/coupons`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCouponsData(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingCoupons(false);
    }
  };

  const fetchGiftCards = async () => {
    if (!token) return;
    setLoadingGiftCards(true);
    try {
      const res = await fetch(`${backendUrl}/api/giftcards`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setGiftCardsData(data.giftCards);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingGiftCards(false);
    }
  };

  const fetchRewards = async () => {
    if (!token) return;
    setLoadingRewards(true);
    try {
      const res = await fetch(`${backendUrl}/api/rewards`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRewardsData(data.rewards);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRewards(false);
    }
  };

  const fetchReturns = async () => {
    if (!token) return;
    setLoadingReturns(true);
    try {
      const res = await fetch(`${backendUrl}/api/returns`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setReturnsData(data.returns);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingReturns(false);
    }
  };

  useEffect(() => {
    if (token) {
      if (activeTab === 'profile' || activeTab === 'dashboard') fetchProfileData();
      if (activeTab === 'coupons') fetchCoupons();
      if (activeTab === 'giftcards') fetchGiftCards();
      if (activeTab === 'rewards') fetchRewards();
      if (activeTab === 'returns') fetchReturns();
    }
  }, [token, activeTab]);

  // Fetch Orders & Wishlist Details
  const fetchMyOrders = async () => {
    if (!token) return;
    setLoadingOrders(true);
    try {
      const response = await fetch(`${backendUrl}/api/orders/myorders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setOrders(data);
        if (data.length > 0 && !selectedOrderToTrack) {
          setSelectedOrderToTrack(data[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchWishlistDetails = async () => {
    if (!token || wishlist.length === 0) {
      setWishlistProducts([]);
      return;
    }
    setLoadingWishlist(true);
    try {
      const resolved = [];
      for (const id of wishlist) {
        const response = await fetch(`${backendUrl}/api/products/${id}`);
        if (response.ok) {
          const prod = await response.json();
          resolved.push(prod);
        }
      }
      setWishlistProducts(resolved);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingWishlist(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchMyOrders();
      fetchWishlistDetails();
    }
  }, [token, wishlist]);

  const handleTabChange = (tabName) => {
    if (tabName === 'logout') {
      logout();
      navigate('/');
      return;
    }
    setSearchParams({ tab: tabName });
    setSelectedTicket(null);
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    const success = await addAddress({ street, city, state, zip, country, isDefault });
    if (success) {
      setShowAddressForm(false);
      setStreet('');
      setCity('');
      setState('');
      setZip('');
    }
  };

  // Raise Ticket
  const handleRaiseTicket = async (e) => {
    e.preventDefault();
    if (!ticketSubject || !ticketDesc) return;
    const success = await createTicket(ticketSubject, ticketDesc);
    if (success) {
      setTicketSubject('');
      setTicketDesc('');
      fetchMyTickets();
    }
  };

  // Reply to ticket
  const handleTicketReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;
    const updated = await replyToTicket(selectedTicket._id, replyText);
    if (updated) {
      setSelectedTicket(updated);
      setReplyText('');
      fetchMyTickets();
    }
  };

  // Share Wishlist
  const handleShareWishlist = () => {
    const shareUrl = `${window.location.origin}/shop?wishlist_sharer=${user?._id}`;
    navigator.clipboard.writeText(shareUrl);
    addNotification('Wishlist link copied to clipboard!', 'success');
  };

  // Copy Referral Code
  const handleCopyReferral = () => {
    if (!user?.referralCode) return;
    navigator.clipboard.writeText(user.referralCode);
    addNotification('Referral code copied!', 'success');
  };

  // jsPDF Invoice Generation
  const downloadInvoicePDF = (order) => {
    try {
      const doc = new jsPDF();
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor('#2874F0');
      doc.text('Vyvora Store', 14, 20);

      doc.setFontSize(10);
      doc.setTextColor('#64748B');
      doc.text('Modern Enterprise MERN Platform', 14, 26);

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(28);
      doc.setTextColor('#1E293B');
      doc.text('INVOICE', 145, 23);

      doc.setFontSize(9);
      doc.setFont('Helvetica', 'normal');
      doc.text(`Invoice Ref: INV-${order._id.substring(0, 8).toUpperCase()}`, 14, 42);
      doc.text(`Order Date: ${new Date(order.createdAt).toLocaleDateString()}`, 14, 48);
      doc.text(`Payment: ${order.paymentStatus.toUpperCase()}`, 14, 54);

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor('#1E293B');
      doc.text('DELIVERED TO:', 14, 68);

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor('#64748B');
      doc.text(user?.name || 'Customer', 14, 74);
      doc.text(user?.email || '', 14, 80);

      const addr = order.shippingAddress;
      doc.text(`${addr.street}`, 14, 86);
      doc.text(`${addr.city}, ${addr.state} - ${addr.zip}`, 14, 92);
      doc.text(`${addr.country}`, 14, 98);

      doc.setDrawColor('#e2e8f0');
      doc.line(14, 108, 196, 108);

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor('#1E293B');
      doc.text('Item Description', 16, 114);
      doc.text('Quantity', 120, 114);
      doc.text('Price', 145, 114);
      doc.text('Total', 175, 114);

      doc.line(14, 118, 196, 118);

      doc.setFont('Helvetica', 'normal');
      doc.setTextColor('#64748B');
      let currentY = 125;

      order.items.forEach((item) => {
        const splitTitle = doc.splitTextToSize(item.title, 90);
        doc.text(splitTitle, 16, currentY);
        doc.text(item.quantity.toString(), 120, currentY);
        doc.text(formatPrice(item.price).replace('₹', 'Rs. '), 145, currentY);
        doc.text(formatPrice(item.price * item.quantity).replace('₹', 'Rs. '), 175, currentY);
        currentY += 8 * splitTitle.length;
      });

      doc.line(14, currentY, 196, currentY);

      currentY += 8;
      doc.setFont('Helvetica', 'bold');
      doc.setTextColor('#1E293B');
      doc.text('Total Paid:', 130, currentY);
      doc.text(formatPrice(order.totalAmount).replace('₹', 'Rs. '), 175, currentY);

      doc.setFont('Helvetica', 'italic');
      doc.setFontSize(9);
      doc.setTextColor('#64748B');
      doc.text('Thank you for shopping with Vyvora! For support, visit the dashboard Help Desk.', 35, 275);

      doc.save(`invoice_${order._id.substring(0, 8)}.pdf`);
      addNotification('Invoice PDF downloaded.', 'success');
    } catch (error) {
      console.error(error);
      addNotification('Failed to generate invoice PDF', 'error');
    }
  };

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'orders', label: 'My Orders', icon: ShoppingBag },
    { id: 'track', label: 'Track Orders', icon: MapPin },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'cart', label: 'Shopping Cart', icon: ShoppingCart },
    { id: 'addresses', label: 'Saved Addresses', icon: Map },
    { id: 'payments', label: 'Payment Methods', icon: CreditCard },
    { id: 'wallet', label: 'Wallet', icon: Wallet },
    { id: 'coupons', label: 'Coupons', icon: Tag },
    { id: 'rewards', label: 'Rewards', icon: Award },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'reviews', label: 'Reviews & Ratings', icon: Star },
    { id: 'returns', label: 'Returns & Refunds', icon: RefreshCw },
    { id: 'giftcards', label: 'Gift Cards', icon: Gift },
    { id: 'refer', label: 'Refer & Earn', icon: Share2 },
    { id: 'support', label: 'Support & Help', icon: HelpCircle },
    { id: 'privacy', label: 'Privacy Settings', icon: Lock },
    { id: 'language', label: 'Language & Region', icon: Globe },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'logout', label: 'Logout', icon: LogOut }
  ];

  const activeTabLabel = sidebarItems.find(item => item.id === activeTab)?.label || 'Dashboard';

  // Render sub-components based on tab selection
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 animate-in fade-in duration-300">
      
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-[10px] font-extrabold text-slate-400 mb-6 uppercase tracking-widest">
        <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
        <span>/</span>
        <span className="text-slate-750">My Account</span>
        <span>/</span>
        <span className="text-blue-650 font-black">{activeTabLabel}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* Sticky Sidebar Navigation Panel */}
        <div className="lg:col-span-1 lg:sticky lg:top-24 max-h-[calc(100vh-140px)] overflow-y-auto pr-2 no-scrollbar">
          <div className="bg-white border border-slate-200/80 shadow-md rounded-[24px] p-5 space-y-5">
            
            {/* User Short Profile Details */}
            <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100">
              <div className="relative">
                <img
                  src={profileForm.profilePic}
                  alt="avatar"
                  className="w-11 h-11 rounded-2xl object-cover border-2 border-blue-500/20 shadow-sm"
                />
                <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center" title="Online">
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-extrabold text-slate-800 text-xs truncate leading-tight flex items-center gap-1.5">
                  {user?.name || 'Loading Name...'}
                </h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">NexaPlus Elite Member</p>
              </div>
            </div>

            {/* Navigation List */}
            <div className="flex flex-col gap-1 text-[11px] font-black uppercase tracking-wider text-slate-500">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabChange(item.id)}
                    className={`w-full text-left py-2 px-3.5 rounded-xl flex items-center justify-between transition-all group ${
                      isActive
                        ? 'bg-blue-650 text-white shadow-md shadow-blue-650/15'
                        : 'hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-600'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.id === 'wishlist' && wishlist.length > 0 && (
                      <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                        {wishlist.length}
                      </span>
                    )}
                    {item.id === 'cart' && cart.length > 0 && (
                      <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md animate-pulse ${isActive ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-600'}`}>
                        {cart.reduce((a, c) => a + c.quantity, 0)}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

          </div>
        </div>

        {/* Dynamic Account Panel Content */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="bg-white border border-slate-200/80 shadow-lg rounded-[28px] p-6 sm:p-8"
            >
              
              {/* TAB: DASHBOARD */}
              {activeTab === 'dashboard' && (
                <div className="space-y-6">
                  {/* Greeting & Info */}
                  <div className="flex justify-between items-start flex-wrap gap-4 border-b border-slate-100 pb-5">
                    <div>
                      <h3 className="text-xl font-black text-slate-800">Hello, {user?.name || 'User'}!</h3>
                      <p className="text-slate-500 text-xs font-semibold mt-1">Welcome to your personal Vyvora dashboard control center.</p>
                    </div>
                    <div className="bg-slate-50 border border-slate-200/50 rounded-2xl px-4 py-2 text-right">
                      <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Membership Status</span>
                      <span className="text-xs font-black text-blue-650">VyvoraPlus Premium Elite</span>
                    </div>
                  </div>

                  {/* Profile Completion Meter */}
                  <div className="bg-blue-50/40 border border-blue-100/60 rounded-2xl p-4.5 space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                      <span>Profile Completion Rate</span>
                      <span className="text-blue-650">85% Complete</span>
                    </div>
                    <div className="w-full bg-slate-200/70 h-2 rounded-full overflow-hidden">
                      <div className="bg-blue-600 h-full rounded-full" style={{ width: '85%' }} />
                    </div>
                    <p className="text-[10px] text-slate-455 font-semibold">Tip: Verify alternative phone number to secure account and reach 100%.</p>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-slate-50 border border-slate-200/40 rounded-2xl p-4 text-center">
                      <Wallet className="w-5 h-5 text-blue-600 mx-auto mb-2" />
                      <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400">Wallet</span>
                      <p className="text-lg font-black text-slate-800 mt-0.5">{formatPrice(user?.walletBalance || 0)}</p>
                    </div>
                    <div className="bg-slate-50 border border-slate-200/40 rounded-2xl p-4 text-center">
                      <Award className="w-5 h-5 text-amber-500 mx-auto mb-2" />
                      <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400">Loyalty Pts</span>
                      <p className="text-lg font-black text-slate-800 mt-0.5">{user?.loyaltyPoints || 0} PTS</p>
                    </div>
                    <div className="bg-slate-50 border border-slate-200/40 rounded-2xl p-4 text-center">
                      <Heart className="w-5 h-5 text-rose-500 mx-auto mb-2" />
                      <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400">Wishlist</span>
                      <p className="text-lg font-black text-slate-800 mt-0.5">{wishlist.length} Items</p>
                    </div>
                    <div className="bg-slate-50 border border-slate-200/40 rounded-2xl p-4 text-center">
                      <ShoppingCart className="w-5 h-5 text-blue-600 mx-auto mb-2" />
                      <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400">Cart Items</span>
                      <p className="text-lg font-black text-slate-800 mt-0.5">{cart.reduce((a,c)=>a+c.quantity, 0)} Items</p>
                    </div>
                    <div className="bg-slate-50 border border-slate-200/40 rounded-2xl p-4 text-center">
                      <ShoppingBag className="w-5 h-5 text-slate-600 mx-auto mb-2" />
                      <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400">Total Orders</span>
                      <p className="text-lg font-black text-slate-800 mt-0.5">{orders.length} Placed</p>
                    </div>
                    <div className="bg-slate-50 border border-slate-200/40 rounded-2xl p-4 text-center">
                      <Gift className="w-5 h-5 text-purple-500 mx-auto mb-2" />
                      <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400">Total Savings</span>
                      <p className="text-lg font-black text-slate-800 mt-0.5">{formatPrice(184.20)}</p>
                    </div>
                    <div className="bg-slate-50 border border-slate-200/40 rounded-2xl p-4 text-center">
                      <Tag className="w-5 h-5 text-emerald-500 mx-auto mb-2" />
                      <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400">Coupons</span>
                      <p className="text-lg font-black text-slate-800 mt-0.5">3 Available</p>
                    </div>
                    <div className="bg-slate-50 border border-slate-200/40 rounded-2xl p-4 text-center">
                      <Clock className="w-5 h-5 text-indigo-500 mx-auto mb-2" />
                      <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400">Delivered</span>
                      <p className="text-lg font-black text-slate-800 mt-0.5">{orders.filter(o=>o.orderStatus==='Delivered').length} Items</p>
                    </div>
                  </div>

                  {/* Recent Order Preview */}
                  <div className="border border-slate-150 rounded-[20px] p-5 space-y-4">
                    <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider">Latest Order Tracker</h4>
                    {orders.length === 0 ? (
                      <p className="text-xs text-slate-400 font-semibold py-4 text-center">No orders created yet.</p>
                    ) : (
                      <div className="space-y-4.5 bg-slate-50/30 p-4 border border-slate-200/50 rounded-2xl">
                        <div className="flex justify-between items-center text-xs font-bold text-slate-655 flex-wrap gap-2">
                          <span>Order Code: <code className="bg-slate-100 px-1 rounded">#{orders[0]._id.substring(0,8).toUpperCase()}</code></span>
                          <span className="text-[10px] text-slate-400">Placed: {new Date(orders[0].createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1 bg-emerald-50/50 border border-emerald-150 text-emerald-800 text-[10px] font-black uppercase px-2.5 py-1 rounded-lg w-max">
                          Status: {orders[0].orderStatus}
                        </div>
                        <button
                          onClick={() => handleTabChange('track')}
                          className="w-full bg-blue-650 hover:bg-blue-750 text-white text-[10px] font-black uppercase py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5"
                        >
                          <MapPin className="w-3.5 h-3.5" /> Full Live Tracking Hub
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Personalized Recommendations */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider">Recommended Just For You</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="border border-slate-150 rounded-2xl p-3 bg-white hover:shadow-sm transition-all text-center">
                        <img src="https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=150" alt="smartwatch" className="h-20 object-contain mx-auto" />
                        <h5 className="text-[11px] font-black text-slate-700 truncate mt-2">NexaWatch Ultra 3</h5>
                        <p className="text-xs font-bold text-slate-800 mt-1">{formatPrice(299.00)}</p>
                      </div>
                      <div className="border border-slate-150 rounded-2xl p-3 bg-white hover:shadow-sm transition-all text-center">
                        <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=150" alt="headphones" className="h-20 object-contain mx-auto" />
                        <h5 className="text-[11px] font-black text-slate-700 truncate mt-2">Over-Ear Wireless Pro</h5>
                        <p className="text-xs font-bold text-slate-800 mt-1">{formatPrice(149.00)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: PROFILE MANAGEMENT */}
              {activeTab === 'profile' && (
                <form onSubmit={handleSaveProfile} className="space-y-6">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3.5">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2.5">
                      <User className="w-4.5 h-4.5 text-blue-650" /> Profile Configurations
                    </h3>
                    <button
                      type="submit"
                      className="bg-blue-650 hover:bg-blue-750 text-white font-black text-[10px] uppercase px-5 py-2.5 rounded-xl shadow-sm transition-all"
                    >
                      Save Changes
                    </button>
                  </div>

                  {/* Profile Picture section */}
                  <div className="flex items-center gap-4 bg-slate-50/50 p-4 border border-slate-200/50 rounded-2xl">
                    <img
                      src={profileForm.profilePic}
                      alt="avatar large"
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-205 shadow-sm"
                    />
                    <div className="space-y-1.5 flex-1">
                      <p className="text-xs font-black text-slate-700">Update Profile Avatar</p>
                      <input
                        type="text"
                        placeholder="Image URL"
                        value={profileForm.profilePic}
                        onChange={(e) => setProfileForm({ ...profileForm, profilePic: e.target.value })}
                        className="text-xs border border-slate-200 rounded-xl px-3 py-1.5 bg-white w-full sm:w-64 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Grid fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-650 block">Full Name</label>
                      <input
                        type="text"
                        value={user?.name || ''}
                        disabled
                        className="w-full bg-slate-100 border border-slate-200 text-slate-500 rounded-xl py-2 px-3 cursor-not-allowed focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-655 block">Username</label>
                      <input
                        type="text"
                        value={profileForm.username}
                        onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                        className="w-full border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:border-blue-650"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-655 block">Email Address</label>
                      <input
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="w-full bg-slate-100 border border-slate-200 text-slate-500 rounded-xl py-2 px-3 cursor-not-allowed focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-655 block">Mobile Number</label>
                      <input
                        type="text"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        className="w-full border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:border-blue-650"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-655 block">Alternative Mobile Number</label>
                      <input
                        type="text"
                        value={profileForm.altPhone}
                        onChange={(e) => setProfileForm({ ...profileForm, altPhone: e.target.value })}
                        className="w-full border border-slate-200 rounded-xl py-2 px-3 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-655 block">Gender</label>
                      <select
                        value={profileForm.gender}
                        onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}
                        className="w-full border border-slate-200 rounded-xl py-2 px-3 focus:outline-none"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-655 block">Date of Birth</label>
                      <input
                        type="date"
                        value={profileForm.dob}
                        onChange={(e) => setProfileForm({ ...profileForm, dob: e.target.value })}
                        className="w-full border border-slate-200 rounded-xl py-2 px-3 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-655 block">Language Preference</label>
                      <select
                        value={profileForm.language}
                        onChange={(e) => setProfileForm({ ...profileForm, language: e.target.value })}
                        className="w-full border border-slate-200 rounded-xl py-2 px-3 focus:outline-none"
                      >
                        <option value="English">English</option>
                        <option value="Hindi">Hindi</option>
                        <option value="Spanish">Spanish</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-655 block">City</label>
                      <input
                        type="text"
                        value={profileForm.city}
                        onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                        className="w-full border border-slate-200 rounded-xl py-2 px-3 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-655 block">State</label>
                      <input
                        type="text"
                        value={profileForm.state}
                        onChange={(e) => setProfileForm({ ...profileForm, state: e.target.value })}
                        className="w-full border border-slate-200 rounded-xl py-2 px-3 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-655 block">Pincode</label>
                      <input
                        type="text"
                        value={profileForm.pincode}
                        onChange={(e) => setProfileForm({ ...profileForm, pincode: e.target.value })}
                        className="w-full border border-slate-200 rounded-xl py-2 px-3 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-655 block">Country</label>
                      <input
                        type="text"
                        value={profileForm.country}
                        onChange={(e) => setProfileForm({ ...profileForm, country: e.target.value })}
                        className="w-full border border-slate-200 rounded-xl py-2 px-3 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <label className="font-bold text-slate-655 block">Bio Description</label>
                    <textarea
                      rows="3"
                      value={profileForm.bio}
                      onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl py-2 px-3 focus:outline-none"
                    />
                  </div>

                  {/* Danger zone actions */}
                  <div className="pt-6 border-t border-slate-100 flex justify-between items-center flex-wrap gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm('Are you sure you want to deactivate your account? You will lose access to active orders.')) {
                          addNotification('Account deactivation requested (mock).', 'info');
                        }
                      }}
                      className="border border-slate-200 hover:bg-slate-50 text-[10px] font-black uppercase text-slate-600 px-4 py-2.5 rounded-xl transition-all"
                    >
                      Deactivate Account
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm('WARNING: Deleting account is permanent. All wallet funds and reward points will be deleted.')) {
                          addNotification('Account deletion requested.', 'error');
                        }
                      }}
                      className="bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 text-[10px] font-black uppercase px-4 py-2.5 rounded-xl transition-all"
                    >
                      Delete Account
                    </button>
                  </div>
                </form>
              )}

              {/* TAB: LOGIN & SECURITY */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2.5">
                    <Lock className="w-4.5 h-4.5 text-blue-650" /> Login & Security Settings
                  </h3>

                  {/* Change Password Form */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-black uppercase text-slate-700">Change Account Password</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="space-y-1.5">
                        <label className="font-bold text-slate-600 block">New Password</label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="At least 8 characters"
                          className="w-full border border-slate-200 rounded-xl py-2 px-3 focus:outline-none"
                        />
                        {/* Password strength meter */}
                        {newPassword && (
                          <div className="space-y-1 mt-1">
                            <div className="flex justify-between items-center text-[9px] font-bold text-slate-500">
                              <span>Password Strength:</span>
                              <span className="font-extrabold">{getPasswordStrength().label}</span>
                            </div>
                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div className={`h-full ${getPasswordStrength().color} transition-all`} style={{ width: `${getPasswordStrength().score}%` }} />
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <label className="font-bold text-slate-655 block">Confirm New Password</label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Re-enter password"
                          className="w-full border border-slate-200 rounded-xl py-2 px-3 focus:outline-none"
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (newPassword.length < 8) {
                          addNotification('Password must be at least 8 characters.', 'error');
                          return;
                        }
                        if (newPassword !== confirmPassword) {
                          addNotification('Passwords do not match.', 'error');
                          return;
                        }
                        addNotification('Password changed successfully!', 'success');
                        setNewPassword('');
                        setConfirmPassword('');
                      }}
                      className="bg-blue-650 hover:bg-blue-750 text-white font-black text-[10px] uppercase px-5 py-2.5 rounded-xl shadow-sm transition-all"
                    >
                      Update Password
                    </button>
                  </div>

                  {/* Two-Factor Authentication */}
                  <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
                    <div className="space-y-1">
                      <h4 className="text-xs font-black uppercase text-slate-700 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" /> Two-Factor Authentication (2FA)
                      </h4>
                      <p className="text-[10px] text-slate-455 font-semibold leading-relaxed">Secure your account transactions with SMS / App Authenticator OTP validation codes.</p>
                    </div>
                    <button
                      onClick={() => {
                        setTwoFactorEnabled(!twoFactorEnabled);
                        addNotification(twoFactorEnabled ? '2FA Deactivated' : '2FA Enabled successfully! SMS verification setup.', 'success');
                      }}
                      className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider border transition-all ${
                        twoFactorEnabled
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                          : 'bg-slate-50 border-slate-200 text-slate-500'
                      }`}
                    >
                      {twoFactorEnabled ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>

                  {/* Login Devices list */}
                  <div className="pt-6 border-t border-slate-100 space-y-3">
                    <h4 className="text-xs font-black uppercase text-slate-700">Currently Logged-in Devices</h4>
                    <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/10">
                      <div className="p-3.5 flex justify-between items-center text-xs">
                        <div className="flex items-center gap-3">
                          <Activity className="w-5 h-5 text-blue-600 animate-pulse" />
                          <div>
                            <p className="font-extrabold text-slate-800">Chrome (Windows 11) - Bengaluru, India</p>
                            <p className="text-[10px] text-slate-450 mt-0.5">Active Session (This browser)</p>
                          </div>
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-150 px-2 py-0.5 rounded-lg">Current</span>
                      </div>
                      <div className="p-3.5 flex justify-between items-center text-xs">
                        <div className="flex items-center gap-3">
                          <Activity className="w-5 h-5 text-slate-400" />
                          <div>
                            <p className="font-semibold text-slate-700">Chrome (Android) - Mumbai, India</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">Last active: 2 hours ago</p>
                          </div>
                        </div>
                        <button
                          onClick={() => addNotification('Session revoked successfully.', 'info')}
                          className="text-[10px] font-extrabold text-rose-600 hover:underline"
                        >
                          Revoke
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => addNotification('Logged out from all other active sessions.', 'success')}
                      className="border border-rose-200 hover:bg-rose-50 text-rose-600 font-black text-[9px] uppercase px-4 py-2.5 rounded-xl transition-all"
                    >
                      Logout from All Devices
                    </button>
                  </div>
                </div>
              )}

              {/* TAB: MY ORDERS */}
              {activeTab === 'orders' && (
                <div className="space-y-6">
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2.5">
                    <ShoppingBag className="w-4.5 h-4.5 text-blue-650" /> Orders History Catalog
                  </h3>

                  {loadingOrders ? (
                    <div className="py-12 flex justify-center">
                      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : orders.length === 0 ? (
                    <p className="text-center text-xs font-semibold text-slate-400 py-10 bg-slate-50/50 border border-slate-150 rounded-2xl">
                      No orders completed yet. Go discover deals!
                    </p>
                  ) : (
                    <div className="space-y-6 animate-in fade-in duration-300">
                      {orders.map((ord) => (
                        <div key={ord._id} className="border border-slate-150 rounded-2xl p-5 bg-white space-y-4">
                          
                          {/* Order Card header */}
                          <div className="flex justify-between items-center border-b border-slate-100 pb-3 flex-wrap gap-2 text-xs font-semibold text-slate-500">
                            <div>
                              <span className="text-[10px] text-slate-400 font-bold uppercase block">Order ID</span>
                              <span className="font-mono text-slate-805 font-bold select-all">#{ord._id.toUpperCase()}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 font-bold uppercase block">Placed On</span>
                              <span className="text-slate-700">{new Date(ord.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Amount</span>
                              <span className="text-slate-805 font-black">{formatPrice(ord.totalAmount)}</span>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => downloadInvoicePDF(ord)}
                                className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-blue-600 flex items-center gap-1.5 text-[10px] font-black uppercase"
                                title="Download Invoice"
                              >
                                <Download className="w-4 h-4" /> Invoice
                              </button>
                            </div>
                          </div>

                          {/* Order Products List */}
                          <div className="divide-y divide-slate-100">
                            {ord.items.map((item, idx) => (
                              <div key={idx} className="py-3 flex items-center justify-between text-xs flex-wrap gap-3">
                                <div className="flex items-center gap-3.5">
                                  <div className="w-10 h-10 bg-slate-50 rounded-xl border p-1 flex items-center justify-center">
                                    <img src={item.productId?.images?.[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=150'} alt="product" className="h-full object-contain" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-bold text-slate-800 truncate">{item.title}</p>
                                    <p className="text-[10px] text-slate-450 mt-0.5">Brand: NexaTech • Seller: Retailer Corp</p>
                                    <p className="text-[9px] text-indigo-650 bg-indigo-50 px-2 py-0.5 rounded-lg w-max font-bold mt-1">Payment: {ord.paymentMethod.toUpperCase()}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="font-extrabold text-slate-800">{formatPrice(item.price * item.quantity)}</p>
                                  <p className="text-[10px] text-slate-455 mt-0.5">{item.quantity} Unit × {formatPrice(item.price)}</p>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Action Toolbar */}
                          <div className="pt-3 border-t border-slate-100 flex justify-between items-center flex-wrap gap-3">
                            <span className="text-[10px] font-black uppercase text-slate-450">Estimated delivery: {ord.orderStatus === 'Delivered' ? 'Delivered successfully' : 'Within 3 Business Days'}</span>
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setSelectedOrderToTrack(ord);
                                  handleTabChange('track');
                                }}
                                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-[10px] font-black uppercase rounded-xl transition-all"
                              >
                                Track Order
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedTicket({ subject: `Return Order #${ord._id.substring(0,8).toUpperCase()}`, messages: [] });
                                  handleTabChange('support');
                                }}
                                className="px-4 py-2 bg-slate-50 hover:bg-slate-100 border text-[10px] font-black uppercase rounded-xl transition-all text-slate-705"
                              >
                                Return / Help
                              </button>
                            </div>
                          </div>

                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB: ORDER TRACKING */}
              {activeTab === 'track' && (
                <div className="space-y-6">
                  <h3 className="text-sm font-black text-slate-855 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2.5">
                    <MapPin className="w-4.5 h-4.5 text-blue-650" /> Live Tracking Hub
                  </h3>

                  {orders.length === 0 ? (
                    <p className="text-xs text-slate-400 font-semibold py-8 text-center bg-slate-50/30 rounded-2xl border">No orders placed to track.</p>
                  ) : (
                    <div className="space-y-6">
                      
                      {/* Active Order Selector */}
                      <div className="flex gap-3 items-center overflow-x-auto pb-2">
                        {orders.map((ord) => (
                          <button
                            key={ord._id}
                            onClick={() => setSelectedOrderToTrack(ord)}
                            className={`flex-shrink-0 px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl border transition-all ${
                              selectedOrderToTrack?._id === ord._id
                                ? 'bg-blue-50 border-blue-200 text-blue-655'
                                : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                            }`}
                          >
                            Order #{ord._id.substring(0,8).toUpperCase()}
                          </button>
                        ))}
                      </div>

                      {selectedOrderToTrack && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                          
                          {/* Details Bar */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-655">
                            <div>
                              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Logistics Partner</span>
                              <span className="text-slate-808 font-black">NexaLogistics Express</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Estimated Delivery</span>
                              <span className="text-slate-808 font-black">June 29, 2026</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Tracking Reference</span>
                              <span className="font-mono text-slate-808 font-bold block select-all">NEX-8827-X1</span>
                            </div>
                          </div>

                          {/* Stepper Timeline */}
                          <div className="relative pl-8 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200">
                            <div className="relative">
                              <span className="absolute -left-[27px] top-1.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white ring-2 ring-emerald-500/20" />
                              <h4 className="text-xs font-black text-slate-850 uppercase">Order Confirmed</h4>
                              <p className="text-[10.5px] text-slate-500 mt-1 font-semibold">Payment processed and seller accepted the checkout order.</p>
                              <span className="text-[9px] text-slate-400 block mt-0.5">June 25, 2026 - 11:20 AM</span>
                            </div>
                            <div className="relative">
                              <span className="absolute -left-[27px] top-1.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white ring-2 ring-emerald-500/20" />
                              <h4 className="text-xs font-black text-slate-850 uppercase">Packed & Manifested</h4>
                              <p className="text-[10.5px] text-slate-500 mt-1 font-semibold">Consolidated package ready at Seller hub warehouse.</p>
                              <span className="text-[9px] text-slate-400 block mt-0.5">June 25, 2026 - 02:40 PM</span>
                            </div>
                            <div className="relative">
                              <span className={`absolute -left-[27px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white ${
                                selectedOrderToTrack.orderStatus === 'Shipped' || selectedOrderToTrack.orderStatus === 'Delivered'
                                  ? 'bg-emerald-500 ring-2 ring-emerald-500/20'
                                  : 'bg-slate-300 ring-2 ring-slate-300/20 animate-pulse'
                              }`} />
                              <h4 className={`text-xs font-black uppercase ${
                                selectedOrderToTrack.orderStatus === 'Shipped' || selectedOrderToTrack.orderStatus === 'Delivered'
                                  ? 'text-slate-850'
                                  : 'text-slate-400'
                              }`}>Shipped from Origin Hub</h4>
                              <p className="text-[10.5px] text-slate-500 mt-1 font-semibold">In transit via NexaLogistics Express line.</p>
                            </div>
                            <div className="relative">
                              <span className={`absolute -left-[27px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white ${
                                selectedOrderToTrack.orderStatus === 'Delivered'
                                  ? 'bg-emerald-500'
                                  : 'bg-slate-300'
                              }`} />
                              <h4 className={`text-xs font-black uppercase ${
                                selectedOrderToTrack.orderStatus === 'Delivered' ? 'text-slate-850' : 'text-slate-400'
                              }`}>Delivered Successfully</h4>
                              <p className="text-[10.5px] text-slate-500 mt-1 font-semibold">Package handed over to customer.</p>
                            </div>
                          </div>

                        </div>
                      )}

                    </div>
                  )}
                </div>
              )}

              {/* TAB: WISHLIST */}
              {activeTab === 'wishlist' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3 flex-wrap gap-2">
                    <h3 className="text-sm font-black text-slate-855 uppercase tracking-wider flex items-center gap-2.5">
                      <Heart className="w-4.5 h-4.5 text-rose-500 fill-current" /> Favorites Wishlist
                    </h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleShareWishlist}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-650 rounded-xl text-[10px] font-extrabold uppercase transition-colors"
                      >
                        <Share2 className="w-3.5 h-3.5" /> Share List
                      </button>
                    </div>
                  </div>

                  {loadingWishlist ? (
                    <div className="py-8 flex justify-center">
                      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : wishlistProducts.length === 0 ? (
                    <p className="text-center text-xs font-semibold text-slate-400 py-10 bg-slate-50/50 border border-slate-155 rounded-2xl">
                      Wishlist list is empty. Add products from cards!
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {wishlistProducts.map((prod) => (
                        <div key={prod._id} className="border border-slate-150 rounded-2xl p-4 flex flex-col justify-between h-64 bg-white shadow-sm hover:shadow-md transition-shadow relative">
                          <div className="h-28 flex items-center justify-center p-2 bg-slate-55/30 rounded-xl">
                            <img src={prod.images[0]} alt={prod.title} className="h-full object-contain" />
                          </div>
                          <div className="mt-2.5">
                            <span className="text-[9px] uppercase tracking-wider font-extrabold text-indigo-650 bg-indigo-50 px-2 py-0.5 rounded-lg">{prod.category}</span>
                            <Link to={`/product/${prod._id}`}>
                              <h4 className="text-xs font-black text-slate-800 truncate mt-1.5 hover:text-blue-650 transition-colors">{prod.title}</h4>
                            </Link>
                            <p className="text-sm font-black text-slate-850 mt-1">{formatPrice(prod.price)}</p>
                          </div>
                          <div className="flex gap-2.5 mt-3 pt-3 border-t border-slate-100">
                            <button
                              onClick={() => {
                                addToCart(prod, 1);
                                toggleWishlist(prod._id);
                              }}
                              className="bg-blue-650 text-white py-1.5 px-3 text-[10px] text-center font-black rounded-xl flex-1 uppercase tracking-wider shadow-sm flex items-center justify-center gap-1.5"
                            >
                              <ShoppingCart className="w-3.5 h-3.5" /> Move to Cart
                            </button>
                            <button
                              onClick={() => toggleWishlist(prod._id)}
                              className="border border-slate-205 hover:bg-slate-50 text-rose-505 text-[10px] px-3 font-extrabold rounded-xl transition-all"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB: SHOPPING CART */}
              {activeTab === 'cart' && (
                <div className="space-y-6">
                  <h3 className="text-sm font-black text-slate-855 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2.5">
                    <ShoppingCart className="w-4.5 h-4.5 text-blue-650" /> Shopping Cart Items
                  </h3>

                  {cart.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50/50 border rounded-[20px] space-y-3">
                      <ShoppingCart className="w-10 h-10 text-slate-350 mx-auto" />
                      <p className="text-xs text-slate-400 font-bold uppercase">Your cart is currently empty</p>
                      <Link to="/shop" className="inline-block bg-blue-650 hover:bg-blue-750 text-white font-black text-[10px] uppercase px-5 py-2.5 rounded-xl shadow-md transition-all">Go Shop Catalog</Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start animate-in fade-in duration-300">
                      
                      {/* Items Column */}
                      <div className="lg:col-span-2 space-y-4">
                        {cart.map((item) => (
                          <div key={item.productId._id} className="border border-slate-150 rounded-2xl p-4 bg-white flex justify-between items-center gap-4 text-xs">
                            <div className="flex items-center gap-3.5 min-w-0">
                              <img src={item.productId.images?.[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=150'} alt="product" className="w-12 h-12 rounded-xl object-contain border p-1 bg-slate-50" />
                              <div className="min-w-0">
                                <h4 className="font-extrabold text-slate-850 truncate">{item.productId.title}</h4>
                                <p className="text-[10px] text-slate-400 mt-0.5">Unit Price: {formatPrice(item.productId.price)}</p>
                                <button
                                  onClick={() => {
                                    toggleWishlist(item.productId._id);
                                    removeFromCart(item.productId._id);
                                  }}
                                  className="text-[9px] font-black uppercase text-blue-600 hover:underline mt-1.5 block"
                                >
                                  Move to Wishlist
                                </button>
                              </div>
                            </div>

                            {/* Quantity controller */}
                            <div className="flex items-center gap-3 flex-shrink-0">
                              <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 overflow-hidden">
                                <button
                                  onClick={() => updateQuantity(item.productId._id, item.quantity - 1, item.productId.inventoryCount)}
                                  className="px-2 py-1 hover:bg-slate-200 text-slate-655 font-black"
                                >
                                  -
                                </button>
                                <span className="px-3 font-extrabold text-slate-800">{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(item.productId._id, item.quantity + 1, item.productId.inventoryCount)}
                                  className="px-2 py-1 hover:bg-slate-200 text-slate-655 font-black"
                                >
                                  +
                                </button>
                              </div>
                              <button
                                onClick={() => removeFromCart(item.productId._id)}
                                className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl border border-rose-100"
                                title="Remove item"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Total Calculations Panel */}
                      <div className="lg:col-span-1 bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                        <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider">Price Details</h4>
                        
                        <div className="space-y-2.5 text-xs text-slate-600 font-semibold border-b border-slate-200/60 pb-3">
                          <div className="flex justify-between">
                            <span>Subtotal ({cart.reduce((a,c)=>a+c.quantity,0)} Items)</span>
                            <span className="text-slate-805 font-bold">{formatPrice(getSubtotal())}</span>
                          </div>
                          {promoDiscount > 0 && (
                            <div className="flex justify-between text-emerald-650 font-bold">
                              <span>Promo Code Discount</span>
                              <span>-{formatPrice(getDiscountAmount())}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span>Tax & Charges</span>
                            <span className="text-slate-805 font-bold">Calculated at checkout</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Delivery Fees</span>
                            <span className="text-emerald-600 font-bold">FREE</span>
                          </div>
                        </div>

                        {/* Promo application */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-slate-500 font-black uppercase">Apply Coupon</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Code (e.g. NEXA50)"
                              value={couponInput}
                              onChange={(e) => setCouponInput(e.target.value)}
                              className="bg-white border rounded-xl py-1.5 px-3 text-xs w-full focus:outline-none"
                            />
                            <button
                              onClick={async () => {
                                if (!couponInput.trim()) return;
                                const success = await validatePromoCode(couponInput);
                                if (success) setCouponInput('');
                              }}
                              className="bg-blue-650 hover:bg-blue-750 text-white font-black text-[9px] uppercase px-4 py-2 rounded-xl"
                            >
                              Apply
                            </button>
                          </div>
                          {promoCode && (
                            <p className="text-[10px] text-emerald-655 font-bold">Active Promo: {promoCode}</p>
                          )}
                          {promoError && (
                            <p className="text-[10px] text-rose-655 font-bold">{promoError}</p>
                          )}
                        </div>

                        <div className="flex justify-between text-sm font-black text-slate-805 pt-2 border-t border-slate-200">
                          <span>Total Amount</span>
                          <span className="text-blue-650 text-base">{formatPrice(getTotal())}</span>
                        </div>

                        <Link
                          to="/checkout"
                          className="w-full bg-[#2874F0] hover:bg-[#1b62d1] text-white py-3 rounded-xl text-center font-black uppercase text-xs shadow-md hover:shadow-lg transition-all block tracking-wider mt-4"
                        >
                          Checkout Button
                        </Link>
                      </div>

                    </div>
                  )}
                </div>
              )}

              {/* TAB: SAVED ADDRESSES */}
              {activeTab === 'addresses' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b border-slate-105 pb-3 flex-wrap gap-2">
                    <h3 className="text-sm font-black text-slate-850 uppercase tracking-wider flex items-center gap-2.5">
                      <MapPin className="w-4.5 h-4.5 text-blue-650" /> Saved Addresses Slot
                    </h3>
                    <button
                      onClick={() => setShowAddressForm(!showAddressForm)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-55 hover:bg-blue-100 text-blue-600 rounded-xl text-[10px] font-extrabold uppercase transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Address
                    </button>
                  </div>

                  {/* Add New Address Form */}
                  {showAddressForm && (
                    <form onSubmit={handleAddAddress} className="p-5 border border-slate-200 rounded-2xl bg-slate-50/30 space-y-3.5 animate-in slide-in-from-top-5 duration-300">
                      <h4 className="text-xs font-black uppercase text-slate-800">Add New Shipping Address</h4>
                      <div className="grid grid-cols-1 gap-3">
                        <input
                          type="text"
                          placeholder="Street Address"
                          required
                          value={street}
                          onChange={(e) => setStreet(e.target.value)}
                          className="w-full border rounded-xl py-2 px-3 text-xs bg-white focus:outline-none"
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="text"
                            placeholder="City"
                            required
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className="w-full border rounded-xl py-2 px-3 text-xs bg-white focus:outline-none"
                          />
                          <input
                            type="text"
                            placeholder="State"
                            required
                            value={state}
                            onChange={(e) => setState(e.target.value)}
                            className="w-full border rounded-xl py-2 px-3 text-xs bg-white focus:outline-none"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="text"
                            placeholder="ZIP / Postal Code"
                            required
                            value={zip}
                            onChange={(e) => setZip(e.target.value)}
                            className="w-full border rounded-xl py-2 px-3 text-xs bg-white focus:outline-none"
                          />
                          <input
                            type="text"
                            placeholder="Country"
                            required
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            className="w-full border rounded-xl py-2 px-3 text-xs bg-white focus:outline-none"
                          />
                        </div>
                        <div className="flex items-center gap-2 pt-1.5">
                          <input
                            type="checkbox"
                            id="isDefaultCheck"
                            checked={isDefault}
                            onChange={(e) => setIsDefault(e.target.checked)}
                            className="rounded text-blue-600"
                          />
                          <label htmlFor="isDefaultCheck" className="text-xs font-bold text-slate-700 cursor-pointer">Set as default delivery address</label>
                        </div>
                      </div>

                      <div className="flex gap-2.5 pt-2">
                        <button
                          type="button"
                          onClick={() => setShowAddressForm(false)}
                          className="border border-slate-200 hover:bg-slate-50 py-2 px-4 rounded-xl text-xs font-bold"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="bg-blue-650 hover:bg-blue-755 text-white py-2 px-6 rounded-xl text-xs font-black uppercase tracking-wider"
                        >
                          Add Address
                        </button>
                      </div>
                    </form>
                  )}

                  {/* List of saved addresses */}
                  <div className="grid grid-cols-1 gap-4">
                    {user?.shippingAddresses?.map((addr, idx) => (
                      <div key={idx} className="p-4 bg-white border border-slate-200 rounded-2xl flex justify-between items-start">
                        <div>
                          <p className="font-extrabold text-xs text-slate-805 flex items-center gap-1.5">
                            Address Slot #{idx + 1} {addr.isDefault && <span className="bg-blue-50 text-blue-600 px-2 py-0.5 text-[8px] rounded-lg font-black uppercase">Default</span>}
                          </p>
                          <p className="text-slate-500 text-xs mt-1.5 font-semibold leading-relaxed">
                            {addr.street}, {addr.city}, {addr.state} - {addr.zip}, {addr.country}
                          </p>
                        </div>
                        <button
                          onClick={() => addNotification('Address deletion is restricted in simulation.', 'warning')}
                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Google Maps Integration Ready mock frame */}
                  <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50 space-y-3.5">
                    <h4 className="text-xs font-black uppercase text-slate-855 flex items-center gap-2">
                      <Globe className="w-4.5 h-4.5 text-blue-600 animate-spin" /> Google Maps Pin Dropper Ready
                    </h4>
                    <div className="bg-slate-100 rounded-xl h-24 border flex items-center justify-center text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                      Map Integration Sandbox Environment Loaded
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: PAYMENT METHODS */}
              {activeTab === 'payments' && (
                <div className="space-y-6">
                  <h3 className="text-sm font-black text-slate-855 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2.5">
                    <CreditCard className="w-4.5 h-4.5 text-blue-650" /> Saved Payment Methods
                  </h3>

                  {/* Cards Mock */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-5 bg-gradient-to-tr from-slate-900 to-slate-800 text-white rounded-2xl flex flex-col justify-between h-36 shadow-md relative overflow-hidden">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-450">NexaCredit Premium</span>
                        <span className="font-extrabold text-xs">VISA</span>
                      </div>
                      <div>
                        <p className="font-mono text-sm tracking-widest text-slate-200">•••• •••• •••• 4242</p>
                        <div className="flex justify-between items-end mt-4">
                          <div>
                            <span className="text-[8px] text-slate-450 uppercase block">Card Holder</span>
                            <span className="text-[10px] font-bold text-slate-200">{user?.name?.toUpperCase()}</span>
                          </div>
                          <div>
                            <span className="text-[8px] text-slate-450 uppercase block">Expires</span>
                            <span className="text-[10px] font-bold text-slate-200">12/28</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 bg-gradient-to-tr from-blue-700 to-indigo-700 text-white rounded-2xl flex flex-col justify-between h-36 shadow-md relative overflow-hidden">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-black uppercase tracking-wider text-blue-200">NexaDebit Classic</span>
                        <span className="font-extrabold text-xs">MASTERCARD</span>
                      </div>
                      <div>
                        <p className="font-mono text-sm tracking-widest text-slate-200">•••• •••• •••• 5555</p>
                        <div className="flex justify-between items-end mt-4">
                          <div>
                            <span className="text-[8px] text-blue-200 uppercase block">Card Holder</span>
                            <span className="text-[10px] font-bold text-slate-200">{user?.name?.toUpperCase()}</span>
                          </div>
                          <div>
                            <span className="text-[8px] text-blue-200 uppercase block">Expires</span>
                            <span className="text-[10px] font-bold text-slate-200">08/30</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* UPI IDs */}
                  <div className="border border-slate-200 rounded-2xl p-5 space-y-3.5 bg-slate-50/50">
                    <h4 className="text-xs font-black uppercase text-slate-800">Saved UPI Accounts</h4>
                    <div className="flex justify-between items-center bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-700">
                      <span>{profileForm.username}@okaxis</span>
                      <span className="text-[9px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Verified</span>
                    </div>
                  </div>

                  {/* Form Mock Add Card */}
                  <div className="space-y-3.5 border-t border-slate-100 pt-6">
                    <h4 className="text-xs font-black uppercase text-slate-800">Add New Payment Instrument</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input type="text" placeholder="16 Digit Card Number" className="sm:col-span-2 border rounded-xl py-2 px-3 text-xs w-full focus:outline-none" />
                      <input type="text" placeholder="MM/YY" className="border rounded-xl py-2 px-3 text-xs w-full focus:outline-none" />
                    </div>
                    <button
                       onClick={() => addNotification(`Card verification simulation initialized. Verification fee ${formatPrice(1)} voided.`, 'success')}
                      className="bg-blue-650 hover:bg-blue-750 text-white font-black text-[10px] uppercase px-5 py-2.5 rounded-xl shadow-sm transition-all"
                    >
                      Verify & Add Card
                    </button>
                  </div>
                </div>
              )}

              {/* TAB: WALLET */}
              {activeTab === 'wallet' && (
                <div className="space-y-6">
                  <h3 className="text-sm font-black text-slate-855 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2.5">
                    <Wallet className="w-4.5 h-4.5 text-blue-650" /> Reward Wallet Control
                  </h3>

                  <div className="p-6 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex flex-col justify-between h-36 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-xl" />
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-200">Wallet Credit</span>
                      <Wallet className="w-5 h-5 text-indigo-200" />
                    </div>
                    <div>
                      <p className="text-3xl font-black">{formatPrice(user?.walletBalance || 0)}</p>
                      <p className="text-[9px] font-bold text-slate-200 uppercase tracking-wider mt-1.5">Simulation Welcome Gift Cash</p>
                    </div>
                  </div>

                  {/* Recharge Form */}
                  <div className="border border-slate-200 rounded-2xl p-5 space-y-3.5 bg-slate-50/50">
                    <h4 className="text-xs font-black uppercase text-slate-800">Quick Wallet Recharge</h4>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Amount (e.g. 100)"
                        value={rechargeAmount}
                        onChange={(e) => setRechargeAmount(e.target.value)}
                        className="bg-white border rounded-xl py-2 px-3 text-xs w-full focus:outline-none"
                      />
                      <button
                        onClick={() => {
                          if (!rechargeAmount) return;
                          addNotification(`Wallet recharged successfully with ${formatPrice(rechargeAmount)}! (Simulation)`, 'success');
                          setRechargeAmount('');
                        }}
                        className="bg-blue-650 hover:bg-blue-755 text-white font-black text-[10px] uppercase px-5 py-2.5 rounded-xl flex-shrink-0"
                      >
                        Recharge
                      </button>
                    </div>
                  </div>

                  {/* Ledger mock */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-black uppercase text-slate-700">Wallet Ledger History</h4>
                    <div className="divide-y divide-slate-100 border border-slate-150 rounded-2xl overflow-hidden text-xs">
                      <div className="p-3.5 flex justify-between items-center bg-white">
                        <div>
                          <p className="font-bold text-slate-805">Simulation Welcome Gift Cash</p>
                          <p className="text-[9px] text-slate-450 mt-0.5">June 25, 2026</p>
                        </div>
                        <span className="text-emerald-600 font-extrabold">+{formatPrice(100)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: COUPONS */}
              {activeTab === 'coupons' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3 flex-wrap gap-2">
                    <h3 className="text-sm font-black text-slate-855 uppercase tracking-wider flex items-center gap-2.5">
                      <Tag className="w-4.5 h-4.5 text-blue-650" /> Coupons & Promo Codes
                    </h3>
                    {/* Sub-tabs */}
                    <div className="flex gap-1.5 text-[10px] font-black uppercase">
                      {['available', 'used', 'expired'].map(t => (
                        <button
                          key={t}
                          onClick={() => setActiveCouponTab(t)}
                          className={`px-3 py-1.5 rounded-lg border transition-all ${
                            activeCouponTab === t
                              ? 'bg-blue-50 border-blue-200 text-blue-600'
                              : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {loadingCoupons ? (
                    <div className="py-8 flex justify-center">
                      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : (couponsData[activeCouponTab] || []).length === 0 ? (
                    <div className="text-center py-10 bg-slate-50/50 border rounded-2xl text-xs font-semibold text-slate-400">
                      No coupons found in this category.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {(couponsData[activeCouponTab] || []).map((coup, idx) => (
                        <div
                          key={idx}
                          className={`border-2 border-dashed rounded-2xl p-4 bg-white space-y-2 relative overflow-hidden ${
                            activeCouponTab === 'available'
                              ? 'border-blue-200 hover:shadow-sm'
                              : 'border-slate-200 opacity-60'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-lg ${
                              activeCouponTab === 'available' ? 'bg-blue-600 text-white' : 'bg-slate-500 text-white'
                            }`}>
                              {activeCouponTab.toUpperCase()}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400">Min Order: {formatPrice(coup.minOrder)}</span>
                          </div>
                          <h4 className="text-sm font-black text-slate-850 tracking-wide">{coup.code}</h4>
                          <p className="text-xs font-extrabold text-indigo-600">{coup.discount}</p>
                          <p className="text-[11px] text-slate-500 leading-normal">{coup.details}</p>
                          <p className="text-[9px] font-bold text-slate-400">Expires: {new Date(coup.expiry).toLocaleDateString()}</p>
                          
                          {activeCouponTab === 'available' && (
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(coup.code);
                                addNotification(`Coupon code ${coup.code} copied to clipboard!`, 'success');
                              }}
                              className="text-[9px] font-black uppercase text-blue-650 hover:underline pt-2.5 block text-left"
                            >
                              Copy Coupon Code
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB: REWARDS */}
              {activeTab === 'rewards' && (
                <div className="space-y-6">
                  <h3 className="text-sm font-black text-slate-855 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2.5">
                    <Award className="w-4.5 h-4.5 text-blue-650" /> Rewards & Loyalty Zone
                  </h3>

                  {loadingRewards ? (
                    <div className="py-8 flex justify-center">
                      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Loyalty points card */}
                      <div className="p-6 rounded-3xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex flex-col justify-between h-36 shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-xl" />
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-amber-100 block">Active Points</span>
                            <span className="text-[9px] font-bold text-amber-205 mt-0.5 block">Membership Level: {rewardsData.tier}</span>
                          </div>
                          <Award className="w-6 h-6 text-amber-200" />
                        </div>
                        <div>
                          <p className="text-3xl font-black">{rewardsData.points} PTS</p>
                          <p className="text-[9px] font-bold text-amber-100 uppercase tracking-wider mt-1.5">Redeemable at Checkout payments</p>
                        </div>
                      </div>

                      {/* Point History & Achievements Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* History */}
                        <div className="space-y-3">
                          <h4 className="text-xs font-black uppercase text-slate-700 border-b pb-2">Points Ledger</h4>
                          <div className="divide-y divide-slate-100 border border-slate-150 rounded-2xl overflow-hidden text-xs max-h-56 overflow-y-auto no-scrollbar">
                            {(rewardsData.history || []).map((h, i) => (
                              <div key={i} className="p-3 bg-white flex justify-between items-center">
                                <div>
                                  <p className="font-bold text-slate-800">{h.action}</p>
                                  <p className="text-[9px] text-slate-400 mt-0.5">{new Date(h.date).toLocaleDateString()}</p>
                                </div>
                                <span className={`font-black ${h.type === 'earned' ? 'text-emerald-600' : 'text-rose-500'}`}>
                                  {h.type === 'earned' ? '+' : '-'}{h.points} PTS
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Achievements */}
                        <div className="space-y-3">
                          <h4 className="text-xs font-black uppercase text-slate-700 border-b pb-2">Achievements & Badges</h4>
                          <div className="grid grid-cols-2 gap-3">
                            {(rewardsData.achievements || []).map((ac, idx) => (
                              <div key={idx} className="p-3 border border-slate-150 bg-slate-50/20 rounded-xl text-center flex flex-col justify-center items-center">
                                <span className="text-2xl mb-1">{ac.badge}</span>
                                <h5 className="text-[10px] font-black text-slate-800 uppercase leading-none">{ac.title}</h5>
                                <p className="text-[9px] text-slate-450 mt-1 leading-normal">{ac.desc}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB: NOTIFICATIONS */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3 flex-wrap gap-2">
                    <h3 className="text-sm font-black text-slate-855 uppercase tracking-wider flex items-center gap-2.5">
                      <Bell className="w-4.5 h-4.5 text-blue-650" /> Inbox Notifications Control
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={clearAllNotifications}
                        className="text-[9px] bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 px-3 py-1.5 rounded-xl font-black uppercase"
                      >
                        Delete All
                      </button>
                    </div>
                  </div>

                  {dbNotifications.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50/50 border border-slate-150 rounded-3xl space-y-2">
                      <Bell className="w-8 h-8 text-slate-355 mx-auto" />
                      <p className="text-xs font-black uppercase text-slate-400">Inbox is empty</p>
                      <p className="text-[10px] text-slate-450">You will receive dynamic order statuses, price drops, and tracking alerts here.</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1 no-scrollbar">
                      {dbNotifications.map((notif) => (
                        <div
                          key={notif._id || notif.id}
                          className={`p-4 border rounded-2xl flex justify-between items-start gap-4 transition-all ${
                            notif.readStatus 
                              ? 'bg-slate-50/40 border-slate-200/60 opacity-75' 
                              : 'bg-white border-blue-150 shadow-sm ring-1 ring-blue-500/5'
                          }`}
                        >
                          <div className="flex-1 text-xs">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-extrabold text-slate-800">{notif.title}</h4>
                              {!notif.readStatus && (
                                <span className="bg-blue-600 text-white text-[7px] font-black uppercase px-1.5 py-0.5 rounded-md tracking-wider">NEW</span>
                              )}
                            </div>
                            <p className="text-slate-600 mt-1 font-semibold leading-relaxed">{notif.message}</p>
                            <span className="text-[9px] text-slate-400 mt-2 block font-medium">
                              {new Date(notif.createdAt || Date.now()).toLocaleString()}
                            </span>
                          </div>

                          <div className="flex gap-2 flex-shrink-0">
                            {!notif.readStatus && (
                              <button
                                onClick={() => markNotificationRead(notif._id)}
                                className="text-[9px] font-black uppercase text-blue-600 hover:underline"
                              >
                                Mark Read
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB: RETURNS */}
              {activeTab === 'returns' && (
                <div className="space-y-6">
                  <h3 className="text-sm font-black text-slate-850 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2.5">
                    <RefreshCw className="w-4.5 h-4.5 text-blue-650" /> Returns & Refunds Timeline
                  </h3>

                  {loadingReturns ? (
                    <div className="py-8 flex justify-center">
                      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : returnsData.length === 0 ? (
                    <div className="border border-slate-200 rounded-3xl p-12 text-center text-xs font-bold text-slate-400 bg-slate-50/50 space-y-3">
                      <RefreshCw className="w-8 h-8 text-slate-355 mx-auto" />
                      <p className="uppercase">No Active Return Requests</p>
                      <p className="text-[10px] font-semibold text-slate-400">If you wish to return a delivered item, go to the "My Orders" tab and select "Return / Help" on the specific order card.</p>
                      <button
                        onClick={() => handleTabChange('orders')}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase px-5 py-2.5 rounded-xl shadow-md"
                      >
                        View My Orders
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {returnsData.map((ret, index) => (
                        <div key={index} className="p-5 border border-slate-200 rounded-2xl bg-white space-y-4">
                          <div className="flex justify-between items-center border-b pb-3 flex-wrap gap-2 text-xs font-semibold text-slate-500">
                            <div>
                              <span className="text-[9px] text-slate-400 uppercase block">Return ID</span>
                              <span className="font-mono text-slate-800 font-bold select-all">#{ret._id}</span>
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-400 uppercase block">Refund Method</span>
                              <span className="text-slate-800">{ret.refundMethod}</span>
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-400 uppercase block">Expected Refund</span>
                              <span className="text-slate-800 font-black">{formatPrice(ret.refundAmount)}</span>
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-400 uppercase block">Status</span>
                              <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase ${
                                ret.status === 'Approved'
                                  ? 'bg-green-50 text-green-700 border border-green-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}>{ret.status}</span>
                            </div>
                          </div>

                          <div className="text-xs">
                            <p className="font-bold text-slate-700">Reason for return request: <span className="font-semibold text-slate-600 italic">"{ret.reason}"</span></p>
                            <p className="font-bold text-slate-700 mt-1.5">Returned items: <span className="font-semibold text-slate-600">{ret.items?.map(i => `${i.title} (${i.quantity} Unit)`).join(', ')}</span></p>
                          </div>

                          {/* Tracking Steps timeline */}
                          <div className="pt-2">
                            <div className="relative pl-6 space-y-4 before:absolute before:left-[7px] before:top-1.5 before:bottom-1.5 before:w-[2px] before:bg-slate-200">
                              <div className="relative">
                                <span className="absolute -left-[23px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white" />
                                <p className="text-[11px] font-black text-slate-800 uppercase leading-none">Return Requested</p>
                                <p className="text-[9.5px] text-slate-400 mt-0.5 font-semibold">Verification check in progress.</p>
                              </div>
                              <div className="relative">
                                <span className={`absolute -left-[23px] top-1 w-2.5 h-2.5 rounded-full border border-white ${
                                  ret.status === 'Approved' ? 'bg-emerald-500' : 'bg-slate-300'
                                }`} />
                                <p className={`text-[11px] font-black uppercase leading-none ${ret.status === 'Approved' ? 'text-slate-800' : 'text-slate-400'}`}>Approved & Refund Initiated</p>
                                <p className="text-[9.5px] text-slate-400 mt-0.5 font-semibold">Refund values dispatched to {ret.refundMethod}.</p>
                              </div>
                            </div>
                          </div>

                          <div className="pt-3 border-t flex justify-end gap-2 text-[10px] font-black uppercase">
                            <button
                              onClick={() => addNotification('Return details downloaded.', 'info')}
                              className="px-3 py-1.5 border rounded-lg hover:bg-slate-50"
                            >
                              Download Receipt
                            </button>
                            <button
                              onClick={() => {
                                setSelectedTicket({ subject: `Help regarding Return #${ret._id}`, messages: [] });
                                handleTabChange('support');
                              }}
                              className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border rounded-lg"
                            >
                              Contact Support
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB: GIFT CARDS */}
              {activeTab === 'giftcards' && (
                <div className="space-y-6">
                  <h3 className="text-sm font-black text-slate-850 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2.5">
                    <Gift className="w-4.5 h-4.5 text-blue-650" /> Gift Card Wallet
                  </h3>

                  {loadingGiftCards ? (
                    <div className="py-8 flex justify-center">
                      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                      
                      {/* Left: Balance card, Redeem form & Buy form */}
                      <div className="lg:col-span-2 space-y-6">
                        
                        {/* Balance display */}
                        <div className="p-6 rounded-3xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex flex-col justify-between h-36 shadow-lg relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-xl" />
                          <div className="flex justify-between items-start">
                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-100">Gift Card Balance</span>
                            <Gift className="w-6 h-6 text-indigo-200" />
                          </div>
                          <div>
                            <p className="text-3xl font-black">{formatPrice(giftCardsData.balance || 0)}</p>
                            <p className="text-[9px] font-bold text-indigo-100 uppercase tracking-wider mt-1.5">Redeem card PINs to increase wallet balance</p>
                          </div>
                        </div>

                        {/* Redeem form */}
                        <div className="border border-slate-200 rounded-2xl p-5 space-y-3.5 bg-slate-50/50">
                          <h4 className="text-xs font-black uppercase text-slate-800">Redeem Gift Card Voucher</h4>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Voucher Code (e.g. NEXAGIFT500)"
                              value={redeemCardCode}
                              onChange={(e) => setRedeemCardCode(e.target.value)}
                              className="bg-white border rounded-xl py-2 px-3 text-xs w-full focus:outline-none"
                            />
                            <button
                              onClick={async () => {
                                if (!redeemCardCode) return;
                                try {
                                  const res = await fetch(`${backendUrl}/api/giftcards/redeem`, {
                                    method: 'POST',
                                    headers: {
                                      'Content-Type': 'application/json',
                                      Authorization: `Bearer ${token}`
                                    },
                                    body: JSON.stringify({ code: redeemCardCode })
                                  });
                                  const data = await res.json();
                                  if (res.ok) {
                                    addNotification(data.message, 'success');
                                    setRedeemCardCode('');
                                    fetchGiftCards();
                                    fetchProfileData();
                                  } else {
                                    addNotification(data.message, 'error');
                                  }
                                } catch (err) {
                                  console.error(err);
                                }
                              }}
                              className="bg-blue-650 hover:bg-blue-755 text-white font-black text-[10px] uppercase px-5 py-2.5 rounded-xl flex-shrink-0"
                            >
                              Redeem Code
                            </button>
                          </div>
                        </div>

                        {/* Buy Form */}
                        <div className="border border-slate-200 rounded-2xl p-5 space-y-3.5 bg-white">
                          <h4 className="text-xs font-black uppercase text-slate-800">Purchase E-Gift Card</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <input
                              type="number"
                              placeholder="Card Value (₹)"
                              value={giftCardValue}
                              onChange={(e) => setGiftCardValue(e.target.value)}
                              className="border rounded-xl py-2 px-3 text-xs focus:outline-none"
                            />
                            <input
                              type="email"
                              placeholder="Recipient Email (optional)"
                              value={giftCardEmail}
                              onChange={(e) => setGiftCardEmail(e.target.value)}
                              className="border rounded-xl py-2 px-3 text-xs focus:outline-none"
                            />
                          </div>
                          <button
                            onClick={async () => {
                              if (!giftCardValue || isNaN(giftCardValue)) {
                                addNotification('Please enter a valid gift card amount', 'warning');
                                return;
                              }
                              try {
                                const res = await fetch(`${backendUrl}/api/giftcards/buy`, {
                                  method: 'POST',
                                  headers: {
                                    'Content-Type': 'application/json',
                                    Authorization: `Bearer ${token}`
                                  },
                                  body: JSON.stringify({ value: giftCardValue, email: giftCardEmail })
                                });
                                const data = await res.json();
                                if (res.ok) {
                                  addNotification(data.message, 'success');
                                  setGiftCardValue('');
                                  setGiftCardEmail('');
                                  fetchGiftCards();
                                }
                              } catch (err) {
                                console.error(err);
                              }
                            }}
                            className="w-full bg-blue-650 hover:bg-blue-755 text-white font-black text-[10px] uppercase py-2.5 rounded-xl transition-all"
                          >
                            Purchase Gift Card
                          </button>
                        </div>
                      </div>

                      {/* Right: History ledger lists */}
                      <div className="space-y-4">
                        <h4 className="text-xs font-black uppercase text-slate-700 border-b pb-2">Gift History Ledger</h4>
                        
                        <div className="divide-y divide-slate-100 border border-slate-150 rounded-2xl overflow-hidden text-xs max-h-72 overflow-y-auto no-scrollbar">
                          {/* Purchased list */}
                          {(giftCardsData.purchased || []).map((c, i) => (
                            <div key={'p_' + i} className="p-3 bg-white space-y-1">
                              <div className="flex justify-between items-center">
                                <span className="font-mono font-bold text-slate-805">{c.code}</span>
                                <span className="font-bold text-slate-800">{formatPrice(c.value)}</span>
                              </div>
                              <div className="flex justify-between items-center text-[9px] text-slate-400">
                                <span>Sent To: {c.sentTo}</span>
                                <span className={`px-1.5 py-0.5 rounded font-black uppercase ${
                                  c.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'
                                }`}>{c.status}</span>
                              </div>
                            </div>
                          ))}
                          
                          {/* Received list */}
                          {(giftCardsData.received || []).map((c, i) => (
                            <div key={'r_' + i} className="p-3 bg-slate-50/50 space-y-1">
                              <div className="flex justify-between items-center">
                                <span className="font-mono font-bold text-indigo-650">{c.code}</span>
                                <span className="font-bold text-slate-800">{formatPrice(c.value)}</span>
                              </div>
                              <div className="flex justify-between items-center text-[9px] text-slate-400">
                                <span>From: {c.sender}</span>
                                <span className="bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded font-black uppercase">{c.status}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB: REFER & EARN */}
              {activeTab === 'refer' && (
                <div className="space-y-6">
                  <h3 className="text-sm font-black text-slate-850 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2.5">
                    <Share2 className="w-4.5 h-4.5 text-blue-650" /> Refer & Earn Program
                  </h3>

                  {user?.referralCode ? (
                    <div className="p-5 border border-indigo-150 rounded-2xl bg-indigo-50/20 space-y-4">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-indigo-650" />
                        <div>
                          <h4 className="text-xs font-black uppercase text-slate-850">Referral Program Bonus</h4>
                          <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Invite friends and earn {formatPrice(50)} referral bonus on signup!</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 flex-wrap">
                        <div className="bg-white border border-slate-250 rounded-xl px-3.5 py-2.5 font-mono text-xs font-black text-indigo-650 tracking-wider">
                          {user.referralCode}
                        </div>
                        <button
                          onClick={handleCopyReferral}
                          className="p-2.5 bg-indigo-600 hover:bg-indigo-755 text-white rounded-xl shadow-sm transition-all flex items-center gap-1.5 text-[10px] font-black uppercase"
                          title="Copy code"
                        >
                          <Clipboard className="w-4 h-4" /> Copy Code
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">Program features temporarily restricted.</p>
                  )}
                </div>
              )}

              {/* TAB: SUPPORT & HELPDESK */}
              {activeTab === 'support' && (
                <div className="space-y-6">
                  <h3 className="text-sm font-black text-slate-805 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2.5">
                    <HelpCircle className="w-4.5 h-4.5 text-blue-650" /> Help Desk & Support
                  </h3>

                  {!selectedTicket ? (
                    <div className="space-y-6">
                      {/* Create ticket form */}
                      <form onSubmit={handleRaiseTicket} className="p-5 border border-slate-200 bg-white rounded-2xl space-y-3.5">
                        <h4 className="text-xs font-black uppercase text-slate-800">Raise a Help Ticket</h4>
                        <div className="space-y-3">
                          <input
                            type="text"
                            placeholder="Subject (e.g. Return request for Headphones)"
                            required
                            value={ticketSubject}
                            onChange={(e) => setTicketSubject(e.target.value)}
                            className="w-full border border-slate-200 bg-slate-50/50 rounded-xl py-2 px-3 text-xs focus:outline-none"
                          />
                          <textarea
                            rows="3"
                            placeholder="Describe your issue or question in detail..."
                            required
                            value={ticketDesc}
                            onChange={(e) => setTicketDesc(e.target.value)}
                            className="w-full border border-slate-200 bg-slate-50/50 rounded-xl py-2 px-3 text-xs focus:outline-none"
                          />
                        </div>
                        <button
                          type="submit"
                          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-md"
                        >
                          Raise Ticket
                        </button>
                      </form>

                      {/* Tickets List */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-black uppercase text-slate-800 border-b border-slate-100 pb-2">Active Tickets</h4>
                        {tickets.length === 0 ? (
                          <p className="text-center text-xs font-semibold text-slate-400 py-8 bg-slate-55/30 rounded-2xl border border-slate-200">No support tickets found.</p>
                        ) : (
                          tickets.map(ticket => (
                            <div
                              key={ticket._id}
                              onClick={() => setSelectedTicket(ticket)}
                              className="p-4 bg-white border border-slate-150 rounded-2xl hover:border-blue-300 hover:shadow-sm cursor-pointer transition-all flex justify-between items-center"
                            >
                              <div className="min-w-0">
                                <p className="text-xs font-extrabold text-slate-800 truncate">{ticket.subject}</p>
                                <p className="text-[10px] text-slate-450 mt-1 font-semibold">Raised: {new Date(ticket.createdAt).toLocaleDateString()} • {ticket.messages?.length || 0} messages</p>
                              </div>
                              <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider border ${
                                ticket.status === 'resolved'
                                  ? 'bg-green-50 border-green-155 text-green-700'
                                  : 'bg-amber-50 border-amber-155 text-amber-700'
                              }`}>
                                {ticket.status}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Ticket Thread Chat */
                    <div className="space-y-4">
                      <button
                        onClick={() => setSelectedTicket(null)}
                        className="text-xs text-blue-650 hover:underline font-extrabold uppercase flex items-center gap-1.5"
                      >
                        ← Back to Support
                      </button>

                      <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex justify-between items-center text-xs font-semibold text-slate-750">
                        <div>
                          <h4 className="font-extrabold text-slate-850">Subject: {selectedTicket.subject}</h4>
                          <p className="text-[10px] text-slate-450 mt-0.5 font-bold">Status: {selectedTicket.status ? selectedTicket.status.toUpperCase() : 'PENDING'}</p>
                        </div>
                      </div>

                      {/* Chat Messages */}
                      <div className="border border-slate-200 rounded-2xl p-4 bg-white h-64 overflow-y-auto space-y-3 pr-1.5 no-scrollbar">
                        {selectedTicket.messages?.map((msg, idx) => (
                          <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`p-3 rounded-2xl text-xs max-w-[80%] ${
                              msg.sender === 'user'
                                ? 'bg-blue-600 text-white rounded-tr-none'
                                : 'bg-slate-100 text-slate-805 border border-slate-200 rounded-tl-none'
                            }`}>
                              <p className="font-medium leading-relaxed">{msg.text}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Send Reply Form */}
                      <form onSubmit={handleTicketReply} className="flex gap-2 bg-slate-55 p-2.5 border border-slate-200 rounded-2xl">
                        <input
                          type="text"
                          placeholder="Type your reply message..."
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          className="flex-1 px-3 py-2 text-xs border border-slate-200 bg-white rounded-xl focus:outline-none"
                        />
                        <button
                          type="submit"
                          disabled={!replyText.trim()}
                          className="p-2.5 bg-blue-605 text-white rounded-xl hover:bg-blue-755 shadow-sm transition-colors disabled:opacity-40"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              )}

              {/* TAB: PRIVACY SETTINGS */}
              {activeTab === 'privacy' && (
                <div className="space-y-6">
                  <h3 className="text-sm font-black text-slate-855 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2.5">
                    <Lock className="w-4.5 h-4.5 text-blue-650" /> Privacy & Data Configurations
                  </h3>

                  <div className="space-y-4 text-xs font-semibold text-slate-655">
                    <div className="flex justify-between items-center p-3 border rounded-2xl bg-white border-slate-155">
                      <div>
                        <p className="font-bold text-slate-805">Cookie Consent Preferences</p>
                        <p className="text-[10px] text-slate-450">Allow marketing trackers to customize recommend products.</p>
                      </div>
                      <input type="checkbox" defaultChecked className="rounded text-blue-655 w-4 h-4" />
                    </div>

                    <button
                      onClick={() => addNotification('Data compilation started. JSON link sent in verified email.', 'success')}
                      className="bg-blue-650 hover:bg-blue-750 text-white font-black text-[10px] uppercase px-5 py-2.5 rounded-xl shadow-sm transition-all"
                    >
                      Download My Data (JSON)
                    </button>
                  </div>
                </div>
              )}

              {/* TAB: LANGUAGE */}
              {activeTab === 'language' && (
                <div className="space-y-6">
                  <h3 className="text-sm font-black text-slate-850 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2.5">
                    <Globe className="w-4.5 h-4.5 text-blue-650" /> Language & Regional Settings
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                    <div className="space-y-1.5">
                      <label className="text-slate-650 block">Default Language</label>
                      <select className="w-full border rounded-xl py-2 px-3 focus:outline-none">
                        <option>English (US)</option>
                        <option>Español</option>
                        <option>Hindi (India)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-slate-650 block">Display Currency</label>
                      <select className="w-full border rounded-xl py-2 px-3 focus:outline-none">
                        <option>USD ($)</option>
                        <option>INR (₹)</option>
                        <option>EUR (€)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: SETTINGS */}
              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <h3 className="text-sm font-black text-slate-855 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2.5">
                    <Settings className="w-4.5 h-4.5 text-blue-650" /> Preferences Settings
                  </h3>

                  <div className="space-y-4 text-xs font-semibold text-slate-655">
                    <div className="flex justify-between items-center p-3 border rounded-2xl bg-white border-slate-155">
                      <div>
                        <p className="font-bold text-slate-805">Developer Simulation Sandbox mode</p>
                        <p className="text-[10px] text-slate-450">Toggles live state feedback to console log monitors.</p>
                      </div>
                      <input type="checkbox" defaultChecked className="rounded text-blue-655 w-4 h-4" />
                    </div>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
