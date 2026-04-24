require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const https = require('https');
const path = require('path');
const { run, get, all, initDatabase } = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'ecofriend_super_secret_2024';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

app.use(cors());
app.use(express.json());

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  if (token === 'guest') {
    req.userId = null;
    req.isGuest = true;
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.userId = user.userId;
    req.isGuest = false;
    next();
  });
};

// POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await get('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await run(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );

    const token = jwt.sign({ userId: result.lastID }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: result.lastID,
        username,
        email,
        eco_score: 0
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Wrong password' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        eco_score: user.eco_score
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/auth/me
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await get('SELECT id, username, email, eco_score, created_at FROM users WHERE id = ?', [req.userId]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/user/stats
app.get('/api/user/stats', authenticateToken, async (req, res) => {
  try {
    if (req.isGuest) {
      return res.json({
        user: { username: 'Guest', eco_score: 0, created_at: new Date() },
        completedChallenges: 0,
        totalChallenges: 0,
        carbonHistory: [],
        totalConversations: 0,
      });
    }

    const user = await get(
      'SELECT id, username, email, eco_score, created_at FROM users WHERE id = ?',
      [req.userId]
    );

    const completedCount = await get(
      'SELECT COUNT(*) as count FROM user_challenges WHERE user_id = ? AND completed = 1',
      [req.userId]
    );

    const totalChallenges = await get(
      'SELECT COUNT(*) as count FROM challenges'
    );

    const carbonHistory = await all(
      'SELECT * FROM carbon_calculations WHERE user_id = ? ORDER BY created_at DESC LIMIT 5',
      [req.userId]
    );

    const conversationCount = await get(
      'SELECT COUNT(*) as count FROM conversations WHERE user_id = ?',
      [req.userId]
    );

    res.json({
      user,
      completedChallenges: completedCount.count,
      totalChallenges: totalChallenges.count,
      carbonHistory,
      totalConversations: conversationCount.count,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/conversations
app.post('/api/conversations', authenticateToken, async (req, res) => {
  try {
    const { topic, title } = req.body;
    console.log('Creating conversation for user:', req.userId, { topic, title });

    const result = await run(
      'INSERT INTO conversations (user_id, topic, title) VALUES (?, ?, ?)',
      [req.userId, topic || null, title || 'New Conversation']
    );

    console.log('Insert result:', result);
    res.json({ id: result.lastID, topic, title });
  } catch (error) {
    console.error('Conversation creation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/conversations
app.get('/api/conversations', authenticateToken, async (req, res) => {
  try {
    const conversations = await all(
      'SELECT * FROM conversations WHERE user_id = ? ORDER BY created_at DESC',
      [req.userId]
    );

    res.json({ conversations });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/chat
app.post('/api/chat', authenticateToken, async (req, res) => {
  try {
    const { message, conversation_id, topic } = req.body;

    // Save user message
    if (!req.isGuest && conversation_id) {
      await run(
        'INSERT INTO messages (conversation_id, role, content) VALUES (?, ?, ?)',
        [conversation_id, 'user', message]
      );
    }

    // Fetch previous messages
    const previousMessages = await all(
      'SELECT role, content FROM messages WHERE conversation_id = ? ORDER BY created_at ASC',
      [conversation_id]
    );

    // Build messages array for OpenRouter
    const messagesForAI = [
      {
        role: 'system',
        content: 'You are EcoFriend, a warm and knowledgeable AI assistant dedicated exclusively to environmental awareness. You only discuss topics related to nature, climate change, recycling, wildlife, oceans, energy, forests, and sustainability. If asked about anything unrelated to the environment, politely redirect the conversation back to eco topics. Keep responses informative, encouraging, and engaging.'
      },
      ...previousMessages.map(m => ({ role: m.role, content: m.content }))
    ];

    // Set up streaming response
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const requestData = JSON.stringify({
      model: 'google/gemini-2.0-flash-lite-001',
      messages: messagesForAI,
      stream: true
    });

    const options = {
      hostname: 'openrouter.ai',
      path: '/api/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Length': Buffer.byteLength(requestData)
      }
    };

    let fullResponse = '';

    const apiReq = https.request(options, (apiRes) => {
      let buffer = '';

      apiRes.on('data', async (chunk) => {
      console.log('RAW CHUNK FROM OPENROUTER:', chunk.toString());
      buffer += chunk.toString();
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              // Save the full AI response
              if (!req.isGuest && conversation_id && fullResponse) {
                await run(
                  'INSERT INTO messages (conversation_id, role, content) VALUES (?, ?, ?)',
                  [conversation_id, 'assistant', fullResponse]
                );
              }
              res.write('data: [DONE]\n\n');
              res.end();
              return;
            }
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                fullResponse += content;
                res.write(`data: ${JSON.stringify({ content })}\n\n`);
              }
            } catch (e) {
              // Ignore parse errors
            }
          }
        }
      });

      apiRes.on('end', async () => {
        if (!req.isGuest && conversation_id && fullResponse) {
          await run(
            'INSERT INTO messages (conversation_id, role, content) VALUES (?, ?, ?)',
            [conversation_id, 'assistant', fullResponse]
          );
        }
        res.end();
      });
    });

    apiReq.on('error', (error) => {
      res.status(500).json({ error: error.message });
    });

    apiReq.write(requestData);
    apiReq.end();

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/messages/:conversationId
app.get('/api/messages/:conversationId', authenticateToken, async (req, res) => {
  try {
    const { conversationId } = req.params;

    const messages = await all(
      'SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC',
      [conversationId]
    );

    res.json({ messages });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/challenges
app.get('/api/challenges', authenticateToken, async (req, res) => {
  try {
    const challenges = await all('SELECT * FROM challenges');

    const challengesWithStatus = await Promise.all(challenges.map(async (challenge) => {
      const userChallenge = await get(
        'SELECT completed FROM user_challenges WHERE user_id = ? AND challenge_id = ?',
        [req.userId, challenge.id]
      );

      return {
        ...challenge,
        completed: userChallenge ? userChallenge.completed === 1 : false
      };
    }));

    res.json({ challenges: challengesWithStatus });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/challenges/:id/complete
app.post('/api/challenges/:id/complete', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await get(
      'SELECT * FROM user_challenges WHERE user_id = ? AND challenge_id = ?',
      [req.userId, id]
    );

    if (existing && existing.completed === 1) {
      return res.status(400).json({ error: 'Challenge already completed' });
    }

    const challenge = await get('SELECT points FROM challenges WHERE id = ?', [id]);
    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    if (existing) {
      await run(
        'UPDATE user_challenges SET completed = 1, completed_at = CURRENT_TIMESTAMP WHERE user_id = ? AND challenge_id = ?',
        [req.userId, id]
      );
    } else {
      await run(
        'INSERT INTO user_challenges (user_id, challenge_id, completed, completed_at) VALUES (?, ?, 1, CURRENT_TIMESTAMP)',
        [req.userId, id]
      );
    }

    await run(
      'UPDATE users SET eco_score = eco_score + ? WHERE id = ?',
      [challenge.points, req.userId]
    );

    const user = await get('SELECT eco_score FROM users WHERE id = ?', [req.userId]);

    res.json({ eco_score: user.eco_score });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/carbon
app.post('/api/carbon', authenticateToken, async (req, res) => {
  try {
    const { transport_score, diet_score, energy_score } = req.body;

    const total_score = (transport_score || 0) + (diet_score || 0) + (energy_score || 0);

    await run(
      'INSERT INTO carbon_calculations (user_id, transport_score, diet_score, energy_score, total_score) VALUES (?, ?, ?, ?, ?)',
      [req.userId, transport_score, diet_score, energy_score, total_score]
    );

    const suggestions = [
      { icon: '🚲', text: 'Switch one weekly car trip to cycling', impact: 'Save ~2kg CO₂ weekly' },
      { icon: '🥗', text: 'Try one meat-free day per week', impact: 'Save ~0.5kg CO₂ daily' },
      { icon: '💡', text: 'Switch to LED bulbs throughout your home', impact: 'Save ~200kg CO₂ yearly' }
    ];

    res.json({ total_score, suggestions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/carbon
app.get('/api/carbon', authenticateToken, async (req, res) => {
  try {
    const calculations = await all(
      'SELECT * FROM carbon_calculations WHERE user_id = ? ORDER BY created_at DESC LIMIT 5',
      [req.userId]
    );

    res.json({ calculations });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../dist')));

// For any route not matched by API, serve the frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

// Initialize database and start server
async function startServer() {
  await initDatabase();
  app.listen(PORT, () => {
    console.log(`EcoFriend backend running on port ${PORT}`);
  });
}

startServer();
