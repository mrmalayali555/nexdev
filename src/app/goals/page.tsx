'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useGoals } from '@/hooks/useGoals';
import GoalCard from '@/components/goals/GoalCard';
import GlassCard from '@/components/ui/GlassCard';
import Confetti from '@/components/ui/Confetti';
import { Goal, GoalCategory, GOAL_CATEGORIES } from '@/lib/types';
import { Plus, Target, CheckCircle2, Clock, PauseCircle, Trophy } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { triggerHaptic } from '@/lib/haptics';

export default function GoalsPage() {
  const router = useRouter();
  const {
    goals,
    loaded,
    updateGoal,
    deleteGoal,
    toggleMilestone,
    setProgress,
  } = useGoals();

  const [selectedStatus, setSelectedStatus] = useState<'all' | 'in-progress' | 'completed' | 'paused'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [confettiTrigger, setConfettiTrigger] = useState(false);

  if (!loaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  const handleMilestoneToggle = (goalId: string, milestoneId: string) => {
    const justCompleted = toggleMilestone(goalId, milestoneId);
    if (justCompleted) {
      setConfettiTrigger(true);
      setTimeout(() => setConfettiTrigger(false), 2000);
    }
  };

  const filteredGoals = goals.filter((g) => {
    const matchStatus = selectedStatus === 'all' || g.status === selectedStatus;
    const matchCategory = selectedCategory === 'All' || g.category === selectedCategory;
    return matchStatus && matchCategory;
  });

  const inProgressCount = goals.filter((g) => g.status === 'in-progress').length;
  const completedCount = goals.filter((g) => g.status === 'completed').length;
  const pausedCount = goals.filter((g) => g.status === 'paused').length;

  return (
    <div className="space-y-5 sm:space-y-8 pb-28 sm:pb-12">
      <Confetti trigger={confettiTrigger} />

      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>Goals</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-semibold border border-blue-500/30">
              {goals.length}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
            Turn vision into tangible, milestone-driven checkpoints.
          </p>
        </div>
        <Link
          href="/goals/new"
          onClick={() => triggerHaptic('light')}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:brightness-110 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-600/30 transition-all shrink-0"
        >
          <Plus size={16} />
          <span className="hidden xs:inline">New Goal</span>
          <span className="xs:hidden">Add</span>
        </Link>
      </div>

      {/* 3 Status Counter Tiles */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
        <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-blue-950/40 via-[#0a1224]/60 to-[#070914] border border-blue-500/25 shadow-md text-center flex flex-col items-center justify-center">
          <Clock size={16} className="text-blue-400 mb-1" />
          <p className="text-lg sm:text-2xl font-black text-white">{inProgressCount}</p>
          <p className="text-[10px] sm:text-xs text-blue-300 font-bold">In Progress</p>
        </div>
        <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-[#081816]/60 to-[#070914] border border-emerald-500/25 shadow-md text-center flex flex-col items-center justify-center">
          <CheckCircle2 size={16} className="text-emerald-400 mb-1" />
          <p className="text-lg sm:text-2xl font-black text-white">{completedCount}</p>
          <p className="text-[10px] sm:text-xs text-emerald-300 font-bold">Completed</p>
        </div>
        <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-amber-950/40 via-[#181316]/60 to-[#070914] border border-amber-500/25 shadow-md text-center flex flex-col items-center justify-center">
          <PauseCircle size={16} className="text-amber-400 mb-1" />
          <p className="text-lg sm:text-2xl font-black text-white">{pausedCount}</p>
          <p className="text-[10px] sm:text-xs text-amber-300 font-bold">Paused</p>
        </div>
      </div>

      {/* Filter and Category Strip */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/[0.03] border border-white/5 w-fit">
          {(['all', 'in-progress', 'completed', 'paused'] as const).map((status) => (
            <button
              key={status}
              onClick={() => {
                triggerHaptic('light');
                setSelectedStatus(status);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                selectedStatus === status
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {status.replace('-', ' ')}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto no-scrollbar flex items-center gap-2 pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 touch-pan-x">
          <button
            onClick={() => {
              triggerHaptic('light');
              setSelectedCategory('All');
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${
              selectedCategory === 'All'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white/[0.04] text-gray-400 hover:text-white border border-white/5'
            }`}
          >
            All Categories
          </button>
          {GOAL_CATEGORIES.map((cat) => (
            <button
              key={cat.name}
              onClick={() => {
                triggerHaptic('light');
                setSelectedCategory(cat.name);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all flex items-center gap-1.5 ${
                selectedCategory === cat.name
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white/[0.04] text-gray-400 hover:text-white border border-white/5'
              }`}
            >
              <span>{cat.emoji}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Goals List */}
      {filteredGoals.length === 0 ? (
        <GlassCard>
          <div className="text-center py-12 px-4">
            <Target size={36} className="text-gray-600 mx-auto mb-2.5" />
            <h3 className="text-base font-bold text-white">
              {goals.length === 0 ? 'No goals set yet' : 'No goals match filter'}
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              {goals.length === 0
                ? 'Define your first real target and break it into checkpoints with AI.'
                : 'Try another category or create a new goal.'}
            </p>
            <Link
              href="/goals/new"
              onClick={() => triggerHaptic('light')}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold"
            >
              <Plus size={14} /> Create Goal
            </Link>
          </div>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredGoals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onToggleMilestone={handleMilestoneToggle}
                onEdit={() => router.push(`/goals/edit?id=${goal.id}`)}
                onDelete={deleteGoal}
                onUpdateStatus={(id, status) => updateGoal(id, { status })}
                onSetProgress={setProgress}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
