import express from "express";
import { getDb } from "../db/connection.js";
import { ObjectId } from "mongodb";
import jwt from "jsonwebtoken";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// User registration endpoint
router.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Basic validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user already exists
    const db = getDb();
    const existingUser = await db.collection("users").findOne({ 
      $or: [{ email }, { username }] 
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create new user with game stats
    const newUser = {
      username,
      email,
      password, // TODO: Hash password before storing
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
    
    res.status(201).json({ 
      message: "User created successfully",
      userId: result.insertedId.toString(),
      username: username
    });
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

    // Check if user exists by username only
    const db = getDb();
    const user = await db.collection("users").findOne({ 
      username: username,
      password: password 
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Create JWT payload
    const payload = {
      user: {
        id: user._id.toString(),
        username: user.username,
        role: 'member'
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
            email: user.email
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

export default router; 