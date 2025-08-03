import express from "express";
import { getDb } from "../db/connection.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
import { ObjectId } from "mongodb";

const router = express.Router();

// ===== USER MANAGEMENT ENDPOINTS =====

// Get all users (admin only) - with optional filtering for members only and search
router.get("/users", adminMiddleware, async (req, res) => {
  try {
    const db = getDb();
    const { role, search, limit } = req.query;
    
    // Build query filter
    let filter = {};
    
    // Filter by role if specified (e.g., only members)
    if (role) {
      filter.role = role;
    }
    
    // Add search functionality
    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    let query = db.collection("users")
      .find(filter, { 
        projection: { 
          password: 0 // Don't include passwords in response
        } 
      })
      .sort({ createdAt: -1 });
    
    // Apply limit if specified
    if (limit) {
      query = query.limit(parseInt(limit));
    }
    
    const users = await query.toArray();

    res.status(200).json({
      message: "Users retrieved successfully",
      users: users.map(user => ({
        id: user._id.toString(),
        name: user.username, // Map username to name for frontend compatibility
        username: user.username,
        email: user.email,
        role: user.role || 'member',
        registrationDate: user.createdAt,
        game_stats: user.game_stats || {
          dailyStreak: 0,
          pointTotal: 0,
          currentRank: 1
        }
      }))
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Error fetching users" });
  }
});

// Get user by ID (admin only)
router.get("/users/:id", adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const db = getDb();
    const user = await db.collection("users").findOne(
      { _id: new ObjectId(id) },
      { projection: { password: 0 } }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User retrieved successfully",
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        role: user.role || 'member',
        registrationDate: user.createdAt,
        game_stats: user.game_stats || {
          dailyStreak: 0,
          pointTotal: 0,
          currentRank: 1
        },
        nutritionGoals: user.nutritionGoals
      }
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Error fetching user" });
  }
});

// Update user role (admin only)
router.put("/users/:id/role", adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    if (!role || !['member', 'admin'].includes(role)) {
      return res.status(400).json({ message: "Invalid role. Must be 'member' or 'admin'" });
    }

    const db = getDb();
    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(id) },
      { $set: { role: role } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User role updated successfully",
      userId: id,
      newRole: role
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    res.status(500).json({ message: "Error updating user role" });
  }
});

// Update user game stats (admin only)
router.put("/users/:id/stats", adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { points, streak } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    if (typeof points !== 'number' || typeof streak !== 'number') {
      return res.status(400).json({ message: "Points and streak must be numbers" });
    }

    if (points < 0 || streak < 0) {
      return res.status(400).json({ message: "Points and streak cannot be negative" });
    }

    const db = getDb();
    
    // Get current user state first
    const user = await db.collection("users").findOne(
      { _id: new ObjectId(id) },
      { projection: { game_stats: 1, username: 1 } }
    );
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const currentGameStats = user.game_stats || {};
    
    // Calculate correct rank based on new streak
    function calculateRank(dailyStreak) {
      if (dailyStreak >= 30) {
        return 3; // Gold
      } else if (dailyStreak >= 15) {
        return 2; // Silver
      } else {
        return 1; // Bronze (0-14 days)
      }
    }
    
    const newRank = calculateRank(streak);
    
    // Smart date logic: Set lastGoalsCompletedDate to yesterday if user hasn't completed goals today
    // This allows the user to complete goals today and increase their streak
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    let lastGoalsCompletedDate = currentGameStats.lastGoalsCompletedDate;
    let goalsCompletedToday = currentGameStats.goalsCompletedToday || false;
    
    // If user hasn't completed goals today, set lastGoalsCompletedDate to yesterday
    // so they can complete today's goals and increase the admin-set streak
    if (!goalsCompletedToday) {
      lastGoalsCompletedDate = yesterday;
      console.log(`📅 Admin override: Setting lastGoalsCompletedDate to yesterday for ${user.username} (streak ${streak})`);
    } else {
      console.log(`ℹ️  User ${user.username} already completed goals today, keeping current date`);
    }
    
    const updateData = {
      "game_stats.pointTotal": points,
      "game_stats.dailyStreak": streak,
      "game_stats.currentRank": newRank,
      "game_stats.lastGoalsCompletedDate": lastGoalsCompletedDate,
      "game_stats.adminModified": true,
      "game_stats.lastAdminUpdate": new Date()
    };
    
    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const rankNames = { 1: 'Bronze', 2: 'Silver', 3: 'Gold' };
    console.log(`🔧 Admin updated ${user.username}: ${streak} days (${rankNames[newRank]}), ${points} points`);

    res.status(200).json({
      message: "User stats updated successfully",
      userId: id,
      newStats: { 
        points, 
        streak, 
        rank: newRank,
        rankName: rankNames[newRank],
        lastGoalsCompletedDate: lastGoalsCompletedDate,
        canCompleteToday: !goalsCompletedToday
      }
    });
  } catch (error) {
    console.error("Error updating user stats:", error);
    res.status(500).json({ message: "Error updating user stats" });
  }
});

// Delete user (admin only)
router.delete("/users/:id", adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // Prevent admin from deleting themselves
    if (id === req.user.id) {
      return res.status(400).json({ message: "Cannot delete your own account" });
    }

    const db = getDb();
    
    // Also delete user's meals
    await db.collection("meals").deleteMany({ userId: new ObjectId(id) });
    
    const result = await db.collection("users").deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User deleted successfully",
      deletedUserId: id
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Error deleting user" });
  }
});

// ===== FOOD ITEM MANAGEMENT ENDPOINTS =====

// Get all food items (admin only)
router.get("/food-items", adminMiddleware, async (req, res) => {
  try {
    const db = getDb();
    const foodItems = await db.collection("food_items")
      .find({})
      .sort({ name: 1 })
      .toArray();

    res.status(200).json({
      message: "Food items retrieved successfully",
      foodItems: foodItems.map(item => ({
        id: item._id.toString(),
        name: item.name,
        calories: item.calories,
        protein: item.protein,
        carbs: item.carbs,
        fats: item.fats,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      }))
    });
  } catch (error) {
    console.error("Error fetching food items:", error);
    res.status(500).json({ message: "Error fetching food items" });
  }
});

// Create food item (admin only)
router.post("/food-items", adminMiddleware, async (req, res) => {
  try {
    const { name, calories, protein, carbs, fats } = req.body;

    // Validation
    if (!name || typeof calories !== 'number' || typeof protein !== 'number' || 
        typeof carbs !== 'number' || typeof fats !== 'number') {
      return res.status(400).json({ 
        message: "All fields are required and must be valid numbers" 
      });
    }

    if (calories < 0 || protein < 0 || carbs < 0 || fats < 0) {
      return res.status(400).json({ 
        message: "Nutritional values cannot be negative" 
      });
    }

    const db = getDb();
    
    // Check if food item already exists
    const existingItem = await db.collection("food_items").findOne({ name });
    if (existingItem) {
      return res.status(400).json({ message: "Food item already exists" });
    }

    const newFoodItem = {
      name,
      calories,
      protein,
      carbs,
      fats,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: req.user.id
    };

    const result = await db.collection("food_items").insertOne(newFoodItem);

    res.status(201).json({
      message: "Food item created successfully",
      foodItem: {
        id: result.insertedId.toString(),
        ...newFoodItem
      }
    });
  } catch (error) {
    console.error("Error creating food item:", error);
    res.status(500).json({ message: "Error creating food item" });
  }
});

// Update food item (admin only)
router.put("/food-items/:id", adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, calories, protein, carbs, fats } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid food item ID" });
    }

    // Validation
    if (!name || typeof calories !== 'number' || typeof protein !== 'number' || 
        typeof carbs !== 'number' || typeof fats !== 'number') {
      return res.status(400).json({ 
        message: "All fields are required and must be valid numbers" 
      });
    }

    if (calories < 0 || protein < 0 || carbs < 0 || fats < 0) {
      return res.status(400).json({ 
        message: "Nutritional values cannot be negative" 
      });
    }

    const db = getDb();
    const result = await db.collection("food_items").updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: {
          name,
          calories,
          protein,
          carbs,
          fats,
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Food item not found" });
    }

    res.status(200).json({
      message: "Food item updated successfully",
      foodItemId: id
    });
  } catch (error) {
    console.error("Error updating food item:", error);
    res.status(500).json({ message: "Error updating food item" });
  }
});

// Delete food item (admin only)
router.delete("/food-items/:id", adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid food item ID" });
    }

    const db = getDb();
    const result = await db.collection("food_items").deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Food item not found" });
    }

    res.status(200).json({
      message: "Food item deleted successfully",
      deletedFoodItemId: id
    });
  } catch (error) {
    console.error("Error deleting food item:", error);
    res.status(500).json({ message: "Error deleting food item" });
  }
});

// ===== SYSTEM STATISTICS ENDPOINTS =====

// Get system statistics (admin only)
router.get("/stats", adminMiddleware, async (req, res) => {
  try {
    const db = getDb();

    // Get user statistics
    const totalUsers = await db.collection("users").countDocuments();
    const adminUsers = await db.collection("users").countDocuments({ role: "admin" });
    const memberUsers = totalUsers - adminUsers;

    // Get meal statistics
    const totalMeals = await db.collection("meals").countDocuments();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const mealsToday = await db.collection("meals").countDocuments({
      createdAt: { $gte: today, $lt: tomorrow }
    });

    // Get food item statistics
    const totalFoodItems = await db.collection("food_items").countDocuments();

    res.status(200).json({
      message: "System statistics retrieved successfully",
      stats: {
        users: {
          total: totalUsers,
          admins: adminUsers,
          members: memberUsers
        },
        meals: {
          total: totalMeals,
          today: mealsToday
        },
        foodItems: {
          total: totalFoodItems
        }
      }
    });
  } catch (error) {
    console.error("Error fetching system statistics:", error);
    res.status(500).json({ message: "Error fetching system statistics" });
  }
});

export default router;