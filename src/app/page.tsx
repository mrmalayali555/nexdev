'use client';

import { useHabits } from '@/hooks/useHabits';
import { useGoals } from '@/hooks/useGoals';
import { useJournal } from '@/hooks/useJournal';
import { useStats } from '@/hooks/useStats';
import ScreenTimeCard from '@/components/dashboard/ScreenTimeCard';
import TechNewsCard from '@/components/dashboard/TechNewsCard';
import DashboardCards from '@/components/dashboard/DashboardCards';
import TodayHabits from '@/components/dashboard/TodayHabits';
import WeeklyChart from '@/components/dashboard/WeeklyChart';
import GlassCard from '@/components/ui/GlassCard';
import Link from 'next/link';
import {
  ArrowRight,
  Flame,
  Target,
  BookOpen,
  CheckCircle2,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';

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
          <p className="text-xs text-slate-400 font-semibold tracking-wide">Loading your workspace...</p>
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
    <div className="space-y-5 sm:space-y-8 pb-28 sm:pb-12">
      {/* Daily Screen Time Tracker */}
      <ScreenTimeCard />

      {/* Daily Tech Briefing Hub */}
      <TechNewsCard />

      {/* 4 Stat Overview Cards */}
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
                  <div className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                    <Target size={16} />
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-white">Active Goals</h3>
                </div>
                <Link
                  href="/goals"
                  onClick={() => triggerHaptic('light')}
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-bold"
                >
                  View All ({goals.length}) <ArrowRight size={13} />
                </Link>
              </div>

              {activeGoals.length === 0 ? (
                <div className="text-center py-8 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                  <p className="text-xs sm:text-sm text-slate-400 mb-2">No active goals yet.</p>
                  <Link
                    href="/goals/new"
                    onClick={() => triggerHaptic('light')}
                    className="inline-flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 font-bold"
                  >
                    Set your first goal <ArrowRight size={12} />
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeGoals.map((goal) => (
                    <div
                      key={goal.id}
                      className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs sm:text-sm font-bold text-white truncate max-w-[70%]">
                          {goal.title}
                        </span>
                        <span className="text-xs font-black" style={{ color: goal.color }}>
                          {goal.progress}%
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-white/[0.08] overflow-hidden p-0.5">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${goal.progress}%`,
                            background: `linear-gradient(90deg, ${goal.color}, ${goal.color}dd)`,
                            boxShadow: `0 0 10px ${goal.color}60`,
                          }}
                        />
                      </div>
                      <div className="flex justify-between items-center mt-2.5 text-[10px] sm:text-[11px] text-slate-400 font-medium">
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
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
                  <Flame size={16} className="fill-amber-400" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white">Streak Champion</h3>
              </div>
              {topHabit ? (
                <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-transparent border border-amber-500/25 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl filter drop-shadow">{topHabit.emoji}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-white truncate">{topHabit.name}</p>
                      <p className="text-xs text-amber-300 font-extrabold flex items-center gap-1 mt-0.5">
                        <Flame size={13} className="fill-amber-400" />
                        {stats.currentStreaks[topHabit.id] || 0} Day Active Streak
                      </p>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-300 font-medium leading-relaxed">
                    Consistency builds identity. Keep your streak alive today!
                  </p>
                </div>
              ) : (
                <p className="text-xs text-slate-400">Add a habit to ignite your streak!</p>
              )}
            </div>
          </GlassCard>

          {/* Quick Badges Preview */}
          <GlassCard delay={0.5}>
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">
                    <Trophy size={16} />
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-white">Badges Earned</h3>
                </div>
                <Link
                  href="/stats"
                  onClick={() => triggerHaptic('light')}
                  className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 font-bold"
                >
                  All Stats <ArrowRight size={12} />
                </Link>
              </div>

              <div className="flex flex-wrap gap-2">
                {unlockedBadges.length > 0 ? (
                  unlockedBadges.map((badge) => (
                    <div
                      key={badge.days}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-slate-200"
                    >
                      <span>{badge.emoji}</span>
                      <span className="font-bold text-xs">{badge.label}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400">Reach a 7-day streak to unlock your first badge!</p>
                )}
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Quick Launchpad Action Bar */}
      <div className="rounded-3xl p-4 sm:p-6 bg-gradient-to-br from-white/[0.025] to-transparent border border-white/[0.08] backdrop-blur-2xl shadow-xl">
        <div className="flex items-center gap-2 mb-3.5">
          <Sparkles size={17} className="text-purple-400" />
          <h3 className="text-sm sm:text-base font-bold text-white">Quick Actions</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
          <Link
            href="/habits/new"
            onClick={() => triggerHaptic('light')}
            className="group p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-purple-500/15 via-purple-600/5 to-transparent hover:from-purple-500/25 border border-purple-500/25 active:scale-[0.98] transition-all flex flex-col justify-between"
          >
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-300 shrink-0 shadow-sm shadow-purple-500/20">
                <CheckCircle2 size={16} />
              </div>
              <p className="text-xs sm:text-sm font-bold text-white">New Habit</p>
            </div>
            <p className="text-[10px] text-slate-400">Track & build consistency</p>
          </Link>

          <Link
            href="/goals/new"
            onClick={() => triggerHaptic('light')}
            className="group p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-blue-500/15 via-blue-600/5 to-transparent hover:from-blue-500/25 border border-blue-500/25 active:scale-[0.98] transition-all flex flex-col justify-between"
          >
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-300 shrink-0 shadow-sm shadow-blue-500/20">
                <Target size={16} />
              </div>
              <p className="text-xs sm:text-sm font-bold text-white">Set Goal</p>
            </div>
            <p className="text-[10px] text-slate-400">Milestones & progress</p>
          </Link>

          <Link
            href="/journal/new"
            onClick={() => triggerHaptic('light')}
            className="group p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-emerald-500/15 via-emerald-600/5 to-transparent hover:from-emerald-500/25 border border-emerald-500/25 active:scale-[0.98] transition-all flex flex-col justify-between"
          >
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-300 shrink-0 shadow-sm shadow-emerald-500/20">
                <BookOpen size={16} />
              </div>
              <p className="text-xs sm:text-sm font-bold text-white">Journal</p>
            </div>
            <p className="text-[10px] text-slate-400">Mood & gratitude log</p>
          </Link>

          <Link
            href="/news/add"
            onClick={() => triggerHaptic('light')}
            className="group p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-indigo-500/15 via-indigo-600/5 to-transparent hover:from-indigo-500/25 border border-indigo-500/25 active:scale-[0.98] transition-all flex flex-col justify-between"
          >
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-300 shrink-0 shadow-sm shadow-indigo-500/20">
                <Sparkles size={16} />
              </div>
              <p className="text-xs sm:text-sm font-bold text-white">Tech News</p>
            </div>
            <p className="text-[10px] text-slate-400">Daily AI briefing digest</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
