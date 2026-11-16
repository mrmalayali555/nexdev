'use client';

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, BookOpen, Edit3 } from 'lucide-react';
import Link from 'next/link';
import { useJournal } from '@/hooks/useJournal';
import JournalEditor from '@/components/journal/JournalEditor';
import { Mood } from '@/lib/types';
import { triggerHaptic } from '@/lib/haptics';

function JournalEditContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const { entries, loaded, updateEntry } = useJournal();

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

  const handleSave = (data: {
    content: string;
    mood: Mood;
    gratitude: string[];
    tags: string[];
    date?: string;
  }) => {
    updateEntry(entry.id, data);
    triggerHaptic('success');
    router.push(`/journal/view?id=${entry.id}`);
  };

  return (
    <div className="space-y-6 pb-28 sm:pb-12 max-w-3xl mx-auto">
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-3">
        <Link
          href={`/journal/view?id=${entry.id}`}
          onClick={() => triggerHaptic('light')}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-300 hover:text-white transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Cancel & Back</span>
        </Link>

        <span className="text-[11px] font-mono text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20">
          Edit Reflection
        </span>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/30">
            <Edit3 size={18} />
          </div>
          <span>Edit Journal Entry</span>
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 mt-1">
          Modify your reflections, update your gratitude items, or adjust tags.
        </p>
      </div>

      {/* Editor Body */}
      <div className="rounded-3xl p-5 sm:p-7 bg-white/[0.03] border border-white/10 backdrop-blur-xl shadow-2xl">
        <JournalEditor
          initial={entry}
          onSubmit={handleSave}
          onCancel={() => router.push(`/journal/view?id=${entry.id}`)}
        />
      </div>
    </div>
  );
}

export default function JournalEditPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-10 h-10 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
        </div>
      }
    >
      <JournalEditContent />
    </Suspense>
  );
}
