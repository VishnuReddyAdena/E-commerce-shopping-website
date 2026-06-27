import React from 'react';

function SkeletonBox({ className = '' }) {
  return (
    <div className={`animate-pulse bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 bg-[length:200%_100%] rounded-lg ${className}`}
      style={{ animation: 'shimmer 1.6s infinite linear', backgroundSize: '200% 100%' }}
    />
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-white/72 rounded-2xl border border-slate-100 p-5 space-y-3">
      <div className="flex items-start justify-between">
        <SkeletonBox className="w-10 h-10 rounded-xl" />
        <SkeletonBox className="w-12 h-5 rounded-full" />
      </div>
      <div className="space-y-2 mt-3">
        <SkeletonBox className="w-24 h-3" />
        <SkeletonBox className="w-32 h-7" />
        <SkeletonBox className="w-20 h-3" />
      </div>
    </div>
  );
}

export function TableRowSkeleton({ cols = 5, rows = 6 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="border-b border-slate-50">
          {Array.from({ length: cols }).map((_, j) => (
            <td key={j} className="py-3.5 px-4">
              <SkeletonBox className={`h-4 ${j === 0 ? 'w-10 h-10 rounded-xl' : j === cols - 1 ? 'w-16' : 'w-24'}`} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export function CardGridSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 space-y-3">
          <div className="flex gap-3 items-center">
            <SkeletonBox className="w-12 h-12 rounded-xl flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <SkeletonBox className="h-4 w-3/4" />
              <SkeletonBox className="h-3 w-1/2" />
            </div>
          </div>
          <SkeletonBox className="h-3 w-full" />
          <SkeletonBox className="h-3 w-2/3" />
        </div>
      ))}
    </div>
  );
}

export default SkeletonBox;
