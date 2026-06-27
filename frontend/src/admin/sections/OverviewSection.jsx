import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign, ShoppingBag, Users, Package,
  TrendingUp, Clock, CheckCircle, Plus, Eye, 
  RefreshCw, Sliders, ChevronUp, ChevronDown, 
  Check, Sparkles, Brain, MapPin, Activity, HelpCircle
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend, ComposedChart, Line
} from 'recharts';
import { useApp } from '../../context/AppContext';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import { StatCardSkeleton } from '../components/SkeletonLoader';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl shadow-lg px-3 py-2">
        <p className="text-[10px] font-semibold text-slate-500 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-xs font-bold" style={{ color: p.color || '#2563EB' }}>
            {p.name}: {p.name?.includes('Revenue') || p.name?.includes('Sales') || p.name?.includes('Forecast') ? `$${p.value?.toLocaleString()}` : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const PIE_COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444'];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatDate() {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

export default function OverviewSection({ onNavigate }) {
  const { 
    token, user, backendUrl, formatPrice, adminStore, 
    liveOrders, setLiveOrders, auditLogs, addAuditLog, socket
  } = useApp();

  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Theme support local variables (for map/insigts)
  const isDarkTheme = localStorage.getItem('admin_theme') === 'dark';

  // Customizable KPI Cards Settings
  const [showKPICustomizer, setShowKPICustomizer] = useState(false);
  const [revenueTarget, setRevenueTarget] = useState(25000);
  const [ordersTarget, setOrdersTarget] = useState(80);
  const [kpiCards, setKpiCards] = useState(() => {
    try {
      const saved = localStorage.getItem('admin_kpi_cards');
      return saved ? JSON.parse(saved) : [
        { id: 'revenue', label: 'Total Revenue', visible: true },
        { id: 'orders', label: 'Total Orders', visible: true },
        { id: 'customers', label: 'Total Customers', visible: true },
        { id: 'products', label: 'Products Listed', visible: true },
        { id: 'aov', label: 'Average Order Value', visible: true },
        { id: 'profit', label: 'Profit Margin (Est)', visible: false }
      ];
    } catch {
      return [];
    }
  });

  // Widget Layout Settings
  const [customizeMode, setCustomizeMode] = useState(false);
  const [dashboardLayout, setDashboardLayout] = useState(() => {
    try {
      const saved = localStorage.getItem('admin_dashboard_layout');
      return saved ? JSON.parse(saved) : [
        { id: 'kpi_cards', label: 'KPI Performance Cards', visible: true },
        { id: 'ai_insights', label: 'AI Insights & Forecasts', visible: true },
        { id: 'live_feed', label: 'Live Order Activity Feed', visible: true },
        { id: 'revenue_trend', label: 'Revenue Trends & Charts', visible: true },
        { id: 'activity_logs', label: 'Recent System Audit Timeline', visible: true },
        { id: 'low_stock', label: 'Inventory Critical Alerts', visible: true }
      ];
    } catch {
      return [];
    }
  });

  // Map tooltip state
  const [activeMapHub, setActiveMapHub] = useState(null);

  // Fetch dashboard statistics
  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, ordersRes, usersRes, productsRes] = await Promise.all([
        fetch(`${backendUrl}/api/orders/analytics/stats`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${backendUrl}/api/orders`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${backendUrl}/api/auth/users`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${backendUrl}/api/products`),
      ]);
      const [statsData, ordersData, usersData, productsData] = await Promise.all([
        statsRes.json(), ordersRes.json(), usersRes.json(), productsRes.json()
      ]);
      if (statsRes.ok) setStats(statsData);
      if (ordersRes.ok) setOrders(ordersData);
      if (usersRes.ok) setUsers(usersData);
      if (productsRes.ok) setProducts(productsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token, backendUrl]);

  // Save layout settings
  const toggleWidgetVisibility = (id) => {
    setDashboardLayout(prev => {
      const next = prev.map(w => w.id === id ? { ...w, visible: !w.visible } : w);
      localStorage.setItem('admin_dashboard_layout', JSON.stringify(next));
      return next;
    });
  };

  const moveWidget = (index, direction) => {
    setDashboardLayout(prev => {
      const next = [...prev];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex >= 0 && targetIndex < next.length) {
        const temp = next[index];
        next[index] = next[targetIndex];
        next[targetIndex] = temp;
        localStorage.setItem('admin_dashboard_layout', JSON.stringify(next));
        addAuditLog('Widget Rearranged', `Moved dashboard widget "${temp.label}" ${direction}.`, 'settings');
      }
      return next;
    });
  };

  // KPI card toggling
  const toggleKPICard = (id) => {
    setKpiCards(prev => {
      const next = prev.map(c => c.id === id ? { ...c, visible: !c.visible } : c);
      localStorage.setItem('admin_kpi_cards', JSON.stringify(next));
      return next;
    });
  };

  // Simulate socket order placement
  const handleSimulateOrder = () => {
    const names = ['Ethan Hunt', 'Sophia Loren', 'Robert Chen', 'Grace Hopper', 'Yuki Tanaka', 'Liam Neeson'];
    const productsList = [
      { id: 'sim_p1', title: 'Holographic Nexa Headphones', price: 149.00 },
      { id: 'sim_p2', title: 'Modular RGB Lights', price: 99.50 },
      { id: 'sim_p3', title: 'EcoVibe Dropshoulder Hoodie', price: 79.99 },
      { id: 'sim_p4', title: 'Supreme Keyboard V2', price: 120.00 }
    ];
    const countries = ['USA', 'India', 'Europe', 'Japan', 'UK'];

    const chosenName = names[Math.floor(Math.random() * names.length)];
    const chosenProduct = productsList[Math.floor(Math.random() * productsList.length)];
    const chosenCountry = countries[Math.floor(Math.random() * countries.length)];
    const amount = chosenProduct.price;

    const mockOrderPayload = {
      _id: `ord_sim_${Math.random().toString(36).substring(2, 7)}`,
      userId: { name: chosenName, email: `${chosenName.toLowerCase().replace(' ', '')}@example.com` },
      items: [
        { productId: chosenProduct.id, title: chosenProduct.title, quantity: 1, price: amount }
      ],
      totalAmount: amount,
      shippingAddress: { country: chosenCountry, city: 'Simulated Hub' },
      orderStatus: 'Processing',
      createdAt: new Date().toISOString()
    };

    // Emit via client socket if connected, otherwise update state locally
    if (socket) {
      socket.emit('newOrder', mockOrderPayload);
    } else {
      // Local fallback logic
      const store = localStorage.getItem('admin_store') || 'USA';
      const symbol = store === 'India' ? '₹' : store === 'Europe' ? '€' : '$';
      const factor = store === 'India' ? 83 : store === 'Europe' ? 0.92 : 1;
      const formatted = `${symbol}${Math.round(amount * factor).toLocaleString()}`;
      addNotification(`[Mock] New order placed by ${chosenName}! Total: ${formatted}`, 'success');
      setLiveOrders(prev => [mockOrderPayload, ...prev].slice(0, 50));
      addAuditLog('New Order Simulated', `Simulated order for ${formatted} from ${chosenName} (${chosenCountry}).`, 'order');
    }
  };

  // Base Data preparation
  const displayStats = {
    totalRevenue: stats?.totalRevenue || 18750,
    totalOrdersCount: stats?.totalOrdersCount || 65,
    dailyRevenue: stats?.dailyRevenue?.length > 0 ? stats.dailyRevenue : [
      { _id: 'Mon', revenue: 1420, count: 12 },
      { _id: 'Tue', revenue: 2180, count: 18 },
      { _id: 'Wed', revenue: 1850, count: 15 },
      { _id: 'Thu', revenue: 2900, count: 24 },
      { _id: 'Fri', revenue: 2400, count: 20 },
      { _id: 'Sat', revenue: 3800, count: 32 },
      { _id: 'Sun', revenue: 4200, count: 35 },
    ],
    topProducts: stats?.topProducts?.length > 0 ? stats.topProducts : [
      { title: 'Holographic Nexa Headphones', quantitySold: 28, totalSales: 4172 },
      { title: 'Supreme Mobiles V5', quantitySold: 22, totalSales: 3850 },
      { title: 'Luminous RGB modular lights', quantitySold: 19, totalSales: 2831 },
      { title: 'Supreme Keyboards V2', quantitySold: 15, totalSales: 1800 },
      { title: 'EcoVibe Dropshoulder Hoodies', quantitySold: 12, totalSales: 960 },
    ]
  };

  const displayOrders = orders.length > 0 ? orders : [
    {
      _id: 'ord_mock1',
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      totalAmount: 149.00,
      orderStatus: 'Processing',
      paymentStatus: 'paid',
      userId: { name: 'Sarah Jenkins', email: 'sarah@example.com' },
      items: [ { productId: 'p1', title: 'Modular RGB Lights', quantity: 1 } ]
    },
    {
      _id: 'ord_mock2',
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      totalAmount: 299.99,
      orderStatus: 'Shipped',
      paymentStatus: 'paid',
      userId: { name: 'Alex Rivera', email: 'alex@example.com' },
      items: [ { productId: 'p2', title: 'Holographic Headphones', quantity: 1 } ]
    },
    {
      _id: 'ord_mock3',
      createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
      totalAmount: 89.50,
      orderStatus: 'Delivered',
      paymentStatus: 'paid',
      userId: { name: 'Emily Chen', email: 'emily@example.com' },
      items: [ { productId: 'p3', title: 'EcoVibe Linen Hoodie', quantity: 1 } ]
    }
  ];

  // Merge simulated order logs into orders list
  const mergedOrders = [...liveOrders, ...displayOrders];
  const recentOrders = mergedOrders.slice(0, 5);
  const lowStockProducts = products.filter(p => p.inventoryCount <= 5).slice(0, 4);

  const orderStatusData = [
    { name: 'Processing', value: mergedOrders.filter(o => o.orderStatus === 'Processing').length },
    { name: 'Shipped', value: mergedOrders.filter(o => o.orderStatus === 'Shipped').length },
    { name: 'Delivered', value: mergedOrders.filter(o => o.orderStatus === 'Delivered').length },
  ].filter(d => d.value > 0);

  // Revenue Forecaster composed data
  const lastActual = displayStats.dailyRevenue[displayStats.dailyRevenue.length - 1];
  const forecastData = displayStats.dailyRevenue.map((d, idx) => ({
    name: d._id,
    Revenue: d.revenue,
    Forecast: idx === displayStats.dailyRevenue.length - 1 ? d.revenue : null
  }));

  // Add 3 days of AI projection
  forecastData.push(
    { name: 'Next Mon', Revenue: null, Forecast: Math.round((lastActual?.revenue || 3000) * 1.09) },
    { name: 'Next Tue', Revenue: null, Forecast: Math.round((lastActual?.revenue || 3000) * 1.16) },
    { name: 'Next Wed', Revenue: null, Forecast: Math.round((lastActual?.revenue || 3000) * 1.24) }
  );

  // World map order coordinates & tooltips
  const MAP_HUBS = [
    { id: 'ny', label: 'New York (USA)', cx: '28%', cy: '36%', ordersCount: 14, salesVal: 2450 },
    { id: 'ld', label: 'London (UK)', cx: '47%', cy: '31%', ordersCount: 9, salesVal: 1540 },
    { id: 'ber', label: 'Berlin (Europe)', cx: '51%', cy: '29%', ordersCount: 12, salesVal: 1890 },
    { id: 'mb', label: 'Mumbai (India)', cx: '68%', cy: '48%', ordersCount: 22, salesVal: 3820 },
    { id: 'tok', label: 'Tokyo (Japan)', cx: '84%', cy: '38%', ordersCount: 8, salesVal: 1120 }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Hero & Customizer actions */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{formatDate()}</p>
          <h2 className="text-xl font-bold text-slate-800 mt-0.5">
            {getGreeting()}, {user?.name?.split(' ')[0]}! 👋
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowKPICustomizer(true)}
            className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold shadow-sm transition-all"
          >
            <Sliders className="w-3.5 h-3.5" />
            KPI Targets
          </button>

          <button
            onClick={() => setCustomizeMode(v => !v)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all border
              ${customizeMode 
                ? 'bg-blue-600 text-white border-blue-600' 
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
          >
            <Plus className="w-3.5 h-3.5" />
            {customizeMode ? 'Save Layout' : 'Customize Widgets'}
          </button>
        </div>
      </div>

      {/* Customizable Dashboard Layout Renderer */}
      {dashboardLayout.map((widget, widgetIdx) => {
        // Hide if not visible and not in custom mode
        if (!widget.visible && !customizeMode) return null;

        return (
          <div 
            key={widget.id} 
            className={`relative transition-all duration-150 ${!widget.visible ? 'opacity-40 border-2 border-dashed border-slate-200 rounded-2xl p-4' : ''}`}
          >
            {/* Widget layout controls overlay */}
            {customizeMode && (
              <div className="absolute top-2 right-2 bg-slate-900/90 text-white rounded-xl px-2.5 py-1.5 z-40 flex items-center gap-3 text-[11px] shadow-xl">
                <span className="font-bold border-r border-slate-700 pr-2.5">{widget.label}</span>
                <div className="flex items-center gap-1">
                  <button 
                    disabled={widgetIdx === 0} 
                    onClick={() => moveWidget(widgetIdx, 'up')}
                    className="p-1 hover:bg-slate-700 rounded disabled:opacity-30"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    disabled={widgetIdx === dashboardLayout.length - 1} 
                    onClick={() => moveWidget(widgetIdx, 'down')}
                    className="p-1 hover:bg-slate-700 rounded disabled:opacity-30"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>
                <button
                  onClick={() => toggleWidgetVisibility(widget.id)}
                  className="bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded text-[10px]"
                >
                  {widget.visible ? 'Hide' : 'Show'}
                </button>
              </div>
            )}

            {/* Render actual widget contents */}
            {widget.visible && (
              <>
                {/* 1. KPI Cards Widget */}
                {widget.id === 'kpi_cards' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {loading ? (
                      Array.from({ length: 3 }).map((_, i) => <StatCardSkeleton key={i} />)
                    ) : (
                      <>
                        {kpiCards.find(c => c.id === 'revenue')?.visible && (
                          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Revenue Status</p>
                                <p className="text-2xl font-extrabold text-slate-900 mt-1">{formatPrice(displayStats.totalRevenue)}</p>
                              </div>
                              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                                <DollarSign className="w-4.5 h-4.5" />
                              </div>
                            </div>
                            <div className="space-y-1.5">
                              <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                                <span>Monthly Target</span>
                                <span>{Math.min(100, Math.round((displayStats.totalRevenue / revenueTarget) * 100))}% reached</span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-blue-600 rounded-full transition-all duration-500" 
                                  style={{ width: `${Math.min(100, (displayStats.totalRevenue / revenueTarget) * 100)}%` }}
                                />
                              </div>
                              <p className="text-[9px] text-slate-400 font-medium">Goal: {formatPrice(revenueTarget)}</p>
                            </div>
                          </div>
                        )}

                        {kpiCards.find(c => c.id === 'orders')?.visible && (
                          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Orders</p>
                                <p className="text-2xl font-extrabold text-slate-900 mt-1">{displayStats.totalOrdersCount}</p>
                              </div>
                              <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600">
                                <ShoppingBag className="w-4.5 h-4.5" />
                              </div>
                            </div>
                            <div className="space-y-1.5">
                              <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                                <span>Conversion Target</span>
                                <span>{Math.min(100, Math.round((displayStats.totalOrdersCount / ordersTarget) * 100))}% reached</span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-violet-600 rounded-full transition-all duration-500" 
                                  style={{ width: `${Math.min(100, (displayStats.totalOrdersCount / ordersTarget) * 100)}%` }}
                                />
                              </div>
                              <p className="text-[9px] text-slate-400 font-medium">Goal: {ordersTarget} Orders</p>
                            </div>
                          </div>
                        )}

                        {kpiCards.find(c => c.id === 'customers')?.visible && (
                          <StatCard
                            title="Total Customers"
                            value={users?.length || 42}
                            trend={5}
                            trendLabel="Active accounts"
                            icon={Users}
                            iconBg="bg-emerald-50"
                            iconColor="text-emerald-600"
                            gradient="bg-emerald-400"
                          />
                        )}

                        {kpiCards.find(c => c.id === 'products')?.visible && (
                          <StatCard
                            title="Products Listed"
                            value={products?.length || 15}
                            trendLabel={`${lowStockProducts.length} low stock`}
                            icon={Package}
                            iconBg="bg-amber-50"
                            iconColor="text-amber-600"
                            gradient="bg-amber-400"
                          />
                        )}

                        {kpiCards.find(c => c.id === 'aov')?.visible && (
                          <StatCard
                            title="Average Order Value"
                            value={Math.round(displayStats.totalRevenue / (displayStats.totalOrdersCount || 1))}
                            prefix={adminStore === 'India' ? '₹' : adminStore === 'Europe' ? '€' : '$'}
                            decimals={0}
                            trend={4}
                            trendLabel="Increase in cart sizes"
                            icon={TrendingUp}
                            iconBg="bg-rose-50"
                            iconColor="text-rose-600"
                            gradient="bg-rose-400"
                          />
                        )}

                        {kpiCards.find(c => c.id === 'profit')?.visible && (
                          <StatCard
                            title="Profit Margin"
                            value={68}
                            suffix="%"
                            trend={1}
                            trendLabel="Healthy margins"
                            icon={TrendingUp}
                            iconBg="bg-teal-50"
                            iconColor="text-teal-600"
                            gradient="bg-teal-400"
                          />
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* 2. AI Sales Insights & Forecasting Widget */}
                {widget.id === 'ai_insights' && (
                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                    {/* Forecast Chart */}
                    <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <Brain className="w-4 h-4 text-violet-600 animate-pulse" />
                            <h3 className="text-sm font-semibold text-slate-900">AI Revenue Forecasting</h3>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">7-day historical trend vs next 3 days AI projection</p>
                        </div>
                        <div className="flex gap-4 text-[10px] font-semibold text-slate-500">
                          <span className="flex items-center gap-1.5"><span className="w-2.5 h-0.5 bg-blue-600 inline-block" /> Actual Sales</span>
                          <span className="flex items-center gap-1.5"><span className="w-2.5 h-0.5 border-t border-dashed border-violet-600 inline-block" /> AI Projection</span>
                        </div>
                      </div>

                      <div className="h-56 -mx-2">
                        <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart data={forecastData} margin={{ left: -20, right: 8, top: 4, bottom: 0 }}>
                            <defs>
                              <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#2563EB" stopOpacity={0.12} />
                                <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="4 4" stroke="#f1f5f9" vertical={false} />
                            <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area
                              type="monotone"
                              dataKey="Revenue"
                              name="Actual Revenue"
                              stroke="#2563EB"
                              strokeWidth={2.5}
                              fill="url(#actualGrad)"
                              dot={{ r: 3, fill: '#2563EB', strokeWidth: 0 }}
                              activeDot={{ r: 5, fill: '#2563EB', stroke: '#fff', strokeWidth: 2 }}
                            />
                            <Line
                              type="monotone"
                              dataKey="Forecast"
                              name="Projected Forecast"
                              stroke="#7C3AED"
                              strokeWidth={2.5}
                              strokeDasharray="6 6"
                              dot={{ r: 4, fill: '#7C3AED', strokeWidth: 0 }}
                              activeDot={{ r: 5, fill: '#7C3AED', stroke: '#fff', strokeWidth: 2 }}
                            />
                          </ComposedChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* AI Insights list */}
                    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
                      <div className="flex items-center gap-1.5 border-b border-slate-50 pb-3">
                        <Sparkles className="w-4.5 h-4.5 text-amber-500" fill="rgba(245, 158, 11, 0.2)" />
                        <div>
                          <h3 className="text-sm font-semibold text-slate-900">AI Sales Insights</h3>
                          <p className="text-[10px] text-slate-400">Natural language models summary</p>
                        </div>
                      </div>

                      <div className="space-y-3.5">
                        <div className="bg-slate-50 border border-slate-150 rounded-xl p-3 text-[11px] leading-relaxed relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-1 h-full bg-violet-600" />
                          <p className="font-bold text-slate-800">Peak hour optimization</p>
                          <p className="text-slate-600 mt-1">Purchasing density spikes on Fridays between 6 PM - 9 PM. We recommend scheduling email checkout prompts at 5:30 PM.</p>
                        </div>

                        <div className="bg-slate-50 border border-slate-150 rounded-xl p-3 text-[11px] leading-relaxed relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
                          <p className="font-bold text-slate-800">High retention category</p>
                          <p className="text-slate-600 mt-1">"Electronics" catalog shows a 34% higher repeat sales frequency. Target these users with coupons/promos.</p>
                        </div>

                        <div className="bg-slate-50 border border-slate-150 rounded-xl p-3 text-[11px] leading-relaxed relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
                          <p className="font-bold text-slate-800">Abandonment Recovery</p>
                          <p className="text-slate-600 mt-1">Cart dropoffs are at 32%. Deploying follow-up coupons could recover roughly $2,100 in weekly sales.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Live Order Feed & Interactive SVG Map Widget */}
                {widget.id === 'live_feed' && (
                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                    {/* Live Feed list */}
                    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex flex-col justify-between h-96">
                      <div className="space-y-4 flex-grow overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between border-b border-slate-50 pb-3 flex-shrink-0">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping flex-shrink-0" />
                              <h3 className="text-sm font-semibold text-slate-900">Live Order Feed</h3>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-0.5">Real-time store orders ticketing</p>
                          </div>
                          
                          <button
                            onClick={handleSimulateOrder}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg shadow transition-colors flex-shrink-0"
                          >
                            Simulate Order
                          </button>
                        </div>

                        <div className="flex-1 overflow-y-auto divide-y divide-slate-50 pr-1 no-scrollbar">
                          {liveOrders.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center text-slate-450 space-y-2 py-10">
                              <ShoppingBag className="w-8 h-8 text-slate-300" />
                              <p className="text-xs font-semibold text-slate-500">Listening to events...</p>
                              <p className="text-[10px] text-slate-450 max-w-[200px] leading-relaxed">Place an order or click "Simulate Order" above to watch logs populate</p>
                            </div>
                          ) : (
                            <AnimatePresence initial={false}>
                              {liveOrders.map((o) => (
                                <motion.div
                                  key={o._id}
                                  initial={{ opacity: 0, height: 0, y: -20 }}
                                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.25 }}
                                  className="py-2.5 flex items-center justify-between gap-3 text-xs"
                                >
                                  <div className="min-w-0">
                                    <p className="font-bold text-slate-800 truncate">{o.userId?.name || 'Customer'}</p>
                                    <p className="text-[10px] text-slate-400 mt-0.5 truncate">{o.items?.[0]?.title || 'Store checkout'}</p>
                                  </div>
                                  <div className="text-right flex-shrink-0">
                                    <span className="font-extrabold text-blue-600">{formatPrice(o.totalAmount)}</span>
                                    <p className="text-[9px] text-emerald-600 font-semibold uppercase tracking-wider mt-0.5">Live ticket</p>
                                  </div>
                                </motion.div>
                              ))}
                            </AnimatePresence>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* SVG Interactive Map */}
                    <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex flex-col justify-between h-96 relative">
                      <div className="mb-2">
                        <div className="flex items-center gap-1.5">
                          <Activity className="w-4 h-4 text-blue-600" />
                          <h3 className="text-sm font-semibold text-slate-900">Geographical Hub Pulses</h3>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">Hover active regions to verify real-time sales contributions</p>
                      </div>

                      {/* Map Container */}
                      <div className="flex-grow bg-slate-50 border border-slate-150 rounded-2xl overflow-hidden relative flex items-center justify-center">
                        <svg className="w-full h-full opacity-30 pointer-events-none" viewBox="0 0 1000 500" fill="currentColor">
                          {/* Very basic stylized world continents path block representations */}
                          <path d="M150 150h100v80H150zm200 120h120v100H350zm300-180h220v150H650zM450 120h80v60h-80zm30 180h80v60H480z" fill="#94A3B8" />
                          <circle cx="280" cy="180" r="100" fill="#CBD5E1" />
                          <circle cx="680" cy="220" r="120" fill="#CBD5E1" />
                          <circle cx="500" cy="150" r="80" fill="#CBD5E1" />
                        </svg>

                        {/* Interactive Markers overlay */}
                        {MAP_HUBS.map((hub) => (
                          <div
                            key={hub.id}
                            style={{ left: hub.cx, top: hub.cy }}
                            className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group"
                            onMouseEnter={() => setActiveMapHub(hub)}
                            onMouseLeave={() => setActiveMapHub(null)}
                          >
                            <span className="absolute inline-flex h-4 w-4 rounded-full bg-blue-400 opacity-75 animate-ping" />
                            <div className="w-3.5 h-3.5 rounded-full bg-blue-600 border-2 border-white shadow flex items-center justify-center">
                              <MapPin className="w-1.5 h-1.5 text-white" />
                            </div>
                          </div>
                        ))}

                        {/* World Map Hover Tooltip Overlay */}
                        <AnimatePresence>
                          {activeMapHub && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.96, y: 10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.96 }}
                              className="absolute top-4 left-4 bg-slate-900/95 text-white rounded-xl p-3 border border-slate-800 shadow-2xl z-30 space-y-1 text-xs"
                            >
                              <p className="font-bold text-blue-400">{activeMapHub.label}</p>
                              <div className="flex justify-between gap-6 mt-1 text-[11px] text-slate-350">
                                <span>Contribution Sales</span>
                                <span className="font-bold text-white">{formatPrice(activeMapHub.salesVal)}</span>
                              </div>
                              <div className="flex justify-between gap-6 text-[11px] text-slate-350">
                                <span>Hub Orders</span>
                                <span className="font-bold text-white">{activeMapHub.ordersCount}</span>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Revenue Trend Chart Widget (Default charts rendered inside layout widgets) */}
                {widget.id === 'revenue_trend' && (
                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                    {/* Revenue Area Chart */}
                    <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-sm font-semibold text-slate-900">Revenue Trend</h3>
                          <p className="text-[11px] text-slate-400 mt-0.5">Past 7 days performance</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-[#2563EB]" />
                          <span className="text-[10px] text-slate-500 font-medium">Revenue</span>
                        </div>
                      </div>
                      {displayStats.dailyRevenue?.length > 0 ? (
                        <div className="h-52 -mx-1">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={displayStats.dailyRevenue} margin={{ left: -20, right: 8, top: 4, bottom: 0 }}>
                              <defs>
                                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="4 4" stroke="#f1f5f9" vertical={false} />
                              <XAxis dataKey="_id" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                              <Tooltip content={<CustomTooltip />} />
                              <Area
                                type="monotone"
                                dataKey="revenue"
                                name="Revenue"
                                stroke="#2563EB"
                                strokeWidth={2.5}
                                fill="url(#revenueGrad)"
                                dot={{ r: 3, fill: '#2563EB', strokeWidth: 0 }}
                                activeDot={{ r: 5, fill: '#2563EB', stroke: '#fff', strokeWidth: 2 }}
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <div className="h-52 flex items-center justify-center text-slate-300 text-sm font-medium">
                          No revenue data yet
                        </div>
                      )}
                    </div>

                    {/* Order Status Pie */}
                    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                      <div className="mb-4">
                        <h3 className="text-sm font-semibold text-slate-900">Order Status</h3>
                        <p className="text-[11px] text-slate-400 mt-0.5">Distribution by status</p>
                      </div>
                      {orderStatusData.length > 0 ? (
                        <div className="h-52">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={orderStatusData}
                                cx="50%"
                                cy="45%"
                                innerRadius={52}
                                outerRadius={74}
                                dataKey="value"
                                strokeWidth={2}
                                stroke="white"
                              >
                                {orderStatusData.map((entry, index) => (
                                  <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip content={<CustomTooltip />} />
                              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 10 }} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <div className="h-52 flex items-center justify-center text-slate-300 text-sm">No orders yet</div>
                      )}
                    </div>
                  </div>
                )}

                {/* 5. System Logs timeline Widget */}
                {widget.id === 'activity_logs' && (
                  <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Activity className="w-4 h-4 text-blue-600 animate-hover-spin" />
                        <h3 className="text-sm font-semibold text-slate-900">Recent Audit logs & Activity timeline</h3>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">System operations trace persistence</p>
                    </div>

                    <div className="max-h-56 overflow-y-auto space-y-3.5 pr-2 no-scrollbar">
                      {auditLogs.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-6">No audit records found.</p>
                      ) : (
                        auditLogs.slice(0, 10).map((log) => (
                          <div key={log.id} className="flex gap-3 text-xs leading-relaxed">
                            <div className="flex flex-col items-center flex-shrink-0 mt-1">
                              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 border-2 border-white shadow flex-shrink-0" />
                              <span className="w-0.5 h-full bg-slate-100 flex-grow mt-1" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-4">
                                <p className="font-bold text-slate-800">{log.action}</p>
                                <span className="text-[10px] text-slate-400 font-semibold">
                                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-550 mt-0.5">{log.detail}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* 6. Inventory Critical Alerts Widget */}
                {widget.id === 'low_stock' && lowStockProducts.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-amber-100 flex items-center justify-center">
                          <Package className="w-3.5 h-3.5 text-amber-600" />
                        </div>
                        <p className="text-xs font-semibold text-amber-800">Critical Stock Alerts</p>
                      </div>
                      <button onClick={() => onNavigate('products')} className="text-[10px] text-amber-700 font-medium hover:underline">
                        Manage inventory →
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {lowStockProducts.map(p => (
                        <div key={p._id} className="bg-white rounded-xl border border-amber-100 p-2.5 flex items-center gap-2">
                          <div className="min-w-0">
                            <p className="text-[10px] font-semibold text-slate-850 truncate">{p.title}</p>
                            <p className="text-[9px] font-extrabold text-amber-600">{p.inventoryCount} left</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        );
      })}

      {/* Static recent orders & top products grid (under layout items or static) */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Recent Orders list */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
            <h3 className="text-sm font-semibold text-slate-900">Recent Orders</h3>
            <button
              onClick={() => onNavigate('orders')}
              className="text-[11px] text-blue-600 font-medium hover:text-blue-700 flex items-center gap-1"
            >
              View all
            </button>
          </div>
          <div className="divide-y divide-slate-50">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="px-5 py-3 flex items-center gap-3 animate-pulse" />
              ))
            ) : recentOrders.length === 0 ? (
              <div className="py-10 text-center text-xs text-slate-400">No orders yet</div>
            ) : (
              recentOrders.map(order => (
                <div
                  key={order._id}
                  className="flex items-center gap-3 px-5 py-3 text-xs"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <ShoppingBag className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 truncate">
                      {order._id.startsWith('ord_sim_') 
                        ? `#${order._id.slice(-5).toUpperCase()}` 
                        : (order._id.startsWith('ord_mock') ? `#${order._id.slice(-5).toUpperCase()}` : `#${order._id.slice(-8).toUpperCase()}`)}
                    </p>
                    <p className="text-[10px] text-slate-450 truncate mt-0.5">
                      {order.userId?.name || 'Customer'} · {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-slate-900">{formatPrice(order.totalAmount)}</p>
                    <StatusBadge status={order.orderStatus} size="xs" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Top Selling Products</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">By quantity sold</p>
            </div>
          </div>
          {displayStats.topProducts?.length > 0 ? (
            <div className="h-52 -mx-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={displayStats.topProducts.slice(0, 5)} margin={{ left: -20, right: 8, top: 4, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="4 4" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="title" tick={{ fontSize: 9, fill: '#94a3b8' }} tickFormatter={t => t.slice(0, 8) + '..'} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="quantitySold" name="Qty Sold" fill="#2563EB" radius={[6, 6, 0, 0]} maxBarSize={36} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-52 flex items-center justify-center text-slate-300 text-sm">No sales data yet</div>
          )}
        </div>
      </div>

      {/* KPI Targets Selector Modal */}
      {showKPICustomizer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowKPICustomizer(false)} />
          <div className="relative w-full max-w-sm bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 z-50 space-y-4">
            <h3 className="text-sm font-bold text-slate-800">Customize KPI Targets</h3>
            
            <div className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Target Revenue (USD)</label>
                <input 
                  type="number" 
                  value={revenueTarget} 
                  onChange={e => setRevenueTarget(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none font-semibold text-slate-850"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Target Orders Count</label>
                <input 
                  type="number" 
                  value={ordersTarget} 
                  onChange={e => setOrdersTarget(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none font-semibold text-slate-850"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1.5">Show/Hide KPI Cards</label>
                <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                  {kpiCards.map(c => (
                    <label key={c.id} className="flex items-center gap-2 cursor-pointer p-1.5 rounded-lg border border-slate-150 hover:bg-slate-50">
                      <input 
                        type="checkbox" 
                        checked={c.visible} 
                        onChange={() => toggleKPICard(c.id)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span>{c.label.split(' ')[0]}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => {
                  setShowKPICustomizer(false);
                  addAuditLog('KPI Config Updated', `Revenue target set to ${revenueTarget}, Orders target set to ${ordersTarget}.`, 'settings');
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl"
              >
                Apply Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
