'use client';

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { triggerHaptic } from '@/lib/haptics';

export default function AICoachButton() {
  const pathname = usePathname();

  // Hide floating button when user is on the dedicated AI chat or any creation/editing form
  const HIDE_ON_PAGES = [
    '/ai',
    '/habits/new',
    '/habits/edit',
    '/goals/new',
    '/goals/edit',
    '/challenges/new',
    '/journal/new',
    '/journal/edit',
    '/news/add',
  ];
  if (HIDE_ON_PAGES.some((p) => pathname === p || pathname.startsWith(p))) {
    return null;
  }

  return (
    <Link
      href="/ai"
      onClick={() => triggerHaptic('light')}
      className="fixed bottom-24 md:bottom-8 right-4 sm:right-8 z-30 group"
      aria-label="Open AI Growth Coach"
    >
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.6, type: 'spring' }}
        whileHover={{ scale: 1.06, y: -2 }}
        whileTap={{ scale: 0.92 }}
        className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white font-bold text-xs shadow-[0_8px_30px_rgba(147,51,234,0.45)] border border-purple-400/50 backdrop-blur-xl relative overflow-hidden group-hover:shadow-[0_12px_40px_rgba(147,51,234,0.65)] transition-all"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
        </span>
        <Sparkles size={15} className="text-amber-300 group-hover:rotate-12 transition-transform duration-300" />
        <span className="tracking-tight font-bold">AI Coach</span>
      </motion.div>
    </Link>
  );
}
