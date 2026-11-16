'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Habit } from '@/lib/types';
import { getLast52WeeksDates, getMonthName } from '@/lib/utils';
import { ArrowLeftRight } from 'lucide-react';

interface HeatMapProps {
  habit: Habit;
}

export default function HeatMap({ habit }: HeatMapProps) {
  const [weeks, setWeeks] = useState<string[][]>([]);

  useEffect(() => {
    setWeeks(getLast52WeeksDates());
  }, []);

  const monthLabels = useMemo(() => {
    const labels: { month: string; index: number }[] = [];
    let lastMonth = '';
    weeks.forEach((week, i) => {
      const month = getMonthName(week[0]);
      if (month !== lastMonth) {
        labels.push({ month, index: i });
        lastMonth = month;
      }
    });
    return labels;
  }, [weeks]);

  const getIntensity = (date: string): number => {
    return habit.completions[date] ? 1 : 0;
  };

  const getColor = (intensity: number): string => {
    if (intensity === 0) return 'rgba(255,255,255,0.04)';
    return habit.color || '#8b5cf6';
  };

  const dayLetters = ['M', '', 'W', '', 'F', '', 'S'];

  if (weeks.length === 0) {
    return (
      <div className="h-28 flex items-center justify-center text-xs text-gray-500">
        Loading activity heatmap...
      </div>
    );
  }

  return (
    <div>
      {/* Mobile Swipe Hint */}
      <div className="flex sm:hidden items-center justify-between text-[11px] text-gray-400 mb-2">
        <span className="flex items-center gap-1">
          <ArrowLeftRight size={12} className="text-purple-400" />
          <span>Swipe horizontally</span>
        </span>
        <span className="text-[10px] text-gray-500">52 weeks history</span>
      </div>

      <div className="overflow-x-auto no-scrollbar pb-2 touch-pan-x">
        <div className="min-w-[690px]">
          {/* Month labels */}
          <div className="relative h-4 mb-2 ml-6">
            {monthLabels.map(({ month, index }) => (
              <span
                key={`${month}-${index}`}
                className="absolute text-[10px] text-gray-500 font-medium"
                style={{ left: `${index * 13}px` }}
              >
                {month}
              </span>
            ))}
          </div>

          {/* Heatmap Grid with day labels */}
          <div className="flex gap-2">
            {/* Day of week labels */}
            <div className="flex flex-col gap-[3px] text-[9px] text-gray-500 w-4 justify-between py-[1px]">
              {dayLetters.map((letter, i) => (
                <span key={i} className="h-[11px] leading-[11px] text-center">
                  {letter}
                </span>
              ))}
            </div>

            {/* Grid columns */}
            <div className="flex gap-[3px]">
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-[3px]">
                  {week.map((date, di) => {
                    const intensity = getIntensity(date);
                    return (
                      <motion.div
                        key={date}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: (wi * 7 + di) * 0.0003 }}
                        className="w-[11px] h-[11px] rounded-[2px] transition-transform active:scale-125 hover:scale-125 cursor-pointer"
                        style={{
                          backgroundColor: getColor(intensity),
                          boxShadow: intensity > 0 ? `0 0 6px ${habit.color || '#8b5cf6'}66` : 'none',
                        }}
                        title={`${date}: ${intensity ? 'Completed' : 'Not completed'}`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-between sm:justify-end gap-3 mt-3 text-[10px] text-gray-500 pt-1">
            <span className="sm:hidden text-gray-400">Activity Level:</span>
            <div className="flex items-center gap-1.5">
              <span>Less</span>
              <div className="w-[11px] h-[11px] rounded-[2px] bg-white/[0.04]" />
              <div
                className="w-[11px] h-[11px] rounded-[2px]"
                style={{ backgroundColor: `${habit.color || '#8b5cf6'}88` }}
              />
              <div
                className="w-[11px] h-[11px] rounded-[2px]"
                style={{ backgroundColor: habit.color || '#8b5cf6' }}
              />
              <span>More</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
