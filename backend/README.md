# EcoFriend Backend

## Setup Instructions

1. Create a `.env` file in this folder with the following content:

```
OPENROUTER_API_KEY=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
JWT_SECRET=ecofriend_super_secret_2024
PORT=3001
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
# or for development with auto-reload:
npm run dev
```

The server will start on `http://localhost:3001`

## API Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login existing user
- `GET /api/auth/me` - Get current user info
- `POST /api/conversations` - Create new conversation
- `GET /api/conversations` - Get user's conversations
- `POST /api/chat` - Send message (streaming)
- `GET /api/messages/:conversationId` - Get messages
- `GET /api/challenges` - Get all challenges
- `POST /api/challenges/:id/complete` - Complete a challenge
- `POST /api/carbon` - Save carbon calculation
- `GET /api/carbon` - Get carbon history

## Database

SQLite database is automatically created at `ecofriend.db` when the server starts.
