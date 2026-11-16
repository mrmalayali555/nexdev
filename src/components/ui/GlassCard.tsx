'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  gradient?: string;
  delay?: number;
  onClick?: () => void;
  hover?: boolean;
}

export default function GlassCard({
  children,
  className = '',
  gradient,
  delay = 0,
  onClick,
  hover = false,
}: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={hover ? { scale: 1.02, y: -2 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
      className={`relative rounded-2xl border border-white/10 backdrop-blur-xl overflow-hidden ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
      style={{
        background: gradient || 'rgba(255,255,255,0.03)',
      }}
    >
      {children}
    </motion.div>
  );
}

