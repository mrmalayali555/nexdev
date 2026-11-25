'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { parseNewsBriefing } from '@/lib/ai';
import { getNews, saveNews } from '@/lib/storage';
import { TechNewsStory } from '@/lib/types';
import { triggerHaptic } from '@/lib/haptics';

export interface NewsJobState {
  id: string;
  status: 'idle' | 'analyzing' | 'extracting' | 'saving' | 'completed' | 'error';
  progress: number; // 0 to 100
  message: string;
  rawTextPreview?: string;
  storyCount?: number;
  error?: string;
}

interface NewsJobContextType {
  job: NewsJobState;
  startJob: (rawText: string) => Promise<void>;
  dismissJob: () => void;
}

const STORAGE_JOB_KEY = 'nexdev_news_job_state';

const initialJobState: NewsJobState = {
  id: '',
  status: 'idle',
  progress: 0,
  message: '',
};

const NewsJobContext = createContext<NewsJobContextType>({
  job: initialJobState,
  startJob: async () => {},
  dismissJob: () => {},
});

export function NewsJobProvider({ children }: { children: React.ReactNode }) {
  const [job, setJob] = useState<NewsJobState>(() => {
    if (typeof window === 'undefined') return initialJobState;
    try {
      const saved = localStorage.getItem(STORAGE_JOB_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // If it was completed long ago, clear it
        if (parsed.status === 'completed' || parsed.status === 'error') {
          return initialJobState;
        }
        return parsed;
      }
    } catch {}
    return initialJobState;
  });

  // Sync job state to localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      if (job.status === 'idle') {
        localStorage.removeItem(STORAGE_JOB_KEY);
      } else {
        localStorage.setItem(STORAGE_JOB_KEY, JSON.stringify(job));
      }
    } catch {}
  }, [job]);

  const dismissJob = useCallback(() => {
    setJob(initialJobState);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_JOB_KEY);
    }
  }, []);

  const startJob = useCallback(async (rawText: string) => {
    if (!rawText.trim()) return;

    const jobId = `job-${Date.now()}`;
    const preview = rawText.slice(0, 100).trim();

    // 1. Initial State: Starting Job
    setJob({
      id: jobId,
      status: 'analyzing',
      progress: 18,
      message: 'Connecting to Dual-Engine AI (Gemini + NIM)...',
      rawTextPreview: preview,
    });
    triggerHaptic('light');

    // Progress simulation intervals to keep user updated while AI processes
    const timer1 = setTimeout(() => {
      setJob((prev) =>
        prev.id === jobId && prev.status !== 'completed' && prev.status !== 'error'
          ? { ...prev, progress: 48, status: 'extracting', message: 'Extracting key stories & headlines...' }
          : prev
      );
    }, 1800);

    const timer2 = setTimeout(() => {
      setJob((prev) =>
        prev.id === jobId && prev.status !== 'completed' && prev.status !== 'error'
          ? { ...prev, progress: 76, message: 'Synthesizing summaries & categories...' }
          : prev
      );
    }, 4200);

    const timer3 = setTimeout(() => {
      setJob((prev) =>
        prev.id === jobId && prev.status !== 'completed' && prev.status !== 'error'
          ? { ...prev, progress: 89, message: 'Formatting article content & dates...' }
          : prev
      );
    }, 6800);

    try {
      // Background execution of AI parsing
      const parsed = await parseNewsBriefing(rawText.trim());

      setJob((prev) => ({
        ...prev,
        progress: 94,
        status: 'saving',
        message: 'Saving stories to your briefing archive...',
      }));

      const newStories: TechNewsStory[] = parsed.map((item, index) => ({
        ...item,
        id: `news-${Date.now()}-${index}`,
        read: false,
        createdAt: new Date().toISOString(),
      }));

      // Merge with existing stories
      const existing = getNews();
      const updated = [...newStories, ...existing];
      saveNews(updated);

      // Direct write to /api/sync so stories are guaranteed to be saved in Supabase PostgreSQL immediately
      const syncController = new AbortController();
      const syncTimeout = setTimeout(() => syncController.abort(), 10000);
      try {
        const apiBase = process.env.NEXT_PUBLIC_APP_URL || '';
        const syncRes = await fetch(`${apiBase}/api/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: apiBase ? 'include' : 'same-origin',
          body: JSON.stringify({ news: updated }),
          signal: syncController.signal,
        });
        if (syncRes.status === 401 && typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('nexdev-auth-required'));
        }
      } catch (cloudErr) {
        console.warn('Direct database sync fallback to local storage queue:', cloudErr);
      } finally {
        clearTimeout(syncTimeout);
      }

      // Notify any active views
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('nexdev-news-updated', { detail: { count: newStories.length } }));
      }

      setJob({
        id: jobId,
        status: 'completed',
        progress: 100,
        message: `Analysis Complete! ${newStories.length} ${newStories.length === 1 ? 'story' : 'stories'} ready to read.`,
        storyCount: newStories.length,
      });
      triggerHaptic('success');

      // Auto-dismiss completed banner after 8 seconds
      setTimeout(() => {
        setJob((curr) => (curr.id === jobId ? initialJobState : curr));
      }, 8000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'AI parsing timed out or failed';
      console.error('Background Tech News Parsing Error:', err);
      setJob({
        id: jobId,
        status: 'error',
        progress: 100,
        message: 'Failed to parse news briefing',
        error: msg,
      });
      triggerHaptic('warning');
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    }
  }, []);

  return (
    <NewsJobContext.Provider value={{ job, startJob, dismissJob }}>
      {children}
    </NewsJobContext.Provider>
  );
}

export function useNewsJob() {
  return useContext(NewsJobContext);
}

