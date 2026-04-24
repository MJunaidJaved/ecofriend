const bcrypt = require('bcryptjs');
const { run, get, initDatabase } = require('./database');

async function createTestUser() {
  await initDatabase();

  const email = 'junaidjaved2113@gmail.com';
  const password = 'Junaid518%@*';
  const username = 'Junaid';

  try {
    // Check if user already exists
    const existing = await get('SELECT id FROM users WHERE email = ?', [email]);

    if (existing) {
      console.log('Test user already exists!');
      console.log('Email:', email);
      console.log('Password:', password);
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await run(
      'INSERT INTO users (username, email, password, eco_score) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, 100]
    );

    console.log('Test user created successfully!');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('Eco Score: 100');
    process.exit(0);
  } catch (err) {
    if (err.message && err.message.includes('UNIQUE constraint failed')) {
      console.log('Test user already exists!');
      console.log('Email:', email);
      console.log('Password:', password);
      process.exit(0);
    }
    throw err;
  }
}

createTestUser().catch(err => {
  console.error('Error creating test user:', err);
  process.exit(1);
});
