'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/ui/GlassCard';
import { getDayName, getWeekDates, getToday } from '@/lib/utils';
import { TrendingUp } from 'lucide-react';

interface WeeklyChartProps {
  data: number[];
}

export default function WeeklyChart({ data }: WeeklyChartProps) {
  const [weekDates, setWeekDates] = useState<string[]>([]);
  const [todayStr, setTodayStr] = useState<string>('');

  useEffect(() => {
    const refreshDates = () => {
      setWeekDates(getWeekDates());
      setTodayStr(getToday());
    };
    refreshDates();
    window.addEventListener('nexdev-day-changed', refreshDates);
    window.addEventListener('visibilitychange', refreshDates);
    window.addEventListener('focus', refreshDates);
    const interval = setInterval(refreshDates, 30000);
    return () => {
      window.removeEventListener('nexdev-day-changed', refreshDates);
      window.removeEventListener('visibilitychange', refreshDates);
      window.removeEventListener('focus', refreshDates);
      clearInterval(interval);
    };
  }, []);

  const maxVal = Math.max(...data, 1);
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <GlassCard delay={0.3}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
              <TrendingUp size={15} />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-white">Weekly Performance</h3>
          </div>
          <span className="text-[11px] font-bold text-purple-300 px-2.5 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/25">
            Last 7 Days
          </span>
        </div>

        <div className="flex items-end justify-between gap-2.5 h-44 pt-4">
          {data.map((value, i) => {
            const height = (value / maxVal) * 100;
            const dateStr = weekDates[i];
            const isToday = dateStr ? dateStr === todayStr : i === data.length - 1;
            const label = dateStr ? getDayName(dateStr) : days[i] || '';

            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <span className={`text-[11px] font-bold transition-colors ${isToday ? 'text-purple-300' : 'text-slate-400'}`}>
                  {value}%
                </span>
                <div className="w-full relative h-[105px] bg-white/[0.02] rounded-xl flex items-end p-1 border border-white/[0.04]">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(height, 8)}%` }}
                    transition={{ duration: 0.8, delay: 0.08 * i, ease: 'easeOut' }}
                    className="w-full rounded-lg relative overflow-hidden"
                    style={{
                      background: isToday
                        ? 'linear-gradient(to top, #7c3aed, #6366f1)'
                        : 'linear-gradient(to top, rgba(124, 58, 237, 0.35), rgba(99, 102, 241, 0.35))',
                      boxShadow: isToday ? '0 0 16px rgba(124, 58, 237, 0.5)' : 'none',
                    }}
                  >
                    {isToday && (
                      <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/70" />
                    )}
                  </motion.div>
                </div>
                <span className={`text-xs font-bold ${isToday ? 'text-purple-400' : 'text-slate-400'}`}>
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </GlassCard>
  );
}
