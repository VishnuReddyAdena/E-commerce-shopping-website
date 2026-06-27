import React from 'react';
import { motion } from 'framer-motion';

export default function EmptyState({ icon: Icon, title, description, action, actionLabel }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-16 px-8 text-center"
    >
      {/* Illustration container */}
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 border border-slate-200/80 flex items-center justify-center shadow-sm">
          {Icon && <Icon className="w-9 h-9 text-slate-300" strokeWidth={1.5} />}
        </div>
        {/* Decorative dots */}
        <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-blue-100 border-2 border-white" />
        <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 rounded-full bg-violet-100 border-2 border-white" />
      </div>

      <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
      {description && (
        <p className="text-xs text-slate-400 mt-1.5 max-w-xs leading-relaxed">{description}</p>
      )}
      {action && (
        <button
          onClick={action}
          className="mt-5 px-4 py-2 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
        >
          {actionLabel || 'Get Started'}
        </button>
      )}
    </motion.div>
  );
}
