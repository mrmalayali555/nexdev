'use client';

import { useState } from 'react';
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
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';
import { PLACEMENT_CHECKLIST_ITEMS, EXAM_CHECKLIST_ITEMS } from '@/lib/types';
import { getToday } from '@/lib/utils';

export default function CareerCard() {
  const {
    loaded,
    getTodayLog,
    toggleDailyTask,
    toggleExamDailyTask,
    isExamMode,
    toggleExamMode,
    getWeeklyDSAStats,
    getDifficultyCounts,
    getJourneyStats,
  } = useCareer();

  const [viewMode, setViewMode] = useState<'exam' | 'standard'>('exam');

  if (!loaded) {
    return null;
  }

  const today = getToday();
  const todayLog = getTodayLog();
  const weekStats = getWeeklyDSAStats();
  const diffCounts = getDifficultyCounts();
  const journeyStats = getJourneyStats();

  const weekMax = Math.max(...weekStats.map((d) => d.count), 4);
  const showExamView = isExamMode && viewMode === 'exam';

  return (
    <GlassCard delay={0.12}>
      <div className="p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500/25 to-orange-500/20 flex items-center justify-center text-amber-400 shadow-sm shadow-amber-500/20">
              <Briefcase size={17} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">Placement Journey</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono tabular-nums">
                  Day {journeyStats.journeyDay}
                </span>
                {journeyStats.currentStreak > 0 && (
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-orange-500/20 border border-orange-500/35 text-orange-300 flex items-center gap-1 font-mono tabular-nums">
                    <Flame size={11} className="fill-orange-400 text-orange-400" />
                    {journeyStats.currentStreak}d Streak
                  </span>
                )}
                {isExamMode && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center gap-1">
                    <ShieldCheck size={11} />
                    Exam Mode
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                {isExamMode
                  ? 'Exam Season Active: 1 micro-task preserves & advances your daily streak!'
                  : 'Daily Placement Protocol & Activity Tracker'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {/* Toggle Exam Mode Button */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic('medium');
                toggleExamMode();
              }}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all active:scale-[0.97] flex items-center gap-1 ${
                isExamMode
                  ? 'bg-emerald-500/15 border-emerald-500/35 text-emerald-300'
                  : 'bg-white/[0.04] border-white/[0.08] text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck size={12} />
              <span>{isExamMode ? 'Exam Mode' : 'Standard'}</span>
            </button>

            <Link
              href="/career"
              onClick={() => triggerHaptic('light')}
              className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-bold ml-1 active:scale-95"
            >
              Full Journey <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {/* Today's Daily Placement Protocol (Interactive Checklist) */}
        <div className={`p-3.5 sm:p-4 rounded-2xl border mb-4 transition-all ${
          showExamView
            ? 'bg-gradient-to-br from-emerald-950/20 via-[#0a121d] to-[#070a14] border-emerald-500/30'
            : 'bg-gradient-to-br from-white/[0.03] to-transparent border-white/[0.08]'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                {showExamView ? <ShieldCheck size={14} className="text-emerald-400" /> : <Sparkles size={13} className="text-amber-400" />}
                {showExamView ? "Today's Exam Micro-Tasks (Streak Savers)" : "Today's Placement Checklist"}
              </span>

              {journeyStats.isStreakShielded && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  🛡️ Streak Protected
                </span>
              )}
            </div>

            <span className={`text-[11px] font-bold font-mono tabular-nums ${showExamView ? 'text-emerald-300' : 'text-amber-300'}`}>
              {showExamView
                ? `${journeyStats.todayExamTasksDone}/${journeyStats.todayExamTotalTasks} Done (${journeyStats.todayExamPct}%)`
                : `${journeyStats.todayTasksDone}/${journeyStats.todayTotalTasks} Done (${journeyStats.todayPct}%)`}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-white/[0.08] rounded-full h-1.5 mb-3 overflow-hidden">
            <div
              className={`h-1.5 rounded-full transition-all duration-500 ${
                showExamView
                  ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                  : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
              }`}
              style={{ width: `${showExamView ? journeyStats.todayExamPct : journeyStats.todayPct}%` }}
            />
          </div>

          {/* Checklist items */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
            {showExamView
              ? EXAM_CHECKLIST_ITEMS.map((item) => {
                  const isChecked = !!todayLog.examChecklist?.[item.key];
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => {
                        triggerHaptic(isChecked ? 'light' : 'success');
                        toggleExamDailyTask(today, item.key);
                      }}
                      className={`p-2 sm:p-2.5 rounded-xl border text-left transition-all flex sm:flex-col items-center sm:items-start justify-between sm:justify-between gap-2 active:scale-[0.97] ${
                        isChecked
                          ? 'bg-emerald-500/20 border-emerald-500/40 text-white shadow-sm shadow-emerald-500/10'
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
                            ? 'bg-emerald-400 text-slate-950 font-bold shadow-[0_0_6px_rgba(52,211,153,0.6)]'
                            : 'border border-white/20 text-transparent'
                        }`}
                      >
                        <CheckCircle2 size={12} className={isChecked ? 'stroke-[3]' : ''} />
                      </div>
                    </button>
                  );
                })
              : PLACEMENT_CHECKLIST_ITEMS.map((item) => {
                  const isChecked = !!todayLog.checklist?.[item.key];
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => {
                        triggerHaptic(isChecked ? 'light' : 'success');
                        toggleDailyTask(today, item.key);
                      }}
                      className={`p-2 sm:p-2.5 rounded-xl border text-left transition-all flex sm:flex-col items-center sm:items-start justify-between sm:justify-between gap-2 active:scale-[0.97] ${
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
              <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Code2 size={16} />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">DSA Library</span>
                <span className="text-[10px] text-slate-400">
                  {diffCounts.easy} Easy • {diffCounts.medium} Med • {diffCounts.hard} Hard
                </span>
              </div>
            </div>
            <span className="text-lg font-black text-white font-mono tabular-nums">{diffCounts.total}</span>
          </div>

          <div className="sm:col-span-6 p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Cpu size={16} />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Placement Focus</span>
                <span className="text-[10px] text-slate-400">
                  {isExamMode ? 'C Programming & Mental Tracing' : 'DSA Patterns & Core CS'}
                </span>
              </div>
            </div>
            <span className="text-xs font-bold font-mono text-cyan-300 bg-cyan-500/10 px-2 py-1 rounded-lg border border-cyan-500/20">
              {isExamMode ? 'Exam Sync' : 'Ready'}
            </span>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
