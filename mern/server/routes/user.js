import express from "express";
import { getDb } from "../db/connection.js";
import { ObjectId } from "mongodb";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Utility function to calculate rank based on streak
function calculateRank(dailyStreak) {
  if (dailyStreak >= 30) {
    return 3; // Gold
  } else if (dailyStreak >= 15) {
    return 2; // Silver
  } else {
    return 1; // Bronze (0-14 days)
  }
}

// Password validation function
const validatePassword = (password) => {
  if (password.length < 6) {
    return { isValid: false, message: "Password must be at least 6 characters long" };
  }
  if (password.length > 128) {
    return { isValid: false, message: "Password must be less than 128 characters" };
  }
  return { isValid: true };
};

// Email validation function
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, message: "Please enter a valid email address" };
  }
  return { isValid: true };
};

// Username validation function
const validateUsername = (username) => {
  if (username.length < 3) {
    return { isValid: false, message: "Username must be at least 3 characters long" };
  }
  if (username.length > 30) {
    return { isValid: false, message: "Username must be less than 30 characters" };
  }
  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  if (!usernameRegex.test(username)) {
    return { isValid: false, message: "Username can only contain letters, numbers, and underscores" };
  }
  return { isValid: true };
};

// User registration endpoint
router.post("/signup", async (req, res) => {
  console.log('SIGNUP ENDPOINT HIT - UPDATED CODE RUNNING');
  try {
    const { username, email, password } = req.body;

    // Basic validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validate input fields
    const usernameValidation = validateUsername(username);
    if (!usernameValidation.isValid) {
      return res.status(400).json({ message: usernameValidation.message });
    }

    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      return res.status(400).json({ message: emailValidation.message });
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ message: passwordValidation.message });
    }

    // Check if user already exists
    const db = getDb();
    const existingUser = await db.collection("users").findOne({ 
      $or: [{ email }, { username }] 
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user with game stats
    const newUser = {
      username,
      email,
      password: hashedPassword, // Store hashed password
      role: 'member', // Default role for regular users
      createdAt: new Date(),
      goals: [],
      progress: {},
      game_stats: {
        dailyStreak: 0,   //Will be updated when nutrition goals are met
        pointTotal: 0,
        currentRank: 1, // 1 = Bronze, 2 = Silver, 3 = Gold
        lastNutritionCheck: null,
        lastDailyReset: null
      }
    };

    const result = await db.collection("users").insertOne(newUser);
    
    console.log('User created successfully, creating JWT token...');
    
    // Create JWT payload for the newly created user
    const payload = {
      user: {
        id: result.insertedId.toString(),
        username: username,
        role: 'member'
      }
    };

    console.log('JWT payload:', payload);

    // Sign the token
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "3h" },
      (err, token) => {
        if (err) {
          console.error('JWT signing error:', err);
          throw err;
        }
        
        console.log('JWT token created successfully');
        
        // Return user data with game stats and token (same as login)
        res.status(201).json({ 
          message: "User created successfully",
          userId: result.insertedId.toString(),
          username: username,
          user: {
            id: result.insertedId,
            username: username,
            email: email
          },
          game_stats: newUser.game_stats,
          token
        });
      }
    );
  } catch (err) {
    console.error("Signup error details:", err);
    res.status(500).json({ message: "Error creating user", error: err.message });
  }
});

// User login endpoint
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    // Find user by username only
    const db = getDb();
    const user = await db.collection("users").findOne({ username: username });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Compare password with hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Create JWT payload
    const payload = {
      user: {
        id: user._id.toString(),
        username: user.username,
        role: user.role || 'member' // Use user's actual role from database
      }
    };

    // Sign the token
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "3h" },
      (err, token) => {
        if (err) throw err;
        
        // Return user data with game stats and token
        res.status(200).json({ 
          message: "Login successful",
          userId: user._id.toString(),
          username: user.username,
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role || 'member' // Include role in response
          },
          game_stats: user.game_stats || {
            dailyStreak: 0,
            pointTotal: 0,
            currentRank: 1
          },
          token
        });
      }
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error during login" });
  }
});

// Get user's game stats (protected route)
router.get("/game-stats", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const db = getDb();
    const user = await db.collection("users").findOne(
      { _id: new ObjectId(userId) },
      { projection: { game_stats: 1 } }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ 
      game_stats: user.game_stats || {
        dailyStreak: 0,
        pointTotal: 0,
        currentRank: 1
      }
    });
  } catch (err) {
    console.error("Get game stats error:", err);
    res.status(500).json({ message: "Error retrieving game stats" });
  }
});

// Update user's game stats (protected route)
router.put("/game-stats", authMiddleware, async (req, res) => {
  try {
    const { dailyStreak, pointTotal, currentRank } = req.body;
    const userId = req.user.id;
    
    // Validate the data
    if (dailyStreak === undefined || pointTotal === undefined || currentRank === undefined) {
      return res.status(400).json({ message: "All game stats fields are required" });
    }

    // Validate rank is between 1-3
    if (currentRank < 1 || currentRank > 3) {
      return res.status(400).json({ message: "Current rank must be between 1 and 3" });
    }

    const db = getDb();
    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      { 
        $set: { 
          game_stats: {
            dailyStreak: parseInt(dailyStreak),
            pointTotal: parseInt(pointTotal),
            currentRank: parseInt(currentRank)
          }
        } 
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ 
      message: "Game stats updated successfully",
      game_stats: {
        dailyStreak: parseInt(dailyStreak),
        pointTotal: parseInt(pointTotal),
        currentRank: parseInt(currentRank)
      }
    });
  } catch (err) {
    console.error("Update game stats error:", err);
    res.status(500).json({ message: "Error updating game stats" });
  }
});

// Get user's nutrition goals (protected route)
router.get("/nutrition-goals", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const db = getDb();
    const user = await db.collection("users").findOne(
      { _id: new ObjectId(userId) },
      { projection: { nutritionGoals: 1 } }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return default goals if none exist
    const defaultGoals = {
      calorieGoal: 2000,
      proteinGoal: 100,
      carbsGoal: 250,
      fatGoal: 60,
      waterIntakeGoal: 2000
    };

    res.status(200).json({ 
      nutritionGoals: user.nutritionGoals || defaultGoals 
    });
  } catch (err) {
    console.error("Get nutrition goals error:", err);
    res.status(500).json({ message: "Error retrieving nutrition goals" });
  }
});

// Get user's nutrition goals by userId (for new users without JWT)
router.get("/nutrition-goals-by-id", async (req, res) => {
  try {
    const userId = req.query.userId;
    
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const db = getDb();
    const user = await db.collection("users").findOne(
      { _id: new ObjectId(userId) },
      { projection: { nutritionGoals: 1 } }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ 
      nutritionGoals: user.nutritionGoals || null 
    });
  } catch (err) {
    console.error("Get nutrition goals error:", err);
    res.status(500).json({ message: "Error retrieving nutrition goals" });
  }
});

// Save/update user's nutrition goals (protected route)
router.post("/nutrition-goals", authMiddleware, async (req, res) => {
  try {
    const nutritionGoals = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!nutritionGoals) {
      return res.status(400).json({ message: "Nutrition goals data is required" });
    }

    // Handle both nested goals structure and flat structure
    let goalsToValidate;
    let goalsToSave;
    
    if (nutritionGoals.goals) {
      // Frontend is sending nested structure: { goals: { calories: 3000, ... } }
      goalsToValidate = nutritionGoals.goals;
      goalsToSave = {
        calorieGoal: nutritionGoals.goals.calories,
        proteinGoal: nutritionGoals.goals.protein,
        carbsGoal: nutritionGoals.goals.carbs,
        fatGoal: nutritionGoals.goals.fats,
        waterIntakeGoal: nutritionGoals.goals.water
      };
    } else {
      // Backend expects flat structure: { calorieGoal: 3000, ... }
      goalsToValidate = nutritionGoals;
      goalsToSave = nutritionGoals;
    }

    // Validate that all required fields are positive numbers
    const requiredFields = ['calories', 'protein', 'carbs', 'fats', 'water'];
    const validationErrors = [];

    requiredFields.forEach(field => {
      const value = goalsToValidate[field];
      if (value === undefined || value === null) {
        validationErrors.push(`${field} is required`);
      } else if (typeof value !== 'number' || value <= 0) {
        validationErrors.push(`${field} must be a positive number`);
      }
    });

    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        message: "Validation failed", 
        errors: validationErrors 
      });
    }

    const db = getDb();
    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      { $set: { nutritionGoals: goalsToSave } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ 
      message: "Nutrition goals saved successfully",
      nutritionGoals: goalsToSave
    });
  } catch (err) {
    console.error("Save nutrition goals error:", err);
    res.status(500).json({ message: "Error saving nutrition goals" });
  }
});

// Save/update user's nutrition goals by userId (for new users without JWT)
router.post("/nutrition-goals-by-id", async (req, res) => {
  try {
    const nutritionGoals = req.body;
    const userId = req.query.userId;
    
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Validate required fields
    if (!nutritionGoals) {
      return res.status(400).json({ message: "Nutrition goals data is required" });
    }

    // Handle both nested goals structure and flat structure
    let goalsToValidate;
    let goalsToSave;
    
    if (nutritionGoals.goals) {
      // Frontend is sending nested structure: { goals: { calories: 3000, ... } }
      goalsToValidate = nutritionGoals.goals;
      goalsToSave = {
        calorieGoal: nutritionGoals.goals.calories,
        proteinGoal: nutritionGoals.goals.protein,
        carbsGoal: nutritionGoals.goals.carbs,
        fatGoal: nutritionGoals.goals.fats,
        waterIntakeGoal: nutritionGoals.goals.water
      };
    } else {
      // Backend expects flat structure: { calorieGoal: 3000, ... }
      goalsToValidate = nutritionGoals;
      goalsToSave = nutritionGoals;
    }

    // Validate that all required fields are positive numbers
    const requiredFields = ['calories', 'protein', 'carbs', 'fats', 'water'];
    const validationErrors = [];

    requiredFields.forEach(field => {
      const value = goalsToValidate[field];
      if (value === undefined || value === null) {
        validationErrors.push(`${field} is required`);
      } else if (typeof value !== 'number' || value <= 0) {
        validationErrors.push(`${field} must be a positive number`);
      }
    });

    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        message: "Validation failed", 
        errors: validationErrors 
      });
    }

    const db = getDb();
    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      { $set: { nutritionGoals: goalsToSave } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ 
      message: "Nutrition goals saved successfully",
      nutritionGoals: goalsToSave
    });
  } catch (err) {
    console.error("Save nutrition goals error:", err);
    res.status(500).json({ message: "Error saving nutrition goals" });
  }
});

// Update existing user's nutrition goals (protected route)
router.put("/nutrition-goals", authMiddleware, async (req, res) => {
  try {
    const nutritionGoals = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!nutritionGoals) {
      return res.status(400).json({ message: "Nutrition goals data is required" });
    }

    // Handle both nested goals structure and flat structure
    let goalsToValidate;
    let goalsToSave;
    
    if (nutritionGoals.goals) {
      // Frontend is sending nested structure: { goals: { calories: 3000, ... } }
      goalsToValidate = nutritionGoals.goals;
      goalsToSave = {
        calorieGoal: nutritionGoals.goals.calories,
        proteinGoal: nutritionGoals.goals.protein,
        carbsGoal: nutritionGoals.goals.carbs,
        fatGoal: nutritionGoals.goals.fats,
        waterIntakeGoal: nutritionGoals.goals.water
      };
    } else {
      // Backend expects flat structure: { calorieGoal: 3000, ... }
      goalsToValidate = nutritionGoals;
      goalsToSave = nutritionGoals;
    }

    // Validate that all required fields are positive numbers
    const requiredFields = ['calories', 'protein', 'carbs', 'fats', 'water'];
    const validationErrors = [];

    requiredFields.forEach(field => {
      const value = goalsToValidate[field];
      if (value === undefined || value === null) {
        validationErrors.push(`${field} is required`);
      } else if (typeof value !== 'number' || value <= 0) {
        validationErrors.push(`${field} must be a positive number`);
      }
    });

    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        message: "Validation failed", 
        errors: validationErrors 
      });
    }

    const db = getDb();
    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      { $set: { nutritionGoals: goalsToSave } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ 
      message: "Nutrition goals updated successfully",
      nutritionGoals: goalsToSave
    });
  } catch (err) {
    console.error("Update nutrition goals error:", err);
    res.status(500).json({ message: "Error updating nutrition goals" });
  }
});

// Update existing user's nutrition goals by userId (for new users without JWT)
router.put("/nutrition-goals-by-id", async (req, res) => {
  try {
    const nutritionGoals = req.body;
    const userId = req.query.userId;
    
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Validate required fields
    if (!nutritionGoals) {
      return res.status(400).json({ message: "Nutrition goals data is required" });
    }

    // Validate that all required fields are positive numbers
    const requiredFields = ['calorieGoal', 'proteinGoal', 'carbsGoal', 'fatGoal', 'waterIntakeGoal'];
    const validationErrors = [];

    requiredFields.forEach(field => {
      const value = nutritionGoals[field];
      if (value === undefined || value === null) {
        validationErrors.push(`${field} is required`);
      } else if (typeof value !== 'number' || value <= 0) {
        validationErrors.push(`${field} must be a positive number`);
      }
    });

    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        message: "Validation failed", 
        errors: validationErrors 
      });
    }

    const db = getDb();
    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      { $set: { nutritionGoals: nutritionGoals } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ 
      message: "Nutrition goals updated successfully",
      nutritionGoals: nutritionGoals
    });
  } catch (err) {
    console.error("Update nutrition goals error:", err);
    res.status(500).json({ message: "Error updating nutrition goals" });
  }
});

// Change password endpoint (protected route)
router.put("/change-password", authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current password and new password are required" });
    }

    // Validate new password
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ message: passwordValidation.message });
    }

    const db = getDb();
    const user = await db.collection("users").findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      { $set: { password: hashedNewPassword } }
    );

    res.status(200).json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ message: "Error changing password" });
  }
});

// Get user profile (protected route)
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const db = getDb();
    const user = await db.collection("users").findOne(
      { _id: new ObjectId(userId) },
      { projection: { password: 0 } } // Exclude password from response
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ 
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
        game_stats: user.game_stats
      }
    });
  } catch (err) {
    console.error("Get profile error:", err);
    res.status(500).json({ message: "Error retrieving profile" });
  }
});

// Update user profile (protected route)
router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const { email } = req.body;
    const userId = req.user.id;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      return res.status(400).json({ message: emailValidation.message });
    }

    const db = getDb();
    
    // Check if email is already taken by another user
    const existingUser = await db.collection("users").findOne({ 
      email: email,
      _id: { $ne: new ObjectId(userId) }
    });

    if (existingUser) {
      return res.status(400).json({ message: "Email is already taken" });
    }

    // Update user profile
    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      { $set: { email: email } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Profile updated successfully" });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ message: "Error updating profile" });
  }
});

// Nutrition streak management and daily reset endpoint
router.post("/nutrition-streak", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const db = getDb();
    
    // Get user's current game stats
    const user = await db.collection("users").findOne(
      { _id: new ObjectId(userId) },
      { projection: { game_stats: 1, nutritionGoals: 1 } }
    );
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const gameStats = user.game_stats || {
      dailyStreak: 0,
      pointTotal: 0,
      currentRank: 1,
      lastNutritionCheck: null,
      lastDailyReset: null,
      goalsCompletedToday: false,
      lastGoalsCompletedDate: null
    };
    
    const nutritionGoals = user.nutritionGoals;
    
    // Get today's date
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // Check if we need to do a daily reset (new day started)
    const lastResetDate = gameStats.lastDailyReset ? new Date(gameStats.lastDailyReset).toISOString().split('T')[0] : null;
    const lastGoalsDate = gameStats.lastGoalsCompletedDate ? new Date(gameStats.lastGoalsCompletedDate).toISOString().split('T')[0] : null;
    
    let updatedGameStats = { ...gameStats };
    let isNewDay = lastResetDate !== todayStr;
    
    // If it's a new day, handle the daily reset
    if (isNewDay) {
      console.log(`🌅 New day detected for user ${userId}. Last reset: ${lastResetDate}, Today: ${todayStr}`);
      
      // Reset daily flags for new day
      updatedGameStats.goalsCompletedToday = false;
      updatedGameStats.individualGoalsCompletedToday = {
        calories: false,
        protein: false,
        carbs: false,
        fat: false,
        water: false
      };
      updatedGameStats.lastDailyReset = new Date();
      
      // Only reset streak if we have clear evidence goals were NOT completed yesterday
      // Be conservative - don't reset streak unless we're certain
      if (lastGoalsDate && lastGoalsDate !== todayStr && lastResetDate) {
        // Calculate yesterday's date
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        // Only reset if goals were definitely not completed yesterday
        if (lastGoalsDate < yesterdayStr) {
          console.log(`📉 Goals not completed yesterday (${yesterdayStr}), last completed: ${lastGoalsDate}, resetting streak to 0`);
          updatedGameStats.dailyStreak = 0;
        } else {
          console.log(`✅ Goals were completed recently (${lastGoalsDate}), maintaining streak`);
        }
      } else {
        console.log(`ℹ️  Insufficient data to determine yesterday's goal completion, maintaining streak`);
      }
    }
    
    // Always check current nutrition status (allows real-time updates)
    const todayStart = new Date(today);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);
    
    // Get today's meals
    const todayMeals = await db.collection("meals").find({
      userId: new ObjectId(userId),
      createdAt: {
        $gte: todayStart,
        $lte: todayEnd
      }
    }).toArray();
    
    // Calculate today's nutrition totals
    const todayTotals = todayMeals.reduce((totals, meal) => {
      totals.calories += meal.calories || 0;
      totals.protein += meal.protein || 0;
      totals.carbs += meal.carbs || 0;
      totals.fat += meal.fat || 0;
      return totals;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
    
    // Get today's water intake
    const waterRecord = await db.collection("water_intake").findOne({
      userId: new ObjectId(userId),
      date: todayStr
    });
    const waterIntake = waterRecord ? waterRecord.intake : 0;
    
    // Check if nutrition goals are currently met
    let goalsMet = false;
    let goalsMetPercentage = 0;
    if (nutritionGoals) {
      const calorieGoal = nutritionGoals.calorieGoal || 2000;
      const proteinGoal = nutritionGoals.proteinGoal || 100;
      const carbsGoal = nutritionGoals.carbsGoal || 250;
      const fatGoal = nutritionGoals.fatGoal || 60;
      const waterGoal = nutritionGoals.waterIntakeGoal || 2000;
      
      // Calculate completion percentage for each goal
      const goalCompletions = [
        Math.min(todayTotals.calories / calorieGoal, 1),
        Math.min(todayTotals.protein / proteinGoal, 1),
        Math.min(todayTotals.carbs / carbsGoal, 1),
        Math.min(todayTotals.fat / fatGoal, 1),
        Math.min(waterIntake / waterGoal, 1)
      ];
      
      goalsMetPercentage = (goalCompletions.reduce((sum, completion) => sum + completion, 0) / goalCompletions.length) * 100;
      
      // Goals are met if user reached 100% of each goal (including water)
      goalsMet = (
        todayTotals.calories >= calorieGoal &&
        todayTotals.protein >= proteinGoal &&
        todayTotals.carbs >= carbsGoal &&
        todayTotals.fat >= fatGoal &&
        waterIntake >= waterGoal
      );
    }
    
    let individualGoalsCompleted = 0;
    let totalPointsAwarded = 0;
    
    // Check individual goal completions
    const calorieGoal = nutritionGoals?.calorieGoal || 2000;
    const proteinGoal = nutritionGoals?.proteinGoal || 100;
    const carbsGoal = nutritionGoals?.carbsGoal || 250;
    const fatGoal = nutritionGoals?.fatGoal || 60;
    const waterGoal = nutritionGoals?.waterIntakeGoal || 2000;
    
    // Track which individual goals are completed
    const individualGoals = {
      calories: todayTotals.calories >= calorieGoal,
      protein: todayTotals.protein >= proteinGoal,
      carbs: todayTotals.carbs >= carbsGoal,
      fat: todayTotals.fat >= fatGoal,
      water: waterIntake >= waterGoal
    };
    
    // Count completed individual goals
    individualGoalsCompleted = Object.values(individualGoals).filter(completed => completed).length;
    
    // Get previously completed individual goals for today
    const previouslyCompletedGoals = updatedGameStats.individualGoalsCompletedToday || {
      calories: false,
      protein: false,
      carbs: false,
      fat: false,
      water: false
    };
    
    // Calculate newly completed goals
    const newlyCompletedGoals = {
      calories: individualGoals.calories && !previouslyCompletedGoals.calories,
      protein: individualGoals.protein && !previouslyCompletedGoals.protein,
      carbs: individualGoals.carbs && !previouslyCompletedGoals.carbs,
      fat: individualGoals.fat && !previouslyCompletedGoals.fat,
      water: individualGoals.water && !previouslyCompletedGoals.water
    };
    
    // Count newly completed goals
    const newlyCompletedCount = Object.values(newlyCompletedGoals).filter(completed => completed).length;
    
    // Award 10 points for each newly completed individual goal
    if (newlyCompletedCount > 0) {
      const pointsForNewGoals = newlyCompletedCount * 10;
      updatedGameStats.pointTotal = (updatedGameStats.pointTotal || 0) + pointsForNewGoals;
      totalPointsAwarded += pointsForNewGoals;
      
      // Update the tracking of completed individual goals
      updatedGameStats.individualGoalsCompletedToday = {
        calories: individualGoals.calories,
        protein: individualGoals.protein,
        carbs: individualGoals.carbs,
        fat: individualGoals.fat,
        water: individualGoals.water
      };
      
      console.log(`🎯 Newly completed goals: ${newlyCompletedCount}, Awarding ${pointsForNewGoals} points`);
    }
    
    // Handle all goals completion - award bonus points and increase streak
    if (goalsMet && !updatedGameStats.goalsCompletedToday) {
      console.log(`🎉 ALL goals completed for user ${userId}! Awarding bonus points and increasing streak.`);
      
      // Award 50 bonus points for completing all goals
      updatedGameStats.pointTotal += 50;
      totalPointsAwarded += 50;
      
      // Increase streak
      updatedGameStats.dailyStreak = (updatedGameStats.dailyStreak || 0) + 1;
      updatedGameStats.goalsCompletedToday = true;
      updatedGameStats.lastGoalsCompletedDate = new Date();
      
      console.log(`📈 New streak: ${updatedGameStats.dailyStreak}, Total points awarded: ${totalPointsAwarded}`);
    }
    
    // Always calculate rank based on current streak (immediate updates)
    const previousRank = updatedGameStats.currentRank;
    updatedGameStats.currentRank = calculateRank(updatedGameStats.dailyStreak);
    
    // Log rank changes
    if (previousRank !== updatedGameStats.currentRank) {
      const rankNames = { 1: 'Bronze', 2: 'Silver', 3: 'Gold' };
      console.log(`🏆 Rank updated for user ${userId}: ${rankNames[previousRank]} → ${rankNames[updatedGameStats.currentRank]}`);
    }
    
    // Update user's game stats in database
    await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      { $set: { game_stats: updatedGameStats } }
    );
    
    // Return detailed response with current status
    res.status(200).json({
      message: "Nutrition streak updated successfully",
      game_stats: updatedGameStats,
      today_status: {
        goals_met: goalsMet,
        goals_completion_percentage: Math.round(goalsMetPercentage),
        goals_completed_today: updatedGameStats.goalsCompletedToday,
        is_new_day: isNewDay,
        total_points_awarded: totalPointsAwarded,
        individual_goals_completed: individualGoalsCompleted,
        individual_goals: individualGoals,
        nutrition_totals: {
          ...todayTotals,
          water: waterIntake
        }
      }
    });
    
  } catch (err) {
    console.error("Nutrition streak update error:", err);
    res.status(500).json({ message: "Error updating nutrition streak" });
  }
});

// Safe rank update endpoint - called on login, no streak resets
router.post("/update-rank", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const db = getDb();
    
    // Get user's current game stats
    const user = await db.collection("users").findOne(
      { _id: new ObjectId(userId) },
      { projection: { game_stats: 1, username: 1 } }
    );
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const gameStats = user.game_stats || {
      dailyStreak: 0,
      pointTotal: 0,
      currentRank: 1
    };
    
    // Calculate correct rank based on current streak
    const correctRank = calculateRank(gameStats.dailyStreak);
    
    // Only update if rank changed
    if (correctRank !== gameStats.currentRank) {
      console.log(`🏆 Updating rank for ${user.username}: ${gameStats.currentRank} → ${correctRank} (${gameStats.dailyStreak} day streak)`);
      
      await db.collection("users").updateOne(
        { _id: new ObjectId(userId) },
        { $set: { "game_stats.currentRank": correctRank } }
      );
      
      // Update local object for response
      gameStats.currentRank = correctRank;
    }
    
    res.status(200).json({
      message: "Rank updated successfully", 
      game_stats: gameStats
    });
    
  } catch (err) {
    console.error("Update rank error:", err);
    res.status(500).json({ message: "Error updating rank" });
  }
});

// Separate endpoint for daily goal checking (replaces auto-call from nutrition/today)
router.post("/check-daily-goals", authMiddleware, async (req, res) => {
  const userId = req.user.id; // Move outside try block to ensure it's accessible in catch
  try {
    const db = getDb();
    
    // Get user's current game stats and nutrition goals
    const user = await db.collection("users").findOne(
      { _id: new ObjectId(userId) },
      { projection: { game_stats: 1, nutritionGoals: 1, username: 1 } }
    );
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const gameStats = user.game_stats || {
      dailyStreak: 0,
      pointTotal: 0,
      currentRank: 1,
      goalsCompletedToday: false,
      lastGoalsCompletedDate: null,
      lastDailyReset: null
    };
    
    const nutritionGoals = user.nutritionGoals;
    
    // Get today's date
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // Calculate today's nutrition totals
    const todayStart = new Date(today);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);
    
    const todayMeals = await db.collection("meals").find({
      userId: new ObjectId(userId),
      createdAt: { $gte: todayStart, $lte: todayEnd }
    }).toArray();
    
    const todayTotals = todayMeals.reduce((totals, meal) => {
      totals.calories += meal.calories || 0;
      totals.protein += meal.protein || 0;
      totals.carbs += meal.carbs || 0;
      totals.fat += meal.fat || 0;
      return totals;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
    
    // Get today's water intake
    const waterRecord = await db.collection("water_intake").findOne({
      userId: new ObjectId(userId),
      date: todayStr
    });
    const waterIntake = waterRecord ? waterRecord.intake : 0;
    
    // Check if nutrition goals are currently met
    let goalsMet = false;
    let goalsMetPercentage = 0;
    if (nutritionGoals) {
      const calorieGoal = nutritionGoals.calorieGoal || 2000;
      const proteinGoal = nutritionGoals.proteinGoal || 100;
      const carbsGoal = nutritionGoals.carbsGoal || 250;
      const fatGoal = nutritionGoals.fatGoal || 60;
      const waterGoal = nutritionGoals.waterIntakeGoal || 2000;
      
      const goalCompletions = [
        Math.min(todayTotals.calories / calorieGoal, 1),
        Math.min(todayTotals.protein / proteinGoal, 1),
        Math.min(todayTotals.carbs / carbsGoal, 1),
        Math.min(todayTotals.fat / fatGoal, 1),
        Math.min(waterIntake / waterGoal, 1)
      ];
      
      goalsMetPercentage = (goalCompletions.reduce((sum, completion) => sum + completion, 0) / goalCompletions.length) * 100;
      
      // Goals are met if user reached 100% of each goal (including water)
      goalsMet = (
        todayTotals.calories >= calorieGoal &&
        todayTotals.protein >= proteinGoal &&
        todayTotals.carbs >= carbsGoal &&
        todayTotals.fat >= fatGoal &&
        waterIntake >= waterGoal
      );
    }
    
    let updatedGameStats = { ...gameStats };
    let pointsAwarded = false;
    let individualGoalsCompleted = 0;
    let totalPointsAwarded = 0;
    
    // Check individual goal completions
    const calorieGoal = nutritionGoals?.calorieGoal || 2000;
    const proteinGoal = nutritionGoals?.proteinGoal || 100;
    const carbsGoal = nutritionGoals?.carbsGoal || 250;
    const fatGoal = nutritionGoals?.fatGoal || 60;
    const waterGoal = nutritionGoals?.waterIntakeGoal || 2000;
    
    // Track which individual goals are completed
    const individualGoals = {
      calories: todayTotals.calories >= calorieGoal,
      protein: todayTotals.protein >= proteinGoal,
      carbs: todayTotals.carbs >= carbsGoal,
      fat: todayTotals.fat >= fatGoal,
      water: waterIntake >= waterGoal
    };
    
    // Count completed individual goals
    individualGoalsCompleted = Object.values(individualGoals).filter(completed => completed).length;
    
    // Get previously completed individual goals for today
    const previouslyCompletedGoals = gameStats.individualGoalsCompletedToday || {
      calories: false,
      protein: false,
      carbs: false,
      fat: false,
      water: false
    };
    
    // Calculate newly completed goals
    const newlyCompletedGoals = {
      calories: individualGoals.calories && !previouslyCompletedGoals.calories,
      protein: individualGoals.protein && !previouslyCompletedGoals.protein,
      carbs: individualGoals.carbs && !previouslyCompletedGoals.carbs,
      fat: individualGoals.fat && !previouslyCompletedGoals.fat,
      water: individualGoals.water && !previouslyCompletedGoals.water
    };
    
    // Count newly completed goals
    const newlyCompletedCount = Object.values(newlyCompletedGoals).filter(completed => completed).length;
    
    // Always update individual goal tracking
    updatedGameStats.individualGoalsCompletedToday = {
      calories: individualGoals.calories,
      protein: individualGoals.protein,
      carbs: individualGoals.carbs,
      fat: individualGoals.fat,
      water: individualGoals.water
    };
    
    // Award 10 points for each newly completed individual goal
    if (newlyCompletedCount > 0) {
      const pointsForNewGoals = newlyCompletedCount * 10;
      updatedGameStats.pointTotal = (gameStats.pointTotal || 0) + pointsForNewGoals;
      totalPointsAwarded += pointsForNewGoals;
      
      console.log(`🎯 Newly completed goals: ${newlyCompletedCount}, Awarding ${pointsForNewGoals} points`);
      console.log(`🎯 Previous points: ${gameStats.pointTotal || 0}, New total: ${updatedGameStats.pointTotal}`);
    } else {
      console.log(`ℹ️ No newly completed goals for ${user.username}`);
    }
    
    // Handle all goals completion - award bonus points and increase streak
    if (goalsMet && !gameStats.goalsCompletedToday) {
      console.log(`🎉 ALL goals completed for user ${user.username}! Awarding bonus points and increasing streak.`);
      
      // Award 50 bonus points for completing all goals
      updatedGameStats.pointTotal += 50;
      totalPointsAwarded += 50;
      
      // Increase streak
      updatedGameStats.dailyStreak = (gameStats.dailyStreak || 0) + 1;
      updatedGameStats.goalsCompletedToday = true;
      updatedGameStats.lastGoalsCompletedDate = new Date();
      pointsAwarded = true;
      
      console.log(`📈 New streak: ${updatedGameStats.dailyStreak}, Total points awarded: ${totalPointsAwarded}`);
    }
    
    // Update rank based on current streak
    const previousRank = updatedGameStats.currentRank;
    updatedGameStats.currentRank = calculateRank(updatedGameStats.dailyStreak);
    
    // Log rank changes
    if (previousRank !== updatedGameStats.currentRank) {
      const rankNames = { 1: 'Bronze', 2: 'Silver', 3: 'Gold' };
      console.log(`🏆 Rank updated for user ${user.username}: ${rankNames[previousRank]} → ${rankNames[updatedGameStats.currentRank]}`);
    }
    
    // Always update database to ensure immediate updates for admin dashboard
    // This ensures individual goal tracking and points are immediately saved
    console.log(`🔄 Attempting to update database for user ${user.username}`);
    console.log(`🔄 updatedGameStats:`, JSON.stringify(updatedGameStats, null, 2));
    
    const updateResult = await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      { $set: { game_stats: updatedGameStats } }
    );
    
    if (!updateResult.acknowledged || updateResult.modifiedCount === 0) {
      console.error(`❌ Database update failed for user ${userId}:`, updateResult);
      throw new Error("Failed to update user game stats in database");
    }
    
    console.log(`💾 Database update result:`, updateResult);
    console.log(`💾 Points in updatedGameStats: ${updatedGameStats.pointTotal}`);
    
    if (totalPointsAwarded > 0) {
      console.log(`💾 Database updated: ${totalPointsAwarded} points awarded to ${user.username}`);
    } else {
      console.log(`ℹ️ No points awarded this time for ${user.username}`);
    }
    
    // Verify the update by reading back from database
    const verifyUser = await db.collection("users").findOne(
      { _id: new ObjectId(userId) },
      { projection: { game_stats: 1 } }
    );
    console.log(`✅ Verified database state - Points: ${verifyUser?.game_stats?.pointTotal || 0}`);
    
    res.status(200).json({
      message: "Daily goals checked successfully",
      game_stats: updatedGameStats,
      goals_status: {
        goals_met: goalsMet,
        goals_completion_percentage: Math.round(goalsMetPercentage),
        points_awarded: pointsAwarded,
        total_points_awarded: totalPointsAwarded,
        individual_goals_completed: individualGoalsCompleted,
        individual_goals: individualGoals,
        nutrition_totals: { ...todayTotals, water: waterIntake }
      }
    });
    
  } catch (err) {
    console.error("❌ Check daily goals error for user", userId, ":", err);
    console.error("❌ Error stack:", err.stack);
    res.status(500).json({ 
      message: "Error checking daily goals",
      error: err.message,
      userId: userId
    });
  }
});

export default router; 