'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { ReactNode, useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

export default function Modal({ isOpen, onClose, title, children, footer }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] overflow-hidden flex flex-col justify-end sm:justify-center items-center">
          {/* High z-index Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-xl transition-opacity"
            onClick={onClose}
          />

          {/* Modal Container: App-style Bottom Sheet on mobile, centered dialog on desktop */}
          <motion.div
            initial={{ opacity: 0, y: 120, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 120, scale: 0.97 }}
            transition={{ type: 'spring', damping: 30, stiffness: 360 }}
            className="relative z-10 w-full sm:max-w-xl h-[88dvh] sm:h-auto sm:max-h-[85vh] flex flex-col rounded-t-[32px] sm:rounded-3xl bg-[#090d16] border-t sm:border border-white/10 shadow-2xl shadow-black/95 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Drag Indicator Handle */}
            <div className="sm:hidden flex justify-center pt-3 pb-1 shrink-0 cursor-grab">
              <div className="w-12 h-1.5 rounded-full bg-white/20" />
            </div>

            {/* Header: Always pinned at the top */}
            <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-b border-white/5 bg-white/[0.02] shrink-0">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {title}
              </h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors active:scale-95"
                aria-label="Close modal"
              >
                <X size={16} />
              </button>
            </div>

            {/* Form / Scrollable Content Area */}
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              {children}
            </div>

            {/* Optional Separate Footer */}
            {footer && (
              <div className="shrink-0 px-5 py-3 sm:py-3.5 border-t border-white/10 bg-[#0c101d] flex items-center justify-end gap-3 pb-[max(0.85rem,env(safe-area-inset-bottom))]">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
