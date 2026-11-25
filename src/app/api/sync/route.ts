import { NextResponse } from 'next/server';
import { query, withTransaction, isDbConfigured, initDatabaseTables } from '@/lib/db';
import { Habit, Goal, JournalEntry, Challenge, TechNewsStory, ScreenTimeEntry, CareerProfile } from '@/lib/types';
import { AcademicProfile } from '@/lib/academicTypes';
import { requireApiAuth, checkRateLimit } from '@/lib/apiAuth';
import { validateSyncPayload } from '@/lib/syncValidation';

// Dynamic route handler so request headers (Auth/Origin/Cookies) and live DB queries work properly
export const dynamic = 'force-dynamic';

type TxQueryFn = <R = Record<string, unknown>>(text: string, params?: unknown[]) => Promise<R[]>;
type DbRow = Record<string, unknown>;

function parseJsonColumn<T>(value: unknown, fallback: T): T {
  if (typeof value === 'string') return JSON.parse(value) as T;
  return (value as T) || fallback;
}

function dedupeById<T extends { id: string }>(items: T[]): T[] {
  const byId = new Map<string, T>();
  for (const item of items) {
    byId.set(item.id, item);
  }
  return Array.from(byId.values());
}

async function syncTableBatch<T extends { id: string }>(
  txQuery: TxQueryFn,
  tableName: string,
  items: T[] | undefined,
  confirmWipe: boolean | undefined,
  upsertSql: string,
  buildParams: (uniqueItems: T[]) => unknown[]
): Promise<void> {
  if (!Array.isArray(items)) return;

  if (items.length === 0) {
    if (confirmWipe === true) {
      await txQuery(`DELETE FROM ${tableName}`);
    }
    return;
  }

  const uniqueItems = dedupeById(items);
  const ids = uniqueItems.map((item) => item.id);
  await txQuery(`DELETE FROM ${tableName} WHERE NOT (id = ANY($1::text[]))`, [ids]);
  await txQuery(upsertSql, buildParams(uniqueItems));
}

async function fetchAllFromDb() {
  await initDatabaseTables();

  const habitsRows = await query<DbRow>('SELECT * FROM nexdev_habits ORDER BY created_at ASC;');
  const goalsRows = await query<DbRow>('SELECT * FROM nexdev_goals ORDER BY created_at ASC;');
  const journalRows = await query<DbRow>('SELECT * FROM nexdev_journal ORDER BY date DESC;');
  const challengesRows = await query<DbRow>('SELECT * FROM nexdev_challenges ORDER BY created_at ASC;');
  const newsRows = await query<DbRow>('SELECT * FROM nexdev_news ORDER BY created_at DESC;');
  const screentimeRows = await query<DbRow>('SELECT * FROM nexdev_screentime ORDER BY date DESC;');
  const metaRows = await query<DbRow>("SELECT * FROM nexdev_meta WHERE key = 'global_sync';");
  const careerRows = await query<DbRow>("SELECT data FROM nexdev_career WHERE id = 'career_profile';");
  const academicRows = await query<DbRow>("SELECT data FROM nexdev_academics WHERE id = 'academic_profile';");

  const habits: Habit[] = habitsRows.map((row) => ({
    id: row.id as string,
    name: row.name as string,
    emoji: row.emoji as string,
    category: row.category as Habit['category'],
    frequency: row.frequency as Habit['frequency'],
    color: row.color as string,
    challengeMode: row.challenge_mode as Habit['challengeMode'],
    challengeStartDate: row.challenge_start_date as string | undefined,
    createdAt: row.created_at as string,
    completions: parseJsonColumn<Record<string, boolean>>(row.completions, {}),
  }));

  const goals: Goal[] = goalsRows.map((row) => ({
    id: row.id as string,
    title: row.title as string,
    description: (row.description as string) || '',
    category: row.category as Goal['category'],
    targetDate: row.target_date as string,
    progress: (row.progress as number) || 0,
    status: (row.status as Goal['status']) || 'in-progress',
    color: row.color as string,
    createdAt: row.created_at as string,
    milestones: parseJsonColumn<Goal['milestones']>(row.milestones, []),
  }));

  const journal: JournalEntry[] = journalRows.map((row) => ({
    id: row.id as string,
    date: row.date as string,
    content: row.content as string,
    mood: row.mood as JournalEntry['mood'],
    gratitude: parseJsonColumn<string[]>(row.gratitude, []),
    tags: parseJsonColumn<string[]>(row.tags, []),
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }));

  const challenges: Challenge[] = challengesRows.map((row) => ({
    id: row.id as string,
    title: row.title as string,
    description: (row.description as string) || '',
    category: row.category as Challenge['category'],
    durationDays: row.duration_days as number,
    currentDay: row.current_day as number,
    status: row.status as Challenge['status'],
    color: row.color as string,
    emoji: row.emoji as string,
    targetHabitId: row.target_habit_id as string | undefined,
    startDate: row.start_date as string,
    checkins: parseJsonColumn<Record<string, boolean>>(row.checkins, {}),
    createdAt: row.created_at as string,
  }));

  const news: TechNewsStory[] = newsRows.map((row) => ({
    id: row.id as string,
    title: row.title as string,
    category: row.category as string,
    summary: row.summary as string,
    fullContent: row.full_content as string,
    sourceUrl: (row.source_url as string) || undefined,
    read: Boolean(row.read),
    date: row.date as string,
    deepDive: (row.deep_dive as string) || undefined,
    createdAt: row.created_at as string,
  }));

  const screentime: ScreenTimeEntry[] = screentimeRows.map((row) => ({
    id: row.id as string,
    date: row.date as string,
    apps: parseJsonColumn<ScreenTimeEntry['apps']>(row.apps, []),
    totalMinutes: (row.total_minutes as number) || 0,
    createdAt: row.created_at as string,
  }));

  const career: CareerProfile | null = careerRows.length > 0
    ? parseJsonColumn<CareerProfile | null>(careerRows[0].data, null)
    : null;

  const academics: AcademicProfile | null = academicRows.length > 0
    ? parseJsonColumn<AcademicProfile | null>(academicRows[0].data, null)
    : null;

  return {
    configured: true,
    habits,
    goals,
    journal,
    challenges,
    news,
    screentime,
    career,
    academics,
    meta: metaRows.length > 0 ? metaRows[0].value : null,
  };
}

export async function GET(req: Request) {
  const authError = requireApiAuth(req);
  if (authError) return authError;

  const rateError = checkRateLimit(req, 'sync-get', 60, 60_000);
  if (rateError) return rateError;

  if (!isDbConfigured()) {
    return NextResponse.json({
      configured: false,
      message: 'Database not connected in Vercel. Running on local persistence.',
      habits: [],
      goals: [],
      journal: [],
      challenges: [],
      news: [],
      screentime: [],
    });
  }

  try {
    const data = await fetchAllFromDb();
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'CDN-Cache-Control': 'no-store',
        'Vercel-CDN-Cache-Control': 'no-store',
      },
    });
  } catch (err: unknown) {
    console.error('API /api/sync GET error:', err);
    return NextResponse.json(
      {
        configured: true,
        error: 'Database query failed',
        habits: [],
        goals: [],
        journal: [],
        challenges: [],
        news: [],
        screentime: [],
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const authError = requireApiAuth(req);
  if (authError) return authError;

  const rateError = checkRateLimit(req, 'sync-post', 60, 60_000);
  if (rateError) return rateError;

  if (!isDbConfigured()) {
    return NextResponse.json({
      configured: false,
      message: 'Database not connected in Vercel. Saved in local persistence.',
    });
  }

  try {
    let rawBody: unknown;
    try {
      rawBody = await req.json();
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid JSON payload' }, { status: 400 });
    }

    const validation = validateSyncPayload(rawBody);
    if (!validation.ok) {
      return NextResponse.json({ success: false, error: validation.error }, { status: 400 });
    }

    const { pull, confirmWipe, habits, goals, journal, challenges, news, screentime, career, academics } =
      validation.data;

    // If client requested a real-time fresh pull, execute dynamic query and return
    if (pull) {
      const data = await fetchAllFromDb();
      return NextResponse.json(data, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      });
    }

    await initDatabaseTables();

    await withTransaction(async (txQuery) => {
      // 1. HABITS (Synchronize batch upserts and deletes)
      await syncTableBatch<Habit>(
        txQuery,
        'nexdev_habits',
        habits,
        confirmWipe,
        `
          INSERT INTO nexdev_habits (
            id, name, emoji, category, frequency, color, challenge_mode, challenge_start_date, created_at, completions
          )
          SELECT
            u.id, u.name, u.emoji, u.category, u.frequency, u.color,
            u.challenge_mode, u.challenge_start_date, u.created_at, u.completions
          FROM unnest(
            $1::text[], $2::text[], $3::text[], $4::text[], $5::text[],
            $6::text[], $7::text[], $8::text[], $9::text[], $10::jsonb[]
          ) AS u(
            id, name, emoji, category, frequency, color, challenge_mode, challenge_start_date, created_at, completions
          )
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            emoji = EXCLUDED.emoji,
            category = EXCLUDED.category,
            frequency = EXCLUDED.frequency,
            color = EXCLUDED.color,
            challenge_mode = EXCLUDED.challenge_mode,
            challenge_start_date = EXCLUDED.challenge_start_date,
            completions = EXCLUDED.completions;
        `,
        (unique) => [
          unique.map((h) => h.id),
          unique.map((h) => h.name),
          unique.map((h) => h.emoji),
          unique.map((h) => h.category),
          unique.map((h) => h.frequency),
          unique.map((h) => h.color),
          unique.map((h) => h.challengeMode || null),
          unique.map((h) => h.challengeStartDate || null),
          unique.map((h) => h.createdAt),
          unique.map((h) => JSON.stringify(h.completions ?? {})),
        ]
      );

      // 2. GOALS (Synchronize batch upserts and deletes)
      await syncTableBatch<Goal>(
        txQuery,
        'nexdev_goals',
        goals,
        confirmWipe,
        `
          INSERT INTO nexdev_goals (
            id, title, description, category, target_date, progress, status, color, created_at, milestones
          )
          SELECT
            u.id, u.title, u.description, u.category, u.target_date,
            u.progress, u.status, u.color, u.created_at, u.milestones
          FROM unnest(
            $1::text[], $2::text[], $3::text[], $4::text[], $5::text[],
            $6::int[], $7::text[], $8::text[], $9::text[], $10::jsonb[]
          ) AS u(
            id, title, description, category, target_date, progress, status, color, created_at, milestones
          )
          ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            description = EXCLUDED.description,
            category = EXCLUDED.category,
            target_date = EXCLUDED.target_date,
            progress = EXCLUDED.progress,
            status = EXCLUDED.status,
            color = EXCLUDED.color,
            milestones = EXCLUDED.milestones;
        `,
        (unique) => [
          unique.map((g) => g.id),
          unique.map((g) => g.title),
          unique.map((g) => g.description || ''),
          unique.map((g) => g.category),
          unique.map((g) => g.targetDate),
          unique.map((g) => g.progress),
          unique.map((g) => g.status),
          unique.map((g) => g.color),
          unique.map((g) => g.createdAt),
          unique.map((g) => JSON.stringify(g.milestones ?? [])),
        ]
      );

      // 3. JOURNAL (Synchronize batch upserts and deletes)
      await syncTableBatch<JournalEntry>(
        txQuery,
        'nexdev_journal',
        journal,
        confirmWipe,
        `
          INSERT INTO nexdev_journal (
            id, date, content, mood, gratitude, tags, created_at, updated_at
          )
          SELECT
            u.id, u.date, u.content, u.mood, u.gratitude, u.tags, u.created_at, u.updated_at
          FROM unnest(
            $1::text[], $2::text[], $3::text[], $4::text[],
            $5::jsonb[], $6::jsonb[], $7::text[], $8::text[]
          ) AS u(
            id, date, content, mood, gratitude, tags, created_at, updated_at
          )
          ON CONFLICT (id) DO UPDATE SET
            date = EXCLUDED.date,
            content = EXCLUDED.content,
            mood = EXCLUDED.mood,
            gratitude = EXCLUDED.gratitude,
            tags = EXCLUDED.tags,
            updated_at = EXCLUDED.updated_at;
        `,
        (unique) => [
          unique.map((j) => j.id),
          unique.map((j) => j.date),
          unique.map((j) => j.content),
          unique.map((j) => j.mood),
          unique.map((j) => JSON.stringify(j.gratitude ?? [])),
          unique.map((j) => JSON.stringify(j.tags ?? [])),
          unique.map((j) => j.createdAt),
          unique.map((j) => j.updatedAt),
        ]
      );

      // 4. CHALLENGES (Synchronize batch upserts and deletes)
      await syncTableBatch<Challenge>(
        txQuery,
        'nexdev_challenges',
        challenges,
        confirmWipe,
        `
          INSERT INTO nexdev_challenges (
            id, title, description, category, duration_days, current_day, status, color, emoji, target_habit_id, start_date, checkins, created_at
          )
          SELECT
            u.id, u.title, u.description, u.category, u.duration_days, u.current_day,
            u.status, u.color, u.emoji, u.target_habit_id, u.start_date, u.checkins, u.created_at
          FROM unnest(
            $1::text[], $2::text[], $3::text[], $4::text[], $5::int[], $6::int[],
            $7::text[], $8::text[], $9::text[], $10::text[], $11::text[], $12::jsonb[], $13::text[]
          ) AS u(
            id, title, description, category, duration_days, current_day, status, color, emoji, target_habit_id, start_date, checkins, created_at
          )
          ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            description = EXCLUDED.description,
            category = EXCLUDED.category,
            duration_days = EXCLUDED.duration_days,
            current_day = EXCLUDED.current_day,
            status = EXCLUDED.status,
            color = EXCLUDED.color,
            emoji = EXCLUDED.emoji,
            target_habit_id = EXCLUDED.target_habit_id,
            start_date = EXCLUDED.start_date,
            checkins = EXCLUDED.checkins;
        `,
        (unique) => [
          unique.map((c) => c.id),
          unique.map((c) => c.title),
          unique.map((c) => c.description || ''),
          unique.map((c) => c.category),
          unique.map((c) => c.durationDays),
          unique.map((c) => c.currentDay),
          unique.map((c) => c.status),
          unique.map((c) => c.color),
          unique.map((c) => c.emoji),
          unique.map((c) => c.targetHabitId || null),
          unique.map((c) => c.startDate),
          unique.map((c) => JSON.stringify(c.checkins ?? {})),
          unique.map((c) => c.createdAt),
        ]
      );

      // 5. TECH NEWS STORIES (Synchronize batch upserts and deletes)
      await syncTableBatch<TechNewsStory>(
        txQuery,
        'nexdev_news',
        news,
        confirmWipe,
        `
          INSERT INTO nexdev_news (
            id, title, category, summary, full_content, source_url, read, date, deep_dive, created_at
          )
          SELECT
            u.id, u.title, u.category, u.summary, u.full_content,
            u.source_url, u.read, u.date, u.deep_dive, u.created_at
          FROM unnest(
            $1::text[], $2::text[], $3::text[], $4::text[], $5::text[],
            $6::text[], $7::boolean[], $8::text[], $9::text[], $10::text[]
          ) AS u(
            id, title, category, summary, full_content, source_url, read, date, deep_dive, created_at
          )
          ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            category = EXCLUDED.category,
            summary = EXCLUDED.summary,
            full_content = EXCLUDED.full_content,
            source_url = EXCLUDED.source_url,
            read = EXCLUDED.read,
            date = EXCLUDED.date,
            deep_dive = EXCLUDED.deep_dive;
        `,
        (unique) => [
          unique.map((n) => n.id),
          unique.map((n) => n.title),
          unique.map((n) => n.category),
          unique.map((n) => n.summary),
          unique.map((n) => n.fullContent),
          unique.map((n) => n.sourceUrl || null),
          unique.map((n) => n.read),
          unique.map((n) => n.date),
          unique.map((n) => n.deepDive || null),
          unique.map((n) => n.createdAt),
        ]
      );

      // 6. SCREEN TIME (Synchronize batch upserts and deletes)
      await syncTableBatch<ScreenTimeEntry>(
        txQuery,
        'nexdev_screentime',
        screentime,
        confirmWipe,
        `
          INSERT INTO nexdev_screentime (
            id, date, apps, total_minutes, created_at
          )
          SELECT
            u.id, u.date, u.apps, u.total_minutes, u.created_at
          FROM unnest(
            $1::text[], $2::text[], $3::jsonb[], $4::int[], $5::text[]
          ) AS u(
            id, date, apps, total_minutes, created_at
          )
          ON CONFLICT (id) DO UPDATE SET
            date = EXCLUDED.date,
            apps = EXCLUDED.apps,
            total_minutes = EXCLUDED.total_minutes;
        `,
        (unique) => [
          unique.map((s) => s.id),
          unique.map((s) => s.date),
          unique.map((s) => JSON.stringify(s.apps ?? [])),
          unique.map((s) => s.totalMinutes),
          unique.map((s) => s.createdAt),
        ]
      );

      // 7. CAREER PROFILE (single-row JSONB upsert)
      if (career !== undefined) {
        await txQuery(
          `
          INSERT INTO nexdev_career (id, data, updated_at)
          VALUES ('career_profile', $1::jsonb, NOW())
          ON CONFLICT (id) DO UPDATE SET
            data = EXCLUDED.data,
            updated_at = NOW();
          `,
          [JSON.stringify(career)]
        );
      }

      // 8. ACADEMIC PROFILE (single-row JSONB upsert)
      if (academics !== undefined) {
        await txQuery(
          `
          INSERT INTO nexdev_academics (id, data, updated_at)
          VALUES ('academic_profile', $1::jsonb, NOW())
          ON CONFLICT (id) DO UPDATE SET
            data = EXCLUDED.data,
            updated_at = NOW();
          `,
          [JSON.stringify(academics)]
        );
      }

      // 9. Update Meta & Health Record
      const syncedAt = new Date().toISOString();
      const metaPayload = {
        last_synced: syncedAt,
        status: 'healthy',
        counts: {
          habits: habits ? habits.length : null,
          goals: goals ? goals.length : null,
          journal: journal ? journal.length : null,
          challenges: challenges ? challenges.length : null,
          news: news ? news.length : null,
          screentime: screentime ? screentime.length : null,
          career: career ? 1 : null,
          academics: academics ? 1 : null,
        },
      };

      await txQuery(
        `
        INSERT INTO nexdev_meta (key, value, updated_at)
        VALUES ('global_sync', $1::jsonb, NOW())
        ON CONFLICT (key) DO UPDATE SET
          value = EXCLUDED.value,
          updated_at = NOW();
      `,
        [JSON.stringify(metaPayload)]
      );
    });

    return NextResponse.json({
      success: true,
      message: 'Synchronized with Supabase PostgreSQL successfully!',
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    console.error('API /api/sync POST error:', err);
    return NextResponse.json(
      {
        success: false,
        error: 'Database synchronization failed',
      },
      { status: 500 }
    );
  }
}
