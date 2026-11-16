'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
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
      {/* Floating Action Pill */}
      <motion.button
        onClick={handleOpen}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.8, type: 'spring' }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.92 }}
        className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-40 flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white font-bold text-xs shadow-xl shadow-purple-600/35 border border-purple-400/30 backdrop-blur-md"
        aria-label="Open AI Growth Coach"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400" />
        </span>
        <Sparkles size={14} className="fill-white" />
        <span className="tracking-tight">AI Coach</span>
      </motion.button>

      {/* Coach Drawer / Bottom Sheet */}
      <AICoachModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}

