'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  GraduationCap,
  Briefcase,
  Flame,
  CheckSquare,
  BookOpen,
} from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';

const navItems = [
  { href: '/', label: 'Hub', icon: LayoutDashboard },
  { href: '/academics', label: 'Academics', icon: GraduationCap },
  { href: '/career', label: 'Career', icon: Briefcase },
  { href: '/personal', label: 'Personal', icon: Flame },
  { href: '/habits', label: 'Habits', icon: CheckSquare },
  { href: '/journal', label: 'Journal', icon: BookOpen },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 md:hidden pb-[env(safe-area-inset-bottom,0px)] pointer-events-auto">
      {/* Floating Capsule Bar with deep luxury acrylic glass */}
      <div className="mx-3 mb-2 rounded-3xl bg-[#070914]/94 backdrop-blur-3xl border border-white/[0.12] shadow-[0_12px_44px_rgba(0,0,0,0.85),inset_0_1px_0_0_rgba(255,255,255,0.12)] px-1.5 py-1.5">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => triggerHaptic('light')}
                className="relative flex-1 flex flex-col items-center justify-center py-1.5 px-0.5 select-none"
              >
                <motion.div
                  className="flex flex-col items-center justify-center relative"
                  whileTap={{ scale: 0.85 }}
                >
                  {/* Active highlight glow pill */}
                  {isActive && (
                    <motion.div
                      layoutId="mobileActivePill"
                      className="absolute -inset-x-2 -inset-y-1 bg-gradient-to-r from-purple-500/25 via-indigo-500/20 to-blue-500/20 rounded-2xl border border-purple-500/35 -z-10 shadow-[0_0_16px_rgba(168,85,247,0.25)]"
                      transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                    />
                  )}

                  <div className="relative">
                    <Icon
                      size={18}
                      className={`transition-colors duration-200 ${
                        isActive
                          ? 'text-purple-300 drop-shadow-[0_0_10px_rgba(168,85,247,0.6)]'
                          : 'text-slate-400'
                      }`}
                    />
                  </div>

                  <span
                    className={`text-[9px] tracking-tight mt-1 transition-colors duration-200 font-semibold ${
                      isActive ? 'text-white' : 'text-slate-400'
                    }`}
                  >
                    {item.label}
                  </span>

                  {/* Active bottom micro dot with glow */}
                  {isActive && (
                    <motion.span
                      layoutId="mobileActiveDot"
                      className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-0.5 shadow-[0_0_6px_rgba(168,85,247,0.9)]"
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
