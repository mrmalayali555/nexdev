'use client';

import { useCareer } from '@/hooks/useCareer';
import GlassCard from '@/components/ui/GlassCard';
import Link from 'next/link';
import {
  ArrowRight,
  Briefcase,
  Flame,
  CheckCircle2,
  Code2,
  Cpu,
  Sparkles,
} from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';
import { PLACEMENT_CHECKLIST_ITEMS } from '@/lib/types';
import { getToday } from '@/lib/utils';

export default function CareerCard() {
  const {
    loaded,
    getTodayLog,
    toggleDailyTask,
    getWeeklyDSAStats,
    getDifficultyCounts,
    getJourneyStats,
  } = useCareer();

  if (!loaded) {
    return null;
  }

  const today = getToday();
  const todayLog = getTodayLog();
  const weekStats = getWeeklyDSAStats();
  const diffCounts = getDifficultyCounts();
  const journeyStats = getJourneyStats();

  const weekMax = Math.max(...weekStats.map((d) => d.count), 4);

  return (
    <GlassCard delay={0.12}>
      <div className="p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500/25 to-orange-500/20 flex items-center justify-center text-amber-400 shadow-sm shadow-amber-500/20">
              <Briefcase size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white">Placement Journey</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300">
                  Day {journeyStats.journeyDay}
                </span>
                {journeyStats.currentStreak > 0 && (
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-orange-500/20 border border-orange-500/35 text-orange-300 flex items-center gap-1">
                    <Flame size={11} className="fill-orange-400 text-orange-400" />
                    {journeyStats.currentStreak}d Streak
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-400 font-medium">
                Daily Placement Protocol & Activity Tracker
              </p>
            </div>
          </div>
          <Link
            href="/career"
            onClick={() => triggerHaptic('light')}
            className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-bold"
          >
            Full Journey <ArrowRight size={13} />
          </Link>
        </div>

        {/* Today's Daily Placement Protocol (Interactive Checklist) */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-white/[0.03] to-transparent border border-white/[0.08] mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Sparkles size={13} className="text-amber-400" />
              Today&apos;s Placement Checklist
            </span>
            <span className="text-[11px] font-bold text-amber-300">
              {journeyStats.todayTasksDone}/{journeyStats.todayTotalTasks} Done ({journeyStats.todayPct}%)
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-white/[0.08] rounded-full h-1.5 mb-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 h-1.5 rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
              style={{ width: `${journeyStats.todayPct}%` }}
            />
          </div>

          {/* Checklist items */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
            {PLACEMENT_CHECKLIST_ITEMS.map((item) => {
              const isChecked = !!todayLog.checklist?.[item.key];
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    triggerHaptic(isChecked ? 'light' : 'success');
                    toggleDailyTask(today, item.key);
                  }}
                  className={`p-2 sm:p-2.5 rounded-xl border text-left transition-all flex sm:flex-col items-center sm:items-start justify-between sm:justify-between gap-2 ${
                    isChecked
                      ? 'bg-amber-500/15 border-amber-500/35 text-white'
                      : 'bg-white/[0.02] border-white/[0.06] text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{item.emoji}</span>
                    <span className="text-[11px] font-bold leading-tight truncate sm:whitespace-normal">
                      {item.label}
                    </span>
                  </div>

                  <div
                    className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 transition-all ${
                      isChecked
                        ? 'bg-amber-400 text-slate-950 font-bold'
                        : 'border border-white/20 text-transparent'
                    }`}
                  >
                    <CheckCircle2 size={12} className={isChecked ? 'stroke-[3]' : ''} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Quick Row: DSA Solved & 7-Day Velocity */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6 p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                <Code2 size={18} />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">
                  {diffCounts.total} Problems Solved
                </span>
                <div className="flex items-center gap-1.5 text-[10px] font-bold">
                  <span className="text-emerald-400">{diffCounts.easy} Easy</span>
                  <span>•</span>
                  <span className="text-amber-400">{diffCounts.medium} Medium</span>
                  <span>•</span>
                  <span className="text-rose-400">{diffCounts.hard} Hard</span>
                </div>
              </div>
            </div>
          </div>

          <div className="sm:col-span-6 p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-white block">7-Day Consistency</span>
              <span className="text-[10px] text-slate-400">
                {journeyStats.totalDaysLogged} total active days logged
              </span>
            </div>

            <div className="flex items-end gap-1.5 h-8">
              {weekStats.map((d, i) => {
                const isToday = i === 6;
                const hasActivity = d.count > 0 || d.tasksDone > 0;
                const h = hasActivity ? Math.max((d.count / weekMax) * 28, 10) : 4;
                return (
                  <div key={d.date} className="flex flex-col items-center gap-0.5">
                    <div
                      className={`w-2.5 rounded-full transition-all duration-500 ${
                        isToday
                          ? 'bg-gradient-to-t from-amber-500 to-orange-400 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                          : hasActivity
                          ? 'bg-amber-500/40'
                          : 'bg-white/[0.08]'
                      }`}
                      style={{ height: `${h}px` }}
                    />
                    <span className="text-[7px] text-slate-500 font-medium">
                      {['S', 'M', 'T', 'W', 'T', 'F', 'S'][new Date(d.date).getDay()]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
