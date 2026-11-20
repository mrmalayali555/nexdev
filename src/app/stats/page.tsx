'use client';

import { useHabits } from '@/hooks/useHabits';
import { useGoals } from '@/hooks/useGoals';
import { useJournal } from '@/hooks/useJournal';
import { useStats } from '@/hooks/useStats';
import StreakDashboard from '@/components/stats/StreakDashboard';
import WeeklyChart from '@/components/dashboard/WeeklyChart';
import GlassCard from '@/components/ui/GlassCard';
import {
  Trophy,
  Flame,
  CheckCircle2,
  Lock,
  Sparkles,
  TrendingUp,
  Award,
  ArrowLeftRight,
  Zap,
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function StatsPage() {
  const { habits, loaded: habitsLoaded } = useHabits();
  const { goals, loaded: goalsLoaded } = useGoals();
  const { entries, loaded: journalLoaded } = useJournal();
  const { stats, badges } = useStats(habits, goals, entries);

  const isLoaded = habitsLoaded && goalsLoaded && journalLoaded;

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  const totalCompletions = habits.reduce(
    (acc, h) => acc + Object.values(h.completions).filter(Boolean).length,
    0
  );

  const maxStreak = Math.max(
    0,
    ...Object.values(stats.bestStreaks),
    ...Object.values(stats.currentStreaks)
  );

  return (
    <div className="space-y-5 sm:space-y-8 pb-28 sm:pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <span>Analytics</span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 flex items-center gap-1">
            <Flame size={12} className="fill-amber-400" />
            {stats.longestStreak}d Record
          </span>
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
          Deep-dive into streaks, milestone badges, and consistency trends.
        </p>
      </div>

      {/* 4 Summary Metric Cards (2x2 on mobile) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <GlassCard delay={0.1}>
          <div className="p-4 sm:p-5 flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <Flame size={20} className="fill-amber-400" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-extrabold text-white">{stats.longestStreak}d</p>
              <p className="text-[11px] text-gray-400 font-medium">Best Streak</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard delay={0.15}>
          <div className="p-4 sm:p-5 flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-extrabold text-white">{totalCompletions}</p>
              <p className="text-[11px] text-gray-400 font-medium">Check-offs</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard delay={0.2}>
          <div className="p-4 sm:p-5 flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
              <TrendingUp size={20} />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-extrabold text-white">
                {stats.todayTotal > 0
                  ? Math.round((stats.todayCompleted / stats.todayTotal) * 100)
                  : 0}
                %
              </p>
              <p className="text-[11px] text-gray-400 font-medium">Today&apos;s Done</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard delay={0.25}>
          <div className="p-4 sm:p-5 flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <Trophy size={20} />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-extrabold text-white">
                {badges.filter((b) => b.unlocked).length}/{badges.length}
              </p>
              <p className="text-[11px] text-gray-400 font-medium">Badges</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <StreakDashboard habits={habits} />
        <WeeklyChart data={stats.weeklyCompletion} />
      </div>

      {/* Badges Achievement Shelf */}
      <div className="rounded-3xl p-4 sm:p-6 bg-white/[0.03] border border-white/10 backdrop-blur-xl shadow-lg">
        <div className="flex items-center gap-2 mb-1">
          <Award size={18} className="text-purple-400" />
          <h3 className="text-base font-bold text-white">Milestone Badges</h3>
        </div>
        <p className="text-xs text-gray-400 mb-4">
          Unlock badges as your habit streak reaches behavioral milestones.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-4">
          {badges.map((badge, i) => (
            <motion.div
              key={badge.days}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 * i }}
              className={`relative p-3.5 sm:p-4 rounded-2xl border text-center flex flex-col items-center justify-between transition-all ${
                badge.unlocked
                  ? 'bg-gradient-to-b from-white/[0.08] to-white/[0.02] border-white/20 shadow-lg'
                  : 'bg-white/[0.01] border-white/5 opacity-40 grayscale'
              }`}
              style={{
                boxShadow: badge.unlocked ? `0 0 20px ${badge.color}25` : 'none',
              }}
            >
              {!badge.unlocked && (
                <div className="absolute top-2 right-2 text-gray-500">
                  <Lock size={11} />
                </div>
              )}
              <span className="text-3xl mb-1.5 filter drop-shadow">{badge.emoji}</span>
              <p className="text-xs font-bold text-white mb-0.5 leading-tight">{badge.label}</p>
              <p className="text-[10px] text-gray-400 mb-2">{badge.days} Days Streak</p>

              <div className="w-full">
                {badge.unlocked ? (
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full block"
                    style={{
                      backgroundColor: `${badge.color}20`,
                      color: badge.color,
                    }}
                  >
                    Unlocked 🎉
                  </span>
                ) : (
                  <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gray-500"
                      style={{
                        width: `${Math.min(100, (maxStreak / badge.days) * 100)}%`,
                      }}
                    />
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Habit Matrix with horizontal scroll hint on mobile */}
      <GlassCard delay={0.3}>
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm sm:text-base font-bold text-white">Habit Breakdown Matrix</h3>
            <span className="sm:hidden text-[10px] text-gray-400 flex items-center gap-1">
              <ArrowLeftRight size={11} className="text-purple-400" /> Swipe
            </span>
          </div>

          <div className="overflow-x-auto no-scrollbar touch-pan-x">
            <table className="w-full text-left text-xs min-w-[500px]">
              <thead>
                <tr className="border-b border-white/10 text-gray-400">
                  <th className="pb-2.5 font-semibold">Habit</th>
                  <th className="pb-2.5 font-semibold">Category</th>
                  <th className="pb-2.5 font-semibold text-center">Streak</th>
                  <th className="pb-2.5 font-semibold text-center">Best</th>
                  <th className="pb-2.5 font-semibold text-right">Total Done</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {habits.map((habit) => {
                  const current = stats.currentStreaks[habit.id] || 0;
                  const best = stats.bestStreaks[habit.id] || 0;
                  const total = Object.values(habit.completions).filter(Boolean).length;
                  return (
                    <tr key={habit.id} className="hover:bg-white/[0.02]">
                      <td className="py-2.5 flex items-center gap-2">
                        <span className="text-base">{habit.emoji}</span>
                        <span className="font-semibold text-white">{habit.name}</span>
                      </td>
                      <td className="py-2.5">
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                          style={{
                            backgroundColor: `${habit.color}20`,
                            color: habit.color,
                          }}
                        >
                          {habit.category}
                        </span>
                      </td>
                      <td className="py-2.5 text-center">
                        <span className="font-bold text-amber-400">
                          {current > 0 ? `🔥 ${current}d` : '0d'}
                        </span>
                      </td>
                      <td className="py-2.5 text-center text-purple-300 font-semibold">
                        {best}d
                      </td>
                      <td className="py-2.5 text-right text-gray-300 font-semibold">
                        {total} days
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </GlassCard>

      {/* Habit Compounding Journey Card */}
      <div className="rounded-3xl p-5 sm:p-7 bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-blue-950/35 border border-purple-500/25 backdrop-blur-xl shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-purple-600/30 text-white">
              <Zap size={20} />
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-bold text-white flex items-center gap-2 flex-wrap">
                <span>Atomic Habits Compound Daily</span>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Growth Principle
                </span>
              </h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-xl">
                Improving by just 1% each day makes you 37 times better over the course of a single year. Keep your streaks active and celebrate each milestone!
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-purple-300 bg-purple-500/15 px-3.5 py-2 rounded-2xl border border-purple-500/30 shrink-0 font-bold self-start sm:self-auto shadow-sm">
            <Sparkles size={14} className="text-amber-400" />
            <span>Lifelong Momentum</span>
          </div>
        </div>
      </div>
    </div>
  );
}
