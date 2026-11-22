'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  GraduationCap,
  Briefcase,
  CheckSquare,
  Target,
  BookOpen,
  Newspaper,
  Sparkles,
  BarChart3,
  Flame,
  Smartphone,
  Calendar,
  Utensils,
  ArrowLeft,
  Clock,
  MapPin,
} from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';

export default function Sidebar() {
  const pathname = usePathname();

  // If on Home Page, sidebar is hidden to give full-width command hub
  if (pathname === '/') return null;

  const isAcademics = pathname.startsWith('/academics');

  const academicNavItems = [
    { href: '/academics?tab=exams', tabKey: 'exams', label: 'Upcoming Exams', icon: Clock },
    { href: '/academics?tab=timetable', tabKey: 'timetable', label: 'Class Timetable (AD 207)', icon: Calendar },
    { href: '/academics?tab=syllabus', tabKey: 'syllabus', label: 'S1 Syllabus Tracker', icon: BookOpen },
    { href: '/academics?tab=mess', tabKey: 'mess', label: 'Hostel Mess Menu', icon: Utensils },
    { href: '/academics?tab=homework', tabKey: 'homework', label: 'Homework & Tasks', icon: CheckSquare },
    { href: '/academics?tab=performance', tabKey: 'performance', label: 'Attendance & CIE', icon: BarChart3 },
  ];

  const personalNavItems = [
    { href: '/personal', label: 'Personal Dashboard', icon: LayoutDashboard },
    { href: '/career', label: 'Big Tech Career', icon: Briefcase },
    { href: '/habits', label: 'Habits', icon: CheckSquare },
    { href: '/goals', label: 'Goals', icon: Target },
    { href: '/screentime', label: 'Screen Time', icon: Smartphone },
    { href: '/journal', label: 'Journal', icon: BookOpen },
    { href: '/news', label: 'Tech News', icon: Newspaper },
    { href: '/ai', label: 'AI Coach', icon: Sparkles },
    { href: '/stats', label: 'Stats', icon: BarChart3 },
  ];

  return (
    <aside className="hidden md:block fixed top-0 left-0 h-full w-64 bg-[#05070e]/95 backdrop-blur-2xl border-r border-white/[0.08] z-40 shadow-2xl">
      <div className="p-5 h-full flex flex-col justify-between overflow-y-auto">
        <div>
          {/* Top Brand Logo */}
          <div className="flex items-center gap-3 mb-4">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg ${
                isAcademics
                  ? 'bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 shadow-purple-500/25'
                  : 'bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-500 shadow-blue-500/25'
              }`}
            >
              {isAcademics ? (
                <GraduationCap size={20} className="text-white" />
              ) : (
                <Flame size={20} className="text-white fill-white" />
              )}
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-white">
                {isAcademics ? 'Academic OS' : 'Personal OS'}
              </h1>
              <p
                className={`text-[9px] uppercase tracking-widest font-bold ${
                  isAcademics ? 'text-purple-300/80' : 'text-blue-300/80'
                }`}
              >
                {isAcademics ? 'SCMS S1 CSE-3' : 'Growth Engine'}
              </p>
            </div>
          </div>

          {/* MASTER SWITCH BUTTONS */}
          <div className="space-y-1.5 mb-5 pb-4 border-b border-white/[0.08]">
            {/* 1. SWITCH TO HOME HUB BUTTON */}
            <Link
              href="/"
              onClick={() => triggerHaptic('light')}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] border-t-white/[0.18] text-slate-300 hover:text-white text-xs font-bold transition-all active:scale-[0.97] group shadow-sm shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
              <span>← Switch to Home Hub</span>
            </Link>

            {/* 2. QUICK JUMP TO THE SISTER PORTAL */}
            {isAcademics ? (
              <Link
                href="/personal"
                onClick={() => triggerHaptic('light')}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-purple-600/20 hover:from-blue-600/30 hover:to-purple-600/30 border border-blue-500/30 border-t-blue-400/40 text-blue-200 text-xs font-bold transition-all active:scale-[0.97] shadow-sm shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]"
              >
                <Flame size={13} className="text-blue-400" />
                <span>Switch to Personal OS →</span>
              </Link>
            ) : (
              <Link
                href="/academics"
                onClick={() => triggerHaptic('light')}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gradient-to-r from-purple-600/20 via-indigo-600/20 to-purple-600/20 hover:from-purple-600/30 hover:to-indigo-600/30 border border-purple-500/30 border-t-purple-400/40 text-purple-200 text-xs font-bold transition-all active:scale-[0.97] shadow-sm shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]"
              >
                <GraduationCap size={13} className="text-purple-400" />
                <span>Switch to Academic OS →</span>
              </Link>
            )}
          </div>

          {/* Nav Items */}
          <nav className="space-y-1">
            {isAcademics
              ? academicNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => triggerHaptic('light')}
                      className="block"
                    >
                      <motion.div
                        className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl transition-all duration-200 text-slate-300 hover:text-white hover:bg-white/[0.05] font-medium"
                        whileHover={{ x: 2 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Icon size={17} className="text-purple-400" />
                        <span className="text-xs font-semibold">{item.label}</span>
                      </motion.div>
                    </Link>
                  );
                })
              : personalNavItems.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== '/personal' && pathname.startsWith(item.href));
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => triggerHaptic('light')}
                      className="block"
                    >
                      <motion.div
                        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl transition-all duration-200 ${
                          isActive
                            ? 'text-white font-bold bg-gradient-to-r from-blue-500/15 to-purple-500/15 border border-blue-500/30 shadow-md shadow-blue-500/10'
                            : 'text-slate-400 hover:text-white hover:bg-white/[0.04] font-medium'
                        }`}
                        whileHover={{ x: 2 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Icon
                          size={17}
                          className={isActive ? 'text-blue-400' : 'text-slate-400'}
                        />
                        <span className="text-xs font-semibold">{item.label}</span>
                      </motion.div>
                    </Link>
                  );
                })}
          </nav>
        </div>

        {/* Bottom Metadata Card */}
        <div className="pt-4 mt-4 border-t border-white/[0.06]">
          {isAcademics ? (
            <div className="p-3 rounded-2xl bg-purple-950/20 border border-purple-500/20">
              <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                <MapPin size={13} className="text-purple-400" />
                <span>Room: AD 207 • Batch 1</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">SCMS Autonomous Scheme 2026</p>
            </div>
          ) : (
            <div className="p-3 rounded-2xl bg-blue-950/20 border border-blue-500/20">
              <p className="text-xs font-bold text-white">NexDev Personal OS</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Big Tech & Habit Protocol</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
