import { get, put } from '@vercel/blob';
import type {
  Habit,
  Goal,
  JournalEntry,
  Challenge,
  TechNewsStory,
  ScreenTimeEntry,
  CareerProfile,
} from './types';
import type { AcademicProfile } from './academicTypes';

export const CLOUD_BACKUP_PATH = 'nexdev-cloud-backup.json';

export interface CloudSyncSnapshot {
  habits: Habit[];
  goals: Goal[];
  journal: JournalEntry[];
  challenges: Challenge[];
  news: TechNewsStory[];
  screentime: ScreenTimeEntry[];
  career: CareerProfile | null;
  academics: AcademicProfile | null;
  meta: Record<string, unknown> | null;
}

/**
 * Checks whether Vercel Blob credentials (RW token or Vercel OIDC + storeId) exist.
 */
export function isBlobConfigured(): boolean {
  return Boolean(
    process.env.BLOB_READ_WRITE_TOKEN ||
      (process.env.BLOB_STORE_ID && process.env.VERCEL_OIDC_TOKEN)
  );
}

/**
 * Writes the unified cloud sync snapshot to Vercel Blob.
 * Tries private access first and falls back to public if the store is configured as public.
 */
export async function saveSnapshotToBlob(snapshot: CloudSyncSnapshot): Promise<string | null> {
  if (!isBlobConfigured()) return null;

  const body = JSON.stringify(snapshot);
  try {
    const res = await put(CLOUD_BACKUP_PATH, body, {
      access: 'private',
      allowOverwrite: true,
      contentType: 'application/json',
    });
    return res.url;
  } catch (privErr: unknown) {
    const msg = privErr instanceof Error ? privErr.message : String(privErr);
    if (/public/i.test(msg)) {
      const res = await put(CLOUD_BACKUP_PATH, body, {
        access: 'public',
        allowOverwrite: true,
        contentType: 'application/json',
      });
      return res.url;
    }
    throw privErr;
  }
}

/**
 * Reads the cloud sync snapshot from Vercel Blob, returning null if none exists yet.
 */
export async function readSnapshotFromBlob(): Promise<CloudSyncSnapshot | null> {
  if (!isBlobConfigured()) return null;

  for (const access of ['private', 'public'] as const) {
    try {
      const result = await get(CLOUD_BACKUP_PATH, {
        access,
        useCache: false,
      });
      if (!result || result.statusCode !== 200 || !result.stream) continue;

      const text = await new Response(result.stream).text();
      const parsed = JSON.parse(text) as Partial<CloudSyncSnapshot>;
      return {
        habits: Array.isArray(parsed.habits) ? parsed.habits : [],
        goals: Array.isArray(parsed.goals) ? parsed.goals : [],
        journal: Array.isArray(parsed.journal) ? parsed.journal : [],
        challenges: Array.isArray(parsed.challenges) ? parsed.challenges : [],
        news: Array.isArray(parsed.news) ? parsed.news : [],
        screentime: Array.isArray(parsed.screentime) ? parsed.screentime : [],
        career: parsed.career ?? null,
        academics: parsed.academics ?? null,
        meta: parsed.meta ?? null,
      };
    } catch {
      continue;
    }
  }

  return null;
}
