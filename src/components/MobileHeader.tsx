'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Flame, Plus, GraduationCap, ArrowLeft, Home } from 'lucide-react';
import { getHabits } from '@/lib/storage';
import { calculateStreak } from '@/lib/utils';
import { triggerHaptic } from '@/lib/haptics';

export default function MobileHeader() {
  const pathname = usePathname();

  // If on Home Page, header is embedded cleanly inside the page
  if (pathname === '/') return null;

  const isAcademics = pathname.startsWith('/academics');

  return (
    <header className="sticky top-0 z-30 md:hidden bg-[#05070e]/90 backdrop-blur-2xl border-b border-white/[0.08] px-4 py-3 shadow-xl">
      <div className="flex items-center justify-between">
        {/* Left: Back to Home Hub button */}
        <Link
          href="/"
          onClick={() => triggerHaptic('light')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-slate-300 active:scale-95 text-xs font-bold transition-all"
        >
          <Home size={14} className="text-purple-400" />
          <span>Home Hub</span>
        </Link>

        {/* Center: Portal Label */}
        <div className="text-center">
          <h2 className="text-sm font-black text-white">
            {isAcademics ? 'Academic OS' : 'Personal OS'}
          </h2>
          <p className="text-[9px] font-semibold text-slate-400">
            {isAcademics ? 'SCMS S1 CSE-3' : 'Growth Engine'}
          </p>
        </div>

        {/* Right: Switch Portal */}
        {isAcademics ? (
          <Link
            href="/personal"
            onClick={() => triggerHaptic('light')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-bold active:scale-95"
          >
            <Flame size={13} className="text-blue-400" />
            <span>Personal</span>
          </Link>
        ) : (
          <Link
            href="/academics"
            onClick={() => triggerHaptic('light')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-bold active:scale-95"
          >
            <GraduationCap size={13} className="text-purple-400" />
            <span>Academics</span>
          </Link>
        )}
      </div>
    </header>
  );
}
