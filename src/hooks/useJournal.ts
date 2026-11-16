'use client';

import { useState, useEffect, useCallback } from 'react';
import { JournalEntry, Mood } from '@/lib/types';
import { getJournalEntries, saveJournalEntries, hydrateFromCloud } from '@/lib/storage';
import { generateId, getToday } from '@/lib/utils';
import { getSeedJournal } from '@/lib/seed';

export function useJournal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = getJournalEntries();
    setEntries(stored);
    setLoaded(true);

    // Hydrate directly from Supabase PostgreSQL
    hydrateFromCloud().then((cloudData) => {
      if (cloudData && Array.isArray(cloudData.journal)) {
        setEntries(cloudData.journal);
      }
    });
  }, []);

  const persist = useCallback((updated: JournalEntry[]) => {
    setEntries(updated);
    saveJournalEntries(updated);
  }, []);

  const addEntry = useCallback(
    (data: {
      content: string;
      mood: Mood;
      gratitude: string[];
      tags: string[];
      date?: string;
    }) => {
      const now = new Date().toISOString();
      const newEntry: JournalEntry = {
        id: generateId(),
        date: data.date || getToday(),
        content: data.content,
        mood: data.mood,
        gratitude: data.gratitude,
        tags: data.tags,
        createdAt: now,
        updatedAt: now,
      };
      persist([newEntry, ...entries]);
    },
    [entries, persist]
  );

  const updateEntry = useCallback(
    (id: string, updates: Partial<JournalEntry>) => {
      persist(
        entries.map((e) =>
          e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e
        )
      );
    },
    [entries, persist]
  );

  const deleteEntry = useCallback(
    (id: string) => {
      persist(entries.filter((e) => e.id !== id));
    },
    [entries, persist]
  );

  const getEntryByDate = useCallback(
    (date: string) => entries.find((e) => e.date === date),
    [entries]
  );

  const searchEntries = useCallback(
    (query: string) => {
      const q = query.toLowerCase();
      return entries.filter(
        (e) =>
          e.content.toLowerCase().includes(q) ||
          e.tags.some((t) => t.toLowerCase().includes(q)) ||
          e.gratitude.some((g) => g.toLowerCase().includes(q))
      );
    },
    [entries]
  );

  const loadTemplates = useCallback(() => {
    const seed = getSeedJournal();
    persist(seed);
  }, [persist]);

  return { entries, loaded, addEntry, updateEntry, deleteEntry, getEntryByDate, searchEntries, loadTemplates };
}
