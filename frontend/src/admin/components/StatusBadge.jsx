import React from 'react';

const variants = {
  // Order statuses
  Processing: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-100',
  Shipped: 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-100',
  Delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-100',
  Cancelled: 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-100',
  // Payment
  paid: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-100',
  pending: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-100',
  failed: 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-100',
  // Ticket
  open: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-100',
  resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-100',
  // Generic
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-100',
  inactive: 'bg-slate-50 text-slate-500 border-slate-200 ring-slate-100',
  admin: 'bg-violet-50 text-violet-700 border-violet-200 ring-violet-100',
  user: 'bg-slate-50 text-slate-600 border-slate-200 ring-slate-100',
  banned: 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-100',
  verified: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-100',
  unverified: 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-100',
  // Stock
  instock: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-100',
  lowstock: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-100',
  outofstock: 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-100',
};

const dots = {
  Processing: 'bg-amber-400',
  Shipped: 'bg-blue-400',
  Delivered: 'bg-emerald-400',
  Cancelled: 'bg-rose-400',
  paid: 'bg-emerald-400',
  pending: 'bg-amber-400',
  failed: 'bg-rose-400',
  open: 'bg-amber-400',
  resolved: 'bg-emerald-400',
  active: 'bg-emerald-400',
  inactive: 'bg-slate-400',
  admin: 'bg-violet-400',
  user: 'bg-slate-400',
  banned: 'bg-rose-400',
  verified: 'bg-emerald-400',
  unverified: 'bg-rose-400',
};

export default function StatusBadge({ status, showDot = true, size = 'sm' }) {
  const key = status?.toLowerCase().replace(/\s/g, '') || 'inactive';
  const variantKey = Object.keys(variants).find(k => k.toLowerCase() === key) || 'inactive';
  const dotKey = Object.keys(dots).find(k => k.toLowerCase() === key) || 'inactive';

  const sizeClass = size === 'xs' ? 'text-[9px] px-1.5 py-0.5' : 'text-[10px] px-2 py-0.5';

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border font-semibold uppercase tracking-wide ${sizeClass} ${variants[variantKey]}`}>
      {showDot && (
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dots[dotKey]}`} />
      )}
      {status}
    </span>
  );
}
