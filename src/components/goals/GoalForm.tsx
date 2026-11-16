'use client';

import { useState } from 'react';
import { GoalCategory, GOAL_CATEGORIES } from '@/lib/types';
import Button from '@/components/ui/Button';
import { Plus, X, Sparkles, RefreshCw } from 'lucide-react';
import { suggestMilestonesForGoal, isAIConfigured } from '@/lib/ai';
import { triggerHaptic } from '@/lib/haptics';

interface GoalFormProps {
  onSubmit: (data: {
    title: string;
    description: string;
    category: GoalCategory;
    targetDate: string;
    color: string;
    milestones: string[];
  }) => void;
  onCancel: () => void;
}

export default function GoalForm({ onSubmit, onCancel }: GoalFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<GoalCategory>('Personal');
  const [targetDate, setTargetDate] = useState('');
  const [milestones, setMilestones] = useState<string[]>(['']);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const selectedCat = GOAL_CATEGORIES.find((c) => c.name === category);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !targetDate) return;
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      category,
      targetDate,
      color: selectedCat?.color || '#8b5cf6',
      milestones: milestones.filter((m) => m.trim()),
    });
  };

  const addMilestone = () => setMilestones([...milestones, '']);
  const removeMilestone = (i: number) =>
    setMilestones(milestones.filter((_, idx) => idx !== i));
  const updateMilestone = (i: number, val: string) =>
    setMilestones(milestones.map((m, idx) => (idx === i ? val : m)));

  const handleAiSuggestMilestones = async () => {
    if (!title.trim() || isAiLoading) return;
    triggerHaptic('light');
    setIsAiLoading(true);

    try {
      const suggested = await suggestMilestonesForGoal(title.trim(), description.trim());
      if (suggested && suggested.length > 0) {
        setMilestones(suggested);
        triggerHaptic('success');
      }
    } catch (e: any) {
      console.warn('AI suggestions:', e);
      alert(e?.message || 'Please configure an AI token in AI Coach Settings.');
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
      <div>
        <label className="block text-xs font-semibold text-gray-400 mb-1.5">Goal Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Run a Half Marathon or Learn Spanish"
          className="w-full px-3.5 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50 text-sm transition-colors"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-400 mb-1.5">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Why does this goal matter to you?..."
          rows={2}
          className="w-full px-3.5 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50 text-xs sm:text-sm transition-colors resize-none"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-400 mb-1.5">Category</label>
        <div className="flex flex-wrap gap-1.5">
          {GOAL_CATEGORIES.map((cat) => (
            <button
              key={cat.name}
              type="button"
              onClick={() => setCategory(cat.name)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                category === cat.name ? 'scale-105 shadow-sm' : 'opacity-50 hover:opacity-80'
              }`}
              style={{
                backgroundColor: `${cat.color}20`,
                color: cat.color,
                border:
                  category === cat.name
                    ? `1px solid ${cat.color}50`
                    : '1px solid transparent',
              }}
            >
              {cat.emoji} {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-400 mb-1.5">Target Date</label>
        <input
          type="date"
          value={targetDate}
          onChange={(e) => setTargetDate(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-white text-xs sm:text-sm focus:outline-none focus:border-purple-500/50 transition-colors"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-gray-400">Milestone Checkpoints</label>
          <button
            type="button"
            onClick={handleAiSuggestMilestones}
            disabled={!title.trim() || isAiLoading}
            className="flex items-center gap-1.5 text-xs text-purple-300 bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 px-2.5 py-1 rounded-xl disabled:opacity-40 transition-all font-semibold active:scale-95"
          >
            {isAiLoading ? (
              <RefreshCw size={12} className="animate-spin text-purple-300" />
            ) : (
              <Sparkles size={12} className="text-amber-400" />
            )}
            <span>AI Auto-Breakdown</span>
          </button>
        </div>

        <div className="space-y-2">
          {milestones.map((m, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                value={m}
                onChange={(e) => updateMilestone(i, e.target.value)}
                placeholder={`Milestone ${i + 1}`}
                className="flex-1 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-600 text-xs sm:text-sm focus:outline-none focus:border-purple-500/50 transition-colors"
              />
              {milestones.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeMilestone(i)}
                  className="p-2 rounded-xl hover:bg-red-500/10 transition-colors"
                >
                  <X size={14} className="text-gray-500" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addMilestone}
            className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 font-medium transition-colors pt-1"
          >
            <Plus size={14} /> Add another milestone
          </button>
        </div>
      </div>

      <div className="flex justify-end gap-2.5 pt-2">
        <Button variant="ghost" onClick={onCancel} size="sm">Cancel</Button>
        <Button type="submit" size="sm">Create Goal</Button>
      </div>
    </form>
  );
}
