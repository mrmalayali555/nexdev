'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCareer } from '@/hooks/useCareer';
import GlassCard from '@/components/ui/GlassCard';
import {
  Briefcase,
  Code2,
  Cpu,
  FolderGit2,
  Send,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  ExternalLink,
  Award,
  TrendingUp,
  Sparkles,
  Flame,
  Calendar,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  CheckSquare,
} from 'lucide-react';
import {
  DSAPlatform,
  DSA_PLATFORMS,
  DSATopic,
  DSA_TOPICS,
  CareerProject,
  APPLICATION_STATUSES,
  CareerApplication,
  PLACEMENT_CHECKLIST_ITEMS,
} from '@/lib/types';
import { triggerHaptic } from '@/lib/haptics';
import { getToday, formatDate, getDaysBetween } from '@/lib/utils';

export default function CareerPage() {
  const {
    profile,
    loaded,
    getLogForDate,
    getTodayLog,
    toggleDailyTask,
    addDSAProblem,
    removeDSAProblem,
    toggleDSAProblem,
    setStudyHours,
    updateDailyNotes,
    addContest,
    removeContest,
    addProject,
    removeProject,
    addApplication,
    updateApplication,
    removeApplication,
    updateSubjectProgress,
    getWeeklyDSAStats,
    getJourneyStats,
    getDifficultyCounts,
    getTopicCounts,
  } = useCareer();

  const [activeTab, setActiveTab] = useState<'journey' | 'dsa' | 'core' | 'projects' | 'pipeline'>('journey');

  // Selected date for day-by-day journey tracking
  const today = getToday();
  const [selectedDate, setSelectedDate] = useState<string>(today);

  // Form states
  const [problemName, setProblemName] = useState('');
  const [problemPlatform, setProblemPlatform] = useState<DSAPlatform>('LeetCode');
  const [problemDiff, setProblemDiff] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [problemTopic, setProblemTopic] = useState<DSATopic>('Arrays');
  const [problemTimeMins, setProblemTimeMins] = useState<number | ''>('');

  // Project form state
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [projName, setProjName] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projStack, setProjStack] = useState('');
  const [projStatus, setProjStatus] = useState<CareerProject['status']>('in-progress');
  const [projGithub, setProjGithub] = useState('');
  const [projLive, setProjLive] = useState('');

  // Application form state
  const [showAppModal, setShowAppModal] = useState(false);
  const [appCompany, setAppCompany] = useState('');
  const [appRole, setAppRole] = useState('Software Engineering Intern');
  const [appStatus, setAppStatus] = useState<CareerApplication['status']>('applied');
  const [appNotes, setAppNotes] = useState('');

  // Contest form state
  const [showContestModal, setShowContestModal] = useState(false);
  const [contestName, setContestName] = useState('');
  const [contestPlatform, setContestPlatform] = useState<DSAPlatform>('Codeforces');
  const [contestRank, setContestRank] = useState<number | ''>('');
  const [contestRatingChange, setContestRatingChange] = useState<number | ''>('');
  const [contestCurrentRating, setContestCurrentRating] = useState<number | ''>('');

  if (!loaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-semibold tracking-wide">Loading Placement Engine...</p>
        </div>
      </div>
    );
  }

  const selectedLog = getLogForDate(selectedDate);
  const journeyStats = getJourneyStats();
  const diffCounts = getDifficultyCounts();
  const topicCounts = getTopicCounts();
  const weekStats = getWeeklyDSAStats();
  const weekMax = Math.max(...weekStats.map((d) => d.count), 4);

  const avgCoreReadiness = Math.round(
    (profile.coreSubjects.os +
      profile.coreSubjects.dbms +
      profile.coreSubjects.cn +
      profile.coreSubjects.oop) /
      4
  );

  const selectedDayNumber = Math.max(
    1,
    getDaysBetween(profile.journeyStartDate || today, selectedDate) + 1
  );

  const handlePrevDay = () => {
    triggerHaptic('light');
    const [y, m, d] = selectedDate.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() - 1);
    setSelectedDate(formatDate(date));
  };

  const handleNextDay = () => {
    triggerHaptic('light');
    const [y, m, d] = selectedDate.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + 1);
    setSelectedDate(formatDate(date));
  };

  const handleAddProblem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!problemName.trim()) return;
    triggerHaptic('success');
    addDSAProblem(
      {
        name: problemName.trim(),
        platform: problemPlatform,
        difficulty: problemDiff,
        topic: problemTopic,
        solved: true,
        timeMins: problemTimeMins ? Number(problemTimeMins) : undefined,
      },
      selectedDate
    );
    setProblemName('');
    setProblemTimeMins('');
  };

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projName.trim()) return;
    triggerHaptic('success');
    addProject({
      name: projName.trim(),
      description: projDesc.trim(),
      techStack: projStack
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      status: projStatus,
      githubUrl: projGithub.trim() || undefined,
      liveUrl: projLive.trim() || undefined,
    });
    setProjName('');
    setProjDesc('');
    setProjStack('');
    setProjGithub('');
    setProjLive('');
    setShowProjectModal(false);
  };

  const handleAddApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appCompany.trim()) return;
    triggerHaptic('success');
    addApplication({
      company: appCompany.trim(),
      role: appRole.trim(),
      status: appStatus,
      appliedDate: selectedDate,
      notes: appNotes.trim() || undefined,
    });
    setAppCompany('');
    setAppNotes('');
    setShowAppModal(false);
  };

  const handleAddContest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contestName.trim()) return;
    triggerHaptic('success');
    addContest({
      platform: contestPlatform,
      contestName: contestName.trim(),
      rank: contestRank ? Number(contestRank) : undefined,
      ratingChange: contestRatingChange ? Number(contestRatingChange) : undefined,
      currentRating: contestCurrentRating ? Number(contestCurrentRating) : undefined,
      date: selectedDate,
    });
    setContestName('');
    setContestRank('');
    setContestRatingChange('');
    setContestCurrentRating('');
    setShowContestModal(false);
  };

  // Selected date task progress
  const selectedChecklist = selectedLog.checklist || {
    dsaPractice: false,
    coreCsStudy: false,
    devProject: false,
    speedOrContest: false,
    learnNotes: false,
  };
  const selectedTasksDone = Object.values(selectedChecklist).filter(Boolean).length;
  const selectedTasksTotal = 5;
  const selectedPct = Math.round((selectedTasksDone / selectedTasksTotal) * 100);

  return (
    <div className="space-y-6 sm:space-y-8 pb-28 sm:pb-16 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl p-5 sm:p-8 bg-gradient-to-br from-[#0c0f1d] via-[#090b16] to-[#05070e] border border-white/[0.08] shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold">
                <Briefcase size={13} />
                <span>Placement Journey</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/35 text-orange-300 text-xs font-extrabold">
                <Flame size={13} className="fill-orange-400 text-orange-400" />
                <span>Day {journeyStats.journeyDay} • {journeyStats.currentStreak}d Streak</span>
              </span>
              <span className="text-[11px] font-semibold text-slate-400">
                ⏳ {journeyStats.daysRemaining} days to target recruitment season
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Big Tech Placement Engine
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-2xl leading-relaxed">
              Track each day of your journey. Complete your daily placement protocol, practice DSA patterns, build core CS depth, and land offers at Google, Microsoft, Amazon, and top product teams.
            </p>
          </div>

          {/* Quick Metrics Capsule */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
            <div className="p-3.5 px-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">
                DSA Solved
              </span>
              <span className="text-xl sm:text-2xl font-black text-white">{diffCounts.total}</span>
            </div>
            <div className="p-3.5 px-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">
                Today&apos;s Protocol
              </span>
              <span className="text-xl sm:text-2xl font-black text-amber-400">
                {journeyStats.todayTasksDone}/5
              </span>
            </div>
            <div className="p-3.5 px-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">
                Core CS
              </span>
              <span className="text-xl sm:text-2xl font-black text-cyan-400">{avgCoreReadiness}%</span>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 mt-6 pt-5 border-t border-white/[0.08] overflow-x-auto pb-1">
          {[
            { id: 'journey', label: 'Daily Journey & Checklist', icon: CheckSquare, badge: `Day ${journeyStats.journeyDay}` },
            { id: 'dsa', label: 'DSA & Contests', icon: Code2, count: diffCounts.total },
            { id: 'core', label: 'Core CS & Roadmap', icon: Cpu, badge: `${avgCoreReadiness}%` },
            { id: 'projects', label: 'Projects & Open Source', icon: FolderGit2, count: profile.projects.length },
            { id: 'pipeline', label: 'Job & Internship Pipeline', icon: Send, count: profile.applications.length },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  triggerHaptic('light');
                  setActiveTab(tab.id as any);
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 select-none ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500/25 to-orange-500/20 text-amber-200 border border-amber-500/40 shadow-lg shadow-amber-500/10'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <Icon size={16} className={isActive ? 'text-amber-400' : 'text-slate-400'} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-amber-400/20 text-amber-300' : 'bg-white/[0.06] text-slate-400'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
                {tab.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-amber-500/20 text-amber-300' : 'bg-white/[0.06] text-slate-400'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: DAILY JOURNEY & PROTOCOL CHECKLIST */}
      {activeTab === 'journey' && (
        <div className="space-y-6">
          {/* Day Navigator Bar */}
          <GlassCard>
            <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePrevDay}
                  className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-slate-300 hover:text-white transition-all"
                  title="Previous Day"
                >
                  <ChevronLeft size={16} />
                </button>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-black text-white">
                      Day {selectedDayNumber} of Placement Journey
                    </h3>
                    {selectedDate === today && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Today
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                    <Calendar size={13} className="text-amber-400" />
                    <span>
                      {new Date(selectedDate + 'T00:00:00').toLocaleDateString(undefined, {
                        weekday: 'long',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </p>
                </div>

                <button
                  onClick={handleNextDay}
                  className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-slate-300 hover:text-white transition-all"
                  title="Next Day"
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              {/* Jump to Today Button */}
              {selectedDate !== today && (
                <button
                  onClick={() => {
                    triggerHaptic('light');
                    setSelectedDate(today);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold self-start sm:self-auto hover:bg-amber-500/30 transition-all"
                >
                  Jump to Today
                </button>
              )}
            </div>
          </GlassCard>

          {/* Daily Protocol Checklist Grid */}
          <GlassCard>
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-bold text-white">
                      Placement Day Protocol ({selectedTasksDone}/{selectedTasksTotal} Done)
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                      {selectedPct}% Completed
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Complete these 5 high-leverage activities each day to guarantee placement readiness
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-white/[0.08] rounded-full h-2 mb-5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-300 h-2 rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(245,158,11,0.5)]"
                  style={{ width: `${selectedPct}%` }}
                />
              </div>

              {/* 5 Tasks Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {PLACEMENT_CHECKLIST_ITEMS.map((item) => {
                  const isChecked = !!selectedChecklist[item.key];
                  return (
                    <div
                      key={item.key}
                      onClick={() => {
                        triggerHaptic(isChecked ? 'light' : 'success');
                        toggleDailyTask(selectedDate, item.key);
                      }}
                      className={`p-3.5 sm:p-4 rounded-2xl border cursor-pointer transition-all flex items-start justify-between gap-3 group select-none ${
                        isChecked
                          ? 'bg-amber-500/15 border-amber-500/40 shadow-sm shadow-amber-500/10'
                          : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.12]'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-base">{item.emoji}</span>
                          <span className="text-xs font-bold text-white group-hover:text-amber-200 transition-colors">
                            {item.label}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">{item.desc}</p>
                        <span className="inline-block mt-2 text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-white/[0.04] text-slate-400">
                          {item.category}
                        </span>
                      </div>

                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                          isChecked
                            ? 'bg-amber-400 text-slate-950 shadow-[0_0_8px_rgba(245,158,11,0.6)]'
                            : 'border border-white/20 text-transparent group-hover:border-white/40'
                        }`}
                      >
                        <CheckCircle2 size={15} className={isChecked ? 'stroke-[3]' : ''} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </GlassCard>

          {/* Day Activities: Problems Solved, Hours, Reflection */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Problems Logged on Selected Date */}
            <div className="lg:col-span-7">
              <GlassCard>
                <div className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-white">
                        DSA Problems Solved on Day {selectedDayNumber} ({selectedLog.dsaProblems?.length || 0})
                      </h3>
                      <p className="text-[10px] text-slate-400">
                        {selectedLog.dsaProblems?.filter((p) => p.solved).length || 0} solved problems
                      </p>
                    </div>
                  </div>

                  {selectedLog.dsaProblems?.length === 0 ? (
                    <div className="text-center py-8 rounded-2xl bg-white/[0.015] border border-white/[0.04] mb-4">
                      <Code2 size={28} className="mx-auto text-slate-600 mb-2" />
                      <p className="text-xs text-slate-400">No problems logged for this date.</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        Log problems solved during your daily grind below
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
                      {selectedLog.dsaProblems.map((prob, idx) => {
                        const plat = DSA_PLATFORMS.find((p) => p.name === prob.platform);
                        const top = DSA_TOPICS.find((t) => t.name === prob.topic);
                        return (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] transition-all"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <button
                                onClick={() => {
                                  triggerHaptic('light');
                                  toggleDSAProblem(selectedDate, idx);
                                }}
                                className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                                  prob.solved
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                    : 'border border-white/20 text-transparent'
                                }`}
                              >
                                <CheckCircle2 size={14} />
                              </button>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`text-xs font-bold truncate ${
                                      prob.solved ? 'text-white' : 'text-slate-400 line-through'
                                    }`}
                                  >
                                    {prob.name}
                                  </span>
                                  <span
                                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                      prob.difficulty === 'Easy'
                                        ? 'bg-emerald-500/20 text-emerald-300'
                                        : prob.difficulty === 'Medium'
                                        ? 'bg-amber-500/20 text-amber-300'
                                        : 'bg-rose-500/20 text-rose-300'
                                    }`}
                                  >
                                    {prob.difficulty}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                                  <span>{plat?.emoji} {prob.platform}</span>
                                  <span>•</span>
                                  <span>{top?.emoji} {prob.topic}</span>
                                  {prob.timeMins && (
                                    <>
                                      <span>•</span>
                                      <span className="flex items-center gap-0.5">
                                        <Clock size={10} /> {prob.timeMins}m
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            <button
                              onClick={() => {
                                triggerHaptic('light');
                                removeDSAProblem(selectedDate, idx);
                              }}
                              className="text-slate-600 hover:text-rose-400 p-1 rounded-lg"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Add Problem Form for Selected Date */}
                  <form onSubmit={handleAddProblem} className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-3">
                    <span className="text-xs font-bold text-white block">
                      + Add Solved Problem for Day {selectedDayNumber}
                    </span>

                    <input
                      type="text"
                      value={problemName}
                      onChange={(e) => setProblemName(e.target.value)}
                      placeholder="Problem name (e.g. Subarray Sum Equals K)"
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs text-white placeholder-slate-500 focus:outline-none"
                    />

                    <div className="grid grid-cols-3 gap-2">
                      <select
                        value={problemPlatform}
                        onChange={(e) => setProblemPlatform(e.target.value as DSAPlatform)}
                        className="px-2 py-1.5 rounded-xl bg-[#0b0e1a] border border-white/[0.1] text-xs text-white focus:outline-none"
                      >
                        {DSA_PLATFORMS.map((p) => (
                          <option key={p.name} value={p.name}>
                            {p.emoji} {p.name}
                          </option>
                        ))}
                      </select>

                      <select
                        value={problemDiff}
                        onChange={(e) => setProblemDiff(e.target.value as any)}
                        className="px-2 py-1.5 rounded-xl bg-[#0b0e1a] border border-white/[0.1] text-xs text-white focus:outline-none"
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>

                      <select
                        value={problemTopic}
                        onChange={(e) => setProblemTopic(e.target.value as DSATopic)}
                        className="px-2 py-1.5 rounded-xl bg-[#0b0e1a] border border-white/[0.1] text-xs text-white focus:outline-none"
                      >
                        {DSA_TOPICS.map((t) => (
                          <option key={t.name} value={t.name}>
                            {t.emoji} {t.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Plus size={14} /> Log to Day {selectedDayNumber}
                    </button>
                  </form>
                </div>
              </GlassCard>
            </div>

            {/* Right: Study Hours & Daily Learning Reflection */}
            <div className="lg:col-span-5 space-y-6">
              <GlassCard>
                <div className="p-4 sm:p-6 space-y-4">
                  {/* Study Hours */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Clock size={14} className="text-amber-400" />
                        Study Time on Day {selectedDayNumber}
                      </span>
                      <span className="text-xs font-black text-amber-300">
                        {selectedLog.studyHours || 0} Hours
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {[0, 1, 2, 3, 4, 5, 6, 8].map((hrs) => (
                        <button
                          key={hrs}
                          type="button"
                          onClick={() => {
                            triggerHaptic('light');
                            setStudyHours(selectedDate, hrs);
                          }}
                          className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            selectedLog.studyHours === hrs
                              ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                              : 'bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08]'
                          }`}
                        >
                          {hrs}h
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Daily Reflection Journal */}
                  <div className="pt-3 border-t border-white/[0.06]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <BookOpen size={14} className="text-cyan-400" />
                        Daily Placement Reflection
                      </span>
                      <span className="text-[10px] text-slate-500">Auto-saved</span>
                    </div>
                    <textarea
                      value={selectedLog.notes || ''}
                      onChange={(e) => updateDailyNotes(selectedDate, e.target.value)}
                      placeholder="What did you learn today? What edge cases or mistakes did you encounter? What concept clicked?"
                      rows={5}
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/40 resize-none leading-relaxed"
                    />
                  </div>
                </div>
              </GlassCard>
            </div>
          </div>

          {/* Full Journey History Log Table / Calendar Overview */}
          <GlassCard>
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white">
                    Journey History & Activity Timeline ({profile.dailyLogs.length} days recorded)
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    Click any day in your journey to view or update its protocol & accomplishments
                  </p>
                </div>
              </div>

              {profile.dailyLogs.length === 0 ? (
                <div className="text-center py-10 rounded-2xl bg-white/[0.015] border border-white/[0.04]">
                  <Calendar size={32} className="mx-auto text-slate-600 mb-2" />
                  <p className="text-xs text-slate-400 font-medium">Your journey starts today!</p>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Check off your first task above to record Day 1 of your journey.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {[...profile.dailyLogs]
                    .sort((a, b) => b.date.localeCompare(a.date))
                    .map((log) => {
                      const dayNum = Math.max(
                        1,
                        getDaysBetween(profile.journeyStartDate || today, log.date) + 1
                      );
                      const tasksDone = log.checklist
                        ? Object.values(log.checklist).filter(Boolean).length
                        : 0;
                      const solvedCount = (log.dsaProblems || []).filter((p) => p.solved).length;
                      const isSelected = log.date === selectedDate;

                      return (
                        <div
                          key={log.date}
                          onClick={() => {
                            triggerHaptic('light');
                            setSelectedDate(log.date);
                          }}
                          className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                            isSelected
                              ? 'bg-amber-500/15 border-amber-500/40 shadow-sm'
                              : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-300 font-black text-xs flex items-center justify-center shrink-0 border border-amber-500/25">
                              #{dayNum}
                            </span>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-white">
                                  {new Date(log.date + 'T00:00:00').toLocaleDateString(undefined, {
                                    weekday: 'short',
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                  })}
                                </span>
                                {log.date === today && (
                                  <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300">
                                    Today
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                                {log.notes ? `"${log.notes}"` : 'No reflection notes entered'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 self-end sm:self-center">
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-white/[0.05] text-slate-300">
                              {tasksDone}/5 Tasks
                            </span>
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-white/[0.05] text-amber-300">
                              {solvedCount} Solved
                            </span>
                            {log.studyHours > 0 && (
                              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-white/[0.05] text-cyan-300">
                                {log.studyHours}h
                              </span>
                            )}
                            <ChevronRight size={14} className="text-slate-500" />
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      )}

      {/* TAB 2: DSA & CONTESTS */}
      {activeTab === 'dsa' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Quick Log Form */}
            <div className="lg:col-span-5">
              <GlassCard>
                <div className="p-4 sm:p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
                      <Code2 size={16} />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-white">Log Solved Problem</h3>
                      <p className="text-[10px] text-slate-400">Log practice into your record</p>
                    </div>
                  </div>

                  <form onSubmit={handleAddProblem} className="space-y-3.5">
                    <div>
                      <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                        Problem Title
                      </label>
                      <input
                        type="text"
                        value={problemName}
                        onChange={(e) => setProblemName(e.target.value)}
                        placeholder="e.g. 3Sum, LRU Cache, Trapping Rain Water"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                          Platform
                        </label>
                        <select
                          value={problemPlatform}
                          onChange={(e) => setProblemPlatform(e.target.value as DSAPlatform)}
                          className="w-full px-3 py-2 rounded-xl bg-[#0b0e1a] border border-white/[0.1] text-xs text-white focus:outline-none focus:border-amber-500/50"
                        >
                          {DSA_PLATFORMS.map((p) => (
                            <option key={p.name} value={p.name}>
                              {p.emoji} {p.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                          Difficulty
                        </label>
                        <div className="grid grid-cols-3 gap-1 bg-white/[0.03] p-1 rounded-xl border border-white/[0.08]">
                          {(['Easy', 'Medium', 'Hard'] as const).map((diff) => (
                            <button
                              key={diff}
                              type="button"
                              onClick={() => setProblemDiff(diff)}
                              className={`py-1 text-[11px] font-bold rounded-lg transition-all ${
                                problemDiff === diff
                                  ? diff === 'Easy'
                                    ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                                    : diff === 'Medium'
                                    ? 'bg-amber-500/30 text-amber-300 border border-amber-500/40'
                                    : 'bg-rose-500/30 text-rose-300 border border-rose-500/40'
                                  : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              {diff}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                          Topic / Pattern
                        </label>
                        <select
                          value={problemTopic}
                          onChange={(e) => setProblemTopic(e.target.value as DSATopic)}
                          className="w-full px-3 py-2 rounded-xl bg-[#0b0e1a] border border-white/[0.1] text-xs text-white focus:outline-none focus:border-amber-500/50"
                        >
                          {DSA_TOPICS.map((t) => (
                            <option key={t.name} value={t.name}>
                              {t.emoji} {t.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                          Time Taken (mins)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="300"
                          value={problemTimeMins}
                          onChange={(e) =>
                            setProblemTimeMins(e.target.value ? Number(e.target.value) : '')
                          }
                          placeholder="e.g. 20"
                          className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold text-xs sm:text-sm hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
                    >
                      <Plus size={16} />
                      <span>Log Problem Solved</span>
                    </button>
                  </form>
                </div>
              </GlassCard>
            </div>

            {/* Weekly Velocity Chart & Difficulty Breakdown */}
            <div className="lg:col-span-7 space-y-6">
              <GlassCard>
                <div className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-white">
                        7-Day Consistency Curve
                      </h3>
                      <p className="text-[10px] text-slate-400">Daily solved volume over the past week</p>
                    </div>
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                      <TrendingUp size={13} />
                      {weekStats.reduce((sum, d) => sum + d.count, 0)} problems this week
                    </span>
                  </div>

                  <div className="grid grid-cols-7 gap-2 items-end h-28 pt-4 pb-2 border-b border-white/[0.06]">
                    {weekStats.map((d, i) => {
                      const h = d.count > 0 ? Math.max((d.count / weekMax) * 80, 10) : 4;
                      const isToday = i === 6;
                      return (
                        <div key={d.date} className="flex flex-col items-center gap-1.5 h-full justify-end">
                          <span className="text-[10px] font-bold text-slate-400">
                            {d.count > 0 ? d.count : ''}
                          </span>
                          <div
                            className={`w-full max-w-[32px] rounded-t-xl transition-all duration-500 ${
                              isToday
                                ? 'bg-gradient-to-t from-amber-500 to-orange-400 shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                                : d.count > 0
                                ? 'bg-amber-500/40 hover:bg-amber-500/60'
                                : 'bg-white/[0.06]'
                            }`}
                            style={{ height: `${h}px` }}
                          />
                          <span className="text-[9px] text-slate-400 font-bold">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][
                              new Date(d.date).getDay()
                            ]}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </GlassCard>

              {/* Topic Breakdown */}
              <GlassCard>
                <div className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-white">
                        DSA Topic Breakdown
                      </h3>
                      <p className="text-[10px] text-slate-400">
                        85%+ of interview questions focus on ~12 core patterns
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {DSA_TOPICS.map((topic) => {
                      const count = topicCounts[topic.name] || 0;
                      return (
                        <div
                          key={topic.name}
                          className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-sm">{topic.emoji}</span>
                            <span className="text-xs font-semibold text-slate-300 truncate">
                              {topic.name}
                            </span>
                          </div>
                          <span
                            className={`text-xs font-black px-2 py-0.5 rounded-md ${
                              count > 0
                                ? 'bg-amber-500/20 text-amber-300'
                                : 'bg-white/[0.04] text-slate-600'
                            }`}
                          >
                            {count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </GlassCard>
            </div>
          </div>

          {/* Contests Log */}
          <GlassCard>
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white">Contest Ratings</h3>
                  <p className="text-[10px] text-slate-400">Codeforces, LeetCode & CodeChef rounds</p>
                </div>
                <button
                  onClick={() => setShowContestModal(true)}
                  className="px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-xs font-bold flex items-center gap-1 transition-all"
                >
                  <Plus size={13} />
                  <span>Log Contest</span>
                </button>
              </div>

              {profile.contests.length === 0 ? (
                <div className="text-center py-8 rounded-2xl bg-white/[0.015] border border-white/[0.04]">
                  <Award size={28} className="mx-auto text-slate-600 mb-2" />
                  <p className="text-xs text-slate-400">No contests recorded yet.</p>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Target Codeforces Div 3/4 rounds to build timed speed!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {profile.contests.map((c) => (
                    <div
                      key={c.id}
                      className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{c.contestName}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/[0.06] text-slate-300">
                            {c.platform}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                          {c.rank && <span>Rank #{c.rank}</span>}
                          {c.currentRating && <span>Rating: {c.currentRating}</span>}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {c.ratingChange !== undefined && (
                          <span
                            className={`text-xs font-black ${
                              c.ratingChange >= 0 ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {c.ratingChange >= 0 ? `+${c.ratingChange}` : c.ratingChange}
                          </span>
                        )}
                        <button
                          onClick={() => {
                            triggerHaptic('light');
                            removeContest(c.id);
                          }}
                          className="text-slate-600 hover:text-rose-400 p-1"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      )}

      {/* TAB 3: CORE CS & 20-MONTH ROADMAP */}
      {activeTab === 'core' && (
        <div className="space-y-6">
          {/* Core Subjects Readiness Sliders */}
          <GlassCard>
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white">
                    Core CS Fundamentals (Interview Readiness)
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    Operating Systems, DBMS, Networks, and OOP are heavily tested in Round 2 & 3
                  </p>
                </div>
                <span className="text-sm font-black text-cyan-400 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20">
                  {avgCoreReadiness}% Overall
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mt-4">
                {[
                  {
                    key: 'os' as const,
                    name: 'Operating Systems (OS)',
                    desc: 'Processes, Threads, Concurrency, Deadlocks, Paging & Virtual Memory',
                    color: '#06b6d4',
                  },
                  {
                    key: 'dbms' as const,
                    name: 'Database Systems (DBMS)',
                    desc: 'ACID properties, Normalization (1NF-BCNF), Indexing (B-Trees), SQL queries & Transactions',
                    color: '#3b82f6',
                  },
                  {
                    key: 'cn' as const,
                    name: 'Computer Networks (CN)',
                    desc: 'OSI/TCP-IP models, DNS, TCP vs UDP, HTTP/HTTPS, WebSockets, IP Addressing',
                    color: '#8b5cf6',
                  },
                  {
                    key: 'oop' as const,
                    name: 'Object-Oriented Programming (OOP/LLD)',
                    desc: 'Inheritance, Polymorphism, Encapsulation, Abstraction, SOLID principles & Design Patterns',
                    color: '#ec4899',
                  },
                ].map((subj) => {
                  const val = profile.coreSubjects[subj.key];
                  return (
                    <div
                      key={subj.key}
                      className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm font-bold text-white">{subj.name}</span>
                        <span className="text-xs font-black" style={{ color: subj.color }}>
                          {val}%
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{subj.desc}</p>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={val}
                        onChange={(e) => updateSubjectProgress(subj.key, Number(e.target.value))}
                        className="w-full accent-cyan-400 h-1.5 bg-white/[0.08] rounded-lg cursor-pointer"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </GlassCard>

          {/* 20-Month Stepping Stone Architecture */}
          <GlassCard>
            <div className="p-4 sm:p-6">
              <div className="mb-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  Sequenced Roadmap
                </span>
                <h3 className="text-base sm:text-lg font-bold text-white mt-1">
                  20-Month Big Tech Execution Blueprint (Nov 2026 – Aug 2028)
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Pacing your progress across 4 structured layers avoids the cramming trap.
                </p>
              </div>

              <div className="space-y-4 mt-6">
                {[
                  {
                    stage: 'Stage 1: Language Fluency & Tooling',
                    time: 'Months 1–2 (Year 1, Sem 1)',
                    focus: 'Pick ONE language (C++, Java, or Python). Master loops, recursion, Git, GitHub, and terminal commands.',
                    milestone: 'Solve 30–40 basic implementation problems; maintain 8.0+ CGPA; zero backlogs.',
                    badge: 'Foundation',
                  },
                  {
                    stage: 'Stage 2: Linear DSA & First Projects',
                    time: 'Months 3–5 (Year 1, Sem 2)',
                    focus: 'Big-O complexity, Arrays, Strings, Hashing, Two Pointers, Sliding Window, Stacks, and Queues.',
                    milestone: '100+ problems solved on Striver/NeetCode; deploy 1 clean project to Vercel/GitHub.',
                    badge: 'Linear DSA',
                  },
                  {
                    stage: 'Stage 3: Non-Linear DSA & Open-Source',
                    time: 'Months 6–9 (Summer Break & Sem 3)',
                    focus: 'Binary Trees, BSTs, Graphs (BFS/DFS, Dijkstra), Dynamic Programming, SQL, and REST APIs.',
                    milestone: '150–250 total problems; ship 1 deep full-stack project; make first open-source PR for GSoC shortlisting.',
                    badge: 'Deep Tech',
                  },
                  {
                    stage: 'Stage 4: CS Core & Peak Interview Speed',
                    time: 'Months 10–18 (Year 2, Sem 4 to Pre-Final)',
                    focus: 'OS, DBMS, Low-Level Design (LLD), Codeforces 1400+, and drafting 6–8 quantified STAR behavioral stories.',
                    milestone: 'Solve unseen LeetCode Mediums in <20 mins; apply on Day 1 in August for Flagship Internships.',
                    badge: 'Offer Ready',
                  },
                ].map((step, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-amber-500/30 transition-all"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 font-bold text-xs flex items-center justify-center border border-amber-500/30">
                          {idx + 1}
                        </span>
                        <h4 className="text-sm font-bold text-white">{step.stage}</h4>
                      </div>
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-white/[0.06] text-slate-300">
                        {step.time}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-2 leading-relaxed">{step.focus}</p>
                    <div className="mt-2.5 pt-2 border-t border-white/[0.06] text-[11px] text-amber-300 font-medium">
                      🎯 <strong>Exit Criteria:</strong> {step.milestone}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* TAB 4: PROJECTS & OPEN SOURCE */}
      {activeTab === 'projects' && (
        <div className="space-y-6">
          <GlassCard>
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white">
                    Showcase Engineering Projects ({profile.projects.length})
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    Big Tech recruiters look for architectural depth over tutorial clones
                  </p>
                </div>
                <button
                  onClick={() => setShowProjectModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all hover:brightness-110"
                >
                  <Plus size={14} />
                  <span>Add Project</span>
                </button>
              </div>

              {profile.projects.length === 0 ? (
                <div className="text-center py-12 rounded-2xl bg-white/[0.015] border border-white/[0.04]">
                  <FolderGit2 size={36} className="mx-auto text-slate-600 mb-2" />
                  <p className="text-xs text-slate-400 font-semibold">No projects logged yet.</p>
                  <p className="text-[10px] text-slate-500 mt-1 max-w-md mx-auto">
                    Target 2 deep, deployed full-stack or systems projects with live URLs, clean READMEs, and measurable impact (e.g. Google XYZ formula).
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.projects.map((proj) => (
                    <div
                      key={proj.id}
                      className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <h4 className="text-sm font-bold text-white">{proj.name}</h4>
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                              proj.status === 'deployed'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : proj.status === 'completed'
                                ? 'bg-blue-500/20 text-blue-300'
                                : 'bg-amber-500/20 text-amber-300'
                            }`}
                          >
                            {proj.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed mb-3">
                          {proj.description || 'No description added.'}
                        </p>
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {proj.techStack.map((tech, i) => (
                            <span
                              key={i}
                              className="text-[10px] px-2 py-0.5 rounded-md bg-white/[0.05] text-slate-300 font-medium"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-white/[0.06] mt-2">
                        <div className="flex items-center gap-3">
                          {proj.githubUrl && (
                            <a
                              href={proj.githubUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-semibold"
                            >
                              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                              </svg> Code
                            </a>
                          )}
                          {proj.liveUrl && (
                            <a
                              href={proj.liveUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
                            >
                              <ExternalLink size={13} /> Live
                            </a>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            triggerHaptic('light');
                            removeProject(proj.id);
                          }}
                          className="text-slate-600 hover:text-rose-400 p-1"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </GlassCard>

          {/* Resume Spec / XYZ Formula Guide */}
          <GlassCard>
            <div className="p-4 sm:p-6 bg-gradient-to-br from-amber-500/5 to-transparent">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={16} className="text-amber-400" />
                <h4 className="text-sm font-bold text-white">Google XYZ Formula for Project Bullets</h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Describe project achievements using: <em>&ldquo;Accomplished [X], as measured by [Y], by doing [Z].&rdquo;</em>
              </p>
              <div className="mt-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs text-amber-200/90 italic">
                &ldquo;Reduced API query latency by 42% (from 310ms to 180ms) across 10k records by implementing Redis caching and composite PostgreSQL indexing.&rdquo;
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* TAB 5: JOB & INTERNSHIP PIPELINE */}
      {activeTab === 'pipeline' && (
        <div className="space-y-6">
          <GlassCard>
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white">
                    Application Tracking Pipeline ({profile.applications.length})
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    Track referrals, Online Assessments (OA), and interview stages
                  </p>
                </div>
                <button
                  onClick={() => setShowAppModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all hover:brightness-110"
                >
                  <Plus size={14} />
                  <span>Log Application</span>
                </button>
              </div>

              {/* Status Columns Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 mt-4">
                {APPLICATION_STATUSES.map((col) => {
                  const items = profile.applications.filter((a) => a.status === col.name);
                  return (
                    <div
                      key={col.name}
                      className="p-3 rounded-2xl bg-white/[0.015] border border-white/[0.06] flex flex-col justify-between min-h-[220px]"
                    >
                      <div>
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/[0.06]">
                          <span className="text-xs font-bold text-white flex items-center gap-1">
                            <span>{col.emoji}</span>
                            <span className="truncate">{col.label}</span>
                          </span>
                          <span
                            className="text-[10px] font-bold px-1.5 py-0.2 rounded-full"
                            style={{ backgroundColor: `${col.color}25`, color: col.color }}
                          >
                            {items.length}
                          </span>
                        </div>

                        <div className="space-y-2">
                          {items.map((app) => (
                            <div
                              key={app.id}
                              className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-1 group"
                            >
                              <div className="flex items-start justify-between">
                                <span className="text-xs font-bold text-white truncate max-w-[85%]">
                                  {app.company}
                                </span>
                                <button
                                  onClick={() => {
                                    triggerHaptic('light');
                                    removeApplication(app.id);
                                  }}
                                  className="text-slate-600 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Trash2 size={11} />
                                </button>
                              </div>
                              <p className="text-[10px] text-slate-400 truncate">{app.role}</p>

                              {/* Quick Move Dropdown */}
                              <select
                                value={app.status}
                                onChange={(e) =>
                                  updateApplication(app.id, {
                                    status: e.target.value as CareerApplication['status'],
                                  })
                                }
                                className="w-full mt-1 px-1.5 py-1 rounded bg-[#0b0e1a] border border-white/[0.1] text-[9px] text-slate-300 focus:outline-none"
                              >
                                {APPLICATION_STATUSES.map((s) => (
                                  <option key={s.name} value={s.name}>
                                    {s.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setAppStatus(col.name);
                          setShowAppModal(true);
                        }}
                        className="w-full mt-3 py-1.5 rounded-lg border border-dashed border-white/10 text-[10px] text-slate-400 hover:text-white hover:border-white/20 transition-all flex items-center justify-center gap-1"
                      >
                        <Plus size={11} /> Add
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </GlassCard>

          {/* Big Tech Benchmarks Quick Reference */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
              <span className="text-xs font-bold text-amber-300">🔍 Google India</span>
              <p className="text-[11px] text-slate-400 mt-1">
                7.5–8.5+ CGPA favored. 2–3 rounds in Google Docs without autocomplete. Focus: Trees, Graphs, DP, Googliness.
              </p>
              <span className="text-[10px] text-emerald-400 font-bold block mt-2">
                Stipend: ~₹1.1L – ₹1.25L/mo
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
              <span className="text-xs font-bold text-blue-300">🪟 Microsoft India</span>
              <p className="text-[11px] text-slate-400 mt-1">
                Codility/HackerRank OA. 2–3 rounds testing core DSA, project architecture, OS, DBMS, OOP/LLD.
              </p>
              <span className="text-[10px] text-emerald-400 font-bold block mt-2">
                Stipend: ~₹1.25L/mo
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
              <span className="text-xs font-bold text-orange-300">📦 Amazon India</span>
              <p className="text-[11px] text-slate-400 mt-1">
                60-min repository debugging round + DSA + Leadership Principles (STAR format). HackOn & ML Summer School.
              </p>
              <span className="text-[10px] text-emerald-400 font-bold block mt-2">
                Stipend: ~₹1.1L – ₹1.2L/mo
              </span>
            </div>
          </div>
        </div>
      )}

      {/* PROJECT MODAL */}
      <AnimatePresence>
        {showProjectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg p-6 rounded-3xl bg-[#0d1020] border border-white/[0.1] shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <h3 className="text-base font-bold text-white">Add Engineering Project</h3>
                <button
                  onClick={() => setShowProjectModal(false)}
                  className="text-slate-400 hover:text-white text-xs font-bold"
                >
                  Cancel
                </button>
              </div>

              <form onSubmit={handleAddProject} className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 uppercase block mb-1">
                    Project Name
                  </label>
                  <input
                    type="text"
                    value={projName}
                    onChange={(e) => setProjName(e.target.value)}
                    placeholder="e.g. Distributed Task Queue"
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs text-white placeholder-slate-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 uppercase block mb-1">
                    Description & Metrics (XYZ formula)
                  </label>
                  <textarea
                    value={projDesc}
                    onChange={(e) => setProjDesc(e.target.value)}
                    placeholder="What did you build, what was the architecture, and what was the measured impact?"
                    rows={3}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs text-white placeholder-slate-500 focus:outline-none resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-300 uppercase block mb-1">
                      Tech Stack (comma separated)
                    </label>
                    <input
                      type="text"
                      value={projStack}
                      onChange={(e) => setProjStack(e.target.value)}
                      placeholder="React, Go, Redis, Docker"
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs text-white placeholder-slate-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-300 uppercase block mb-1">
                      Status
                    </label>
                    <select
                      value={projStatus}
                      onChange={(e) => setProjStatus(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-[#0b0e1a] border border-white/[0.1] text-xs text-white focus:outline-none"
                    >
                      <option value="planning">Planning</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="deployed">Deployed & Live</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-300 uppercase block mb-1">
                      GitHub URL
                    </label>
                    <input
                      type="url"
                      value={projGithub}
                      onChange={(e) => setProjGithub(e.target.value)}
                      placeholder="https://github.com/..."
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs text-white placeholder-slate-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-300 uppercase block mb-1">
                      Live URL
                    </label>
                    <input
                      type="url"
                      value={projLive}
                      onChange={(e) => setProjLive(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs text-white placeholder-slate-500 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold text-xs hover:brightness-110 transition-all"
                >
                  Save Project
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* APPLICATION MODAL */}
      <AnimatePresence>
        {showAppModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md p-6 rounded-3xl bg-[#0d1020] border border-white/[0.1] shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <h3 className="text-base font-bold text-white">Log Application</h3>
                <button
                  onClick={() => setShowAppModal(false)}
                  className="text-slate-400 hover:text-white text-xs font-bold"
                >
                  Cancel
                </button>
              </div>

              <form onSubmit={handleAddApplication} className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 uppercase block mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={appCompany}
                    onChange={(e) => setAppCompany(e.target.value)}
                    placeholder="e.g. Google, Atlassian, Microsoft"
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs text-white placeholder-slate-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 uppercase block mb-1">
                    Role
                  </label>
                  <input
                    type="text"
                    value={appRole}
                    onChange={(e) => setAppRole(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 uppercase block mb-1">
                    Current Stage
                  </label>
                  <select
                    value={appStatus}
                    onChange={(e) => setAppStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0b0e1a] border border-white/[0.1] text-xs text-white focus:outline-none"
                  >
                    {APPLICATION_STATUSES.map((s) => (
                      <option key={s.name} value={s.name}>
                        {s.emoji} {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 uppercase block mb-1">
                    Notes / Referral details
                  </label>
                  <textarea
                    value={appNotes}
                    onChange={(e) => setAppNotes(e.target.value)}
                    placeholder="Referral name, job ID, OA deadline..."
                    rows={2}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs text-white placeholder-slate-500 focus:outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold text-xs hover:brightness-110 transition-all"
                >
                  Save Application
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CONTEST MODAL */}
      <AnimatePresence>
        {showContestModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md p-6 rounded-3xl bg-[#0d1020] border border-white/[0.1] shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <h3 className="text-base font-bold text-white">Log Contest Result</h3>
                <button
                  onClick={() => setShowContestModal(false)}
                  className="text-slate-400 hover:text-white text-xs font-bold"
                >
                  Cancel
                </button>
              </div>

              <form onSubmit={handleAddContest} className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 uppercase block mb-1">
                    Contest Name
                  </label>
                  <input
                    type="text"
                    value={contestName}
                    onChange={(e) => setContestName(e.target.value)}
                    placeholder="e.g. Codeforces Round 950 (Div 3)"
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs text-white placeholder-slate-500 focus:outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-300 uppercase block mb-1">
                      Platform
                    </label>
                    <select
                      value={contestPlatform}
                      onChange={(e) => setContestPlatform(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-[#0b0e1a] border border-white/[0.1] text-xs text-white focus:outline-none"
                    >
                      {DSA_PLATFORMS.map((p) => (
                        <option key={p.name} value={p.name}>
                          {p.emoji} {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-300 uppercase block mb-1">
                      Rank
                    </label>
                    <input
                      type="number"
                      value={contestRank}
                      onChange={(e) => setContestRank(e.target.value ? Number(e.target.value) : '')}
                      placeholder="e.g. 1420"
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs text-white placeholder-slate-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-300 uppercase block mb-1">
                      Rating Change (+/-)
                    </label>
                    <input
                      type="number"
                      value={contestRatingChange}
                      onChange={(e) =>
                        setContestRatingChange(e.target.value ? Number(e.target.value) : '')
                      }
                      placeholder="e.g. +45"
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs text-white placeholder-slate-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-300 uppercase block mb-1">
                      New Rating
                    </label>
                    <input
                      type="number"
                      value={contestCurrentRating}
                      onChange={(e) =>
                        setContestCurrentRating(e.target.value ? Number(e.target.value) : '')
                      }
                      placeholder="e.g. 1380"
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs text-white placeholder-slate-500 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold text-xs hover:brightness-110 transition-all"
                >
                  Save Contest
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
