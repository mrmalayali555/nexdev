'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Flame, Plus, Sparkles } from 'lucide-react';
import { getToday } from '@/lib/utils';
import { getHabits } from '@/lib/storage';
import { calculateStreak } from '@/lib/utils';

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
    <header className="sticky top-0 z-30 md:hidden bg-[#090d16]/80 backdrop-blur-xl border-b border-white/5 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-blue-500 flex items-center justify-center shadow-md shadow-purple-500/20">
            <Flame size={17} className="text-white fill-white" />
          </div>
          <div>
            <h1 className="text-base font-extrabold bg-gradient-to-r from-white via-purple-100 to-purple-300 bg-clip-text text-transparent leading-none">
              NexDev
            </h1>
            <p className="text-[9px] text-gray-500 font-medium mt-0.5 uppercase tracking-wider">
              {dateStr || 'Today'}
            </p>
          </div>
        </Link>

        {/* Right Status Pill */}
        <div className="flex items-center gap-2">
          {streak > 0 && (
            <Link
              href="/stats"
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold"
            >
              <Flame size={13} className="text-amber-400 fill-amber-400" />
              <span>{streak}d</span>
            </Link>
          )}

          <Link
            href="/habits"
            className="w-8 h-8 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white shadow-md shadow-purple-500/20 active:scale-90 transition-transform"
            aria-label="Add habit"
          >
            <Plus size={16} />
          </Link>
        </div>
      </div>
    </header>
  );
}

