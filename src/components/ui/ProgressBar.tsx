'use client';

import { motion } from 'framer-motion';

interface ProgressBarProps {
  value: number;
  color?: string;
  height?: number;
  showLabel?: boolean;
  animated?: boolean;
}

export default function ProgressBar({
  value,
  color = '#8b5cf6',
  height = 8,
  showLabel = true,
  animated = true,
}: ProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between mb-1">
          <span className="text-xs text-gray-400">Progress</span>
          <span className="text-xs font-semibold" style={{ color }}>
            {clampedValue}%
          </span>
        </div>
      )}
      <div
        className="w-full rounded-full overflow-hidden bg-white/5"
        style={{ height }}
      >
        <motion.div
          className="h-full rounded-full"
          initial={animated ? { width: 0 } : false}
          animate={{ width: `${clampedValue}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
          style={{
            background: `linear-gradient(90deg, ${color}, ${color}cc)`,
            boxShadow: `0 0 12px ${color}44`,
          }}
        />
      </div>
    </div>
  );
}

