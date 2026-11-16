'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/ui/GlassCard';
import { getDayName, getWeekDates, getToday } from '@/lib/utils';

interface WeeklyChartProps {
  data: number[];
}

export default function WeeklyChart({ data }: WeeklyChartProps) {
  const [weekDates, setWeekDates] = useState<string[]>([]);
  const [todayStr, setTodayStr] = useState<string>('');

  useEffect(() => {
    setWeekDates(getWeekDates());
    setTodayStr(getToday());
  }, []);

  const maxVal = Math.max(...data, 1);
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <GlassCard delay={0.3}>
      <div className="p-6">
        <h3 className="text-sm font-semibold text-gray-300 mb-6">Weekly Progress</h3>
        <div className="flex items-end justify-between gap-2 h-40">
          {data.map((value, i) => {
            const height = (value / maxVal) * 100;
            const dateStr = weekDates[i];
            const isToday = dateStr ? dateStr === todayStr : i === data.length - 1;
            const label = dateStr ? getDayName(dateStr) : days[i] || '';

            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-xs text-gray-400 font-medium">{value}%</span>
                <div className="w-full relative" style={{ height: '100px' }}>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ duration: 0.8, delay: 0.1 * i, ease: 'easeOut' }}
                    className="absolute bottom-0 w-full rounded-lg"
                    style={{
                      background: isToday
                        ? 'linear-gradient(to top, #8b5cf6, #6366f1)'
                        : 'linear-gradient(to top, rgba(139,92,246,0.3), rgba(99,102,241,0.3))',
                      boxShadow: isToday ? '0 0 20px rgba(139,92,246,0.3)' : 'none',
                    }}
                  />
                </div>
                <span className={`text-xs ${isToday ? 'text-purple-400 font-semibold' : 'text-gray-500'}`}>
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
