import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView, useMotionValue, useSpring } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

function AnimatedCounter({ value, prefix = '', suffix = '', decimals = 0 }) {
  const ref = useRef(null);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { duration: 1200, bounce: 0 });
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const [display, setDisplay] = useState('0');

  useEffect(() => {
    if (isInView) motionValue.set(value);
  }, [isInView, value, motionValue]);

  useEffect(() => {
    const unsubscribe = springValue.on('change', (latest) => {
      setDisplay(
        decimals > 0
          ? latest.toFixed(decimals)
          : Math.round(latest).toLocaleString()
      );
    });
    return unsubscribe;
  }, [springValue, decimals]);

  return (
    <span ref={ref}>
      {prefix}{display}{suffix}
    </span>
  );
}

export default function StatCard({
  title,
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  trend,
  trendLabel,
  icon: Icon,
  iconBg = 'bg-blue-50',
  iconColor = 'text-blue-600',
  gradient,
  subtitle,
}) {
  const trendPositive = trend > 0;
  const trendZero = trend === 0 || trend == null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -2, boxShadow: '0 12px 40px -8px rgba(0,0,0,0.12)' }}
      className="relative bg-white/72 backdrop-blur-xl rounded-2xl border border-white/60 shadow-sm p-5 overflow-hidden cursor-default"
      style={{ boxShadow: '0 2px 16px -4px rgba(0,0,0,0.08), 0 0 0 1px rgba(255,255,255,0.6) inset' }}
    >
      {/* Subtle gradient orb */}
      {gradient && (
        <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-10 blur-2xl ${gradient}`} />
      )}

      <div className="flex items-start justify-between gap-3">
        {/* Icon */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
          {Icon && <Icon className={`w-5 h-5 ${iconColor}`} strokeWidth={1.8} />}
        </div>

        {/* Trend badge */}
        {!trendZero && (
          <div className={`flex items-center gap-0.5 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
            trendPositive
              ? 'bg-emerald-50 text-emerald-600'
              : 'bg-rose-50 text-rose-600'
          }`}>
            {trendPositive
              ? <TrendingUp className="w-2.5 h-2.5" />
              : <TrendingDown className="w-2.5 h-2.5" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>

      <div className="mt-3">
        <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900 mt-0.5 leading-none tracking-tight">
          <AnimatedCounter value={value} prefix={prefix} suffix={suffix} decimals={decimals} />
        </h3>
        {(trendLabel || subtitle) && (
          <p className="text-[11px] text-slate-400 mt-1.5">
            {trendLabel || subtitle}
          </p>
        )}
      </div>
    </motion.div>
  );
}
