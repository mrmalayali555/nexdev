'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  CheckSquare,
  Target,
  BookOpen,
  BarChart3,
} from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';

const navItems = [
  { href: '/', label: 'Home', icon: LayoutDashboard },
  { href: '/habits', label: 'Habits', icon: CheckSquare },
  { href: '/goals', label: 'Goals', icon: Target },
  { href: '/journal', label: 'Journal', icon: BookOpen },
  { href: '/stats', label: 'Stats', icon: BarChart3 },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 md:hidden pb-[env(safe-area-inset-bottom,0px)] pointer-events-auto">
      {/* Frosted Glass Container with subtle gradient border */}
      <div className="mx-3 mb-2 rounded-2xl bg-gray-950/85 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-black/80 px-2 py-1.5">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => triggerHaptic('light')}
                className="relative flex-1 flex flex-col items-center justify-center py-1.5 px-1 select-none"
              >
                <motion.div
                  className="flex flex-col items-center justify-center relative"
                  whileTap={{ scale: 0.85 }}
                >
                  {/* Active highlight glow pill */}
                  {isActive && (
                    <motion.div
                      layoutId="mobileActivePill"
                      className="absolute -inset-x-3 -inset-y-1 bg-gradient-to-r from-purple-500/25 to-blue-500/25 rounded-xl border border-purple-500/30 -z-10 shadow-lg shadow-purple-500/10"
                      transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                    />
                  )}

                  <div className="relative">
                    <Icon
                      size={20}
                      className={`transition-colors duration-200 ${
                        isActive
                          ? 'text-purple-300 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]'
                          : 'text-gray-400'
                      }`}
                    />
                  </div>

                  <span
                    className={`text-[10px] tracking-tight mt-1 transition-colors duration-200 font-medium ${
                      isActive ? 'text-white font-semibold' : 'text-gray-400'
                    }`}
                  >
                    {item.label}
                  </span>

                  {/* Active bottom tiny dot */}
                  {isActive && (
                    <motion.span
                      layoutId="mobileActiveDot"
                      className="w-1 h-1 rounded-full bg-purple-400 mt-0.5 shadow-sm shadow-purple-300"
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
