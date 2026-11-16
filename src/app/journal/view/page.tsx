'use client';

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Edit3, Trash2, Heart, Calendar, Tag, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { useJournal } from '@/hooks/useJournal';
import { MOODS } from '@/lib/types';
import { triggerHaptic } from '@/lib/haptics';

function JournalViewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const { entries, loaded, deleteEntry } = useJournal();

  if (!loaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  const entry = entries.find((e) => e.id === id);

  if (!entry) {
    return (
      <div className="space-y-6 pb-28 sm:pb-12 max-w-3xl mx-auto text-center py-16">
        <BookOpen size={36} className="text-gray-600 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-white">Journal Entry Not Found</h2>
        <p className="text-xs text-gray-400 mt-1 mb-6">
          This reflection may have been deleted or does not exist.
        </p>
        <Link
          href="/journal"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-all"
        >
          <ArrowLeft size={14} /> Back to Journal
        </Link>
      </div>
    );
  }

  const moodObj = MOODS.find((m) => m.emoji === entry.mood);

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this journal entry?')) {
      triggerHaptic('medium');
      deleteEntry(entry.id);
      router.push('/journal');
    }
  };

  return (
    <div className="space-y-6 pb-28 sm:pb-12 max-w-3xl mx-auto">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/journal"
          onClick={() => triggerHaptic('light')}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-300 hover:text-white transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Journal</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href={`/journal/edit?id=${entry.id}`}
            onClick={() => triggerHaptic('light')}
            className="px-3.5 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-300 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Edit3 size={13} />
            <span>Edit</span>
          </Link>

          <button
            onClick={handleDelete}
            className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 text-xs font-bold flex items-center gap-1.5 transition-all"
            aria-label="Delete entry"
          >
            <Trash2 size={13} />
            <span className="hidden xs:inline">Delete</span>
          </button>
        </div>
      </div>

      {/* Main Journal Entry Card */}
      <div className="rounded-3xl p-6 sm:p-9 bg-white/[0.03] border border-white/10 backdrop-blur-xl shadow-2xl space-y-6">
        {/* Entry Meta Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap border-b border-white/10 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl shadow-inner">
              {entry.mood}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                  {moodObj?.label || 'Mood Log'}
                </span>
              </div>
              <p className="text-sm sm:text-base font-extrabold text-white flex items-center gap-1.5 mt-0.5">
                <Calendar size={14} className="text-purple-400" />
                <span>
                  {new Date(entry.date + 'T00:00:00').toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Gratitude Section */}
        {entry.gratitude && entry.gratitude.length > 0 && (
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-pink-950/20 via-purple-950/15 to-transparent border border-pink-500/20 space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-pink-300 flex items-center gap-1.5">
              <Heart size={14} className="text-pink-400 fill-pink-400" />
              <span>Gratitude & Daily Wins</span>
            </h3>
            <ul className="space-y-1.5">
              {entry.gratitude.map((item, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-200 font-medium"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-pink-400 shrink-0 mt-1.5 shadow-sm shadow-pink-400" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Reflections Content */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
            <BookOpen size={14} className="text-purple-400" />
            <span>Reflections & Thoughts</span>
          </h3>
          <div className="prose prose-invert max-w-none text-xs sm:text-sm text-gray-200 leading-relaxed font-sans whitespace-pre-wrap">
            {entry.content}
          </div>
        </div>

        {/* Tags */}
        {entry.tags && entry.tags.length > 0 && (
          <div className="pt-4 border-t border-white/10 flex items-center gap-2 flex-wrap">
            <Tag size={13} className="text-gray-500" />
            {entry.tags.map((t) => (
              <span
                key={t}
                className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[11px] font-medium text-gray-400"
              >
                #{t}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function JournalViewPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-10 h-10 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
        </div>
      }
    >
      <JournalViewContent />
    </Suspense>
  );
}

