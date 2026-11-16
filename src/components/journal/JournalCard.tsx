'use client';

import { motion } from 'framer-motion';
import { JournalEntry, MOODS } from '@/lib/types';
import GlassCard from '@/components/ui/GlassCard';
import { Calendar, Hash, Heart, Trash2, Edit3, ArrowRight } from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';

interface JournalCardProps {
  entry: JournalEntry;
  onDelete: (id: string) => void;
  onEdit?: (entry: JournalEntry) => void;
  onSelect?: (entry: JournalEntry) => void;
}

export default function JournalCard({ entry, onDelete, onEdit, onSelect }: JournalCardProps) {
  const moodData = MOODS.find((m) => m.emoji === entry.mood);

  const handleCardClick = () => {
    if (onSelect) {
      triggerHaptic('light');
      onSelect(entry);
    }
  };

  return (
    <div onClick={handleCardClick} className="cursor-pointer active:scale-[0.99] transition-transform">
      <GlassCard>
        <div className="p-4 sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-3">
              <span className="text-2xl sm:text-3xl filter drop-shadow">{entry.mood}</span>
              <div>
                <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                  <Calendar size={12} className="text-purple-400" />
                  <span>
                    {new Date(entry.date + 'T00:00:00').toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <span
                  className="text-xs font-bold"
                  style={{ color: moodData?.color || '#a855f7' }}
                >
                  Feeling {moodData?.label || 'Good'}
                </span>
              </div>
            </div>

            {/* Actions: Edit & Delete */}
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              {onEdit && (
                <button
                  onClick={() => {
                    triggerHaptic('light');
                    onEdit(entry);
                  }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-purple-300 hover:bg-purple-500/10 active:scale-90 transition-all"
                  title="Edit reflection"
                >
                  <Edit3 size={15} />
                </button>
              )}
              <button
                onClick={() => {
                  triggerHaptic('medium');
                  onDelete(entry.id);
                }}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-400 hover:bg-red-500/10 active:scale-90 transition-all"
                title="Delete reflection"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>

          {/* Snippet Content */}
          <div className="mb-3 text-xs sm:text-sm text-gray-300 leading-relaxed line-clamp-3 whitespace-pre-line">
            {entry.content}
          </div>

          {/* Gratitude Sneak Peek */}
          {entry.gratitude && entry.gratitude.length > 0 && (
            <div className="mb-3 p-2.5 rounded-xl bg-amber-500/[0.07] border border-amber-500/20 flex items-center gap-2">
              <Heart size={13} className="text-amber-400 fill-amber-400 shrink-0" />
              <span className="text-[11px] text-amber-200 truncate">
                Grateful for: {entry.gratitude.filter(Boolean).join(', ')}
              </span>
            </div>
          )}

          {/* Card Footer: Tags & Read more hint */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex flex-wrap gap-1.5">
              {entry.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-300 text-[10px] sm:text-xs font-medium border border-purple-500/20"
                >
                  <Hash size={10} className="text-purple-400" />
                  {tag}
                </span>
              ))}
              {entry.tags.length > 3 && (
                <span className="text-[10px] text-gray-500 self-center">
                  +{entry.tags.length - 3} more
                </span>
              )}
            </div>

            <span className="text-[11px] font-semibold text-purple-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              <span>Read</span>
              <ArrowRight size={12} />
            </span>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
