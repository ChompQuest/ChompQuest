import express from "express";
import { getDb } from "../db/connection.js";
import { ObjectId } from "mongodb";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

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
        dailyStreak: 0,
        pointTotal: 0,
        currentRank: 1 // 1 = Bronze, 2 = Silver, 3 = Gold
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

    res.status(200).json({ 
      nutritionGoals: user.nutritionGoals || null 
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

    const db = getDb();
    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      { $set: { nutritionGoals: nutritionGoals } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ 
      message: "Nutrition goals saved successfully" 
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

    const db = getDb();
    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      { $set: { nutritionGoals: nutritionGoals } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ 
      message: "Nutrition goals saved successfully" 
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

    const db = getDb();
    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      { $set: { nutritionGoals: nutritionGoals } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ 
      message: "Nutrition goals updated successfully" 
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

    const db = getDb();
    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      { $set: { nutritionGoals: nutritionGoals } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ 
      message: "Nutrition goals updated successfully" 
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

export default router; 