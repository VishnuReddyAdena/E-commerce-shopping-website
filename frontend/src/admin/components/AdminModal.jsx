import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function AdminModal({ isOpen, onClose, title, children, size = 'md', footer }) {
  const sizeMap = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-6xl',
  };

  // Close on Escape
  React.useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-[200] bg-slate-900/40 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
            className={`fixed inset-0 z-[201] flex items-center justify-center p-4 pointer-events-none`}
          >
            <div
              className={`w-full ${sizeMap[size]} pointer-events-auto bg-white/90 backdrop-blur-2xl rounded-2xl border border-white/60 shadow-2xl flex flex-col max-h-[90vh]`}
              style={{ boxShadow: '0 24px 80px -12px rgba(0,0,0,0.18)' }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
                <h2 className="text-base font-semibold text-slate-900">{title}</h2>
                <button
                  onClick={onClose}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto px-6 py-5">
                {children}
              </div>

              {/* Footer */}
              {footer && (
                <div className="px-6 py-4 border-t border-slate-100 flex-shrink-0 flex items-center justify-end gap-3">
                  {footer}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
