# Server Tests

This folder contains various test scripts for the ChompQuest server functionality.

## Test Files

### Database Tests
- **`checkUsers.js`** - Lists all users in the database with their game stats
- **`checkSpecificUser.js`** - Detailed information about a specific user (testingUser)

### Nutrition Streak Tests
- **`testTestingUserStreak.js`** - Tests the nutrition streak system with the testingUser
  - Adds test meals and water intake
  - Verifies streak calculation and database updates
  - Tests 100% goal completion logic
- **`testNutritionStreak.js`** - Original nutrition streak test (legacy)

### Frontend Integration Tests
- **`testFrontendNutritionCall.js`** - Simulates the frontend's call to `/nutrition/today`
- **`testGameStatsEndpoint.js`** - Tests the `/user/game-stats` endpoint
- **`testCompleteFrontendFlow.js`** - Tests the complete frontend flow (login → fetch data → display)
- **`testFrontendWaterDisplay.js`** - Tests water intake display in frontend responses
- **`testFrontendNutritionGoals.js`** - Tests frontend nutrition goals integration

### Water System Tests
- **`testWaterIntakeFlow.js`** - Tests the complete water intake flow
  - Login → Check initial water → Add water → Verify persistence
  - Simulates page reload to verify data persistence
- **`testWaterSystem.js`** - Basic water system functionality test

### Nutrition Goals Tests
- **`testNutritionGoals.js`** - Database-level nutrition goals tests
- **`testNutritionGoalsAPI.js`** - API-level nutrition goals tests

### Legacy Tests
- **`testCompleteIntegration.js`** - Complete frontend-backend integration test
- **`testCompleteFlow.js`** - Complete user flow test
- **`testGameStats.js`** - Game stats functionality test
- **`testInsert.js`** - Database insertion test
- **`testNutritionTracker.js`** - Nutrition tracker functionality test
- **`testPasswordSecurity.js`** - Password security test
- **`testSignupTokenFix.js`** - Signup token fix test

## How to Run Tests

From the server directory, run any test with:

```bash
node tests/[test-filename].js
```

## Test User

Most tests use the `testingUser` account:
- Username: `testingUser`
- Password: `testingUser1`

This user has proper nutrition goals and game stats set up for testing.

## Test Categories

### Quick Checks
- `checkUsers.js` - Quick overview of all users
- `checkSpecificUser.js` - Detailed user information

### Core Functionality
- `testTestingUserStreak.js` - Nutrition streak system
- `testWaterIntakeFlow.js` - Water tracking system

### Frontend Integration
- `testFrontendNutritionCall.js` - Nutrition data fetching
- `testGameStatsEndpoint.js` - Game stats endpoint
- `testCompleteFrontendFlow.js` - Complete user flow
- `testFrontendWaterDisplay.js` - Water display logic

## Notes

- Tests are designed to be non-destructive (they add test data but don't break existing functionality)
- Most tests use the `testingUser` account to avoid affecting real user data
- Tests verify both backend functionality and frontend integration
- Water tests verify data persistence across "reloads" (simulated by multiple API calls) 