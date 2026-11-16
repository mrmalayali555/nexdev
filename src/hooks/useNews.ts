'use client';

import { useState, useEffect, useCallback } from 'react';
import { TechNewsStory } from '@/lib/types';
import { getNews, saveNews, hydrateFromCloud } from '@/lib/storage';
import { parseNewsBriefing, deepDiveStory } from '@/lib/ai';

const INITIAL_SEED_STORIES: TechNewsStory[] = [
  {
    id: 'story-anthropic-ipo-2026',
    title: 'Anthropic Prepares for Historic $1.4 Trillion IPO — Biggest Test of the AI Boom',
    category: 'AI · Startups · Global Finance',
    summary:
      'Anthropic is targeting a $1.4T valuation on Nasdaq under ticker ANT, raising up to $64.4B in public proceeds alongside $26B in private placements from Google, Nvidia, and AMD.',
    fullContent: `### 🚀 Anthropic Prepares for Historic $1.4 Trillion IPO

Anthropic, the artificial intelligence research company behind the Claude model family, is preparing for what could be the largest technology IPO in financial history. According to regulatory disclosures and industry sources, Anthropic is targeting a fully diluted valuation of **$1.4 Trillion**, with shares priced between $70 and $78.

#### Key Financial Metrics
- **Target Valuation:** $1.4 Trillion (fully diluted) / ~$1.0 Trillion (common equity)
- **Public Offering Proceeds:** Up to $64.4 Billion (825 million shares)
- **Private Placements:** $26 Billion anchored by Google, Nvidia, and AMD
- **Annualized Revenue Run Rate:** ~$81 Billion at the end of October 2026
- **Long-term Infrastructure Commitments:** ~$900 Billion across AWS, Google Cloud, and custom silicon

#### Why This Matters for the Entire Tech Ecosystem
Anthropic's public market debut serves as the definitive litmus test for whether institutional capital believes hyperscale AI research and computing infrastructure spend can yield sustained profitability. The outcome of the offering will heavily influence venture funding multiples, semiconductor capital expenditure, and OpenAI's subsequent public market plans.`,
    sourceUrl: 'https://reuters.com',
    read: false,
    date: 'Monday, 16 November 2026',
    createdAt: '2026-11-16T06:00:00.000Z',
  },
  {
    id: 'story-deepmind-alphaproof-2026',
    title: 'Google DeepMind Unveils AlphaProof 2.0: AI Verification for Mission-Critical Software',
    category: 'AI · Mathematics · Security',
    summary:
      'DeepMind has expanded its formal verification neural architecture to automatically prove correctness for aerospace guidance systems, cryptographic libraries, and kernel drivers.',
    fullContent: `### 🔬 Automated Mathematical Proofs for Zero-Defect Code

Building upon its silver-medal performance at the International Mathematical Olympiad, Google DeepMind announced **AlphaProof 2.0**, an AI system designed to mathematically verify software correctness in formal verification languages like Lean 4 and Coq.

#### Core Breakthroughs
- **Formally Verified Kernels:** Automatically proves the absence of memory safety bugs, race conditions, and cryptographic edge-case vulnerabilities in microkernel architectures.
- **Natural Language to Formal Specification:** Translates human requirements directly into formal mathematical theorems and produces machine-checkable proofs.
- **Aerospace & Defense Readiness:** Successfully deployed to verify real-time attitude control algorithms for orbital satellites without human proof engineers.

*"This marks the transition of artificial intelligence from probabilistic generation to deterministic mathematical truth,"* noted the research team.`,
    sourceUrl: 'https://deepmind.google',
    read: false,
    date: 'Monday, 16 November 2026',
    createdAt: '2026-11-16T07:00:00.000Z',
  },
  {
    id: 'story-china-ai-curriculum-2026',
    title: "China Mandates Nationwide 'AI First' Curriculum for Secondary Schools & Universities",
    category: 'Education · AI Strategy',
    summary:
      'A comprehensive national mandate integrates transformer mechanics, model alignment, and robotics labs into compulsory schooling for over 200 million students.',
    fullContent: `### 🎓 Preparing the Next Century of AI Engineers

China's Ministry of Education has officially introduced a nationwide mandate requiring all secondary school curricula to feature hands-on artificial intelligence and systems engineering.

#### Key Pillars of the Initiative
- **Compulsory Practical Neural Networks:** Students in grades 9 through 12 will study tokenization, gradient descent intuition, and build simple local vision/language models.
- **Dedicated Hardware Labs:** Over 120,000 public schools are receiving localized compute workstations powered by domestic silicon to allow offline student experimentation.
- **University Alignment:** Higher education institutes are restructuring computer science degrees to prioritize autonomous agent swarms, computational biology, and quantum-resistant cryptographic systems.`,
    sourceUrl: 'https://scmp.com',
    read: false,
    date: 'Monday, 16 November 2026',
    createdAt: '2026-11-16T08:00:00.000Z',
  },
  {
    id: 'story-kerala-huddle-global-2026',
    title: 'Kerala Startup Mission Unveils Huddle Global 2026: $350M DeepTech Funding Pipeline',
    category: 'Startups · India & Kerala',
    summary:
      "South India's premier beachside tech conclave in Kovalam brings together 5,000 founders and 300 global venture capital firms with heavy focus on AI agents and hardware.",
    fullContent: `### 🌴 DeepTech Ecosystem Flourishes in South India

The Kerala Startup Mission (KSUM) opened registrations for **Huddle Global 2026** in Kovalam, marking one of Asia's most anticipated founder-investor summits.

#### Highlights of the 2026 Edition
- **$350M In-Principle Pipeline:** Global investment syndicates from Silicon Valley, Singapore, and Europe are committing capital allocations for seed and Series A Indian deeptech teams.
- **AI Corridor Expansion:** New state-backed innovation corridors linking Infopark Kochi, Technopark Thiruvananthapuram, and Cyberpark Kozhikode are providing subsidized compute clusters to student startups.
- **Hardware & Robotics Showcase:** Focus on indigenous drone navigation, biomedical telemetry sensors, and marine robotics built by young engineering graduates.`,
    sourceUrl: 'https://startupmission.kerala.gov.in',
    read: false,
    date: 'Monday, 16 November 2026',
    createdAt: '2026-11-16T09:00:00.000Z',
  },
  {
    id: 'story-learningpanda-hackathon-2026',
    title: 'LearningPanda National AI Hackathon 2026: 40,000+ Builders Tackle Agentic Workflows',
    category: 'Hackathons · Developer Community',
    summary:
      'India’s largest collegiate AI hackathon launches with a ₹50 Lakh prize pool, challenging engineers to deploy autonomous multi-agent systems for vernacular healthcare and logistics.',
    fullContent: `### ⚡ 48-Hour Sprint for Autonomous Solutions

The **LearningPanda National AI Hackathon 2026** has kicked off across 80+ university hub nodes and virtual workspaces, drawing over 40,000 developers, students, and indie hackers.

#### Hackathon Tracks
- **Vernacular Healthcare Swarms:** Autonomous voice-first triage agents communicating fluently in regional Indian languages (Malayalam, Hindi, Tamil, Telugu, Bengali).
- **Edge AI & Autonomous Drone Logistics:** Lightweight models running on Raspberry Pi and Jetson platforms for localized disaster relief and agriculture surveys.
- **Prize Pool & Grants:** Over ₹50 Lakhs in non-dilutive equity grants, sponsored GPU credits from Google Cloud and Nvidia, and direct fast-track interviews with premier AI laboratories.`,
    sourceUrl: 'https://learningpanda.org',
    read: false,
    date: 'Monday, 16 November 2026',
    createdAt: '2026-11-16T10:00:00.000Z',
  },
];

export function useNews() {
  const [stories, setStories] = useState<TechNewsStory[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isDeepDiving, setIsDeepDiving] = useState(false);

  // Initialize and load stories from storage & cloud
  useEffect(() => {
    const local = getNews();
    if (local && local.length > 0) {
      setStories(local);
    } else {
      // First-time seed
      setStories(INITIAL_SEED_STORIES);
      saveNews(INITIAL_SEED_STORIES);
    }
    setIsLoaded(true);

    // Sync from Supabase in background
    hydrateFromCloud().then((cloudData) => {
      if (cloudData?.news && Array.isArray(cloudData.news) && cloudData.news.length > 0) {
        setStories(cloudData.news);
      }
    });
  }, []);

  const saveAndSync = useCallback((newStories: TechNewsStory[]) => {
    setStories(newStories);
    saveNews(newStories);
  }, []);

  // Mark story as read
  const markAsRead = useCallback(
    (storyId: string) => {
      const updated = stories.map((s) => (s.id === storyId ? { ...s, read: true } : s));
      saveAndSync(updated);

      // Advance to next unread if possible
      const nextUnreadIndex = updated.findIndex((s, idx) => idx > currentIndex && !s.read);
      if (nextUnreadIndex !== -1) {
        setCurrentIndex(nextUnreadIndex);
      } else {
        const anyUnread = updated.findIndex((s) => !s.read);
        if (anyUnread !== -1) {
          setCurrentIndex(anyUnread);
        } else if (currentIndex < updated.length - 1) {
          setCurrentIndex(currentIndex + 1);
        }
      }
    },
    [stories, currentIndex, saveAndSync]
  );

  // Mark story as unread
  const toggleReadStatus = useCallback(
    (storyId: string) => {
      const updated = stories.map((s) => (s.id === storyId ? { ...s, read: !s.read } : s));
      saveAndSync(updated);
    },
    [stories, saveAndSync]
  );

  // Mark all as unread / reset
  const resetAllRead = useCallback(() => {
    const updated = stories.map((s) => ({ ...s, read: false }));
    saveAndSync(updated);
    setCurrentIndex(0);
  }, [stories, saveAndSync]);

  // Next / Previous navigation
  const nextStory = useCallback(() => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, stories.length]);

  const prevStory = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const goToStory = useCallback(
    (index: number) => {
      if (index >= 0 && index < stories.length) {
        setCurrentIndex(index);
      }
    },
    [stories.length]
  );

  // Import raw newsletter text
  const importBriefing = useCallback(
    async (rawText: string) => {
      if (!rawText.trim()) return;
      setIsImporting(true);
      try {
        const parsed = await parseNewsBriefing(rawText);
        const newStories: TechNewsStory[] = parsed.map((item, index) => ({
          ...item,
          id: `news-${Date.now()}-${index}`,
          read: false,
          createdAt: new Date().toISOString(),
        }));

        const updated = [...newStories, ...stories];
        saveAndSync(updated);
        setCurrentIndex(0);
        return newStories;
      } finally {
        setIsImporting(false);
      }
    },
    [stories, saveAndSync]
  );

  // AI Deep Dive Grounding
  const generateDeepDive = useCallback(
    async (storyId: string) => {
      const story = stories.find((s) => s.id === storyId);
      if (!story) return;

      if (story.deepDive) {
        return story.deepDive;
      }

      setIsDeepDiving(true);
      try {
        const analysis = await deepDiveStory(story.title, story.summary, story.fullContent);
        const updated = stories.map((s) => (s.id === storyId ? { ...s, deepDive: analysis } : s));
        saveAndSync(updated);
        return analysis;
      } finally {
        setIsDeepDiving(false);
      }
    },
    [stories, saveAndSync]
  );

  const currentStory = stories[currentIndex] || null;
  const readCount = stories.filter((s) => s.read).length;
  const totalCount = stories.length;
  const isAllRead = totalCount > 0 && readCount === totalCount;

  // 2:00 PM Reminder Checker
  const now = new Date();
  const todayDateStr = now.toISOString().slice(0, 10);
  const formattedToday = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const fullToday = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' });

  const hasTodayBriefing = stories.some((s) => {
    if (s.createdAt && s.createdAt.startsWith(todayDateStr)) return true;
    if (s.date && (s.date.includes(formattedToday) || s.date.includes(fullToday))) return true;
    return false;
  });

  const isPast2PM = now.getHours() >= 14;
  const shouldShow2PMAlert = isPast2PM && !hasTodayBriefing;

  return {
    stories,
    currentStory,
    currentIndex,
    isLoaded,
    isImporting,
    isDeepDiving,
    readCount,
    totalCount,
    isAllRead,
    hasTodayBriefing,
    isPast2PM,
    shouldShow2PMAlert,
    markAsRead,
    toggleReadStatus,
    resetAllRead,
    nextStory,
    prevStory,
    goToStory,
    importBriefing,
    generateDeepDive,
  };
}
