const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { promisify } = require('util');

const dbPath = path.join(__dirname, 'ecofriend.db');
const db = new sqlite3.Database(dbPath);

// Custom run function that returns lastID and changes
function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

const get = promisify(db.get.bind(db));
const all = promisify(db.all.bind(db));

// Initialize database tables
async function initDatabase() {
  await run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      eco_score INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS conversations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      topic TEXT,
      title TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      conversation_id INTEGER NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('user', 'assistant')),
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (conversation_id) REFERENCES conversations(id)
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS challenges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      difficulty TEXT CHECK(difficulty IN ('easy', 'medium', 'hard')),
      points INTEGER DEFAULT 0
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS user_challenges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      challenge_id INTEGER NOT NULL,
      completed INTEGER DEFAULT 0,
      completed_at DATETIME,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (challenge_id) REFERENCES challenges(id),
      UNIQUE(user_id, challenge_id)
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS carbon_calculations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      transport_score INTEGER,
      diet_score INTEGER,
      energy_score INTEGER,
      total_score INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Seed default challenges if empty
  const countResult = await get('SELECT COUNT(*) as count FROM challenges');
  if (countResult.count === 0) {
    const defaultChallenges = [
      { title: 'Go plastic-free for a day', description: 'Avoid all single-use plastics for 24 hours', difficulty: 'easy', points: 10 },
      { title: 'Take public transport instead of driving', description: 'Use buses, trains, or subway instead of your car', difficulty: 'easy', points: 10 },
      { title: 'Plant something, anything', description: 'Start a small plant or help in a community garden', difficulty: 'easy', points: 15 },
      { title: 'Do a 10 minute local cleanup', description: 'Pick up litter in your neighborhood or nearby park', difficulty: 'medium', points: 25 },
      { title: 'Eat fully plant-based for one day', description: 'Go vegetarian or vegan for a full day', difficulty: 'medium', points: 20 },
      { title: 'Turn off all standby electronics for a week', description: 'Unplug devices when not in use for 7 days', difficulty: 'medium', points: 30 },
      { title: 'Reduce shower time to under 4 minutes for a week', description: 'Take quick showers to save water', difficulty: 'medium', points: 25 },
      { title: 'Start a compost bin', description: 'Begin composting your organic waste', difficulty: 'hard', points: 40 },
      { title: 'Go car-free for one full week', description: 'No personal vehicle use for 7 days', difficulty: 'hard', points: 50 },
      { title: 'Calculate and offset your carbon footprint', description: 'Use our calculator and take offsetting actions', difficulty: 'hard', points: 45 }
    ];

    for (const challenge of defaultChallenges) {
      await run(
        'INSERT INTO challenges (title, description, difficulty, points) VALUES (?, ?, ?, ?)',
        [challenge.title, challenge.description, challenge.difficulty, challenge.points]
      );
    }

    console.log('Default challenges seeded');
  }

  // Streak columns for daily challenges (safe if already present)
  try {
    await run('ALTER TABLE users ADD COLUMN challenge_streak INTEGER DEFAULT 0');
  } catch (_) {
    /* column exists */
  }
  try {
    await run('ALTER TABLE users ADD COLUMN challenge_last_full_day TEXT');
  } catch (_) {
    /* column exists */
  }
}

// Export database and helper functions
module.exports = {
  db,
  run,
  get,
  all,
  initDatabase
};
