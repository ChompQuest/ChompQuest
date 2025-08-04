# ChompQuest API Reference

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## User Endpoints

### POST /user/signup

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
  "userId": "string",
  "username": "string",
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

### POST /user/login

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
  "userId": "string",
  "username": "string",
  "user": {
    "id": "string",
    "username": "string",
    "email": "string",
    "role": "member"
  },
  "game_stats": {
    "dailyStreak": 0,
    "pointTotal": 0,
    "currentRank": 1
  },
  "token": "jwt-token-string"
}
```

## User Management (Protected)

### GET /user/profile

Get user profile information.

**Headers:**

```
Authorization: Bearer <jwt-token>
```

**Response:**

```json
{
  "user": {
    "id": "string",
    "username": "string",
    "email": "string",
    "createdAt": "date",
    "game_stats": {
      "dailyStreak": 5,
      "pointTotal": 150,
      "currentRank": 2
    }
  }
}
```

### PUT /user/profile

Update user profile.

**Headers:**

```
Authorization: Bearer <jwt-token>
```

**Request Body:**

```json
{
  "email": "newemail@example.com"
}
```

**Response:**

```json
{
  "message": "Profile updated successfully"
}
```

### PUT /user/change-password

Change user password.

**Headers:**

```
Authorization: Bearer <jwt-token>
```

**Request Body:**

```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword"
}
```

**Response:**

```json
{
  "message": "Password changed successfully"
}
```

## Game Stats (Protected)

### GET /user/game-stats

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

### PUT /user/game-stats

Update the current user's game stats.

**Headers:**

```
Authorization: Bearer <jwt-token>
```

**Request Body:**

```json
{
  "dailyStreak": 6,
  "pointTotal": 160,
  "currentRank": 2
}
```

**Response:**

```json
{
  "message": "Game stats updated successfully",
  "game_stats": {
    "dailyStreak": 6,
    "pointTotal": 160,
    "currentRank": 2
  }
}
```

## Nutrition Goals (Protected)

### GET /user/nutrition-goals

Get user's nutrition goals.

**Headers:**

```
Authorization: Bearer <jwt-token>
```

**Response:**

```json
{
  "nutritionGoals": {
    "calorieGoal": 2000,
    "proteinGoal": 100,
    "carbsGoal": 250,
    "fatGoal": 60,
    "waterIntakeGoal": 2000
  }
}
```

### POST /user/nutrition-goals

Save user's nutrition goals.

**Headers:**

```
Authorization: Bearer <jwt-token>
```

**Request Body:**

```json
{
  "goals": {
    "calories": 2000,
    "protein": 100,
    "carbs": 250,
    "fats": 60,
    "water": 2000
  }
}
```

**Response:**

```json
{
  "message": "Nutrition goals saved successfully",
  "nutritionGoals": {
    "calorieGoal": 2000,
    "proteinGoal": 100,
    "carbsGoal": 250,
    "fatGoal": 60,
    "waterIntakeGoal": 2000
  }
}
```

### PUT /user/nutrition-goals

Update user's nutrition goals.

**Headers:**

```
Authorization: Bearer <jwt-token>
```

**Request Body:**

```json
{
  "goals": {
    "calories": 2200,
    "protein": 120,
    "carbs": 280,
    "fats": 70,
    "water": 2200
  }
}
```

**Response:**

```json
{
  "message": "Nutrition goals updated successfully",
  "nutritionGoals": {
    "calorieGoal": 2200,
    "proteinGoal": 120,
    "carbsGoal": 280,
    "fatGoal": 70,
    "waterIntakeGoal": 2200
  }
}
```

## Nutrition Tracking (Protected)

### POST /user/nutrition-streak

Update nutrition streak and daily goals.

**Headers:**

```
Authorization: Bearer <jwt-token>
```

**Response:**

```json
{
  "message": "Nutrition streak updated successfully",
  "game_stats": {
    "dailyStreak": 5,
    "pointTotal": 150,
    "currentRank": 2,
    "goalsCompletedToday": true,
    "lastGoalsCompletedDate": "2024-01-15T10:30:00.000Z"
  },
  "today_status": {
    "goals_met": true,
    "goals_completion_percentage": 95,
    "goals_completed_today": true,
    "is_new_day": false,
    "nutrition_totals": {
      "calories": 2100,
      "protein": 105,
      "carbs": 260,
      "fat": 65,
      "water": 2100
    }
  }
}
```

### POST /user/check-daily-goals

Check daily goal completion status.

**Headers:**

```
Authorization: Bearer <jwt-token>
```

**Response:**

```json
{
  "message": "Daily goals checked successfully",
  "game_stats": {
    "dailyStreak": 5,
    "pointTotal": 150,
    "currentRank": 2
  },
  "goals_status": {
    "goals_met": true,
    "goals_completion_percentage": 95,
    "points_awarded": true,
    "nutrition_totals": {
      "calories": 2100,
      "protein": 105,
      "carbs": 260,
      "fat": 65,
      "water": 2100
    }
  }
}
```

## Meal Management (Protected)

### POST /nutrition/meals

Log a new meal.

**Headers:**

```
Authorization: Bearer <jwt-token>
```

**Request Body:**

```json
{
  "name": "Chicken Salad",
  "calories": 350,
  "protein": 25,
  "carbs": 15,
  "fat": 20,
  "fiber": 8,
  "sugar": 5,
  "sodium": 450,
  "mealType": "lunch",
  "notes": "Grilled chicken with mixed greens"
}
```

**Response:**

```json
{
  "message": "Meal logged successfully",
  "meal": {
    "_id": "meal_id",
    "userId": "user_id",
    "name": "Chicken Salad",
    "calories": 350,
    "protein": 25,
    "carbs": 15,
    "fat": 20,
    "fiber": 8,
    "sugar": 5,
    "sodium": 450,
    "mealType": "lunch",
    "notes": "Grilled chicken with mixed greens",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### GET /nutrition/meals

Get user's meal history.

**Headers:**

```
Authorization: Bearer <jwt-token>
```

**Query Parameters:**

- `date` (optional): Get meals for specific date (YYYY-MM-DD)
- `mealType` (optional): Filter by meal type

**Response:**

```json
{
  "meals": [
    {
      "_id": "meal_id",
      "name": "Chicken Salad",
      "calories": 350,
      "protein": 25,
      "carbs": 15,
      "fat": 20,
      "mealType": "lunch",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### DELETE /nutrition/meals/:id

Delete a meal.

**Headers:**

```
Authorization: Bearer <jwt-token>
```

**Response:**

```json
{
  "message": "Meal deleted successfully"
}
```

## Water Tracking (Protected)

### POST /nutrition/water

Log water intake.

**Headers:**

```
Authorization: Bearer <jwt-token>
```

**Request Body:**

```json
{
  "intake": 500
}
```

**Response:**

```json
{
  "message": "Water intake logged successfully",
  "waterRecord": {
    "_id": "water_id",
    "userId": "user_id",
    "intake": 500,
    "date": "2024-01-15",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### GET /nutrition/water

Get water intake history.

**Headers:**

```
Authorization: Bearer <jwt-token>
```

**Query Parameters:**

- `date` (optional): Get water intake for specific date (YYYY-MM-DD)

**Response:**

```json
{
  "waterIntake": [
    {
      "_id": "water_id",
      "intake": 500,
      "date": "2024-01-15",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

## Admin Endpoints (Admin Only)

### User Management

#### GET /admin/users

Get all users.

**Headers:**

```
Authorization: Bearer <admin-jwt-token>
```

**Response:**

```json
{
  "users": [
    {
      "_id": "user_id",
      "username": "john_doe",
      "email": "john@example.com",
      "role": "member",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "game_stats": {
        "dailyStreak": 5,
        "pointTotal": 150,
        "currentRank": 2
      }
    }
  ]
}
```

#### GET /admin/users/:id

Get specific user.

**Headers:**

```
Authorization: Bearer <admin-jwt-token>
```

**Response:**

```json
{
  "user": {
    "_id": "user_id",
    "username": "john_doe",
    "email": "john@example.com",
    "role": "member",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "game_stats": {
      "dailyStreak": 5,
      "pointTotal": 150,
      "currentRank": 2
    }
  }
}
```

#### PUT /admin/users/:id/role

Update user role.

**Headers:**

```
Authorization: Bearer <admin-jwt-token>
```

**Request Body:**

```json
{
  "role": "admin"
}
```

**Response:**

```json
{
  "message": "User role updated successfully"
}
```

#### PUT /admin/users/:id/game-stats

Update user game stats.

**Headers:**

```
Authorization: Bearer <admin-jwt-token>
```

**Request Body:**

```json
{
  "dailyStreak": 10,
  "pointTotal": 200,
  "currentRank": 2
}
```

**Response:**

```json
{
  "message": "User game stats updated successfully"
}
```

#### DELETE /admin/users/:id

Delete user.

**Headers:**

```
Authorization: Bearer <admin-jwt-token>
```

**Response:**

```json
{
  "message": "User deleted successfully"
}
```

### Food Management

#### GET /admin/foods

Get all food items.

**Headers:**

```
Authorization: Bearer <admin-jwt-token>
```

**Query Parameters:**

- `search` (optional): Search food items by name

**Response:**

```json
{
  "foods": [
    {
      "_id": "food_id",
      "name": "Chicken Breast",
      "calories": 165,
      "protein": 31,
      "carbs": 0,
      "fat": 3.6,
      "fiber": 0,
      "sugar": 0,
      "sodium": 74
    }
  ]
}
```

#### POST /admin/foods

Add new food item.

**Headers:**

```
Authorization: Bearer <admin-jwt-token>
```

**Request Body:**

```json
{
  "name": "Salmon",
  "calories": 208,
  "protein": 25,
  "carbs": 0,
  "fat": 12,
  "fiber": 0,
  "sugar": 0,
  "sodium": 59
}
```

**Response:**

```json
{
  "message": "Food item added successfully",
  "food": {
    "_id": "food_id",
    "name": "Salmon",
    "calories": 208,
    "protein": 25,
    "carbs": 0,
    "fat": 12,
    "fiber": 0,
    "sugar": 0,
    "sodium": 59
  }
}
```

#### PUT /admin/foods/:id

Update food item.

**Headers:**

```
Authorization: Bearer <admin-jwt-token>
```

**Request Body:**

```json
{
  "name": "Wild Salmon",
  "calories": 220,
  "protein": 26,
  "carbs": 0,
  "fat": 13
}
```

**Response:**

```json
{
  "message": "Food item updated successfully"
}
```

#### DELETE /admin/foods/:id

Delete food item.

**Headers:**

```
Authorization: Bearer <admin-jwt-token>
```

**Response:**

```json
{
  "message": "Food item deleted successfully"
}
```

## Error Responses

### Authentication Errors

```json
{
  "message": "No token, authorization denied"
}
```

```json
{
  "message": "Token is not valid"
}
```

### Validation Errors

```json
{
  "message": "Validation failed",
  "errors": [
    "Username must be at least 3 characters long",
    "Please enter a valid email address"
  ]
}
```

### Not Found Errors

```json
{
  "message": "User not found"
}
```

### Server Errors

```json
{
  "message": "Error creating user",
  "error": "Database connection failed"
}
```

## Data Flow for Nutrition Goals

### Fetching Goals on Login

The backend returns nutrition goals along with user profile data on successful login:

```json
{
  "user": {
    "id": "abc123",
    "username": "johndoe"
  },
  "nutritionGoals": {
    "calorieGoal": 2000,
    "proteinGoal": 150,
    "carbsGoal": 250,
    "fatGoal": 60,
    "waterIntakeGoal": 2000
  },
  "token": "jwt-token"
}
```

### Goal Management

- **GET /user/nutrition-goals** - Returns current user's nutrition goals
- **POST /user/nutrition-goals** - Saves new nutrition goals
- **PUT /user/nutrition-goals** - Updates existing nutrition goals

All endpoints use JWT authentication to identify the user and ensure users only access their own data.

### Best Practices

- **Always use authentication** to ensure users only access their own data
- **Return nutrition goals in login response** for fast initial load
- **Provide dedicated endpoints** for later fetches/refreshes
- **Keep nutrition goals in a separate field** in the user schema for easy access
- **Support both GET and PUT/PATCH** for nutrition goals
