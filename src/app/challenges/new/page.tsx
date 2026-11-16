'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Zap, Sparkles } from 'lucide-react';
import ChallengeForm from '@/components/challenges/ChallengeForm';
import { useChallenges } from '@/hooks/useChallenges';
import { HabitCategory } from '@/lib/types';
import { triggerHaptic } from '@/lib/haptics';

export default function NewChallengePage() {
  const router = useRouter();
  const { addChallenge } = useChallenges();

  const handleSubmit = (data: {
    title: string;
    description: string;
    category: HabitCategory;
    durationDays: number;
    color: string;
    emoji: string;
  }) => {
    triggerHaptic('success');
    addChallenge(data);
    router.push('/habits');
  };

  const handleCancel = () => {
    triggerHaptic('light');
    router.push('/habits');
  };

  return (
    <div className="space-y-6 pb-28 sm:pb-12 max-w-2xl mx-auto">
      {/* Top Navigation */}
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/habits"
          onClick={() => triggerHaptic('light')}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-300 hover:text-white transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Habits & Challenges</span>
        </Link>

        <span className="text-[11px] font-mono text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
          Sprint Challenge Mode
        </span>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/30">
            <Zap size={18} />
          </div>
          <span>Launch New Challenge</span>
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 mt-1.5">
          Lock in a 21-day neural rewiring, 30-day streak, or 66-day habit automation sprint.
        </p>
      </div>

      {/* Form Container */}
      <div className="rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-white/10 flex items-center gap-2">
          <Sparkles size={16} className="text-amber-400" />
          <h2 className="text-sm font-bold text-white">Challenge Parameters</h2>
        </div>
        <ChallengeForm onSubmit={handleSubmit} onCancel={handleCancel} />
      </div>
    </div>
  );
}
