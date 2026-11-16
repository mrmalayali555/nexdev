'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Target, Sparkles } from 'lucide-react';
import GoalForm from '@/components/goals/GoalForm';
import { useGoals } from '@/hooks/useGoals';
import { GoalCategory } from '@/lib/types';
import { triggerHaptic } from '@/lib/haptics';

export default function NewGoalPage() {
  const router = useRouter();
  const { addGoal } = useGoals();

  const handleSubmit = (data: {
    title: string;
    description: string;
    category: GoalCategory;
    targetDate: string;
    color: string;
    milestones: string[];
  }) => {
    triggerHaptic('success');
    addGoal(data);
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
          Milestone Checkpoints
        </span>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
            <Target size={18} />
          </div>
          <span>Create New Goal</span>
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 mt-1.5">
          Break down big dreams into tangible, measurable milestones with AI support.
        </p>
      </div>

      {/* Form Container */}
      <div className="rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-white/10 flex items-center gap-2">
          <Sparkles size={16} className="text-blue-400" />
          <h2 className="text-sm font-bold text-white">Goal Parameters & Milestones</h2>
        </div>
        <GoalForm onSubmit={handleSubmit} onCancel={handleCancel} />
      </div>
    </div>
  );
}

