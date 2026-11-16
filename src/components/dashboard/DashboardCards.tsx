'use client';

import { motion } from 'framer-motion';
import GlassCard from '@/components/ui/GlassCard';
import { CheckSquare, Target, Flame, BookOpen } from 'lucide-react';
import { UserStats } from '@/lib/types';

interface DashboardCardsProps {
  stats: UserStats;
}

const cards = [
  {
    key: 'habits',
    label: 'Total Habits',
    icon: CheckSquare,
    color: '#8b5cf6',
    gradient: 'from-purple-500/15 to-purple-600/5',
    getValue: (s: UserStats) => s.totalHabits,
  },
  {
    key: 'streak',
    label: 'Best Streak',
    icon: Flame,
    color: '#f59e0b',
    gradient: 'from-amber-500/15 to-orange-600/5',
    getValue: (s: UserStats) => `${s.longestStreak}d`,
  },
  {
    key: 'goals',
    label: 'Active Goals',
    icon: Target,
    color: '#3b82f6',
    gradient: 'from-blue-500/15 to-blue-600/5',
    getValue: (s: UserStats) => s.activeGoals,
  },
  {
    key: 'journal',
    label: 'Reflections',
    icon: BookOpen,
    color: '#10b981',
    gradient: 'from-emerald-500/15 to-emerald-600/5',
    getValue: (s: UserStats) => s.journalEntries,
  },
];

export default function DashboardCards({ stats }: DashboardCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <GlassCard key={card.key} delay={i * 0.08} hover>
            <div className={`p-4 sm:p-5 bg-gradient-to-br ${card.gradient}`}>
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shadow-sm"
                  style={{ backgroundColor: `${card.color}25` }}
                >
                  <Icon size={18} style={{ color: card.color }} />
                </div>
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: card.color }}
                />
              </div>
              <p className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                {card.getValue(stats)}
              </p>
              <p className="text-[11px] sm:text-xs text-gray-400 font-medium mt-0.5">
                {card.label}
              </p>
            </div>
          </GlassCard>
        );
      })}
    </div>
  );
}
