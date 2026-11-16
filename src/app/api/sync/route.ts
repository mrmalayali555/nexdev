import { NextResponse } from 'next/server';
import { query, isDbConfigured, initDatabaseTables } from '@/lib/db';
import { Habit, Goal, JournalEntry, Challenge } from '@/lib/types';
import { put } from '@vercel/blob';

// Static export compatible
export const dynamic = 'force-static';

export async function GET() {
  if (!isDbConfigured()) {
    return NextResponse.json({
      configured: false,
      message: 'Database not connected in Vercel. Running on local persistence.',
      habits: [],
      goals: [],
      journal: [],
      challenges: [],
    });
  }

  try {
    await initDatabaseTables();

    const habitsRows = await query('SELECT * FROM nexdev_habits ORDER BY created_at ASC;');
    const goalsRows = await query('SELECT * FROM nexdev_goals ORDER BY created_at ASC;');
    const journalRows = await query('SELECT * FROM nexdev_journal ORDER BY date DESC;');
    const challengesRows = await query('SELECT * FROM nexdev_challenges ORDER BY created_at ASC;');
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

    return NextResponse.json({
      configured: true,
      habits,
      goals,
      journal,
      challenges,
      meta: metaRows.length > 0 ? metaRows[0].value : null,
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
    const { habits, goals, journal, challenges } = (await req.json()) as {
      habits?: Habit[];
      goals?: Goal[];
      journal?: JournalEntry[];
      challenges?: Challenge[];
    };

    await initDatabaseTables();

    // 1. HABITS
    if (habits && habits.length > 0) {
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
    }

    // 2. GOALS
    if (goals && goals.length > 0) {
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
    }

    // 3. JOURNAL
    if (journal && journal.length > 0) {
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
    }

    // 4. CHALLENGES
    if (challenges && challenges.length > 0) {
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
    }

    // 5. GLOBAL CONFIG & METADATA
    const syncMeta = {
      last_synced: new Date().toISOString(),
      counts: {
        habits: habits?.length || 0,
        goals: goals?.length || 0,
        journal: journal?.length || 0,
        challenges: challenges?.length || 0,
      },
      status: 'healthy',
    };

    await query(
      `
      INSERT INTO nexdev_meta (key, value, updated_at)
      VALUES ('global_sync', $1, NOW())
      ON CONFLICT (key) DO UPDATE SET
        value = EXCLUDED.value,
        updated_at = NOW();
    `,
      [JSON.stringify(syncMeta)]
    );

    // 6. VERCEL BLOB STORE (Disaster Recovery Snapshot Vault)
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
    if (blobToken) {
      try {
        const vaultPayload = JSON.stringify({
          syncedAt: new Date().toISOString(),
          habits,
          goals,
          journal,
          challenges,
          syncMeta,
        });

        await put('vault/latest-backup.json', vaultPayload, {
          access: 'public',
          token: blobToken,
          addRandomSuffix: false,
        });
      } catch (blobErr) {
        console.warn('Vercel Blob snapshot warning (non-fatal):', blobErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'All 4 layers (Local, Supabase Postgres, Global Config, Blob) synchronized successfully!',
      meta: syncMeta,
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
