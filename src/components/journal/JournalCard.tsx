'use client';

import { motion } from 'framer-motion';
import { JournalEntry, MOODS } from '@/lib/types';
import GlassCard from '@/components/ui/GlassCard';
import { Calendar, Hash, Heart, Trash2 } from 'lucide-react';

interface JournalCardProps {
  entry: JournalEntry;
  onDelete: (id: string) => void;
}

export default function JournalCard({ entry, onDelete }: JournalCardProps) {
  const moodData = MOODS.find((m) => m.emoji === entry.mood);

  // Simple markdown rendering
  const renderContent = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, i) => {
      if (line.startsWith('### ')) {
        return (
          <h4 key={i} className="text-sm font-bold text-white mt-3 mb-1">
            {line.slice(4)}
          </h4>
        );
      }
      if (line.startsWith('## ')) {
        return (
          <h3 key={i} className="text-base font-bold text-white mt-3 mb-1">
            {line.slice(3)}
          </h3>
        );
      }
      if (line.startsWith('> ')) {
        return (
          <blockquote
            key={i}
            className="border-l-2 border-purple-500/60 pl-3 my-2 text-purple-200/90 italic text-xs sm:text-sm bg-purple-500/5 py-1 rounded-r-lg"
          >
            {line.slice(2)}
          </blockquote>
        );
      }
      if (line.startsWith('- ')) {
        return (
          <li key={i} className="text-xs sm:text-sm text-gray-300 ml-4 list-disc my-0.5">
            {line.slice(2)}
          </li>
        );
      }
      if (line.trim() === '') {
        return <br key={i} />;
      }
      return (
        <p key={i} className="text-xs sm:text-sm text-gray-300 leading-relaxed my-1">
          {line}
        </p>
      );
    });
  };

  return (
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
          <button
            onClick={() => onDelete(entry.id)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-400 hover:bg-red-500/10 active:scale-90 transition-all"
            title="Delete reflection"
          >
            <Trash2 size={15} />
          </button>
        </div>

        {/* Content */}
        <div className="mb-3.5">{renderContent(entry.content)}</div>

        {/* Gratitude Box */}
        {entry.gratitude.length > 0 && (
          <div className="mb-3.5 p-3 rounded-2xl bg-amber-500/[0.07] border border-amber-500/20">
            <div className="flex items-center gap-1.5 mb-2">
              <Heart size={13} className="text-amber-400 fill-amber-400" />
              <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">
                Grateful for
              </span>
            </div>
            <ul className="space-y-1">
              {entry.gratitude.map((g, i) => (
                <li key={i} className="text-xs text-gray-200 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                  <span>{g}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Tags */}
        {entry.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {entry.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-300 text-[10px] sm:text-xs font-medium border border-purple-500/20"
              >
                <Hash size={10} className="text-purple-400" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </GlassCard>
  );
}
