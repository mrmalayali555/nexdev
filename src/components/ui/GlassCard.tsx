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
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={hover ? { scale: 1.015, y: -2 } : undefined}
      whileTap={onClick ? { scale: 0.985 } : undefined}
      onClick={onClick}
      className={`relative rounded-3xl border border-white/[0.08] backdrop-blur-2xl overflow-hidden transition-all duration-300 ${
        hover
          ? 'hover:border-purple-500/30 hover:shadow-[0_16px_40px_-8px_rgba(0,0,0,0.7),0_0_24px_rgba(168,85,247,0.1)]'
          : 'shadow-[0_8px_32px_rgba(0,0,0,0.5)]'
      } ${onClick ? 'cursor-pointer' : ''} ${className}`}
      style={{
        background: gradient || 'rgba(12, 16, 28, 0.6)',
      }}
    >
      {/* Specular top rim border highlight */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
      {children}
    </motion.div>
  );
}
