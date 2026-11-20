'use client';

import { useScreenTime } from '@/hooks/useScreenTime';
import GlassCard from '@/components/ui/GlassCard';
import Link from 'next/link';
import { ArrowRight, Smartphone, Clock } from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';
import { SCREENTIME_CATEGORIES } from '@/lib/types';

export default function ScreenTimeCard() {
  const { getTodayEntry, getWeekData } = useScreenTime();
  const todayEntry = getTodayEntry();
  const weekData = getWeekData();

  const totalToday = todayEntry?.totalMinutes || 0;
  const hours = Math.floor(totalToday / 60);
  const mins = totalToday % 60;

  // Top 3 apps by time
  const topApps = todayEntry
    ? [...todayEntry.apps].sort((a, b) => b.minutes - a.minutes).slice(0, 3)
    : [];

  // Week max for bar scaling
  const weekMax = Math.max(...weekData.map((d) => d.total), 60);

  return (
    <GlassCard delay={0.15}>
      <div className="p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500/25 to-blue-500/20 flex items-center justify-center text-cyan-400 shadow-sm shadow-cyan-500/20">
              <Smartphone size={16} />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">Screen Time</h3>
              <p className="text-[10px] text-slate-400 font-medium">Today&apos;s usage</p>
            </div>
          </div>
          <Link
            href="/screentime"
            onClick={() => triggerHaptic('light')}
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-bold"
          >
            Log Time <ArrowRight size={13} />
          </Link>
        </div>

        {/* Today's Total */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 p-3.5 rounded-2xl bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-transparent border border-cyan-500/20">
            <div className="flex items-center gap-2 mb-1">
              <Clock size={14} className="text-cyan-400" />
              <span className="text-[11px] text-slate-400 font-medium">Total Today</span>
            </div>
            <p className="text-2xl font-black text-white">
              {totalToday === 0 ? (
                <span className="text-sm text-slate-500">No data yet</span>
              ) : (
                <>
                  {hours > 0 && <span>{hours}<span className="text-sm text-cyan-400 ml-0.5">h</span></span>}
                  {' '}{mins > 0 && <span>{mins}<span className="text-sm text-cyan-400 ml-0.5">m</span></span>}
                </>
              )}
            </p>
          </div>

          {/* Mini Week Bar Chart */}
          <div className="flex items-end gap-1 h-14">
            {weekData.map((d, i) => {
              const h = d.total > 0 ? Math.max((d.total / weekMax) * 56, 4) : 2;
              const isToday = i === 6;
              return (
                <div key={d.date} className="flex flex-col items-center gap-0.5">
                  <div
                    className={`w-3.5 rounded-full transition-all duration-500 ${
                      isToday
                        ? 'bg-gradient-to-t from-cyan-500 to-blue-400 shadow-[0_0_8px_rgba(34,211,238,0.4)]'
                        : 'bg-white/[0.08]'
                    }`}
                    style={{ height: `${h}px` }}
                  />
                  <span className="text-[8px] text-slate-500 font-medium">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'][new Date(d.date).getDay()]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Apps */}
        {topApps.length > 0 && (
          <div className="space-y-2">
            {topApps.map((app, i) => {
              const cat = SCREENTIME_CATEGORIES.find((c) => c.name === app.category);
              const pct = totalToday > 0 ? Math.round((app.minutes / totalToday) * 100) : 0;
              return (
                <div
                  key={i}
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06]"
                >
                  <span className="text-lg">{cat?.emoji || '📱'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white truncate">{app.name}</span>
                      <span className="text-[10px] text-slate-400 font-medium">{app.minutes}m</span>
                    </div>
                    <div className="w-full h-1 rounded-full bg-white/[0.06] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          background: cat?.color || '#22d3ee',
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </GlassCard>
  );
}
