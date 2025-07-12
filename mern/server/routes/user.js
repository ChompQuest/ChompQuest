import express from "express";
import { getDb } from "../db/connection.js";
import { ObjectId } from "mongodb";

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

    // Create new user (in production, hash the password!)
    const newUser = {
      username,
      email,
      password, // TODO: Hash password before storing
      createdAt: new Date(),
      goals: [],
      progress: {}
    };

    const result = await db.collection("users").insertOne(newUser);
    
    res.status(201).json({ 
      message: "User created successfully",
      userId: result.insertedId 
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

    res.status(200).json({ 
      message: "Login successful",
      userId: user._id,
      username: user.username
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error during login" });
  }
});

// Get user's nutrition goals
router.get("/nutrition-goals", async (req, res) => {
  try {
    // TODO: Get userId from authentication token/session
    const userId = req.query.userId; // Temporary - should come from auth
    
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

// Save/update user's nutrition goals
router.post("/nutrition-goals", async (req, res) => {
  try {
    const nutritionGoals = req.body;
    // TODO: Get userId from authentication token/session
    const userId = req.query.userId; // Temporary - should come from auth
    
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

// Update existing user's nutrition goals
router.put("/nutrition-goals", async (req, res) => {
  try {
    const nutritionGoals = req.body;
    // TODO: Get userId from authentication token/session
    const userId = req.query.userId; // Temporary - should come from auth
    
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