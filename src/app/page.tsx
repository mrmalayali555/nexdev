'use client';

import { useHabits } from '@/hooks/useHabits';
import { useGoals } from '@/hooks/useGoals';
import { useJournal } from '@/hooks/useJournal';
import { useStats } from '@/hooks/useStats';
import QuoteCard from '@/components/dashboard/QuoteCard';
import TechNewsCard from '@/components/dashboard/TechNewsCard';
import DashboardCards from '@/components/dashboard/DashboardCards';
import TodayHabits from '@/components/dashboard/TodayHabits';
import WeeklyChart from '@/components/dashboard/WeeklyChart';
import GlassCard from '@/components/ui/GlassCard';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Flame,
  Target,
  BookOpen,
  CheckCircle2,
  Sparkles,
  Trophy,
} from 'lucide-react';

export default function DashboardPage() {
  const { habits, loaded: habitsLoaded, toggleCompletion } = useHabits();
  const { goals, loaded: goalsLoaded } = useGoals();
  const { entries, loaded: journalLoaded } = useJournal();
  const { stats, badges } = useStats(habits, goals, entries);

  const isLoaded = habitsLoaded && goalsLoaded && journalLoaded;

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
          <p className="text-xs text-gray-400">Loading your space...</p>
        </div>
      </div>
    );
  }

  const activeGoals = goals.filter((g) => g.status === 'in-progress').slice(0, 3);
  const topHabit = habits.length > 0
    ? habits.reduce(
        (prev, current) =>
          (stats.currentStreaks[current.id] || 0) > (stats.currentStreaks[prev?.id] || 0)
            ? current
            : prev,
        habits[0]
      )
    : null;
  const unlockedBadges = badges.filter((b) => b.unlocked);

  return (
    <div className="space-y-5 sm:space-y-8 pb-12">
      {/* Welcome & Motivational Quote */}
      <QuoteCard />

      {/* Daily Tech Briefing Hub (One story at a time with Grounded Deep Dive Modal) */}
      <TechNewsCard />

      {/* 4 Stat Overview Cards (2x2 on mobile) */}
      <DashboardCards stats={stats} />

      {/* Main Grid: Today's Habits & Weekly Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <TodayHabits habits={habits} onToggle={toggleCompletion} />
        <WeeklyChart data={stats.weeklyCompletion} />
      </div>

      {/* Secondary Grid: Active Goals & Habit Highlight */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Active Goals Preview */}
        <div className="lg:col-span-2">
          <GlassCard delay={0.3}>
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Target size={17} className="text-blue-400" />
                  <h3 className="text-sm sm:text-base font-bold text-white">Active Goals</h3>
                </div>
                <Link
                  href="/goals"
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold"
                >
                  View All ({goals.length}) <ArrowRight size={13} />
                </Link>
              </div>

              {activeGoals.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-xs sm:text-sm text-gray-400 mb-2">No active goals yet.</p>
                  <Link
                    href="/goals"
                    className="inline-flex items-center gap-1.5 text-xs text-purple-400 font-semibold"
                  >
                    Set your first goal <ArrowRight size={12} />
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeGoals.map((goal) => (
                    <div
                      key={goal.id}
                      className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 active:bg-white/[0.05] transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs sm:text-sm font-bold text-white truncate max-w-[70%]">
                          {goal.title}
                        </span>
                        <span className="text-xs font-bold" style={{ color: goal.color }}>
                          {goal.progress}%
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${goal.progress}%`,
                            background: `linear-gradient(90deg, ${goal.color}, ${goal.color}dd)`,
                          }}
                        />
                      </div>
                      <div className="flex justify-between items-center mt-2 text-[10px] sm:text-[11px] text-gray-400">
                        <span>{goal.milestones.filter((m) => m.completed).length}/{goal.milestones.length} milestones</span>
                        <span>Due {new Date(goal.targetDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </GlassCard>
        </div>

        {/* Habit Spotlight & Badges */}
        <div className="space-y-4 sm:space-y-6">
          {/* Top Streak Spotlight */}
          <GlassCard delay={0.4}>
            <div className="p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-3">
                <Flame size={17} className="text-amber-400 fill-amber-400" />
                <h3 className="text-sm sm:text-base font-bold text-white">Streak Champion</h3>
              </div>
              {topHabit ? (
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-transparent border border-amber-500/25">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl filter drop-shadow">{topHabit.emoji}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-white truncate">{topHabit.name}</p>
                      <p className="text-xs text-amber-300 font-semibold flex items-center gap-1 mt-0.5">
                        <Flame size={12} className="fill-amber-400" />
                        {stats.currentStreaks[topHabit.id] || 0} Day Active Streak
                      </p>
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-300">
                    Consistency builds identity. Keep your streak alive today!
                  </p>
                </div>
              ) : (
                <p className="text-xs text-gray-500">Add a habit to ignite your streak!</p>
              )}
            </div>
          </GlassCard>

          {/* Quick Badges Preview */}
          <GlassCard delay={0.5}>
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Trophy size={17} className="text-purple-400" />
                  <h3 className="text-sm sm:text-base font-bold text-white">Badges Earned</h3>
                </div>
                <Link
                  href="/stats"
                  className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 font-semibold"
                >
                  All Stats <ArrowRight size={12} />
                </Link>
              </div>

              <div className="flex flex-wrap gap-2">
                {unlockedBadges.length > 0 ? (
                  unlockedBadges.map((badge) => (
                    <div
                      key={badge.days}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-200"
                    >
                      <span>{badge.emoji}</span>
                      <span className="font-semibold text-xs">{badge.label}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400">Reach a 7-day streak to unlock your first badge!</p>
                )}
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Quick Launchpad Action Bar */}
      <div className="rounded-3xl p-4 sm:p-6 bg-white/[0.03] border border-white/10 backdrop-blur-xl shadow-lg">
        <div className="flex items-center gap-2 mb-3.5">
          <Sparkles size={17} className="text-purple-400" />
          <h3 className="text-sm sm:text-base font-bold text-white">Quick Actions</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4">
          <Link
            href="/habits"
            className="group p-3.5 sm:p-4 rounded-2xl bg-purple-500/10 hover:bg-purple-500/15 border border-purple-500/20 active:scale-[0.98] transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-300 shrink-0">
                <CheckCircle2 size={19} />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-white">Habits</p>
                <p className="text-[11px] text-gray-400">Track & build consistency</p>
              </div>
            </div>
            <ArrowRight size={16} className="text-gray-400 group-hover:translate-x-1 group-hover:text-purple-300 transition-all" />
          </Link>

          <Link
            href="/goals"
            className="group p-3.5 sm:p-4 rounded-2xl bg-blue-500/10 hover:bg-blue-500/15 border border-blue-500/20 active:scale-[0.98] transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-300 shrink-0">
                <Target size={19} />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-white">Set Goals</p>
                <p className="text-[11px] text-gray-400">Milestones & progress</p>
              </div>
            </div>
            <ArrowRight size={16} className="text-gray-400 group-hover:translate-x-1 group-hover:text-blue-300 transition-all" />
          </Link>

          <Link
            href="/journal"
            className="group p-3.5 sm:p-4 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/20 active:scale-[0.98] transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-300 shrink-0">
                <BookOpen size={19} />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-white">Journal</p>
                <p className="text-[11px] text-gray-400">Mood & gratitude log</p>
              </div>
            </div>
            <ArrowRight size={16} className="text-gray-400 group-hover:translate-x-1 group-hover:text-emerald-300 transition-all" />
          </Link>
        </div>
      </div>
    </div>
  );
}
