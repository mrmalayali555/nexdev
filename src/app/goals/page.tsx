'use client';

import { useState } from 'react';
import { useGoals } from '@/hooks/useGoals';
import GoalCard from '@/components/goals/GoalCard';
import GoalForm from '@/components/goals/GoalForm';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import GlassCard from '@/components/ui/GlassCard';
import Confetti from '@/components/ui/Confetti';
import { Goal, GoalCategory, GOAL_CATEGORIES } from '@/lib/types';
import { Plus, Target, CheckCircle2, Clock, PauseCircle, Trophy } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

export default function GoalsPage() {
  const {
    goals,
    loaded,
    addGoal,
    updateGoal,
    deleteGoal,
    toggleMilestone,
    setProgress,
  } = useGoals();

  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const handleFormSubmit = (data: {
    title: string;
    description: string;
    category: GoalCategory;
    targetDate: string;
    color: string;
    milestones: string[];
  }) => {
    addGoal(data);
    setIsModalOpen(false);
    setConfettiTrigger(true);
    setTimeout(() => setConfettiTrigger(false), 2000);
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
    <div className="space-y-5 sm:space-y-8 pb-12">
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
        <Button onClick={() => setIsModalOpen(true)} size="md" className="shrink-0 font-semibold">
          <Plus size={16} /> <span className="hidden xs:inline">New Goal</span><span className="xs:hidden">Add</span>
        </Button>
      </div>

      {/* 3 Status Counter Tiles */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
        <div className="p-3 sm:p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-center flex flex-col items-center justify-center">
          <Clock size={16} className="text-blue-400 mb-1" />
          <p className="text-lg sm:text-2xl font-extrabold text-white">{inProgressCount}</p>
          <p className="text-[10px] sm:text-xs text-blue-300 font-medium">In Progress</p>
        </div>

        <div className="p-3 sm:p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center flex flex-col items-center justify-center">
          <CheckCircle2 size={16} className="text-emerald-400 mb-1" />
          <p className="text-lg sm:text-2xl font-extrabold text-white">{completedCount}</p>
          <p className="text-[10px] sm:text-xs text-emerald-300 font-medium">Done</p>
        </div>

        <div className="p-3 sm:p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center flex flex-col items-center justify-center">
          <PauseCircle size={16} className="text-amber-400 mb-1" />
          <p className="text-lg sm:text-2xl font-extrabold text-white">{pausedCount}</p>
          <p className="text-[10px] sm:text-xs text-amber-300 font-medium">Paused</p>
        </div>
      </div>

      {/* Mobile-first Horizontal Scrollable Category Pills */}
      <div className="space-y-3">
        <div className="overflow-x-auto no-scrollbar flex items-center gap-2 pb-1 -mx-3.5 px-3.5 sm:mx-0 sm:px-0 touch-pan-x">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${
              selectedCategory === 'All'
                ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md shadow-blue-500/25'
                : 'bg-white/[0.05] text-gray-400 hover:text-white border border-white/5'
            }`}
          >
            All Categories
          </button>
          {GOAL_CATEGORIES.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium shrink-0 transition-all flex items-center gap-1.5 ${
                selectedCategory === cat.name
                  ? 'bg-white/20 text-white border border-white/30 font-semibold shadow-sm'
                  : 'bg-white/[0.04] text-gray-400 hover:text-white border border-white/5'
              }`}
            >
              <span>{cat.emoji}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Status filter tabs */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 bg-white/[0.04] p-1 rounded-xl border border-white/5">
            {(['all', 'in-progress', 'completed', 'paused'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  selectedStatus === status
                    ? 'bg-blue-500/30 text-blue-200 font-semibold shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {status === 'in-progress'
                  ? 'Active'
                  : status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>

          <span className="text-xs text-gray-500 font-medium">
            {filteredGoals.length} {filteredGoals.length === 1 ? 'goal' : 'goals'}
          </span>
        </div>
      </div>

      {/* Goals List */}
      {filteredGoals.length === 0 ? (
        <GlassCard>
          <div className="text-center py-12 px-4">
            <Target size={32} className="text-gray-600 mx-auto mb-2" />
            <h3 className="text-base font-semibold text-white">No goals match filter</h3>
            <p className="text-xs text-gray-400 mt-1">Try another category or create a new goal.</p>
            <Button onClick={() => setIsModalOpen(true)} className="mt-4" size="sm">
              <Plus size={14} /> Create Goal
            </Button>
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
                onEdit={() => {}}
                onDelete={deleteGoal}
                onUpdateStatus={(id, status) => updateGoal(id, { status })}
                onSetProgress={setProgress}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add Goal Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Goal"
      >
        <GoalForm
          onSubmit={handleFormSubmit}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
