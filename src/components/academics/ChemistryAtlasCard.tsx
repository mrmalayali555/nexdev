'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  BookOpen,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Download,
  Copy,
  Check,
  Flame,
  Award,
  Layers,
  FileText,
  BarChart3,
  Calendar,
  Clock,
  ExternalLink,
  ShieldAlert,
  HelpCircle,
  Hash,
} from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import {
  CHEMISTRY_PAPERS,
  CHEMISTRY_CHAPTERS,
  CHEMISTRY_PAPER_REGISTER,
  CHEMISTRY_QUESTIONS,
  CHEMISTRY_TOPICS,
  ChemistryQuestion,
  ChemistryTopic,
} from '@/lib/chemistryAtlasData';
import { triggerHaptic } from '@/lib/haptics';

type AtlasTab = 'questions' | 'syllabus' | 'weightage' | 'matrix' | 'method';

export default function ChemistryAtlasCard() {
  const [activeTab, setActiveTab] = useState<AtlasTab>('questions');

  // Question Filters
  const [qSearch, setQSearch] = useState('');
  const [qModule, setQModule] = useState('All');
  const [qPaper, setQPaper] = useState('All');
  const [qTreatment, setQTreatment] = useState('All');
  const [qOnlyHighMarks, setQOnlyHighMarks] = useState(false);
  const [expandedQuestions, setExpandedQuestions] = useState<Record<number, boolean>>({});
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Syllabus Filters
  const [sSearch, setSSearch] = useState('');
  const [sModule, setSModule] = useState('All');
  const [sStatus, setSStatus] = useState<'All' | 'zero' | 'has'>('All');

  // Filtered Questions
  const filteredQuestions = useMemo(() => {
    return CHEMISTRY_QUESTIONS.filter((item) => {
      if (qModule !== 'All' && item.module !== qModule) return false;
      if (qPaper !== 'All' && item.paper !== qPaper) return false;
      if (qTreatment === 'Direct' && !item.treatment.toLowerCase().includes('direct')) return false;
      if (qTreatment === 'Related' && !item.treatment.toLowerCase().includes('related') && !item.treatment.toLowerCase().includes('partial')) return false;
      if (qTreatment === 'Excluded' && !item.treatment.toLowerCase().includes('excluded')) return false;
      if (qOnlyHighMarks && (item.marks === null || item.marks < 6)) return false;

      if (qSearch.trim()) {
        const query = qSearch.toLowerCase();
        const haystack = `${item.q} ${item.topic} ${item.paper} ${item.ref} ${item.answer}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });
  }, [qSearch, qModule, qPaper, qTreatment, qOnlyHighMarks]);

  // Filtered Syllabus Topics
  const filteredTopics = useMemo(() => {
    return CHEMISTRY_TOPICS.filter((item) => {
      if (sModule !== 'All' && item.module !== sModule) return false;
      if (sStatus === 'zero' && !item.zero) return false;
      if (sStatus === 'has' && item.zero) return false;

      if (sSearch.trim()) {
        const query = sSearch.toLowerCase();
        const haystack = `${item.topic} ${item.chapter} ${item.answer}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });
  }, [sSearch, sModule, sStatus]);

  const toggleQuestion = (idx: number) => {
    triggerHaptic('light');
    setExpandedQuestions((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const copyAnswer = (text: string, idx: number) => {
    triggerHaptic('medium');
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const downloadCSV = () => {
    triggerHaptic('medium');
    const headers = ['Module', 'Chapter', 'Topic', 'Mapped Questions', 'Identified Marks', 'Zero PYQ Status', 'Model Answer'];
    const rows = CHEMISTRY_TOPICS.map((t) => [
      `"${t.module}"`,
      `"${t.chapter}"`,
      `"${t.topic.replace(/"/g, '""')}"`,
      t.count,
      t.marks,
      t.zero ? '"Zero PYQ (Surprise Watch)"' : '"Has PYQ"',
      `"${t.answer.replace(/"/g, '""')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'SCMS_Chemistry_GXCYT122_PYQ_Atlas.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const zeroTopicsCount = CHEMISTRY_TOPICS.filter((t) => t.zero).length;

  return (
    <div className="space-y-6">
      {/* Hero Header Card */}
      <div className="p-5 sm:p-7 rounded-3xl bg-gradient-to-br from-emerald-950/40 via-cyan-950/20 to-[#070a14] border border-white/[0.08] border-t-white/[0.18] backdrop-blur-2xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_12px_36px_rgba(0,0,0,0.5)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
                <Sparkles size={11} /> SCMS Autonomous 2026 Scheme
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-white/[0.06] text-slate-300 text-[10px] font-mono border border-white/[0.08]">
                26GXCYT122
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 text-[10px] font-bold border border-cyan-500/20">
                Exam: Monday, Dec 14, 2026 (09:30 AM)
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Chemistry PYQ &amp; Answer Atlas
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Complete question-level intelligence across 8 past examination papers, covering all 52 autonomous syllabus topics in Modules 1–4 with model answers.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2.5 self-start lg:self-center shrink-0">
            <button
              onClick={downloadCSV}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 border border-white/[0.1] flex items-center gap-1.5 transition-all active:scale-[0.97]"
            >
              <Download size={14} className="text-cyan-400" />
              <span>Export CSV</span>
            </button>
            <div className="px-3 py-1.5 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-mono font-bold flex items-center gap-1.5">
              <span>Theory 50M</span>
            </div>
          </div>
        </div>

        {/* High-Yield KPI Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          <div className="p-3.5 rounded-2xl bg-black/40 border border-white/[0.06]">
            <span className="text-[11px] font-medium text-slate-400 block">Syllabus Topics</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl sm:text-2xl font-extrabold font-mono text-white">52</span>
              <span className="text-[10px] text-emerald-400 font-bold">100% Tracked</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-black/40 border border-white/[0.06]">
            <span className="text-[11px] font-medium text-slate-400 block">Audited Past Prompts</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl sm:text-2xl font-extrabold font-mono text-cyan-300">61</span>
              <span className="text-[10px] text-slate-400 font-bold">8 Papers</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-black/40 border border-white/[0.06]">
            <span className="text-[11px] font-medium text-slate-400 block">Identified Marks</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl sm:text-2xl font-extrabold font-mono text-purple-300">563M</span>
              <span className="text-[10px] text-slate-400 font-bold">Mapped</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/20">
            <span className="text-[11px] font-medium text-amber-300/80 block">Zero-PYQ Surprise Watch</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl sm:text-2xl font-extrabold font-mono text-amber-300">{zeroTopicsCount}</span>
              <span className="text-[10px] text-amber-400/90 font-bold">High Surprise</span>
            </div>
          </div>
        </div>
      </div>

      {/* Subject Navigation Switcher */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        <button className="px-4 py-2 rounded-2xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 text-white shadow-lg shadow-emerald-600/20 border border-emerald-400/30 shrink-0 flex items-center gap-1.5">
          <span>🧪 Chemistry for Info Science (Live)</span>
        </button>
        <button
          onClick={() => triggerHaptic('light')}
          className="px-4 py-2 rounded-2xl text-xs font-medium bg-white/[0.03] text-slate-400 hover:text-white border border-white/[0.06] shrink-0 transition-colors"
        >
          <span>📐 Calculus (Dec 11) • Soon</span>
        </button>
        <button
          onClick={() => triggerHaptic('light')}
          className="px-4 py-2 rounded-2xl text-xs font-medium bg-white/[0.03] text-slate-400 hover:text-white border border-white/[0.06] shrink-0 transition-colors"
        >
          <span>💻 Programming in C (Dec 28) • Soon</span>
        </button>
        <button
          onClick={() => triggerHaptic('light')}
          className="px-4 py-2 rounded-2xl text-xs font-medium bg-white/[0.03] text-slate-400 hover:text-white border border-white/[0.06] shrink-0 transition-colors"
        >
          <span>⚡ IEE / IEC (Dec 18) • Soon</span>
        </button>
        <button
          onClick={() => triggerHaptic('light')}
          className="px-4 py-2 rounded-2xl text-xs font-medium bg-white/[0.03] text-slate-400 hover:text-white border border-white/[0.06] shrink-0 transition-colors"
        >
          <span>📏 Eng. Graphics (Dec 16) • Soon</span>
        </button>
      </div>

      {/* Internal View Navigation Tabs */}
      <div className="flex items-center bg-[#070914] p-1.5 rounded-2xl border border-white/[0.08] overflow-x-auto shadow-inner">
        {[
          { id: 'questions', label: 'PYQ + Model Answers', icon: HelpCircle, badge: filteredQuestions.length },
          { id: 'syllabus', label: 'Full Syllabus Notes', icon: BookOpen, badge: 52 },
          { id: 'weightage', label: 'Module Weightage', icon: BarChart3 },
          { id: 'matrix', label: 'Coverage Matrix', icon: Hash },
          { id: 'method', label: 'Sources & Rules', icon: FileText },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                triggerHaptic('light');
                setActiveTab(tab.id as AtlasTab);
              }}
              className={`relative px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 active:scale-[0.97] ${
                isActive
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30 border border-purple-400/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Icon size={14} className={isActive ? 'text-white' : 'text-slate-400'} />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${isActive ? 'bg-white/20 text-white' : 'bg-white/5 text-slate-400'}`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: QUESTIONS & MODEL ANSWERS */}
      {activeTab === 'questions' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-3">
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={qSearch}
                onChange={(e) => setQSearch(e.target.value)}
                placeholder="Search past questions, topics, keywords (e.g. Nernst, OLED, SEM, Beer-Lambert)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#090d18] border border-white/[0.08] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              {/* Module Filter */}
              <select
                value={qModule}
                onChange={(e) => setQModule(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-[#090d18] border border-white/[0.08] text-slate-200 text-xs focus:outline-none"
              >
                <option value="All">All Modules (1–4)</option>
                <option value="Module 1">Module 1 (Electrochemistry)</option>
                <option value="Module 2">Module 2 (Spectroscopy)</option>
                <option value="Module 3">Module 3 (Nanomaterials &amp; Quantum)</option>
                <option value="Module 4">Module 4 (Environment &amp; Water)</option>
              </select>

              {/* Paper Filter */}
              <select
                value={qPaper}
                onChange={(e) => setQPaper(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-[#090d18] border border-white/[0.08] text-slate-200 text-xs focus:outline-none"
              >
                <option value="All">All Exam Sessions (8 Papers)</option>
                {CHEMISTRY_PAPERS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>

              {/* Treatment Filter */}
              <select
                value={qTreatment}
                onChange={(e) => setQTreatment(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-[#090d18] border border-white/[0.08] text-slate-200 text-xs focus:outline-none"
              >
                <option value="All">All Classifications</option>
                <option value="Direct">Direct Syllabus Match</option>
                <option value="Related">Related / Partial</option>
                <option value="Excluded">Excluded / Older Syllabus</option>
              </select>

              {/* High Marks Only Button */}
              <button
                onClick={() => {
                  triggerHaptic('light');
                  setQOnlyHighMarks(!qOnlyHighMarks);
                }}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  qOnlyHighMarks
                    ? 'bg-purple-500/20 border-purple-500/40 text-purple-200'
                    : 'bg-white/[0.02] border-white/[0.08] text-slate-400 hover:text-white'
                }`}
              >
                <Flame size={12} className={qOnlyHighMarks ? 'text-purple-400' : 'text-slate-500'} />
                <span>≥6 Marks Only</span>
              </button>

              {(qSearch || qModule !== 'All' || qPaper !== 'All' || qTreatment !== 'All' || qOnlyHighMarks) && (
                <button
                  onClick={() => {
                    triggerHaptic('light');
                    setQSearch('');
                    setQModule('All');
                    setQPaper('All');
                    setQTreatment('All');
                    setQOnlyHighMarks(false);
                  }}
                  className="px-2.5 py-1 text-slate-400 hover:text-rose-400 text-xs font-semibold underline"
                >
                  Reset filters
                </button>
              )}
            </div>
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>Showing <strong className="text-white font-mono">{filteredQuestions.length}</strong> questions</span>
            <span className="text-[11px] text-cyan-400/90 font-mono">Tap any question to reveal high-yield model answer</span>
          </div>

          {/* Question List */}
          <div className="space-y-3">
            {filteredQuestions.length === 0 ? (
              <div className="p-10 text-center rounded-3xl bg-white/[0.02] border border-white/[0.06]">
                <p className="text-sm font-bold text-white">No questions matched your filters</p>
                <p className="text-xs text-slate-400 mt-1">Try clearing some filters or searching for different keywords.</p>
              </div>
            ) : (
              filteredQuestions.map((item, idx) => {
                const isExpanded = !!expandedQuestions[idx];
                const isDirect = item.treatment.toLowerCase().includes('direct');
                const isExcluded = item.treatment.toLowerCase().includes('excluded');

                return (
                  <GlassCard
                    key={idx}
                    className="p-4 sm:p-5 transition-all duration-200 border-t-white/[0.18] hover:border-white/[0.15]"
                  >
                    <div
                      onClick={() => toggleQuestion(idx)}
                      className="cursor-pointer space-y-2.5"
                    >
                      {/* Top Badges */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                            {item.module}
                          </span>
                          <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono bg-white/[0.04] text-slate-300 border border-white/[0.08]">
                            {item.paper}
                          </span>
                          <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                            {item.ref}
                          </span>
                          {item.marks && (
                            <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                              {item.marks} Marks
                            </span>
                          )}
                        </div>

                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            isDirect
                              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                              : isExcluded
                              ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                              : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                          }`}
                        >
                          {isDirect ? 'Direct Match' : isExcluded ? 'Excluded' : 'Related'}
                        </span>
                      </div>

                      {/* Question Text */}
                      <h4 className="text-sm sm:text-base font-bold text-white tracking-tight leading-snug">
                        {item.q}
                      </h4>

                      <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-white/[0.04]">
                        <span className="text-[11px] truncate">
                          Topic: <strong className="text-slate-300">{item.topic}</strong>
                        </span>
                        <div className="flex items-center gap-1 text-cyan-400 font-bold text-[11px] shrink-0">
                          <span>{isExpanded ? 'Hide Answer' : 'Model Answer'}</span>
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </div>
                      </div>
                    </div>

                    {/* Expandable Model Answer */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="pt-3 mt-3 border-t border-white/[0.08] space-y-2.5 overflow-hidden"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                              <Sparkles size={12} /> Model Examination Answer
                            </span>
                            <button
                              onClick={() => copyAnswer(item.answer, idx)}
                              className="px-2 py-1 rounded-lg text-[10px] font-bold bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/[0.08] flex items-center gap-1 transition-colors"
                            >
                              {copiedIndex === idx ? (
                                <>
                                  <Check size={11} className="text-emerald-400" />
                                  <span className="text-emerald-400">Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy size={11} />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          </div>

                          <div className="p-3.5 rounded-2xl bg-black/50 border border-white/[0.06] text-xs text-slate-200 leading-relaxed font-sans select-text">
                            {item.answer}
                          </div>

                          {item.treatment && !isDirect && (
                            <p className="text-[10px] text-amber-300/80 font-mono italic">
                              * Classification note: {item.treatment}
                            </p>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </GlassCard>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 2: FULL SYLLABUS & AUTHORED NOTES */}
      {activeTab === 'syllabus' && (
        <div className="space-y-4">
          {/* Syllabus Filters */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-3">
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={sSearch}
                onChange={(e) => setSSearch(e.target.value)}
                placeholder="Search across all 52 syllabus topics & definitions..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#090d18] border border-white/[0.08] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <select
                value={sModule}
                onChange={(e) => setSModule(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-[#090d18] border border-white/[0.08] text-slate-200 text-xs focus:outline-none"
              >
                <option value="All">All Modules (1–4)</option>
                <option value="Module 1">Module 1 (Electrochemistry)</option>
                <option value="Module 2">Module 2 (Spectroscopy)</option>
                <option value="Module 3">Module 3 (Nanomaterials &amp; Quantum)</option>
                <option value="Module 4">Module 4 (Environment &amp; Sustainability)</option>
              </select>

              <select
                value={sStatus}
                onChange={(e) => setSStatus(e.target.value as any)}
                className="px-3 py-1.5 rounded-xl bg-[#090d18] border border-white/[0.08] text-slate-200 text-xs focus:outline-none"
              >
                <option value="All">All 52 Topics</option>
                <option value="zero">⚠️ Zero-PYQ Topics (High Surprise Potential)</option>
                <option value="has">✅ Topics with Mapped PYQs</option>
              </select>

              {(sSearch || sModule !== 'All' || sStatus !== 'All') && (
                <button
                  onClick={() => {
                    setSSearch('');
                    setSModule('All');
                    setSStatus('All');
                  }}
                  className="px-2.5 py-1 text-slate-400 hover:text-rose-400 text-xs font-semibold underline"
                >
                  Reset filters
                </button>
              )}
            </div>
          </div>

          {/* Topic List */}
          <div className="space-y-3">
            {filteredTopics.map((t, idx) => (
              <GlassCard key={idx} className="p-4 sm:p-5 border-t-white/[0.18]">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                        {t.module}
                      </span>
                      <span className="text-[11px] text-slate-400 hidden sm:inline">
                        {t.chapter}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {t.zero ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                          <AlertTriangle size={10} /> Zero PYQ • High Exam Risk
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                          {t.count} Mapped Prompt{t.count > 1 ? 's' : ''} • {t.marks}M
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                    {t.topic}
                  </h3>

                  <div className="p-3.5 rounded-2xl bg-black/40 border border-white/[0.04] text-xs text-slate-300 leading-relaxed font-sans select-text">
                    <strong className="text-cyan-300 block mb-1">Authored Study Explanation:</strong>
                    {t.answer}
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: MODULE WEIGHTAGE & ANALYTICS */}
      {activeTab === 'weightage' && (
        <div className="space-y-6">
          <div className="p-4 sm:p-5 rounded-3xl bg-white/[0.02] border border-white/[0.06]">
            <h3 className="text-sm sm:text-base font-bold text-white mb-1">
              Autonomous Module Weightage Breakdown
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Based on marks identified and mapped across the 8 past papers in your collection.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {CHEMISTRY_CHAPTERS.map((ch) => (
                <div key={ch.chapter} className="p-4 rounded-2xl bg-black/40 border border-white/[0.06] space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold text-cyan-300 block">{ch.chapter}</span>
                      <h4 className="text-sm font-bold text-white mt-0.5">{ch.title}</h4>
                    </div>
                    <span className="text-xl font-mono font-extrabold text-white tabular-nums">
                      {ch.share}%
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="h-2 w-full bg-white/[0.06] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500 rounded-full"
                      style={{ width: `${ch.share * 2.5}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
                    <span>{ch.totalMarks} Total Identified Marks</span>
                    <span>~{ch.avgMarks.toFixed(1)} Marks / Paper</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Exam Strategy Tip */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-950/30 to-indigo-950/20 border border-purple-500/30 text-xs space-y-2">
            <span className="font-bold text-purple-300 uppercase tracking-wider text-[10px] block flex items-center gap-1.5">
              <Award size={14} /> SCMS Exam Strategy Takeaway
            </span>
            <p className="text-slate-300 leading-relaxed">
              <strong>Module 2 (Molecular Spectroscopy)</strong> and <strong>Module 1 (Electrochemistry)</strong> jointly make up over <strong className="text-white">62.7%</strong> of all historical marks. Ensure solid command over UV-Vis electronic transitions, Beer-Lambert derivations, IR modes in CO₂/H₂O, glass electrode pH derivation, and Nernst calculations before moving into Module 3 and 4.
            </p>
          </div>
        </div>
      )}

      {/* TAB 4: COVERAGE MATRIX TABLE */}
      {activeTab === 'matrix' && (
        <div className="space-y-4">
          <div className="rounded-3xl border border-white/[0.1] bg-[#070914]/90 backdrop-blur-2xl overflow-hidden shadow-2xl">
            <div className="p-3.5 bg-white/[0.02] border-b border-white/[0.08] flex items-center justify-between">
              <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                Topic-by-Topic Audit Coverage Matrix
              </h4>
              <span className="text-[11px] font-mono text-slate-400">52 Syllabus Rows</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse min-w-[650px]">
                <thead>
                  <tr className="bg-white/[0.04] border-b border-white/[0.08] font-mono text-[11px] text-cyan-300">
                    <th className="p-3">Module</th>
                    <th className="p-3">Syllabus Topic</th>
                    <th className="p-3 text-center">Mapped Prompts</th>
                    <th className="p-3 text-center">Identified Marks</th>
                    <th className="p-3 text-right">Coverage Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {CHEMISTRY_TOPICS.map((t, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-3 font-mono font-bold text-slate-300">{t.module}</td>
                      <td className="p-3 font-medium text-white">{t.topic}</td>
                      <td className="p-3 text-center font-mono font-bold text-cyan-300">{t.count}</td>
                      <td className="p-3 text-center font-mono text-purple-300">{t.marks}</td>
                      <td className="p-3 text-right">
                        {t.zero ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                            Zero PYQ
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                            Mapped
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: SOURCES & METHODOLOGY */}
      {activeTab === 'method' && (
        <div className="space-y-4">
          <div className="p-5 rounded-3xl bg-white/[0.02] border border-white/[0.06] space-y-4 text-xs">
            <div>
              <h3 className="text-sm font-bold text-white mb-1">Indexed Examination Papers</h3>
              <p className="text-slate-400">8 Question papers identified and audited from the source PDF:</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
              {CHEMISTRY_PAPER_REGISTER.map((p) => (
                <div key={p.label} className="p-3 rounded-2xl bg-black/40 border border-white/[0.06] space-y-1">
                  <span className="font-bold text-white block text-xs">{p.label}</span>
                  <span className="text-[10px] text-slate-400 block">{p.pages}</span>
                  <span className="text-[10px] text-cyan-300/80 font-mono block">{p.scheme}</span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-white/[0.06] space-y-2 text-slate-300 leading-relaxed">
              <strong className="text-white block">Audit Methodology &amp; Classification Rules:</strong>
              <p>• <strong>Primary Syllabus:</strong> Aligned strictly to SCMS Autonomous Scheme 2026 (Course Code: 26GXCYT122, Chemistry for Information Science).</p>
              <p>• <strong>Strict In-Syllabus Standard:</strong> Content from older schemes not present in current syllabus (such as DTA, TGA, column chromatography, conducting polymers, and municipal sewage trickling filters) are marked as <em>Excluded</em>.</p>
              <p>• <strong>Zero-PYQ Topics:</strong> A topic marked with &apos;Zero PYQ&apos; does not mean it cannot appear in your exam; on the contrary, examiners frequently introduce novel questions from unasked syllabus topics (e.g. Silicon-Carbon batteries, Na-ion batteries, AI Data Centre sustainability, and Graphene).</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
