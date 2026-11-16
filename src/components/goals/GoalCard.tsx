'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Goal, GOAL_CATEGORIES } from '@/lib/types';
import ProgressBar from '@/components/ui/ProgressBar';
import { triggerHaptic } from '@/lib/haptics';
import { Calendar, Check, Circle, Trash2, Edit3, Pause, Play } from 'lucide-react';

interface GoalCardProps {
  goal: Goal;
  onToggleMilestone: (goalId: string, milestoneId: string) => void;
  onEdit: (goal: Goal) => void;
  onDelete: (id: string) => void;
  onUpdateStatus: (id: string, status: Goal['status']) => void;
  onSetProgress: (id: string, progress: number) => void;
}

export default function GoalCard({
  goal,
  onToggleMilestone,
  onEdit,
  onDelete,
  onUpdateStatus,
  onSetProgress,
}: GoalCardProps) {
  const [daysLeft, setDaysLeft] = useState<number | null>(null);

  useEffect(() => {
    const diff = Math.ceil((new Date(goal.targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    setDaysLeft(Math.max(0, diff));
  }, [goal.targetDate]);

  const category = GOAL_CATEGORIES.find((c) => c.name === goal.category);

  const statusColors = {
    'in-progress': { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
    completed: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
    paused: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
  };

  const sc = statusColors[goal.status];

  const handleMilestoneClick = (milestoneId: string, completed: boolean) => {
    triggerHaptic(completed ? 'light' : 'success');
    onToggleMilestone(goal.id, milestoneId);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl overflow-hidden shadow-lg transition-all"
    >
      <div className="p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-2 flex-wrap">
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${sc.bg} ${sc.text} border ${sc.border}`}
              >
                {goal.status === 'in-progress' ? 'Active' : goal.status === 'completed' ? 'Completed' : 'Paused'}
              </span>
              <span
                className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                style={{
                  backgroundColor: `${category?.color || '#8b5cf6'}20`,
                  color: category?.color || '#8b5cf6',
                }}
              >
                {category?.emoji} {goal.category}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
              {goal.title}
            </h3>
            {goal.description && (
              <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                {goal.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {goal.status === 'in-progress' ? (
              <button
                onClick={() => onUpdateStatus(goal.id, 'paused')}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-amber-400 hover:bg-amber-500/10 active:scale-90 transition-all"
                title="Pause goal"
              >
                <Pause size={14} />
              </button>
            ) : goal.status === 'paused' ? (
              <button
                onClick={() => onUpdateStatus(goal.id, 'in-progress')}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 active:scale-90 transition-all"
                title="Resume goal"
              >
                <Play size={14} />
              </button>
            ) : null}
            <button
              onClick={() => onEdit(goal)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 active:scale-90 transition-all"
              title="Edit goal"
            >
              <Edit3 size={14} />
            </button>
            <button
              onClick={() => onDelete(goal.id)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-400 hover:bg-red-500/10 active:scale-90 transition-all"
              title="Delete goal"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-3.5">
          <ProgressBar value={goal.progress} color={goal.color} />
        </div>

        {/* Deadline Information */}
        <div className="flex items-center justify-between text-[11px] text-gray-400 mb-3.5 pt-1">
          <div className="flex items-center gap-1.5">
            <Calendar size={13} className="text-purple-400" />
            <span>
              {daysLeft !== null
                ? daysLeft > 0
                  ? `${daysLeft} days remaining`
                  : goal.status === 'completed'
                  ? 'Goal completed! 🏆'
                  : 'Past target date'
                : 'Target date'}
            </span>
          </div>
          <span className="text-gray-500">
            Due {new Date(goal.targetDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </span>
        </div>

        {/* Manual Progress Slider if no discrete milestones */}
        {goal.milestones.length === 0 && (
          <div className="mb-2">
            <input
              type="range"
              min="0"
              max="100"
              value={goal.progress}
              onChange={(e) => onSetProgress(goal.id, parseInt(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer accent-purple-500"
              style={{
                background: `linear-gradient(to right, ${goal.color} ${goal.progress}%, rgba(255,255,255,0.1) ${goal.progress}%)`,
              }}
            />
          </div>
        )}

        {/* Touch-Friendly Milestones */}
        {goal.milestones.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-400 font-semibold mb-1">
              <span>Milestones</span>
              <span>
                {goal.milestones.filter((m) => m.completed).length}/{goal.milestones.length}
              </span>
            </div>

            {goal.milestones.map((milestone) => (
              <motion.button
                key={milestone.id}
                onClick={() => handleMilestoneClick(milestone.id, milestone.completed)}
                className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all text-left ${
                  milestone.completed
                    ? 'bg-emerald-500/[0.08] border border-emerald-500/20'
                    : 'bg-white/[0.02] border border-white/5 active:bg-white/[0.06] hover:bg-white/[0.04]'
                }`}
                whileTap={{ scale: 0.98 }}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                    milestone.completed
                      ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/40'
                      : 'border-2 border-gray-600'
                  }`}
                >
                  {milestone.completed && <Check size={14} className="stroke-[3]" />}
                </div>
                <span
                  className={`text-xs sm:text-sm flex-1 leading-snug ${
                    milestone.completed ? 'text-gray-400 line-through' : 'text-gray-200'
                  }`}
                >
                  {milestone.title}
                </span>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
