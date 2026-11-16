'use client';

import { motion } from 'framer-motion';
import GlassCard from '@/components/ui/GlassCard';
import { Habit } from '@/lib/types';
import { calculateStreak, calculateBestStreak } from '@/lib/utils';
import { Flame, Trophy, TrendingUp } from 'lucide-react';

interface StreakDashboardProps {
  habits: Habit[];
}

export default function StreakDashboard({ habits }: StreakDashboardProps) {
  const streakData = habits.map((h) => ({
    habit: h,
    current: calculateStreak(h.completions),
    best: calculateBestStreak(h.completions),
    totalDays: Object.values(h.completions).filter(Boolean).length,
  }));

  const sortedByCurrent = [...streakData].sort((a, b) => b.current - a.current);

  return (
    <GlassCard delay={0.1}>
      <div className="p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Flame size={18} className="text-amber-400 fill-amber-400" />
          <h3 className="text-sm sm:text-base font-bold text-white">Active Streaks</h3>
        </div>

        <div className="space-y-2.5">
          {sortedByCurrent.map((item, i) => (
            <motion.div
              key={item.habit.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.02] border border-white/5 active:bg-white/[0.05]"
            >
              <span className="text-xl shrink-0 filter drop-shadow">{item.habit.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-semibold text-white truncate">
                  {item.habit.name}
                </p>
                <div className="flex items-center gap-2.5 mt-1 text-[11px] flex-wrap">
                  <div className="flex items-center gap-1 font-bold text-amber-400">
                    <Flame size={12} className="fill-amber-400" />
                    <span>{item.current}d</span>
                  </div>
                  <div className="flex items-center gap-1 text-purple-300 font-medium">
                    <Trophy size={11} className="text-purple-400" />
                    <span>Best: {item.best}d</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500">
                    <span>{item.totalDays} total</span>
                  </div>
                </div>
              </div>

              {/* Progress to personal best */}
              <div className="w-14 sm:w-20 h-2 rounded-full bg-white/10 overflow-hidden shrink-0">
                <motion.div
                  className="h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${Math.min(100, (item.current / Math.max(item.best, 1)) * 100)}%`,
                  }}
                  transition={{ duration: 0.8, delay: i * 0.05 }}
                  style={{
                    background: `linear-gradient(90deg, ${item.habit.color}, ${item.habit.color}dd)`,
                  }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}
