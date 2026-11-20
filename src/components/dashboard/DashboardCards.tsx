'use client';

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
    color: '#a855f7',
    badge: 'Habits',
    gradient: 'from-purple-900/30 via-[#0d1022]/60 to-[#070914]',
    getValue: (s: UserStats) => s.totalHabits,
  },
  {
    key: 'streak',
    label: 'Best Streak',
    icon: Flame,
    color: '#f59e0b',
    badge: 'Streak',
    gradient: 'from-amber-950/30 via-[#13101c]/60 to-[#070914]',
    getValue: (s: UserStats) => `${s.longestStreak}d`,
  },
  {
    key: 'goals',
    label: 'Active Goals',
    icon: Target,
    color: '#38bdf8',
    badge: 'Milestones',
    gradient: 'from-sky-950/30 via-[#0a1222]/60 to-[#070914]',
    getValue: (s: UserStats) => s.activeGoals,
  },
  {
    key: 'journal',
    label: 'Reflections',
    icon: BookOpen,
    color: '#10b981',
    badge: 'Journal',
    gradient: 'from-emerald-950/30 via-[#071518]/60 to-[#070914]',
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
            <div className={`p-4 sm:p-5 bg-gradient-to-br ${card.gradient} relative overflow-hidden`}>
              {/* Subtle top glow line */}
              <div
                className="absolute top-0 left-3 right-3 h-[1px] opacity-70"
                style={{
                  background: `linear-gradient(90deg, transparent, ${card.color}60, transparent)`,
                }}
              />

              <div className="flex items-center justify-between mb-3">
                <div
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center shadow-md transition-transform duration-300 group-hover:scale-105"
                  style={{
                    backgroundColor: `${card.color}18`,
                    border: `1px solid ${card.color}35`,
                  }}
                >
                  <Icon size={18} style={{ color: card.color }} />
                </div>
                <div
                  className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]"
                  style={{ backgroundColor: card.color, color: card.color }}
                />
              </div>

              <p className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {card.getValue(stats)}
              </p>
              <p className="text-[11px] sm:text-xs text-slate-400 font-semibold mt-1">
                {card.label}
              </p>
            </div>
          </GlassCard>
        );
      })}
    </div>
  );
}
