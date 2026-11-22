'use client';

import Link from 'next/link';
import { useHabits } from '@/hooks/useHabits';
import { useGoals } from '@/hooks/useGoals';
import { useJournal } from '@/hooks/useJournal';
import { useStats } from '@/hooks/useStats';
import ScreenTimeCard from '@/components/dashboard/ScreenTimeCard';
import CareerCard from '@/components/dashboard/CareerCard';
import TechNewsCard from '@/components/dashboard/TechNewsCard';
import DashboardCards from '@/components/dashboard/DashboardCards';
import TodayHabits from '@/components/dashboard/TodayHabits';
import WeeklyChart from '@/components/dashboard/WeeklyChart';
import GlassCard from '@/components/ui/GlassCard';
import {
  ArrowRight,
  ArrowLeft,
  Flame,
  Target,
  BookOpen,
  Sparkles,
  GraduationCap,
  Briefcase,
  CheckCircle2,
} from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';

export default function PersonalPortalPage() {
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
          <p className="text-xs text-slate-400 font-semibold tracking-wide">Loading Personal Growth OS...</p>
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

  return (
    <div className="space-y-5 sm:space-y-8 pb-28 sm:pb-12">
      {/* Top Header with Academic Portal Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-300 text-[10px] font-bold uppercase tracking-wider">
              ⚡ Personal Growth OS
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            Personal & Career Command
          </h1>
          <p className="text-xs text-slate-400">
            Daily habits, Big Tech placement journey, screen time & mental clarity
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            onClick={() => triggerHaptic('light')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] border-t-white/[0.18] text-slate-300 hover:text-white text-xs font-bold transition-all active:scale-[0.97] shadow-sm shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]"
          >
            <ArrowLeft size={14} />
            <span>Switch to Home Hub</span>
          </Link>
          <Link
            href="/academics"
            onClick={() => triggerHaptic('light')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600/30 via-indigo-600/30 to-purple-600/30 hover:from-purple-600/40 border border-purple-500/40 border-t-purple-400/50 text-purple-200 text-xs font-bold transition-all shadow-lg shadow-purple-500/15 active:scale-[0.97] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)]"
          >
            <GraduationCap size={15} className="text-purple-400" />
            <span>Switch to Academic OS</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>

      {/* Daily Screen Time Tracker */}
      <ScreenTimeCard />

      {/* Big Tech Career Mission Control */}
      <CareerCard />

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
                  <p className="text-xs text-slate-400 font-medium">No active goals yet.</p>
                  <Link
                    href="/goals"
                    onClick={() => triggerHaptic('light')}
                    className="mt-2 inline-flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 font-bold"
                  >
                    Create your first goal <ArrowRight size={12} />
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeGoals.map((goal) => {
                    const completedMilestones = goal.milestones.filter((m) => m.completed).length;
                    const totalMilestones = goal.milestones.length;
                    const progress = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;

                    return (
                      <div
                        key={goal.id}
                        className="p-3 sm:p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-xs sm:text-sm font-bold text-white">{goal.title}</h4>
                          <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">
                            {goal.category}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-white/[0.06] rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 font-mono">
                            {completedMilestones}/{totalMilestones}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </GlassCard>
        </div>

        {/* Top Habit Streak Card */}
        <div className="lg:col-span-1">
          <GlassCard delay={0.4}>
            <div className="p-4 sm:p-6 flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
                    <Flame size={16} />
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-white">Streak Champion</h3>
                </div>

                {topHabit ? (
                  <div className="space-y-3 text-center py-4">
                    <div className="w-14 h-14 mx-auto rounded-3xl bg-gradient-to-tr from-amber-500/20 via-orange-500/20 to-purple-500/20 border border-amber-500/30 flex items-center justify-center shadow-lg shadow-amber-500/10">
                      <Flame size={28} className="text-amber-400 fill-amber-400 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-base font-extrabold text-white">{topHabit.name}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{topHabit.category}</p>
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-black text-xs font-mono">
                      <span>{stats.currentStreaks[topHabit.id] || 0} Day Streak</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-xs text-slate-400">No habit streaks yet.</p>
                  </div>
                )}
              </div>

              <Link
                href="/habits"
                onClick={() => triggerHaptic('light')}
                className="w-full mt-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-center text-xs font-bold text-purple-300 border border-white/[0.06] flex items-center justify-center gap-1 transition-all"
              >
                <span>View All Habits</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
