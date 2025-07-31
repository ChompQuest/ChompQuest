# Database Schema Documentation

## Users Collection

### Document Structure

```javascript
{
  _id: ObjectId,                    // MongoDB auto-generated unique identifier
  username: String,                 // Unique username for login
  email: String,                    // Unique email address
  password: String,                 // Hashed with bcrypt
  createdAt: Date,                  // Account creation timestamp
  goals: Array,                     // Placeholder for future goal tracking
  progress: Object,                 // Placeholder for progress tracking
  nutritionGoals: {                 // Optional - added when user sets nutrition goals
    sex: 'male' | 'female',
    height: Number,                 // Height in feet
    heightInches: Number,           // Height in inches
    weight: Number,                 // Weight in pounds
    age: Number,                    // Age in years
    activityLevel: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' |
    calorieGoal: Number,            // Daily calorie goal
    waterIntakeGoal: Number,        // Daily water intake goal in ml
    proteinGoal: Number,            // Daily protein goal in grams
    carbsGoal: Number,              // Daily carbs goal in grams
    fatGoal: Number                 // Daily fat goal in grams
  }
}
```

### Indexes

- `username`: Unique index
- `email`: Unique index
- `_id`: Primary key (auto-generated)

### Validation Rules

- `username`: Required, unique, string
- `email`: Required, unique, valid email format
- `password`: Required, minimum 6 characters
- `age`: 13-120 years
- `height`: 3-8 feet
- `heightInches`: 0-11 inches
- `weight`: 50-500 pounds

### Activity Levels

- `sedentary`: Little or no exercise
- `lightly_active`: Light exercise 1-3 days/week
- `moderately_active`: Moderate exercise 3-5 days/week
- `very_active`: Hard exercise 6-7 days/week

## Meals Collection

### Document Structure

```javascript
{
  _id: ObjectId,                    // MongoDB auto-generated unique identifier
  userId: ObjectId,                 // Reference to user who created the meal
  name: String,                     // Name of the meal
  calories: Number,                 // Total calories
  protein: Number,                  // Protein in grams
  carbs: Number,                    // Carbohydrates in grams
  fat: Number,                      // Fat in grams
  fiber: Number,                    // Fiber in grams
  sugar: Number,                    // Sugar in grams
  sodium: Number,                   // Sodium in mg
  mealType: String,                 // 'breakfast', 'lunch', 'dinner', 'snack'
  notes: String,                    // Optional notes about the meal
  createdAt: Date,                  // When the meal was logged
  updatedAt: Date                   // When the meal was last updated
}
```

### Indexes

- `userId`: Index for user queries
- `createdAt`: Index for date-based queries
- `userId + createdAt`: Compound index for daily meal queries

### Validation Rules

- `userId`: Required, valid ObjectId
- `name`: Required, non-empty string
- `calories`: Required, number >= 0
- `protein`, `carbs`, `fat`, `fiber`, `sugar`, `sodium`: Optional, number >= 0
- `mealType`: Optional, one of ['breakfast', 'lunch', 'dinner', 'snack']
- `notes`: Optional, string

## API Endpoints

### Nutrition Tracking

- `GET /nutrition/today` - Get daily nutrition totals and progress
- `POST /nutrition/meals` - Add a new meal
- `GET /nutrition/meals` - Get all meals for current day
- `PUT /nutrition/meals/:id` - Update a meal
- `DELETE /nutrition/meals/:id` - Delete a meal

### User Management

- `POST /user/signup` - Create new user account
- `POST /user/login` - Authenticate user
- `GET /user/nutrition-goals` - Get user's nutrition goals
- `POST /user/nutrition-goals` - Save nutrition goals
- `PUT /user/nutrition-goals` - Update nutrition goals
