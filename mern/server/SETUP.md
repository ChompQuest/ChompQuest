# ChompQuest Server Setup Guide

## Environment Variables

Create a `.env` file in the server directory with the following variables:

```env
# MongoDB Connection
ATLAS_URI=your_mongodb_connection_string_here
DB_NAME=chompDB

# JWT Secret (generate a secure random string)
JWT_SECRET=your_super_secret_jwt_key_here

# Server Port
PORT=5050
```

## JWT Secret Generation

To generate a secure JWT secret, you can use:

```bash
# Option 1: Using Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Option 2: Using OpenSSL
openssl rand -hex 64

# Option 3: Online generator (for development only)
# Visit: https://generate-secret.vercel.app/64
```

## Testing the Setup

1. **Test database connection:**

   ```bash
   node testGameStats.js
   ```

2. **Start the server:**

   ```bash
   npm start
   ```

3. **Test API endpoints:**
   - Create a user: `POST /api/user/signup`
   - Login: `POST /api/user/login`
   - Get game stats: `GET /api/user/game-stats` (with JWT token)
   - Update game stats: `PUT /api/user/game-stats` (with JWT token)

## Game Stats Structure

New users will automatically have the following game stats:

```json
{
  "game_stats": {
    "dailyStreak": 0,
    "pointTotal": 0,
    "currentRank": 1
  }
}
```

## Rank System

- **1** = Bronze (default)
- **2** = Silver
- **3** = Gold
