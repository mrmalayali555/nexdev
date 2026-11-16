'use client';

import { useState, useEffect } from 'react';
import { Mood, MOODS, JournalEntry } from '@/lib/types';
import Button from '@/components/ui/Button';
import { Plus, X, Hash } from 'lucide-react';

interface JournalEditorProps {
  initial?: JournalEntry | null;
  onSubmit: (data: {
    content: string;
    mood: Mood;
    gratitude: string[];
    tags: string[];
    date?: string;
  }) => void;
  onCancel: () => void;
  initialDate?: string;
}

export default function JournalEditor({ initial, onSubmit, onCancel, initialDate }: JournalEditorProps) {
  const [content, setContent] = useState(initial?.content || '');
  const [mood, setMood] = useState<Mood>(initial?.mood || '😊');
  const [gratitude, setGratitude] = useState<string[]>(
    initial?.gratitude && initial.gratitude.length > 0
      ? initial.gratitude
      : ['', '', '']
  );
  const [tags, setTags] = useState<string[]>(initial?.tags || []);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (initial) {
      setContent(initial.content || '');
      setMood(initial.mood || '😊');
      setGratitude(
        initial.gratitude && initial.gratitude.length > 0
          ? initial.gratitude
          : ['', '', '']
      );
      setTags(initial.tags || []);
    }
  }, [initial]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    onSubmit({
      content: content.trim(),
      mood,
      gratitude: gratitude.filter((g) => g.trim()),
      tags,
      date: initial?.date || initialDate,
    });
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  return (
    <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
      {/* Scrollable Form Body */}
      <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 sm:space-y-5 no-scrollbar">
        {/* Mood Selector (Horizontal Carousel on Mobile) */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-2">How are you feeling?</label>
          <div className="overflow-x-auto no-scrollbar flex items-center gap-2 pb-1 -mx-2 px-2 touch-pan-x">
            {MOODS.map((m) => (
              <button
                key={m.emoji}
                type="button"
                onClick={() => setMood(m.emoji)}
                className={`flex flex-col items-center justify-center p-2.5 rounded-2xl shrink-0 w-16 transition-all ${
                  mood === m.emoji
                    ? 'bg-purple-500/30 border border-purple-500/50 scale-105 shadow-md shadow-purple-500/20'
                    : 'bg-white/[0.03] border border-white/5 active:bg-white/[0.08] hover:bg-white/[0.06]'
                }`}
              >
                <span className="text-2xl filter drop-shadow">{m.emoji}</span>
                <span className="text-[10px] text-gray-300 mt-1 font-medium truncate w-full text-center">{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-1.5">
            Reflection <span className="text-gray-500 font-normal">(Markdown supported)</span>
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What went well today? What did you learn?..."
            rows={5}
            className="w-full px-3.5 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50 transition-colors resize-none text-sm leading-relaxed"
          />
        </div>

        {/* Gratitude (3 inputs) */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-1.5">
            🙏 3 Things I&apos;m Grateful For
          </label>
          <div className="space-y-2">
            {gratitude.map((g, i) => (
              <input
                key={i}
                type="text"
                value={g}
                onChange={(e) => {
                  const updated = [...gratitude];
                  updated[i] = e.target.value;
                  setGratitude(updated);
                }}
                placeholder={`#${i + 1} Grateful for...`}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-600 text-xs sm:text-sm focus:outline-none focus:border-purple-500/50 transition-colors"
              />
            ))}
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-1.5">Tags</label>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-300 text-xs border border-purple-500/30"
                >
                  <Hash size={10} />
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 hover:text-red-400"
                  >
                    <X size={11} />
                  </button>
                </span>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag();
                }
              }}
              placeholder="Add a tag..."
              className="flex-1 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-600 text-xs sm:text-sm focus:outline-none focus:border-purple-500/50 transition-colors"
            />
            <Button variant="secondary" size="sm" onClick={addTag} type="button">
              <Plus size={14} /> Add
            </Button>
          </div>
        </div>
      </div>

      {/* Permanently Visible Action Bar */}
      <div className="shrink-0 px-5 py-3 sm:py-3.5 border-t border-white/10 bg-[#0c101d] flex items-center justify-end gap-3 pb-[max(0.85rem,env(safe-area-inset-bottom))]">
        <Button variant="ghost" onClick={onCancel} className="px-5 py-2.5 text-gray-400 hover:text-white">
          Cancel
        </Button>
        <Button type="submit" className="px-6 py-2.5 font-bold shadow-lg shadow-purple-500/20">
          {initial ? 'Save Changes' : 'Save Reflection'}
        </Button>
      </div>
    </form>
  );
}
