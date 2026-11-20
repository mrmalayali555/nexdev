'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/ui/GlassCard';
import { Habit } from '@/lib/types';
import { getToday } from '@/lib/utils';
import { triggerHaptic } from '@/lib/haptics';
import { Check, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface TodayHabitsProps {
  habits: Habit[];
  onToggle: (id: string) => void;
}

export default function TodayHabits({ habits, onToggle }: TodayHabitsProps) {
  const [today, setToday] = useState('');

  useEffect(() => {
    setToday(getToday());
  }, []);

  const dailyHabits = habits.filter((h) => h.frequency === 'daily');
  const completed = today ? dailyHabits.filter((h) => h.completions[today]).length : 0;
  const total = dailyHabits.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  const handleToggleClick = (habit: Habit, isDone: boolean) => {
    triggerHaptic(isDone ? 'light' : 'success');
    onToggle(habit.id);
  };

  return (
    <GlassCard delay={0.2}>
      <div className="p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span>Today&apos;s Routine</span>
              {pct === 100 && total > 0 && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 font-bold shadow-sm shadow-emerald-500/20">
                  <Sparkles size={11} /> 100% Done!
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {completed} of {total} daily habits completed
            </p>
          </div>
          <Link
            href="/habits"
            className="text-xs text-purple-300 hover:text-white font-bold px-3 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 transition-all shadow-sm"
          >
            Manage
          </Link>
        </div>

        {/* Hero Progress Gauge Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-blue-950/35 border border-white/[0.08] mb-4 flex items-center justify-between gap-4 shadow-inner relative overflow-hidden">
          <div className="flex-1">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                {pct}%
              </span>
              <span className="text-xs text-purple-300 font-bold uppercase tracking-wider">Daily Goal</span>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {pct === 100 && total > 0
                ? 'Outstanding work! You crushed all routines today 🎯'
                : total === 0
                ? 'Add your first habit to begin building consistency!'
                : `${total - completed} remaining to reach full streak perfection.`}
            </p>
          </div>

          {/* Radial Progress Gauge */}
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
              <circle
                cx="32"
                cy="32"
                r="26"
                fill="none"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="5"
              />
              <motion.circle
                cx="32"
                cy="32"
                r="26"
                fill="none"
                stroke="url(#radialGaugeGradient)"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 26}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 26 }}
                animate={{
                  strokeDashoffset: 2 * Math.PI * 26 * (1 - pct / 100),
                }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
              />
              <defs>
                <linearGradient id="radialGaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#a855f7" />
                  <stop offset="50%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-sm sm:text-base font-black text-white">
                {completed}/{total}
              </span>
            </div>
          </div>
        </div>

        {/* Habit List */}
        {dailyHabits.length === 0 ? (
          <div className="text-center py-8 px-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
            <p className="text-xs sm:text-sm text-slate-400 mb-3">No habits tracked yet.</p>
            <Link
              href="/habits/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold shadow-md shadow-purple-600/30 hover:brightness-110 active:scale-95 transition-all"
            >
              + Create Your First Habit
            </Link>
          </div>
        ) : (
          <div className="space-y-2 max-h-[340px] overflow-y-auto no-scrollbar pr-0.5">
            {dailyHabits.map((habit) => {
              const isDone = today ? !!habit.completions[today] : false;

              return (
                <motion.button
                  key={habit.id}
                  onClick={() => handleToggleClick(habit, isDone)}
                  className={`w-full flex items-center gap-3.5 p-3 sm:p-3.5 rounded-2xl transition-all duration-200 text-left ${
                    isDone
                      ? 'bg-emerald-500/[0.08] border border-emerald-500/25 shadow-sm'
                      : 'bg-white/[0.03] border border-white/[0.06] active:bg-white/[0.08] hover:bg-white/[0.06]'
                  }`}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Tactile Check Box */}
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 ${
                      isDone
                        ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-md shadow-emerald-500/30'
                        : 'bg-white/[0.06] border border-white/[0.08] text-slate-400'
                    }`}
                  >
                    {isDone ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 500 }}
                      >
                        <Check size={18} className="stroke-[3]" />
                      </motion.div>
                    ) : (
                      <span className="text-lg filter drop-shadow">{habit.emoji}</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <span
                      className={`text-sm sm:text-base font-semibold block truncate transition-colors ${
                        isDone ? 'text-slate-500 line-through' : 'text-slate-100'
                      }`}
                    >
                      {habit.name}
                    </span>
                    <span className="text-[11px] text-slate-400 capitalize">
                      {habit.category}
                    </span>
                  </div>

                  {isDone && (
                    <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full shrink-0 border border-emerald-500/20">
                      Done
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>
        )}
      </div>
    </GlassCard>
  );
}
