'use client';

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Target, Sparkles, Edit3 } from 'lucide-react';
import GoalForm from '@/components/goals/GoalForm';
import { useGoals } from '@/hooks/useGoals';
import { GoalCategory } from '@/lib/types';
import { triggerHaptic } from '@/lib/haptics';

function EditGoalContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const { goals, loaded, updateGoal } = useGoals();

  if (!loaded) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  const goal = goals.find((g) => g.id === id);

  if (!goal) {
    return (
      <div className="text-center py-16 px-4">
        <h2 className="text-lg font-bold text-white mb-2">Goal Not Found</h2>
        <p className="text-xs text-gray-400 mb-6">This goal may have been deleted or does not exist.</p>
        <Link
          href="/goals"
          className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold"
        >
          Back to Goals
        </Link>
      </div>
    );
  }

  const handleSubmit = (data: {
    title: string;
    description: string;
    category: GoalCategory;
    targetDate: string;
    color: string;
    milestones: string[];
  }) => {
    triggerHaptic('success');
    // Preserve completed status for existing milestones if matching titles
    const updatedMilestones = data.milestones.map((mTitle, idx) => {
      const existing = goal.milestones.find((em) => em.title === mTitle) || goal.milestones[idx];
      return {
        id: existing?.id || `m-${Date.now()}-${idx}`,
        title: mTitle,
        completed: existing ? existing.completed : false,
      };
    });

    updateGoal(goal.id, {
      title: data.title,
      description: data.description,
      category: data.category,
      targetDate: data.targetDate,
      color: data.color,
      milestones: updatedMilestones,
    });
    router.push('/goals');
  };

  const handleCancel = () => {
    triggerHaptic('light');
    router.push('/goals');
  };

  return (
    <div className="space-y-6 pb-28 sm:pb-12 max-w-2xl mx-auto">
      {/* Top Navigation */}
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/goals"
          onClick={() => triggerHaptic('light')}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-300 hover:text-white transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Goals</span>
        </Link>

        <span className="text-[11px] font-mono text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20">
          Edit Mode
        </span>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
            <Edit3 size={18} />
          </div>
          <span>Edit Goal</span>
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 mt-1.5">
          Adjust deadlines, milestone checkpoints, or goal scope.
        </p>
      </div>

      {/* Form Container */}
      <div className="rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-white/10 flex items-center gap-2">
          <Sparkles size={16} className="text-blue-400" />
          <h2 className="text-sm font-bold text-white">Modify Goal: {goal.title}</h2>
        </div>
        <GoalForm initial={goal} onSubmit={handleSubmit} onCancel={handleCancel} />
      </div>
    </div>
  );
}

export default function EditGoalPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
        </div>
      }
    >
      <EditGoalContent />
    </Suspense>
  );
}
