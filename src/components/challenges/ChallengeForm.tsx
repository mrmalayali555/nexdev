'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import { HabitCategory, HABIT_CATEGORIES } from '@/lib/types';
import { Zap, Sparkles } from 'lucide-react';

interface ChallengeFormProps {
  onSubmit: (data: {
    title: string;
    description: string;
    category: HabitCategory;
    durationDays: number;
    color: string;
    emoji: string;
  }) => void;
  onCancel: () => void;
}

const PRESET_DURATIONS = [
  { days: 21, label: '21 Days', desc: 'Neural Genesis' },
  { days: 30, label: '30 Days', desc: 'Monthly Sprint' },
  { days: 66, label: '66 Days', desc: 'Habit Automation' },
  { days: 75, label: '75 Hard', desc: 'Mental Toughness' },
];

const EMOJIS = ['⚡', '🔥', '🧬', '🧘', '💪', '📚', '🎯', '🚀', '💎', '🏃', '💧', '🧠'];

export default function ChallengeForm({ onSubmit, onCancel }: ChallengeFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<HabitCategory>('Productivity');
  const [durationDays, setDurationDays] = useState(21);
  const [customDays, setCustomDays] = useState('');
  const [emoji, setEmoji] = useState('⚡');
  const [color, setColor] = useState('#8b5cf6');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const finalDuration = customDays ? Math.max(3, parseInt(customDays) || 21) : durationDays;

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      category,
      durationDays: finalDuration,
      color,
      emoji,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Title */}
      <div>
        <label className="block text-xs font-semibold text-gray-400 mb-1.5">
          Challenge Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. 21-Day Morning Meditation Sprint"
          required
          className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-gray-600 text-sm focus:outline-none focus:border-purple-500/50"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-semibold text-gray-400 mb-1.5">
          Description & Objective
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          placeholder="What rules or commitment are you making?"
          className="w-full px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-gray-600 text-sm focus:outline-none focus:border-purple-500/50 resize-none"
        />
      </div>

      {/* Duration Selector */}
      <div>
        <label className="block text-xs font-semibold text-gray-400 mb-1.5">
          Challenge Duration
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PRESET_DURATIONS.map((preset) => (
            <button
              key={preset.days}
              type="button"
              onClick={() => {
                setDurationDays(preset.days);
                setCustomDays('');
              }}
              className={`p-2.5 rounded-xl text-center border transition-all ${
                durationDays === preset.days && !customDays
                  ? 'bg-purple-500/20 border-purple-500/50 text-white shadow-md'
                  : 'bg-white/5 border-white/5 text-gray-400 hover:text-white'
              }`}
            >
              <div className="font-bold text-sm">{preset.label}</div>
              <div className="text-[10px] text-gray-400">{preset.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="block text-xs font-semibold text-gray-400 mb-1.5">
          Category
        </label>
        <div className="flex flex-wrap gap-1.5">
          {HABIT_CATEGORIES.map((cat) => (
            <button
              key={cat.name}
              type="button"
              onClick={() => {
                setCategory(cat.name);
                setColor(cat.color);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                category === cat.name ? 'scale-105' : 'opacity-60 hover:opacity-100'
              }`}
              style={{
                backgroundColor: `${cat.color}20`,
                color: cat.color,
                border: category === cat.name ? `1px solid ${cat.color}60` : '1px solid transparent',
              }}
            >
              {cat.emoji} {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Emoji Picker */}
      <div>
        <label className="block text-xs font-semibold text-gray-400 mb-1.5">
          Icon
        </label>
        <div className="flex flex-wrap gap-2">
          {EMOJIS.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => setEmoji(e)}
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-base transition-all ${
                emoji === e
                  ? 'bg-purple-500/30 border border-purple-500/60 scale-110 shadow-sm'
                  : 'bg-white/5 border border-white/5 hover:bg-white/10'
              }`}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      {/* Sticky Bottom Action Buttons */}
      <div className="sticky bottom-0 pt-4 pb-2 bg-[#0b0f19]/95 backdrop-blur-md border-t border-white/5 flex items-center justify-end gap-3 z-10">
        <Button variant="ghost" onClick={onCancel} className="px-5 py-2.5 text-gray-400 hover:text-white">
          Cancel
        </Button>
        <Button type="submit" className="px-6 py-2.5 font-bold shadow-lg shadow-purple-500/20">
          Start Challenge
        </Button>
      </div>
    </form>
  );
}
