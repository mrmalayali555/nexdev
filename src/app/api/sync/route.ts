import { NextResponse } from 'next/server';
import { query, isDbConfigured, initDatabaseTables } from '@/lib/db';
import { Habit, Goal, JournalEntry, Challenge, TechNewsStory } from '@/lib/types';
import { put } from '@vercel/blob';

// Static export compatible for Capacitor Android while POST provides real-time dynamic querying
export const dynamic = 'force-static';

async function fetchAllFromDb() {
  await initDatabaseTables();

  const habitsRows = await query('SELECT * FROM nexdev_habits ORDER BY created_at ASC;');
  const goalsRows = await query('SELECT * FROM nexdev_goals ORDER BY created_at ASC;');
  const journalRows = await query('SELECT * FROM nexdev_journal ORDER BY date DESC;');
  const challengesRows = await query('SELECT * FROM nexdev_challenges ORDER BY created_at ASC;');
  const newsRows = await query('SELECT * FROM nexdev_news ORDER BY created_at DESC;');
  const metaRows = await query("SELECT * FROM nexdev_meta WHERE key = 'global_sync';");

  const habits: Habit[] = habitsRows.map((row: any) => ({
    id: row.id,
    name: row.name,
    emoji: row.emoji,
    category: row.category,
    frequency: row.frequency,
    color: row.color,
    challengeMode: row.challenge_mode,
    challengeStartDate: row.challenge_start_date,
    createdAt: row.created_at,
    completions: typeof row.completions === 'string' ? JSON.parse(row.completions) : row.completions || {},
  }));

  const goals: Goal[] = goalsRows.map((row: any) => ({
    id: row.id,
    title: row.title,
    description: row.description || '',
    category: row.category,
    targetDate: row.target_date,
    progress: row.progress || 0,
    status: row.status || 'in-progress',
    color: row.color,
    createdAt: row.created_at,
    milestones: typeof row.milestones === 'string' ? JSON.parse(row.milestones) : row.milestones || [],
  }));

  const journal: JournalEntry[] = journalRows.map((row: any) => ({
    id: row.id,
    date: row.date,
    content: row.content,
    mood: row.mood,
    gratitude: typeof row.gratitude === 'string' ? JSON.parse(row.gratitude) : row.gratitude || [],
    tags: typeof row.tags === 'string' ? JSON.parse(row.tags) : row.tags || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));

  const challenges: Challenge[] = challengesRows.map((row: any) => ({
    id: row.id,
    title: row.title,
    description: row.description || '',
    category: row.category,
    durationDays: row.duration_days,
    currentDay: row.current_day,
    status: row.status,
    color: row.color,
    emoji: row.emoji,
    targetHabitId: row.target_habit_id,
    startDate: row.start_date,
    checkins: typeof row.checkins === 'string' ? JSON.parse(row.checkins) : row.checkins || {},
    createdAt: row.created_at,
  }));

  const news: TechNewsStory[] = newsRows.map((row: any) => ({
    id: row.id,
    title: row.title,
    category: row.category,
    summary: row.summary,
    fullContent: row.full_content,
    sourceUrl: row.source_url || undefined,
    read: Boolean(row.read),
    date: row.date,
    deepDive: row.deep_dive || undefined,
    createdAt: row.created_at,
  }));

  return {
    configured: true,
    habits,
    goals,
    journal,
    challenges,
    news,
    meta: metaRows.length > 0 ? metaRows[0].value : null,
  };
}

export async function GET() {
  if (!isDbConfigured()) {
    return NextResponse.json({
      configured: false,
      message: 'Database not connected in Vercel. Running on local persistence.',
      habits: [],
      goals: [],
      journal: [],
      challenges: [],
      news: [],
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
  } catch (err: any) {
    console.error('API /api/sync GET error:', err);
    return NextResponse.json(
      {
        configured: true,
        error: err?.message || 'Database query failed',
        habits: [],
        goals: [],
        journal: [],
        challenges: [],
        news: [],
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  if (!isDbConfigured()) {
    return NextResponse.json({
      configured: false,
      message: 'Database not connected in Vercel. Saved in local persistence.',
    });
  }

  try {
    const body = (await req.json().catch(() => ({}))) as {
      pull?: boolean;
      habits?: Habit[];
      goals?: Goal[];
      journal?: JournalEntry[];
      challenges?: Challenge[];
      news?: TechNewsStory[];
    };

    // If client requested a real-time fresh pull, execute dynamic query and return
    if (body.pull) {
      const data = await fetchAllFromDb();
      return NextResponse.json(data, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      });
    }

    const { habits, goals, journal, challenges, news } = body;

    await initDatabaseTables();

    // 1. HABITS (Synchronize upserts and deletes)
    if (Array.isArray(habits)) {
      if (habits.length > 0) {
        const ids = habits.map((h) => h.id);
        await query(`DELETE FROM nexdev_habits WHERE NOT (id = ANY($1::text[]))`, [ids]);
        for (const h of habits) {
          await query(
            `
            INSERT INTO nexdev_habits (
              id, name, emoji, category, frequency, color, challenge_mode, challenge_start_date, created_at, completions
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
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
            [
              h.id,
              h.name,
              h.emoji,
              h.category,
              h.frequency,
              h.color,
              h.challengeMode || null,
              h.challengeStartDate || null,
              h.createdAt,
              JSON.stringify(h.completions),
            ]
          );
        }
      } else {
        await query(`DELETE FROM nexdev_habits`);
      }
    }

    // 2. GOALS (Synchronize upserts and deletes)
    if (Array.isArray(goals)) {
      if (goals.length > 0) {
        const ids = goals.map((g) => g.id);
        await query(`DELETE FROM nexdev_goals WHERE NOT (id = ANY($1::text[]))`, [ids]);
        for (const g of goals) {
          await query(
            `
            INSERT INTO nexdev_goals (
              id, title, description, category, target_date, progress, status, color, created_at, milestones
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
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
            [
              g.id,
              g.title,
              g.description || '',
              g.category,
              g.targetDate,
              g.progress,
              g.status,
              g.color,
              g.createdAt,
              JSON.stringify(g.milestones),
            ]
          );
        }
      } else {
        await query(`DELETE FROM nexdev_goals`);
      }
    }

    // 3. JOURNAL (Synchronize upserts and deletes)
    if (Array.isArray(journal)) {
      if (journal.length > 0) {
        const ids = journal.map((j) => j.id);
        await query(`DELETE FROM nexdev_journal WHERE NOT (id = ANY($1::text[]))`, [ids]);
        for (const j of journal) {
          await query(
            `
            INSERT INTO nexdev_journal (
              id, date, content, mood, gratitude, tags, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            ON CONFLICT (id) DO UPDATE SET
              date = EXCLUDED.date,
              content = EXCLUDED.content,
              mood = EXCLUDED.mood,
              gratitude = EXCLUDED.gratitude,
              tags = EXCLUDED.tags,
              updated_at = EXCLUDED.updated_at;
          `,
            [
              j.id,
              j.date,
              j.content,
              j.mood,
              JSON.stringify(j.gratitude),
              JSON.stringify(j.tags),
              j.createdAt,
              j.updatedAt,
            ]
          );
        }
      } else {
        await query(`DELETE FROM nexdev_journal`);
      }
    }

    // 4. CHALLENGES (Synchronize upserts and deletes)
    if (Array.isArray(challenges)) {
      if (challenges.length > 0) {
        const ids = challenges.map((c) => c.id);
        await query(`DELETE FROM nexdev_challenges WHERE NOT (id = ANY($1::text[]))`, [ids]);
        for (const c of challenges) {
          await query(
            `
            INSERT INTO nexdev_challenges (
              id, title, description, category, duration_days, current_day, status, color, emoji, target_habit_id, start_date, checkins, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
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
            [
              c.id,
              c.title,
              c.description || '',
              c.category,
              c.durationDays,
              c.currentDay,
              c.status,
              c.color,
              c.emoji,
              c.targetHabitId || null,
              c.startDate,
              JSON.stringify(c.checkins),
              c.createdAt,
            ]
          );
        }
      } else {
        await query(`DELETE FROM nexdev_challenges`);
      }
    }

    // 5. TECH NEWS STORIES (Synchronize upserts and deletes)
    if (Array.isArray(news)) {
      if (news.length > 0) {
        const ids = news.map((n) => n.id);
        await query(`DELETE FROM nexdev_news WHERE NOT (id = ANY($1::text[]))`, [ids]);
        for (const n of news) {
          await query(
            `
            INSERT INTO nexdev_news (
              id, title, category, summary, full_content, source_url, read, date, deep_dive, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
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
            [
              n.id,
              n.title,
              n.category,
              n.summary,
              n.fullContent,
              n.sourceUrl || null,
              n.read,
              n.date,
              n.deepDive || null,
              n.createdAt,
            ]
          );
        }
      } else {
        await query(`DELETE FROM nexdev_news`);
      }
    }

    // 6. Update Meta & Health Record
    const metaPayload = {
      last_synced: new Date().toISOString(),
      status: 'healthy',
      counts: {
        habits: habits ? habits.length : null,
        goals: goals ? goals.length : null,
        journal: journal ? journal.length : null,
        challenges: challenges ? challenges.length : null,
        news: news ? news.length : null,
      },
    };

    await query(
      `
      INSERT INTO nexdev_meta (key, value, updated_at)
      VALUES ('global_sync', $1::jsonb, NOW())
      ON CONFLICT (key) DO UPDATE SET
        value = EXCLUDED.value,
        updated_at = NOW();
    `,
      [JSON.stringify(metaPayload)]
    );

    // 7. Optional Backup snapshot into Vercel Blob (if token configured)
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
    let blobUrl: string | null = null;
    if (blobToken) {
      try {
        const snapshotData = {
          habits: habits || [],
          goals: goals || [],
          journal: journal || [],
          challenges: challenges || [],
          news: news || [],
          timestamp: new Date().toISOString(),
        };
        const blobResult = await put(
          `nexdev-sync-snapshot-${Date.now()}.json`,
          JSON.stringify(snapshotData),
          {
            access: 'public',
            token: blobToken,
          }
        );
        blobUrl = blobResult.url;
      } catch (blobErr) {
        console.warn('Vercel Blob backup snapshot skipped:', blobErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Synchronized with Supabase PostgreSQL successfully!',
      timestamp: metaPayload.last_synced,
      blobBackupUrl: blobUrl,
    });
  } catch (err: any) {
    console.error('API /api/sync POST error:', err);
    return NextResponse.json(
      {
        success: false,
        error: err?.message || 'Database synchronization failed',
      },
      { status: 500 }
    );
  }
}
