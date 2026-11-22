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
  Clock,
  Calendar,
  Utensils,
  BarChart3,
} from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';

export default function BottomNav() {
  const pathname = usePathname();

  // If on Home Page, bottom bar is hidden to keep Home clean
  if (pathname === '/') return null;

  const isAcademics = pathname.startsWith('/academics');

  const academicNavItems = [
    { href: '/', label: 'Home Hub', icon: LayoutDashboard },
    { href: '/academics?tab=exams', label: 'Exams', icon: Clock },
    { href: '/academics?tab=timetable', label: 'Timetable', icon: Calendar },
    { href: '/academics?tab=syllabus', label: 'Syllabus', icon: BookOpen },
    { href: '/academics?tab=mess', label: 'Mess', icon: Utensils },
    { href: '/academics?tab=homework', label: 'Homework', icon: CheckSquare },
  ];

  const personalNavItems = [
    { href: '/', label: 'Home Hub', icon: LayoutDashboard },
    { href: '/personal', label: 'Personal', icon: Flame },
    { href: '/career', label: 'Career', icon: Briefcase },
    { href: '/habits', label: 'Habits', icon: CheckSquare },
    { href: '/journal', label: 'Journal', icon: BookOpen },
    { href: '/stats', label: 'Stats', icon: BarChart3 },
  ];

  const navItems = isAcademics ? academicNavItems : personalNavItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 md:hidden pb-[env(safe-area-inset-bottom,0px)] pointer-events-auto">
      <div className="mx-3 mb-2 rounded-3xl bg-[#070914]/94 backdrop-blur-3xl border border-white/[0.12] shadow-[0_12px_44px_rgba(0,0,0,0.85),inset_0_1px_0_0_rgba(255,255,255,0.12)] px-1.5 py-1.5">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && item.href !== '/personal' && pathname.startsWith(item.href));
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
                  whileTap={{ scale: 0.92 }}
                  transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="relative">
                    <Icon
                      size={18}
                      className={`transition-colors duration-200 ${
                        isActive
                          ? isAcademics ? 'text-purple-300 drop-shadow-[0_0_10px_rgba(168,85,247,0.6)]' : 'text-blue-300 drop-shadow-[0_0_10px_rgba(59,130,246,0.6)]'
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
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
