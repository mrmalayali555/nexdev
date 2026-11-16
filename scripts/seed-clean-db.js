const { Pool } = require('pg');

const rawUrl = process.env.POSTGRES_URL || 'postgres://postgres.abhzzgpnjnnibmrgscea:mrDdScB1ekzbv0PK@aws-1-us-east-1.pooler.supabase.com:6543/postgres';
const cleanUrl = rawUrl.split('?')[0];

const pool = new Pool({
  connectionString: cleanUrl,
  ssl: { rejectUnauthorized: false }
});

async function seedClean() {
  const client = await pool.connect();
  console.log('Seeding pristine data directly to Supabase...');

  // 1. Pristine Habits
  const habits = [
    {
      id: 'habit-meditation',
      name: 'Morning Mindfulness & Breathwork',
      emoji: '🧘',
      category: 'Mindfulness',
      frequency: 'daily',
      color: '#8b5cf6',
      challenge_mode: '21-day',
      challenge_start_date: '2026-11-01',
      created_at: '2026-11-01T06:00:00.000Z',
      completions: JSON.stringify({
        '2026-11-12': true,
        '2026-11-13': true,
        '2026-11-14': true,
        '2026-11-15': true,
        '2026-11-16': true,
      })
    },
    {
      id: 'habit-deepwork',
      name: '2-Hour Uninterrupted Deep Work',
      emoji: '⚡',
      category: 'Productivity',
      frequency: 'daily',
      color: '#6366f1',
      challenge_mode: '66-day',
      challenge_start_date: '2026-11-01',
      created_at: '2026-11-01T08:00:00.000Z',
      completions: JSON.stringify({
        '2026-11-13': true,
        '2026-11-14': true,
        '2026-11-15': true,
        '2026-11-16': true,
      })
    },
    {
      id: 'habit-fitness',
      name: 'Physical Training & Mobility',
      emoji: '💪',
      category: 'Fitness',
      frequency: 'daily',
      color: '#ef4444',
      challenge_mode: '21-day',
      challenge_start_date: '2026-11-05',
      created_at: '2026-11-05T07:00:00.000Z',
      completions: JSON.stringify({
        '2026-11-14': true,
        '2026-11-15': true,
        '2026-11-16': true,
      })
    },
    {
      id: 'habit-reading',
      name: 'Read 20 Pages Nonfiction',
      emoji: '📚',
      category: 'Learning',
      frequency: 'daily',
      color: '#f59e0b',
      challenge_mode: null,
      challenge_start_date: null,
      created_at: '2026-11-08T20:00:00.000Z',
      completions: JSON.stringify({
        '2026-11-15': true,
        '2026-11-16': true,
      })
    }
  ];

  for (const h of habits) {
    await client.query(`
      INSERT INTO nexdev_habits (id, name, emoji, category, frequency, color, challenge_mode, challenge_start_date, created_at, completions)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        emoji = EXCLUDED.emoji,
        category = EXCLUDED.category,
        frequency = EXCLUDED.frequency,
        color = EXCLUDED.color,
        completions = EXCLUDED.completions;
    `, [h.id, h.name, h.emoji, h.category, h.frequency, h.color, h.challenge_mode, h.challenge_start_date, h.created_at, h.completions]);
  }
  console.log('✅ Seeded habits in Supabase');

  // 2. Pristine Goals with Milestones
  const goals = [
    {
      id: 'goal-endurance',
      title: 'Complete 10K Running Milestone',
      description: 'Progressively increase running stamina through dedicated tempo and long runs.',
      category: 'Health',
      target_date: '2026-12-31',
      progress: 60,
      status: 'in-progress',
      color: '#10b981',
      created_at: '2026-11-01T00:00:00.000Z',
      milestones: JSON.stringify([
        { id: 'm1', title: 'Run 3km without pausing', completed: true, completedAt: '2026-11-05' },
        { id: 'm2', title: 'Complete 5km under 30 minutes', completed: true, completedAt: '2026-11-12' },
        { id: 'm3', title: 'Run 8km continuous endurance run', completed: false },
        { id: 'm4', title: 'Cross official 10K finish line', completed: false }
      ])
    },
    {
      id: 'goal-mobile-app',
      title: 'Ship NexDev Mobile APK to Production',
      description: 'Package, polish UI/UX, verify dual AI coaches, and deploy to Android devices.',
      category: 'Career',
      target_date: '2026-11-30',
      progress: 80,
      status: 'in-progress',
      color: '#6366f1',
      created_at: '2026-11-01T00:00:00.000Z',
      milestones: JSON.stringify([
        { id: 'm1', title: 'Build modern glassmorphic dashboard', completed: true, completedAt: '2026-11-10' },
        { id: 'm2', title: 'Integrate Gemini & NVIDIA dual AI coach', completed: true, completedAt: '2026-11-14' },
        { id: 'm3', title: 'Connect Supabase, Blob, and Edge databases', completed: true, completedAt: '2026-11-16' },
        { id: 'm4', title: 'Export unsigned release APK build', completed: false }
      ])
    },
    {
      id: 'goal-emergency-fund',
      title: 'Build $10,000 Peace of Mind Reserve',
      description: 'Systematically allocate savings to create an unbreakable safety buffer.',
      category: 'Financial',
      target_date: '2027-03-31',
      progress: 40,
      status: 'in-progress',
      color: '#f59e0b',
      created_at: '2026-11-01T00:00:00.000Z',
      milestones: JSON.stringify([
        { id: 'm1', title: 'Save first $2,500 milestone', completed: true, completedAt: '2026-11-08' },
        { id: 'm2', title: 'Cross $5,000 threshold', completed: false },
        { id: 'm3', title: 'Reach $7,500 reserve', completed: false },
        { id: 'm4', title: 'Achieve full $10,000 target', completed: false }
      ])
    }
  ];

  for (const g of goals) {
    await client.query(`
      INSERT INTO nexdev_goals (id, title, description, category, target_date, progress, status, color, created_at, milestones)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        category = EXCLUDED.category,
        target_date = EXCLUDED.target_date,
        progress = EXCLUDED.progress,
        status = EXCLUDED.status,
        color = EXCLUDED.color,
        milestones = EXCLUDED.milestones;
    `, [g.id, g.title, g.description, g.category, g.target_date, g.progress, g.status, g.color, g.created_at, g.milestones]);
  }
  console.log('✅ Seeded goals in Supabase');

  // 3. Pristine Challenges
  const challenges = [
    {
      id: 'challenge-21d-genesis',
      title: '21-Day Neural Habit Genesis',
      description: 'Break through initial psychological friction and establish an automatic daily morning routine.',
      category: 'Productivity',
      duration_days: 21,
      current_day: 5,
      status: 'active',
      color: '#8b5cf6',
      emoji: '⚡',
      target_habit_id: 'habit-meditation',
      start_date: '2026-11-12',
      checkins: JSON.stringify({
        'day-1': true,
        'day-2': true,
        'day-3': true,
        'day-4': true,
        'day-5': true
      }),
      created_at: '2026-11-12T00:00:00.000Z'
    },
    {
      id: 'challenge-66d-automation',
      title: '66-Day Habit Automation Lock-in',
      description: 'The science-backed threshold to transform conscious effort into permanent subconscious muscle memory.',
      category: 'Health',
      duration_days: 66,
      current_day: 14,
      status: 'active',
      color: '#10b981',
      emoji: '🧬',
      target_habit_id: 'habit-fitness',
      start_date: '2026-11-03',
      checkins: JSON.stringify({
        'day-1': true, 'day-2': true, 'day-3': true, 'day-4': true, 'day-5': true,
        'day-6': true, 'day-7': true, 'day-8': true, 'day-9': true, 'day-10': true,
        'day-11': true, 'day-12': true, 'day-13': true, 'day-14': true
      }),
      created_at: '2026-11-03T00:00:00.000Z'
    },
    {
      id: 'challenge-30d-mindful',
      title: '30-Day Evening Reflection Sprint',
      description: 'Cultivate gratitude, decompress stress, and track emotional wellness every evening before sleep.',
      category: 'Mindfulness',
      duration_days: 30,
      current_day: 8,
      status: 'active',
      color: '#f59e0b',
      emoji: '🧘',
      target_habit_id: null,
      start_date: '2026-11-09',
      checkins: JSON.stringify({
        'day-1': true, 'day-2': true, 'day-3': true, 'day-4': true,
        'day-5': true, 'day-6': true, 'day-7': true, 'day-8': true
      }),
      created_at: '2026-11-09T00:00:00.000Z'
    }
  ];

  for (const c of challenges) {
    await client.query(`
      INSERT INTO nexdev_challenges (id, title, description, category, duration_days, current_day, status, color, emoji, target_habit_id, start_date, checkins, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        category = EXCLUDED.category,
        duration_days = EXCLUDED.duration_days,
        current_day = EXCLUDED.current_day,
        status = EXCLUDED.status,
        color = EXCLUDED.color,
        emoji = EXCLUDED.emoji,
        checkins = EXCLUDED.checkins;
    `, [c.id, c.title, c.description, c.category, c.duration_days, c.current_day, c.status, c.color, c.emoji, c.target_habit_id, c.start_date, c.checkins, c.created_at]);
  }
  console.log('✅ Seeded challenges in Supabase');

  // 4. Pristine Journal Reflections
  const journal = [
    {
      id: 'journal-entry-1',
      date: '2026-11-16',
      content: 'Shipped the full hybrid database integration across Supabase PostgreSQL, Vercel Blob, Global Config, and offline storage. Everything is cleanly wired and responsive.',
      mood: '🤩',
      gratitude: JSON.stringify(['Clean architecture', 'Reliable cloud sync', 'Productive flow']),
      tags: JSON.stringify(['milestone', 'launch', 'tech']),
      created_at: '2026-11-16T10:00:00.000Z',
      updated_at: '2026-11-16T10:00:00.000Z'
    },
    {
      id: 'journal-entry-2',
      date: '2026-11-15',
      content: 'Maintained deep work without distraction for two solid hours. The compounding effect of small consistent daily rituals is truly noticeable.',
      mood: '😊',
      gratitude: JSON.stringify(['Mental focus', 'Peaceful morning', 'Good coffee']),
      tags: JSON.stringify(['deepwork', 'habits']),
      created_at: '2026-11-15T18:00:00.000Z',
      updated_at: '2026-11-15T18:00:00.000Z'
    }
  ];

  for (const j of journal) {
    await client.query(`
      INSERT INTO nexdev_journal (id, date, content, mood, gratitude, tags, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (id) DO UPDATE SET
        date = EXCLUDED.date,
        content = EXCLUDED.content,
        mood = EXCLUDED.mood,
        gratitude = EXCLUDED.gratitude,
        tags = EXCLUDED.tags,
        updated_at = EXCLUDED.updated_at;
    `, [j.id, j.date, j.content, j.mood, j.gratitude, j.tags, j.created_at, j.updated_at]);
  }
  console.log('✅ Seeded journal reflections in Supabase');

  client.release();
  await pool.end();
  console.log('🎉 Live Supabase database populated with clean, structured real data!');
}

seedClean().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});

