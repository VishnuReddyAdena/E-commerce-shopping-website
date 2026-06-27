import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, ComposedChart
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { TrendingUp, DollarSign, ShoppingBag, Users, Sparkles, Brain, MapPin, Activity } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl shadow-lg px-3 py-2">
        <p className="text-[10px] font-semibold text-slate-500 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-xs font-bold" style={{ color: p.color }}>
            {p.name}: {typeof p.value === 'number' && p.value > 100 ? `$${p.value.toLocaleString()}` : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalyticsSection() {
  const { token, backendUrl, formatPrice } = useApp();
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Heatmap & Funnel Local Data states
  const [activeHeatCell, setActiveHeatCell] = useState(null);

  const HEATMAP_DATA = {
    Mon: [1, 4, 6, 8],
    Tue: [2, 3, 5, 7],
    Wed: [1, 5, 6, 7],
    Thu: [2, 6, 7, 8],
    Fri: [3, 7, 8, 10],
    Sat: [3, 8, 9, 9],
    Sun: [2, 6, 8, 9]
  };

  const BRACKETS = ['Night (12am-6am)', 'Morning (6am-12pm)', 'Afternoon (12pm-6pm)', 'Evening (6pm-12am)'];
  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [statsRes, ordersRes] = await Promise.all([
          fetch(`${backendUrl}/api/orders/analytics/stats`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${backendUrl}/api/orders`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const [statsData, ordersData] = await Promise.all([statsRes.json(), ordersRes.json()]);
        if (statsRes.ok) setStats(statsData);
        if (ordersRes.ok) setOrders(ordersData);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [token, backendUrl]);

  // Fallback Mock Data for Analytics
  const displayStats = {
    totalRevenue: stats?.totalRevenue || 18750,
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
    { createdAt: new Date(Date.now() - 3600000 * 2).toISOString(), totalAmount: 149 },
    { createdAt: new Date(Date.now() - 3600000 * 5).toISOString(), totalAmount: 299 },
    { createdAt: new Date(Date.now() - 3600000 * 12).toISOString(), totalAmount: 89 },
    { createdAt: new Date(Date.now() - 3600000 * 24).toISOString(), totalAmount: 120 }
  ];

  const totalRevenue = displayStats.totalRevenue;
  const avgOrderValue = displayOrders.length > 0 ? totalRevenue / displayOrders.length : 0;

  // Build daily orders count from orders
  const ordersByDay = {};
  displayOrders.forEach(o => {
    const day = new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    ordersByDay[day] = (ordersByDay[day] || 0) + 1;
  });
  const dailyOrdersData = Object.entries(ordersByDay).slice(-7).map(([day, count]) => ({ day, count }));

  // Fallback for dailyOrdersData if empty or single entry
  const chartOrdersData = dailyOrdersData.length > 1 ? dailyOrdersData : [
    { day: 'Mon', count: 12 },
    { day: 'Tue', count: 18 },
    { day: 'Wed', count: 15 },
    { day: 'Thu', count: 24 },
    { day: 'Fri', count: 20 },
    { day: 'Sat', count: 32 },
    { day: 'Sun', count: 35 },
  ];

  const funnelStages = [
    { label: 'Store Sessions', value: 12500, pct: 100, color: 'from-blue-600 to-indigo-600' },
    { label: 'Product Views', value: 8125, pct: 65, color: 'from-indigo-500 to-violet-500' },
    { label: 'Cart Additions', value: 3250, pct: 26, color: 'from-violet-500 to-fuchsia-500' },
    { label: 'Checkout Started', value: 1300, pct: 10.4, color: 'from-fuchsia-500 to-pink-500' },
    { label: 'Completed Orders', value: displayOrders.length === 4 && orders.length === 0 ? 65 : displayOrders.length, pct: 0.5, color: 'from-pink-500 to-rose-500' }
  ];

  return (
    <div className="space-y-5">
      {/* Quick KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Total Orders', value: displayOrders.length === 4 && orders.length === 0 ? 65 : displayOrders.length, icon: ShoppingBag, color: 'text-violet-600', bg: 'bg-violet-50' },
          { label: 'Avg. Order Value', value: `$${(displayOrders.length === 4 && orders.length === 0 ? 288.46 : avgOrderValue).toFixed(2)}`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Top Products', value: displayStats.topProducts.length, icon: Users, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((kpi, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${kpi.bg}`}>
              <kpi.icon className={`w-4.5 h-4.5 ${kpi.color}`} style={{ width: 18, height: 18 }} />
            </div>
            <div>
              <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">{kpi.label}</p>
              <p className="text-sm font-bold text-slate-900 mt-0.5">{kpi.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Revenue over time */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900 mb-1">Revenue Over Time</h3>
          <p className="text-[11px] text-slate-400 mb-4">Daily revenue — last 7 days</p>
          {displayStats.dailyRevenue?.length > 0 ? (
            <div className="h-56 -mx-1">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={displayStats.dailyRevenue} margin={{ left: -20, right: 8, top: 4, bottom: 0 }}>
                  <defs>
                    <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="_id" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="revenue" name="Revenue ($)" stroke="#2563EB" strokeWidth={2.5} fill="url(#grad1)"
                    dot={{ r: 3, fill: '#2563EB', strokeWidth: 0 }} activeDot={{ r: 5, fill: '#2563EB', stroke: '#fff', strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-56 flex items-center justify-center text-slate-300 text-sm">No data</div>
          )}
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900 mb-1">Top Products by Sales</h3>
          <p className="text-[11px] text-slate-400 mb-4">Products ranked by quantity sold</p>
          {displayStats.topProducts?.length > 0 ? (
            <div className="h-56 -mx-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={displayStats.topProducts.slice(0, 6)} margin={{ left: -20, right: 8, top: 4, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="4 4" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="title" tick={{ fontSize: 9, fill: '#94a3b8' }} tickFormatter={t => t.slice(0, 7) + '..'} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="quantitySold" name="Qty Sold" fill="#7C3AED" radius={[6, 6, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-56 flex items-center justify-center text-slate-300 text-sm">No data</div>
          )}
        </div>

        {/* Daily Orders */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900 mb-1">Daily Order Volume</h3>
          <p className="text-[11px] text-slate-400 mb-4">Number of orders per day</p>
          {chartOrdersData.length > 0 ? (
            <div className="h-56 -mx-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartOrdersData} margin={{ left: -20, right: 8, top: 4, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="4 4" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey={dailyOrdersData.length > 1 ? "day" : "_id"} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey={dailyOrdersData.length > 1 ? "count" : "revenue"} name="Orders" fill="#10B981" radius={[6, 6, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-56 flex items-center justify-center text-slate-300 text-sm">No data</div>
          )}
        </div>

        {/* Revenue vs Orders Combined */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900 mb-1">Revenue & Orders Combined</h3>
          <p className="text-[11px] text-slate-400 mb-4">Correlation view</p>
          {displayStats.dailyRevenue?.length > 0 ? (
            <div className="h-56 -mx-1">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={displayStats.dailyRevenue} margin={{ left: -20, right: 8, top: 4, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="4 4" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="_id" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Orders" fill="#E0E7FF" radius={[4, 4, 0, 0]} maxBarSize={32} />
                  <Line type="monotone" dataKey="revenue" name="Revenue ($)" stroke="#2563EB" strokeWidth={2.5} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-56 flex items-center justify-center text-slate-300 text-sm">No data</div>
          )}
        </div>
      </div>

      {/* Funnel & Heatmap row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Customer Journey Funnel */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Customer Journey Funnel</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Sessions conversion and drop-off analysis</p>
          </div>
          
          <div className="space-y-3">
            {funnelStages.map((stage, idx) => {
              const prevStage = funnelStages[idx - 1];
              const dropOff = prevStage ? Math.round((1 - (stage.value / prevStage.value)) * 100) : 0;
              
              return (
                <div key={stage.label} className="space-y-1">
                  {idx > 0 && (
                    <div className="flex items-center justify-between text-[9px] font-bold text-rose-500 bg-rose-50 border border-rose-100 rounded-lg px-2 py-0.5 w-fit mx-auto">
                      <span>↓ {dropOff}% drop-off</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between gap-4 p-3 bg-slate-50 border border-slate-150 rounded-xl relative overflow-hidden">
                    <div className="flex-1 min-w-0 z-10">
                      <p className="text-xs font-bold text-slate-800">{stage.label}</p>
                      <p className="text-[10px] text-slate-450 mt-0.5">{stage.value.toLocaleString()} users</p>
                    </div>
                    <div className="text-right z-10">
                      <span className="text-xs font-extrabold text-slate-900">{stage.pct}%</span>
                      <p className="text-[9px] text-slate-400 uppercase font-semibold tracking-wide">conversion</p>
                    </div>
                    {/* Background visual fill */}
                    <div 
                      className={`absolute left-0 top-0 h-full opacity-10 bg-gradient-to-r ${stage.color} rounded-r-lg`} 
                      style={{ width: `${stage.pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sales Heatmap Grid */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex flex-col justify-between relative min-h-[380px]">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Weekly Sales Heatmap</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Peak ordering hours density matrix (Days vs Time of day)</p>
          </div>

          <div className="grid grid-cols-8 gap-2.5 my-4">
            {/* Corner header blank spacer */}
            <div className="text-[9px] font-bold text-slate-400 flex items-center justify-center">Time / Day</div>
            {DAYS.map(day => (
              <div key={day} className="text-[10px] font-bold text-slate-505 text-center uppercase tracking-wide">{day}</div>
            ))}

            {BRACKETS.map((bracket, bIdx) => (
              <React.Fragment key={bracket}>
                {/* Row label */}
                <div className="text-[9px] font-bold text-slate-405 leading-tight flex items-center">{bracket.split(' ')[0]}</div>
                {/* Columns */}
                {DAYS.map(day => {
                  const val = HEATMAP_DATA[day][bIdx];
                  const ordersCount = Math.round(val * 2.5 + (orders.length > 0 ? orders.length / 5 : 2));
                  const estRev = Math.round(ordersCount * 145);
                  
                  // Color selectors
                  let colorClass = 'bg-slate-50 border-slate-100';
                  if (val >= 8) colorClass = 'bg-emerald-600 text-white border-emerald-700';
                  else if (val >= 6) colorClass = 'bg-emerald-300 text-emerald-800 border-emerald-400';
                  else if (val >= 3) colorClass = 'bg-emerald-100 text-emerald-700 border-emerald-200';
                  else if (val > 0) colorClass = 'bg-emerald-50 text-emerald-600 border-emerald-100';
                  if (val === 10) colorClass = 'bg-emerald-700 text-white border-emerald-800 ring-2 ring-emerald-500/20';

                  return (
                    <div
                      key={day}
                      onMouseEnter={() => setActiveHeatCell({ day, bracket, ordersCount, estRev })}
                      onMouseLeave={() => setActiveHeatCell(null)}
                      className={`h-9 rounded-xl border flex items-center justify-center cursor-pointer transition-all duration-150 hover:scale-105 ${colorClass}`}
                    >
                      <span className="text-[10px] font-bold">{val}</span>
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>

          {/* Legend indicator */}
          <div className="flex justify-between items-center text-[9px] text-slate-400 font-semibold border-t border-slate-55 pt-3">
            <span>Low Sales Density (1)</span>
            <div className="flex gap-1.5">
              <span className="w-3.5 h-3.5 rounded-md bg-emerald-50 border border-emerald-100 inline-block" />
              <span className="w-3.5 h-3.5 rounded-md bg-emerald-100 border border-emerald-200 inline-block" />
              <span className="w-3.5 h-3.5 rounded-md bg-emerald-300 border border-emerald-400 inline-block" />
              <span className="w-3.5 h-3.5 rounded-md bg-emerald-600 border border-emerald-700 inline-block" />
              <span className="w-3.5 h-3.5 rounded-md bg-emerald-700 border border-emerald-800 inline-block" />
            </div>
            <span>Peak Density (10)</span>
          </div>

          {/* Heatmap Tooltip Overlay */}
          <AnimatePresence>
            {activeHeatCell && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900/95 text-white rounded-xl p-3 border border-slate-800 shadow-2xl z-30 space-y-1.5 text-xs text-center"
              >
                <p className="font-bold text-emerald-400">{activeHeatCell.day} - {activeHeatCell.bracket}</p>
                <p className="text-[11px] text-slate-350">
                  Total Orders: <span className="text-white font-bold">{activeHeatCell.ordersCount}</span>
                </p>
                <p className="text-[11px] text-slate-350">
                  Est. Revenue: <span className="text-white font-bold">{formatPrice(activeHeatCell.estRev)}</span>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Top Products Table */}
      {displayStats.topProducts?.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-50">
            <h3 className="text-sm font-semibold text-slate-900">Top Product Rankings</h3>
          </div>
          <div className="divide-y divide-slate-50">
            {displayStats.topProducts.slice(0, 8).map((product, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3">
                <span className={`text-xs font-bold w-5 text-center ${i < 3 ? 'text-amber-500' : 'text-slate-400'}`}>#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-900 truncate">{product.title}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-bold text-slate-900">{product.quantitySold} sold</p>
                  <p className="text-[10px] text-slate-400">${product.totalSales?.toFixed(2)}</p>
                </div>
                {/* Mini progress */}
                <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden flex-shrink-0">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full"
                    style={{ width: `${Math.min((product.quantitySold / (displayStats.topProducts[0]?.quantitySold || 1)) * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
