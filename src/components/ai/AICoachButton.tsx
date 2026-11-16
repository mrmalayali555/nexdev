'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Bot } from 'lucide-react';
import AICoachModal from './AICoachModal';
import { triggerHaptic } from '@/lib/haptics';

export default function AICoachButton() {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => {
    triggerHaptic('light');
    setIsOpen(true);
  };

  return (
    <>
      {/* Floating Action Pill - Positioned safely above bottom nav */}
      <motion.button
        onClick={handleOpen}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.6, type: 'spring' }}
        whileHover={{ scale: 1.06, y: -2 }}
        whileTap={{ scale: 0.92 }}
        className="fixed bottom-24 md:bottom-8 right-4 sm:right-8 z-30 flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white font-semibold text-xs shadow-2xl shadow-purple-600/40 border border-purple-400/40 backdrop-blur-xl group"
        aria-label="Open AI Growth Coach"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
        </span>
        <Sparkles size={15} className="text-amber-300 group-hover:rotate-12 transition-transform duration-300" />
        <span className="tracking-tight font-bold">AI Coach</span>
      </motion.button>

      {/* AI Coach Full Drawer / Sheet */}
      <AICoachModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
