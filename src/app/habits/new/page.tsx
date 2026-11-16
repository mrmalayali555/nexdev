'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Plus } from 'lucide-react';
import HabitForm from '@/components/habits/HabitForm';
import { useHabits } from '@/hooks/useHabits';
import { HabitCategory } from '@/lib/types';
import { triggerHaptic } from '@/lib/haptics';

export default function NewHabitPage() {
  const router = useRouter();
  const { addHabit } = useHabits();

  const handleSubmit = (data: {
    name: string;
    emoji: string;
    category: HabitCategory;
    frequency: 'daily' | 'weekly';
    color: string;
    challengeMode?: '21-day' | '66-day' | null;
  }) => {
    triggerHaptic('success');
    addHabit({
      ...data,
      challengeStartDate: data.challengeMode ? new Date().toISOString() : undefined,
    });
    router.push('/habits');
  };

  const handleCancel = () => {
    triggerHaptic('light');
    router.push('/habits');
  };

  return (
    <div className="space-y-6 pb-28 sm:pb-12 max-w-2xl mx-auto">
      {/* Top Navigation */}
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/habits"
          onClick={() => triggerHaptic('light')}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-300 hover:text-white transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Habits</span>
        </Link>

        <span className="text-[11px] font-mono text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20">
          Atomic Habits Builder
        </span>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/30">
            <Plus size={18} />
          </div>
          <span>Create New Habit</span>
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 mt-1.5">
          Design a micro-habit with high automaticity. Consistency creates identity.
        </p>
      </div>

      {/* Form Container */}
      <div className="rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-white/10 flex items-center gap-2">
          <Sparkles size={16} className="text-purple-400" />
          <h2 className="text-sm font-bold text-white">Habit Specifications</h2>
        </div>
        <HabitForm onSubmit={handleSubmit} onCancel={handleCancel} />
      </div>
    </div>
  );
}

