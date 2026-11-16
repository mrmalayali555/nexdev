'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { useJournal } from '@/hooks/useJournal';
import JournalEditor from '@/components/journal/JournalEditor';
import { Mood } from '@/lib/types';
import { triggerHaptic } from '@/lib/haptics';

export default function NewJournalEntryPage() {
  const router = useRouter();
  const { addEntry } = useJournal();

  const handleSave = (data: {
    content: string;
    mood: Mood;
    gratitude: string[];
    tags: string[];
    date?: string;
  }) => {
    addEntry(data);
    triggerHaptic('success');
    router.push('/journal');
  };

  return (
    <div className="space-y-6 pb-28 sm:pb-12 max-w-3xl mx-auto">
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/journal"
          onClick={() => triggerHaptic('light')}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-300 hover:text-white transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Journal</span>
        </Link>

        <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
          Dedicated Full Editor
        </span>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
            <BookOpen size={18} />
          </div>
          <span>New Journal Reflection</span>
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 mt-1">
          Reflect on your day, record your gratitude wins, and capture your mindset.
        </p>
      </div>

      {/* Editor Body */}
      <div className="rounded-3xl p-5 sm:p-7 bg-white/[0.03] border border-white/10 backdrop-blur-xl shadow-2xl">
        <JournalEditor
          onSubmit={handleSave}
          onCancel={() => router.push('/journal')}
        />
      </div>
    </div>
  );
}

