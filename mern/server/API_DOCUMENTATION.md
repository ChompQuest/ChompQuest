# ChompQuest API Documentation

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## User Endpoints

### POST /api/user/signup

Create a new user account with game stats.

**Request Body:**

```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

**Response:**

```json
{
  "message": "User created successfully",
  "userId": "string"
}
```

### POST /api/user/login

Authenticate user and receive JWT token with game stats.

**Request Body:**

```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**

```json
{
  "message": "Login successful",
  "user": {
    "id": "string",
    "username": "string",
    "email": "string"
  },
  "game_stats": {
    "dailyStreak": 0,
    "pointTotal": 0,
    "currentRank": 1
  },
  "token": "jwt-token-string"
}
```

## Game Stats Endpoints (Protected)

### GET /api/user/game-stats

Get the current user's game stats.

**Headers:**

```
Authorization: Bearer <jwt-token>
```

**Response:**

```json
{
  "game_stats": {
    "dailyStreak": 5,
    "pointTotal": 150,
    "currentRank": 2
  }
}
```

### PUT /api/user/game-stats

Update the current user's game stats.

**Headers:**

```
Authorization: Bearer <jwt-token>
```

**Request Body:**

```json
{
  "dailyStreak": 5,
  "pointTotal": 150,
  "currentRank": 2
}
```

**Response:**

```json
{
  "message": "Game stats updated successfully",
  "game_stats": {
    "dailyStreak": 5,
    "pointTotal": 150,
    "currentRank": 2
  }
}
```

## Game Stats Schema

The `game_stats` object contains:

- **dailyStreak** (integer): Number of consecutive days the user has been active
- **pointTotal** (integer): Total points earned by the user
- **currentRank** (integer): User's current rank (1 = Bronze, 2 = Silver, 3 = Gold)

## Rank System

- **1** = Bronze (default for new users)
- **2** = Silver
- **3** = Gold

## Error Responses

### 401 Unauthorized

```json
{
  "message": "No token, authorization denied"
}
```

### 400 Bad Request

```json
{
  "message": "All game stats fields are required"
}
```

### 404 Not Found

```json
{
  "message": "User not found"
}
```

### 500 Internal Server Error

```json
{
  "message": "Error updating game stats"
}
```
