'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Flame, Plus } from 'lucide-react';
import { getHabits } from '@/lib/storage';
import { calculateStreak } from '@/lib/utils';
import { triggerHaptic } from '@/lib/haptics';

export default function MobileHeader() {
  const [dateStr, setDateStr] = useState('');
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const now = new Date();
    setDateStr(
      now.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      })
    );

    const habits = getHabits();
    let max = 0;
    habits.forEach((h) => {
      const s = calculateStreak(h.completions);
      if (s > max) max = s;
    });
    setStreak(max);
  }, []);

  return (
    <header className="sticky top-0 z-30 md:hidden bg-[#05070e]/85 backdrop-blur-2xl border-b border-white/[0.08] px-4 py-3 shadow-xl">
      <div className="flex items-center justify-between">
        {/* Brand */}
        <Link
          href="/"
          onClick={() => triggerHaptic('light')}
          className="flex items-center gap-2.5 active:scale-95 transition-transform"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-500 flex items-center justify-center shadow-md shadow-purple-500/30">
            <Flame size={16} className="text-white fill-white" />
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-purple-200 bg-clip-text text-transparent leading-none">
              NexDev
            </h1>
            <p className="text-[9px] text-purple-300/70 font-semibold mt-0.5 uppercase tracking-wider">
              {dateStr || 'Today'}
            </p>
          </div>
        </Link>

        {/* Right Status Pill */}
        <div className="flex items-center gap-2">
          {streak > 0 && (
            <Link
              href="/stats"
              onClick={() => triggerHaptic('light')}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500/15 to-orange-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold shadow-sm shadow-amber-500/10 active:scale-95 transition-all"
            >
              <Flame size={13} className="text-amber-400 fill-amber-400" />
              <span>{streak}d</span>
            </Link>
          )}

          <Link
            href="/habits/new"
            onClick={() => triggerHaptic('light')}
            className="w-8 h-8 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-600/30 active:scale-90 transition-transform"
            aria-label="Add habit"
          >
            <Plus size={16} />
          </Link>
        </div>
      </div>
    </header>
  );
}
