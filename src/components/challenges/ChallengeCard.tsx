'use client';

import { motion } from 'framer-motion';
import { Challenge } from '@/lib/types';
import { Check, Flame, Trophy, Calendar, Sparkles, Trash2 } from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';

interface ChallengeCardProps {
  challenge: Challenge;
  onCheckinDay: (challengeId: string, dayNumber: number) => void;
  onDelete: (challengeId: string) => void;
}

export default function ChallengeCard({
  challenge,
  onCheckinDay,
  onDelete,
}: ChallengeCardProps) {
  const completedDays = Object.values(challenge.checkins || {}).filter(Boolean).length;
  const progressPercent = Math.min(
    100,
    Math.round((completedDays / challenge.durationDays) * 100)
  );
  const isCompleted = progressPercent === 100 || challenge.status === 'completed';

  const handleDayClick = (dayNumber: number) => {
    triggerHaptic('light');
    onCheckinDay(challenge.id, dayNumber);
  };

  // Generate day pills (show all if <= 21, or show scrollable/compact if longer)
  const daysArray = Array.from({ length: challenge.durationDays }, (_, i) => i + 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`relative overflow-hidden rounded-3xl p-5 sm:p-6 bg-[#0c111d]/90 border transition-all ${
        isCompleted
          ? 'border-emerald-500/30 bg-gradient-to-br from-emerald-950/20 to-gray-950'
          : 'border-white/10 hover:border-purple-500/30'
      } backdrop-blur-xl shadow-xl`}
    >
      {/* Top Header */}
      <div className="flex items-start justify-between gap-3 mb-3.5">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 shadow-lg"
            style={{
              backgroundColor: `${challenge.color}25`,
              border: `1px solid ${challenge.color}40`,
            }}
          >
            {challenge.emoji}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-white leading-tight">
                {challenge.title}
              </h3>
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
                style={{
                  backgroundColor: `${challenge.color}20`,
                  color: challenge.color,
                  border: `1px solid ${challenge.color}40`,
                }}
              >
                {challenge.durationDays}-Day Challenge
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1 line-clamp-2">
              {challenge.description}
            </p>
          </div>
        </div>

        {/* Delete action */}
        <button
          onClick={() => onDelete(challenge.id)}
          className="text-gray-600 hover:text-red-400 p-1.5 rounded-lg hover:bg-white/5 transition-colors shrink-0"
          title="Delete challenge"
        >
          <Trash2 size={15} />
        </button>
      </div>

      {/* Progress Metric Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-gray-400 font-medium flex items-center gap-1.5">
            <Flame size={14} className="text-amber-400" />
            <span>Progress: {completedDays} / {challenge.durationDays} days</span>
          </span>
          <span className="font-bold text-purple-300">{progressPercent}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{
              backgroundColor: isCompleted ? '#10b981' : challenge.color,
            }}
          />
        </div>
      </div>

      {/* Interactive Day Check-in Grid */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            Daily Check-ins (Tap to Mark)
          </span>
          {isCompleted && (
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
              <Trophy size={13} /> Completed!
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto no-scrollbar p-1 rounded-xl bg-black/20 border border-white/5">
          {daysArray.map((dayNum) => {
            const isChecked = !!challenge.checkins?.[`day-${dayNum}`];
            const isCurrent = dayNum === completedDays + 1 && !isCompleted;

            return (
              <button
                key={dayNum}
                onClick={() => handleDayClick(dayNum)}
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-xs font-bold flex items-center justify-center transition-all active:scale-90 ${
                  isChecked
                    ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-md shadow-emerald-500/20'
                    : isCurrent
                    ? 'bg-purple-500/30 text-purple-200 border-2 border-purple-400 animate-pulse'
                    : 'bg-white/[0.04] text-gray-400 border border-white/5 hover:bg-white/10'
                }`}
                title={`Day ${dayNum}: ${isChecked ? 'Completed' : 'Pending'}`}
              >
                {isChecked ? <Check size={14} className="stroke-[3]" /> : dayNum}
              </button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
