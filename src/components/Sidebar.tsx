'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
} from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';

export default function Sidebar() {
  const pathname = usePathname();

  const isAcademicActive = pathname.startsWith('/academics');
  const isPersonalActive = pathname === '/personal' || pathname.startsWith('/habits') || pathname.startsWith('/goals') || pathname.startsWith('/career');

  return (
    <aside className="hidden md:block fixed top-0 left-0 h-full w-64 bg-[#05070e]/95 backdrop-blur-2xl border-r border-white/[0.08] z-40 shadow-2xl">
      <div className="p-6 h-full flex flex-col justify-between overflow-y-auto">
        <div>
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 mb-6 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/25 group-hover:shadow-purple-500/40 group-hover:scale-105 transition-all duration-300">
              <Flame size={20} className="text-white fill-white" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-purple-200 bg-clip-text text-transparent">
                NexDev
              </h1>
              <p className="text-[10px] text-purple-300/60 uppercase tracking-widest font-bold">
                Dual Portal OS
              </p>
            </div>
          </Link>

          {/* DUAL-PORTAL SWITCHER TABS */}
          <div className="p-1 mb-5 rounded-2xl bg-[#090c18] border border-white/[0.08] grid grid-cols-2 gap-1 text-xs font-bold">
            <Link
              href="/academics"
              onClick={() => triggerHaptic('light')}
              className={`py-2 px-2 rounded-xl text-center flex items-center justify-center gap-1.5 transition-all ${
                isAcademicActive
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <GraduationCap size={14} />
              <span>Academic</span>
            </Link>

            <Link
              href="/personal"
              onClick={() => triggerHaptic('light')}
              className={`py-2 px-2 rounded-xl text-center flex items-center justify-center gap-1.5 transition-all ${
                isPersonalActive
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Flame size={14} />
              <span>Personal</span>
            </Link>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1">
            {/* Primary Hub */}
            <Link
              href="/"
              onClick={() => triggerHaptic('light')}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl transition-all duration-200 mb-2 ${
                pathname === '/'
                  ? 'text-white font-bold bg-white/[0.08] border border-white/[0.12]'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04] font-medium'
              }`}
            >
              <LayoutDashboard size={18} className={pathname === '/' ? 'text-purple-400' : 'text-slate-400'} />
              <span className="text-xs sm:text-sm">Command Hub</span>
            </Link>

            {/* Academic Portal Section */}
            <div className="pt-2 pb-1">
              <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Academic OS (AD 207)
              </p>
            </div>

            <Link
              href="/academics"
              onClick={() => triggerHaptic('light')}
              className={`flex items-center gap-3 px-4 py-2 rounded-2xl transition-all duration-200 ${
                pathname === '/academics'
                  ? 'text-white font-bold bg-purple-500/15 border border-purple-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04] font-medium'
              }`}
            >
              <GraduationCap size={17} className={pathname === '/academics' ? 'text-purple-400' : 'text-slate-400'} />
              <span className="text-xs sm:text-sm">Exams & Timetable</span>
            </Link>

            {/* Personal Growth Section */}
            <div className="pt-3 pb-1">
              <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Personal & Career OS
              </p>
            </div>

            <Link
              href="/career"
              onClick={() => triggerHaptic('light')}
              className={`flex items-center gap-3 px-4 py-2 rounded-2xl transition-all duration-200 ${
                pathname.startsWith('/career')
                  ? 'text-white font-bold bg-blue-500/15 border border-blue-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04] font-medium'
              }`}
            >
              <Briefcase size={17} className={pathname.startsWith('/career') ? 'text-blue-400' : 'text-slate-400'} />
              <span className="text-xs sm:text-sm">Big Tech Career</span>
            </Link>

            <Link
              href="/personal"
              onClick={() => triggerHaptic('light')}
              className={`flex items-center gap-3 px-4 py-2 rounded-2xl transition-all duration-200 ${
                pathname === '/personal'
                  ? 'text-white font-bold bg-purple-500/15 border border-purple-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04] font-medium'
              }`}
            >
              <Flame size={17} className={pathname === '/personal' ? 'text-amber-400' : 'text-slate-400'} />
              <span className="text-xs sm:text-sm">Personal Dashboard</span>
            </Link>

            <Link
              href="/habits"
              onClick={() => triggerHaptic('light')}
              className={`flex items-center gap-3 px-4 py-2 rounded-2xl transition-all duration-200 ${
                pathname.startsWith('/habits')
                  ? 'text-white font-bold bg-purple-500/15 border border-purple-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04] font-medium'
              }`}
            >
              <CheckSquare size={17} className={pathname.startsWith('/habits') ? 'text-purple-400' : 'text-slate-400'} />
              <span className="text-xs sm:text-sm">Habits</span>
            </Link>

            <Link
              href="/goals"
              onClick={() => triggerHaptic('light')}
              className={`flex items-center gap-3 px-4 py-2 rounded-2xl transition-all duration-200 ${
                pathname.startsWith('/goals')
                  ? 'text-white font-bold bg-purple-500/15 border border-purple-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04] font-medium'
              }`}
            >
              <Target size={17} className={pathname.startsWith('/goals') ? 'text-blue-400' : 'text-slate-400'} />
              <span className="text-xs sm:text-sm">Goals</span>
            </Link>

            <Link
              href="/screentime"
              onClick={() => triggerHaptic('light')}
              className={`flex items-center gap-3 px-4 py-2 rounded-2xl transition-all duration-200 ${
                pathname.startsWith('/screentime')
                  ? 'text-white font-bold bg-purple-500/15 border border-purple-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04] font-medium'
              }`}
            >
              <Smartphone size={17} className={pathname.startsWith('/screentime') ? 'text-cyan-400' : 'text-slate-400'} />
              <span className="text-xs sm:text-sm">Screen Time</span>
            </Link>

            <Link
              href="/journal"
              onClick={() => triggerHaptic('light')}
              className={`flex items-center gap-3 px-4 py-2 rounded-2xl transition-all duration-200 ${
                pathname.startsWith('/journal')
                  ? 'text-white font-bold bg-purple-500/15 border border-purple-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04] font-medium'
              }`}
            >
              <BookOpen size={17} className={pathname.startsWith('/journal') ? 'text-purple-400' : 'text-slate-400'} />
              <span className="text-xs sm:text-sm">Journal</span>
            </Link>

            <Link
              href="/news"
              onClick={() => triggerHaptic('light')}
              className={`flex items-center gap-3 px-4 py-2 rounded-2xl transition-all duration-200 ${
                pathname.startsWith('/news')
                  ? 'text-white font-bold bg-purple-500/15 border border-purple-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04] font-medium'
              }`}
            >
              <Newspaper size={17} className={pathname.startsWith('/news') ? 'text-indigo-400' : 'text-slate-400'} />
              <span className="text-xs sm:text-sm">Tech News</span>
            </Link>

            <Link
              href="/ai"
              onClick={() => triggerHaptic('light')}
              className={`flex items-center gap-3 px-4 py-2 rounded-2xl transition-all duration-200 ${
                pathname.startsWith('/ai')
                  ? 'text-white font-bold bg-purple-500/15 border border-purple-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04] font-medium'
              }`}
            >
              <Sparkles size={17} className={pathname.startsWith('/ai') ? 'text-purple-400' : 'text-slate-400'} />
              <span className="text-xs sm:text-sm">AI Coach</span>
            </Link>
          </nav>
        </div>

        {/* Bottom Student Info Card */}
        <div className="pt-4 mt-4 border-t border-white/[0.06]">
          <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
            <p className="text-[11px] font-bold text-white">SCMS S1 CSE-3</p>
            <p className="text-[10px] text-slate-400">Class Room: AD 207 • Batch 1</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
