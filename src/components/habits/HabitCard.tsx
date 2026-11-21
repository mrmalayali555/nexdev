'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Habit, HABIT_CATEGORIES } from '@/lib/types';
import { calculateStreak, getToday } from '@/lib/utils';
import { triggerHaptic } from '@/lib/haptics';
import { Check, Flame, Trash2, Edit3, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface HabitCardProps {
  habit: Habit;
  onToggle: (id: string) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (id: string) => void;
}

export default function HabitCard({ habit, onToggle, onEdit, onDelete }: HabitCardProps) {
  const [today, setToday] = useState(getToday());

  useEffect(() => {
    const updateDay = () => setToday(getToday());
    window.addEventListener('nexdev-day-changed', updateDay);
    window.addEventListener('visibilitychange', updateDay);
    window.addEventListener('focus', updateDay);
    return () => {
      window.removeEventListener('nexdev-day-changed', updateDay);
      window.removeEventListener('visibilitychange', updateDay);
      window.removeEventListener('focus', updateDay);
    };
  }, []);

  const isDone = today ? !!habit.completions[today] : false;
  const streak = calculateStreak(habit.completions);
  const category = HABIT_CATEGORIES.find((c) => c.name === habit.category);

  const handleToggleClick = () => {
    triggerHaptic(isDone ? 'light' : 'success');
    onToggle(habit.id);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`relative rounded-2xl border backdrop-blur-xl overflow-hidden transition-all duration-300 ${
        isDone
          ? 'border-emerald-500/30 bg-emerald-500/[0.07] shadow-lg shadow-emerald-500/5'
          : 'border-white/10 bg-white/[0.03] active:bg-white/[0.06] hover:bg-white/[0.05]'
      }`}
    >
      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          {/* Left: Interactive Check Target */}
          <div className="flex items-center gap-3.5 min-w-0 flex-1">
            <motion.button
              onClick={handleToggleClick}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300 shadow-md ${
                isDone
                  ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-emerald-500/30 ring-4 ring-emerald-500/20'
                  : 'bg-white/10 border border-white/10 text-white hover:bg-white/15'
              }`}
              whileTap={{ scale: 0.88 }}
              aria-label={isDone ? `Mark ${habit.name} incomplete` : `Complete ${habit.name}`}
            >
              {isDone ? (
                <motion.div
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                >
                  <Check size={22} className="stroke-[3]" />
                </motion.div>
              ) : (
                <span className="text-2xl filter drop-shadow">{habit.emoji}</span>
              )}
            </motion.button>

            {/* Middle: Details */}
            <div className="min-w-0 flex-1">
              <h3
                className={`font-semibold text-base sm:text-lg leading-tight truncate transition-colors duration-200 ${
                  isDone ? 'text-gray-400 line-through' : 'text-white'
                }`}
              >
                {habit.name}
              </h3>

              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span
                  className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{
                    backgroundColor: `${category?.color || '#8b5cf6'}20`,
                    color: category?.color || '#8b5cf6',
                  }}
                >
                  {habit.category}
                </span>

                <span className="text-[10px] text-gray-500 font-medium capitalize">
                  {habit.frequency}
                </span>

                {/* Inline Streak Pill on Mobile */}
                {streak > 0 && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                    <Flame size={11} className="fill-amber-400 text-amber-400" />
                    {streak}d
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1 shrink-0">
            <Link
              href={`/habits/edit?id=${habit.id}`}
              onClick={() => triggerHaptic('light')}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 active:scale-90 transition-all"
              title="Edit habit"
            >
              <Edit3 size={15} />
            </Link>
            <button
              onClick={() => onDelete(habit.id)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-400 hover:bg-red-500/10 active:scale-90 transition-all"
              title="Delete habit"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        {/* Challenge Progress Road */}
        {habit.challengeMode && habit.challengeStartDate && (
          <ChallengeProgress habit={habit} />
        )}
      </div>
    </motion.div>
  );
}

function ChallengeProgress({ habit }: { habit: Habit }) {
  const target = habit.challengeMode === '21-day' ? 21 : 66;
  const streak = calculateStreak(habit.completions);
  const pct = Math.min(100, Math.round((streak / target) * 100));

  return (
    <div className="mt-3.5 pt-3 border-t border-white/5">
      <div className="flex items-center justify-between text-xs mb-1.5">
        <span className="text-[11px] font-medium text-purple-300 flex items-center gap-1">
          <Sparkles size={12} className="text-amber-400" />
          {habit.challengeMode} Automaticity Challenge
        </span>
        <span className="text-[11px] font-bold text-purple-200">
          {streak} / {target} days
        </span>
      </div>
      <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-purple-500 via-indigo-500 to-emerald-400"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
