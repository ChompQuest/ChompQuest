# Database Schema Documentation

## Users Collection

### Document Structure

```javascript
{
  _id: ObjectId,                    // MongoDB auto-generated unique identifier
  username: String,                 // Unique username for login
  email: String,                    // Unique email address
  password: String,                 // TODO: Should be hashed with bcrypt
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
