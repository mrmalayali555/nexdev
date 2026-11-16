'use client';

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Edit3 } from 'lucide-react';
import HabitForm from '@/components/habits/HabitForm';
import { useHabits } from '@/hooks/useHabits';
import { HabitCategory } from '@/lib/types';
import { triggerHaptic } from '@/lib/haptics';

function EditHabitContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const { habits, loaded, updateHabit } = useHabits();

  if (!loaded) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  const habit = habits.find((h) => h.id === id);

  if (!habit) {
    return (
      <div className="text-center py-16 px-4">
        <h2 className="text-lg font-bold text-white mb-2">Habit Not Found</h2>
        <p className="text-xs text-gray-400 mb-6">This habit may have been deleted or does not exist.</p>
        <Link
          href="/habits"
          className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold"
        >
          Back to Habits
        </Link>
      </div>
    );
  }

  const handleSubmit = (data: {
    name: string;
    emoji: string;
    category: HabitCategory;
    frequency: 'daily' | 'weekly';
    color: string;
    challengeMode?: '21-day' | '66-day' | null;
  }) => {
    triggerHaptic('success');
    updateHabit(habit.id, {
      ...data,
      challengeStartDate: data.challengeMode ? (habit.challengeStartDate || new Date().toISOString()) : undefined,
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
          Edit Mode
        </span>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/30">
            <Edit3 size={18} />
          </div>
          <span>Edit Habit</span>
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 mt-1.5">
          Adjust frequency, automaticity challenges, or categories.
        </p>
      </div>

      {/* Form Container */}
      <div className="rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-white/10 flex items-center gap-2">
          <Sparkles size={16} className="text-purple-400" />
          <h2 className="text-sm font-bold text-white">Modify Habit: {habit.name}</h2>
        </div>
        <HabitForm initial={habit} onSubmit={handleSubmit} onCancel={handleCancel} />
      </div>
    </div>
  );
}

export default function EditHabitPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="w-10 h-10 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
        </div>
      }
    >
      <EditHabitContent />
    </Suspense>
  );
}

