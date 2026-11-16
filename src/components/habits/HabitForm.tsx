'use client';

import { useState } from 'react';
import { Habit, HabitCategory, HABIT_CATEGORIES } from '@/lib/types';
import Button from '@/components/ui/Button';

interface HabitFormProps {
  initial?: Habit | null;
  onSubmit: (data: {
    name: string;
    emoji: string;
    category: HabitCategory;
    frequency: 'daily' | 'weekly';
    color: string;
    challengeMode?: '21-day' | '66-day' | null;
  }) => void;
  onCancel: () => void;
}

const EMOJIS = ['💪', '🧘', '📚', '💧', '✍️', '🏃', '🎨', '🔤', '🎵', '💤', '🥗', '🧠', '🌅', '🚶', '💊'];

export default function HabitForm({ initial, onSubmit, onCancel }: HabitFormProps) {
  const [name, setName] = useState(initial?.name || '');
  const [emoji, setEmoji] = useState(initial?.emoji || '💪');
  const [category, setCategory] = useState<HabitCategory>(initial?.category || 'Health');
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>(initial?.frequency || 'daily');
  const [challengeMode, setChallengeMode] = useState<'21-day' | '66-day' | null>(
    initial?.challengeMode || null
  );

  const selectedCat = HABIT_CATEGORIES.find((c) => c.name === category);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({
      name: name.trim(),
      emoji,
      category,
      frequency,
      color: selectedCat?.color || '#8b5cf6',
      challengeMode,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Name */}
      <div>
        <label className="block text-sm text-gray-400 mb-2">Habit Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Morning Meditation"
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50 transition-colors"
        />
      </div>

      {/* Emoji picker */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm text-gray-400">Icon / Custom Emoji</label>
          <span className="text-xs text-purple-400">Selected: {emoji}</span>
        </div>

        {/* Custom Emoji Input Field */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-11 h-11 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-xl shrink-0">
            {emoji || '✨'}
          </div>
          <input
            type="text"
            value={emoji}
            onChange={(e) => setEmoji(e.target.value.trim() ? e.target.value : '💪')}
            placeholder="Type or paste any custom emoji..."
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 text-sm focus:outline-none focus:border-purple-500/50 transition-colors"
          />
        </div>

        {/* Quick select presets */}
        <div className="flex flex-wrap gap-2">
          {EMOJIS.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => setEmoji(e)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all ${
                emoji === e
                  ? 'bg-purple-500/30 border border-purple-500/50 scale-110'
                  : 'bg-white/5 border border-white/5 hover:bg-white/10'
              }`}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm text-gray-400 mb-2">Category</label>
        <div className="flex flex-wrap gap-2">
          {HABIT_CATEGORIES.map((cat) => (
            <button
              key={cat.name}
              type="button"
              onClick={() => setCategory(cat.name)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                category === cat.name
                  ? 'scale-105'
                  : 'opacity-50 hover:opacity-80'
              }`}
              style={{
                backgroundColor: `${cat.color}20`,
                color: cat.color,
                border: category === cat.name ? `1px solid ${cat.color}50` : '1px solid transparent',
              }}
            >
              {cat.emoji} {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Frequency */}
      <div>
        <label className="block text-sm text-gray-400 mb-2">Frequency</label>
        <div className="flex gap-2">
          {(['daily', 'weekly'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFrequency(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                frequency === f
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                  : 'bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Challenge Mode */}
      <div>
        <label className="block text-sm text-gray-400 mb-2">Challenge Mode (optional)</label>
        <div className="flex gap-2">
          {([null, '21-day', '66-day'] as const).map((mode) => (
            <button
              key={mode || 'none'}
              type="button"
              onClick={() => setChallengeMode(mode)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                challengeMode === mode
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10'
              }`}
            >
              {mode || 'None'}
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons - Large, accessible, highly visible */}
      <div className="sticky bottom-0 pt-4 pb-2 bg-[#0b0f19]/95 backdrop-blur-md border-t border-white/5 flex items-center justify-end gap-3 z-10">
        <Button variant="ghost" onClick={onCancel} className="px-5 py-2.5 text-gray-400 hover:text-white">
          Cancel
        </Button>
        <Button type="submit" className="px-6 py-2.5 font-bold shadow-lg shadow-purple-500/20">
          {initial ? 'Save Changes' : 'Create Habit'}
        </Button>
      </div>
    </form>
  );
}

