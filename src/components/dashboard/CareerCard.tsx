'use client';

import { useCareer } from '@/hooks/useCareer';
import GlassCard from '@/components/ui/GlassCard';
import Link from 'next/link';
import { ArrowRight, Briefcase, Code2, Trophy, Cpu, FolderGit2 } from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';

export default function CareerCard() {
  const { profile, loaded, getTodayLog, getWeeklyDSAStats, getDifficultyCounts } = useCareer();

  if (!loaded) {
    return null;
  }

  const todayLog = getTodayLog();
  const todaySolved = (todayLog.dsaProblems || []).filter((p) => p.solved).length;
  const weekStats = getWeeklyDSAStats();
  const diffCounts = getDifficultyCounts();

  // Average core subject readiness
  const avgCoreReadiness = Math.round(
    (profile.coreSubjects.os +
      profile.coreSubjects.dbms +
      profile.coreSubjects.cn +
      profile.coreSubjects.oop) /
      4
  );

  const weekMax = Math.max(...weekStats.map((d) => d.count), 5);
  const activeApps = profile.applications.filter((a) => a.status !== 'rejected').length;

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
                <h3 className="text-sm sm:text-base font-bold text-white">Career Engine</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300">
                  Big Tech
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">DSA, Core CS & Opportunities</p>
            </div>
          </div>
          <Link
            href="/career"
            onClick={() => triggerHaptic('light')}
            className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-bold"
          >
            Mission Control <ArrowRight size={13} />
          </Link>
        </div>

        {/* Top 3 Stat Pillars */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mb-4">
          {/* Total DSA */}
          <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/20">
            <div className="flex items-center gap-1.5 mb-1 text-slate-400">
              <Code2 size={13} className="text-amber-400" />
              <span className="text-[11px] font-medium">DSA Solved</span>
            </div>
            <p className="text-xl sm:text-2xl font-black text-white">{diffCounts.total}</p>
            <div className="flex items-center gap-1.5 mt-1 text-[9px] font-bold">
              <span className="text-emerald-400">{diffCounts.easy}E</span>
              <span className="text-amber-400">{diffCounts.medium}M</span>
              <span className="text-rose-400">{diffCounts.hard}H</span>
            </div>
          </div>

          {/* Today's Problems */}
          <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
            <div className="flex items-center gap-1.5 mb-1 text-slate-400">
              <Trophy size={13} className="text-purple-400" />
              <span className="text-[11px] font-medium">Solved Today</span>
            </div>
            <p className="text-xl sm:text-2xl font-black text-white">{todaySolved}</p>
            <p className="text-[10px] text-slate-500 mt-1">
              {todayLog.studyHours > 0 ? `${todayLog.studyHours}h studied` : 'Ready to grind'}
            </p>
          </div>

          {/* Core CS Readiness */}
          <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
            <div className="flex items-center gap-1.5 mb-1 text-slate-400">
              <Cpu size={13} className="text-cyan-400" />
              <span className="text-[11px] font-medium">Core CS</span>
            </div>
            <p className="text-xl sm:text-2xl font-black text-white">{avgCoreReadiness}%</p>
            <div className="w-full bg-white/[0.08] rounded-full h-1 mt-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-cyan-500 to-blue-500 h-1 rounded-full transition-all duration-500"
                style={{ width: `${avgCoreReadiness}%` }}
              />
            </div>
          </div>

          {/* Projects / Pipeline */}
          <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
            <div className="flex items-center gap-1.5 mb-1 text-slate-400">
              <FolderGit2 size={13} className="text-indigo-400" />
              <span className="text-[11px] font-medium">Projects & Apps</span>
            </div>
            <p className="text-xl sm:text-2xl font-black text-white">{profile.projects.length}</p>
            <p className="text-[10px] text-slate-500 mt-1">
              {activeApps > 0 ? `${activeApps} active apps` : '0 apps pending'}
            </p>
          </div>
        </div>

        {/* 7-Day Velocity Activity Bar */}
        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between gap-4">
          <div className="min-w-0">
            <span className="text-xs font-bold text-white block">7-Day DSA Velocity</span>
            <span className="text-[10px] text-slate-400">
              Target: 2-3 pattern problems daily for Big Tech readiness
            </span>
          </div>

          <div className="flex items-end gap-1.5 h-10 shrink-0">
            {weekStats.map((d, i) => {
              const h = d.count > 0 ? Math.max((d.count / weekMax) * 36, 6) : 2;
              const isToday = i === 6;
              return (
                <div key={d.date} className="flex flex-col items-center gap-0.5">
                  <div
                    className={`w-3 rounded-full transition-all duration-500 ${
                      isToday
                        ? 'bg-gradient-to-t from-amber-500 to-orange-400 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                        : d.count > 0
                        ? 'bg-amber-500/40'
                        : 'bg-white/[0.08]'
                    }`}
                    style={{ height: `${h}px` }}
                    title={`${d.date}: ${d.count} solved`}
                  />
                  <span className="text-[8px] text-slate-500 font-medium">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'][new Date(d.date).getDay()]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
