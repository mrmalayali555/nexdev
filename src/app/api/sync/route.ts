import { NextResponse } from 'next/server';
import { getDb, isDbConfigured, initDatabaseTables } from '@/lib/db';
import { Habit, Goal, JournalEntry } from '@/lib/types';

// Route handler for database sync
export const dynamic = 'force-static';

export async function GET() {
  if (!isDbConfigured()) {
    return NextResponse.json({
      configured: false,
      message: 'Database not connected in Vercel. Running on local persistence.',
      habits: [],
      goals: [],
      journal: [],
    });
  }

  try {
    const sql = getDb();
    await initDatabaseTables();

    const habitsRows = (await sql`SELECT * FROM nexdev_habits ORDER BY created_at ASC;`) as any[];
    const goalsRows = (await sql`SELECT * FROM nexdev_goals ORDER BY created_at ASC;`) as any[];
    const journalRows = (await sql`SELECT * FROM nexdev_journal ORDER BY date DESC;`) as any[];

    const habits: Habit[] = habitsRows.map((row) => ({
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

    const goals: Goal[] = goalsRows.map((row) => ({
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

    const journal: JournalEntry[] = journalRows.map((row) => ({
      id: row.id,
      date: row.date,
      content: row.content,
      mood: row.mood,
      gratitude: typeof row.gratitude === 'string' ? JSON.parse(row.gratitude) : row.gratitude || [],
      tags: typeof row.tags === 'string' ? JSON.parse(row.tags) : row.tags || [],
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return NextResponse.json({
      configured: true,
      habits,
      goals,
      journal,
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
    const { habits, goals, journal } = (await req.json()) as {
      habits?: Habit[];
      goals?: Goal[];
      journal?: JournalEntry[];
    };

    const sql = getDb();
    await initDatabaseTables();

    // Sync Habits
    if (habits && habits.length > 0) {
      for (const h of habits) {
        await sql`
          INSERT INTO nexdev_habits (
            id, name, emoji, category, frequency, color, challenge_mode, challenge_start_date, created_at, completions
          ) VALUES (
            ${h.id}, ${h.name}, ${h.emoji}, ${h.category}, ${h.frequency}, ${h.color},
            ${h.challengeMode || null}, ${h.challengeStartDate || null}, ${h.createdAt}, ${JSON.stringify(h.completions)}
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
        `;
      }
    }

    // Sync Goals
    if (goals && goals.length > 0) {
      for (const g of goals) {
        await sql`
          INSERT INTO nexdev_goals (
            id, title, description, category, target_date, progress, status, color, created_at, milestones
          ) VALUES (
            ${g.id}, ${g.title}, ${g.description || ''}, ${g.category}, ${g.targetDate},
            ${g.progress}, ${g.status}, ${g.color}, ${g.createdAt}, ${JSON.stringify(g.milestones)}
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
        `;
      }
    }

    // Sync Journal
    if (journal && journal.length > 0) {
      for (const j of journal) {
        await sql`
          INSERT INTO nexdev_journal (
            id, date, content, mood, gratitude, tags, created_at, updated_at
          ) VALUES (
            ${j.id}, ${j.date}, ${j.content}, ${j.mood}, ${JSON.stringify(j.gratitude)},
            ${JSON.stringify(j.tags)}, ${j.createdAt}, ${j.updatedAt}
          )
          ON CONFLICT (id) DO UPDATE SET
            date = EXCLUDED.date,
            content = EXCLUDED.content,
            mood = EXCLUDED.mood,
            gratitude = EXCLUDED.gratitude,
            tags = EXCLUDED.tags,
            updated_at = EXCLUDED.updated_at;
        `;
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Synchronized with Vercel Postgres successfully!',
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
