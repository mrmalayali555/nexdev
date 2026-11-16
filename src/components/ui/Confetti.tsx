'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useCallback } from 'react';

interface ConfettiPiece {
  id: number;
  x: number;
  color: string;
  delay: number;
  rotation: number;
}

export default function Confetti({ trigger }: { trigger: boolean }) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  const generatePieces = useCallback(() => {
    const colors = ['#8b5cf6', '#6366f1', '#3b82f6', '#f59e0b', '#ef4444', '#10b981', '#ec4899'];
    return Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 0.3,
      rotation: Math.random() * 360,
    }));
  }, []);

  useEffect(() => {
    if (trigger) {
      setPieces(generatePieces());
      const timeout = setTimeout(() => setPieces([]), 2000);
      return () => clearTimeout(timeout);
    }
  }, [trigger, generatePieces]);

  return (
    <AnimatePresence>
      {pieces.length > 0 && (
        <div className="fixed inset-0 pointer-events-none z-[100]">
          {pieces.map((piece) => (
            <motion.div
              key={piece.id}
              initial={{
                opacity: 1,
                x: `${piece.x}vw`,
                y: -20,
                rotate: 0,
                scale: 1,
              }}
              animate={{
                opacity: 0,
                y: '100vh',
                rotate: piece.rotation + 360,
                scale: 0.5,
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 1.5 + Math.random(),
                delay: piece.delay,
                ease: 'easeOut',
              }}
              className="absolute w-3 h-3 rounded-sm"
              style={{ backgroundColor: piece.color }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}

