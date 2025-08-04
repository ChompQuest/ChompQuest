import express from "express";
import { getDb } from "../db/connection.js";
import { ObjectId } from "mongodb";
import authMiddleware from "../middleware/authMiddleware.js";
import fetch from "node-fetch";

const router = express.Router();

// Helper function to get start and end of day in UTC timezone (consistent with date strings)
const getDayBounds = (userTimezone = 'UTC') => {
  // Use UTC date to match the date strings used for water intake
  const todayStr = new Date().toISOString().split('T')[0];
  const startOfDay = new Date(todayStr + 'T00:00:00.000Z');
  const endOfDay = new Date(todayStr + 'T23:59:59.999Z');
  
  return { startOfDay, endOfDay };
};



// Helper function to aggregate nutrition totals
// This function is used to aggregate the nutrition totals for the current day.
// It takes in an array of meals and returns an object with the total calories, protein, carbs, fat, fiber, sugar, and sodium.
// Note: I could have used a library like lodash to do this, but I wanted to keep it simple and easy to understand.
//       I also added the fiber, sugar, and sodium fields to the meal object, but I didn't use them in the frontend.
const aggregateNutritionTotals = (meals) => {
  return meals.reduce((totals, meal) => {
    totals.calories += meal.calories || 0;
    totals.protein += meal.protein || 0;
    totals.carbs += meal.carbs || 0;
    totals.fat += meal.fat || 0;
    totals.fiber += meal.fiber || 0;
    totals.sugar += meal.sugar || 0;
    totals.sodium += meal.sodium || 0;
    return totals;
  }, {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    sugar: 0,
    sodium: 0
  });
};

// GET /nutrition/today - Get daily nutrition totals for logged-in user
router.get("/today", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const db = getDb();
    
    // Get user's nutrition goals
    const user = await db.collection("users").findOne(
      { _id: new ObjectId(userId) },
      { projection: { nutritionGoals: 1, game_stats: 1 } }
    );
    
    const nutritionGoals = user?.nutritionGoals || null;
    const gameStats = user?.game_stats || null;
    
    // Get start and end of current day
    const { startOfDay, endOfDay } = getDayBounds();
    
    // Get all meals for the current day
    const meals = await db.collection("meals").find({
      userId: new ObjectId(userId),
      createdAt: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    }).toArray();
    
    // Aggregate nutrition totals
    const dailyTotals = aggregateNutritionTotals(meals);
    
    // Get today's water intake
    const todayStr = new Date().toISOString().split('T')[0];
    const waterRecord = await db.collection("water_intake").findOne({
      userId: new ObjectId(userId),
      date: todayStr
    });
    const waterIntake = waterRecord ? waterRecord.intake : 0;
    
    // Structure response for frontend consumption
    const response = {
      date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
      totals: {
        ...dailyTotals,
        water: waterIntake
      },
      goals: nutritionGoals ? {
        calories: nutritionGoals.calorieGoal || 2000,
        protein: nutritionGoals.proteinGoal || 100,
        carbs: nutritionGoals.carbsGoal || 250,
        fat: nutritionGoals.fatGoal || 60,
        water: nutritionGoals.waterIntakeGoal || 2000
      } : {
        calories: 2000,
        protein: 100,
        carbs: 250,
        fat: 60,
        water: 2000
      },
      meals: meals.length,
      gameStats: gameStats,
      progress: {
        calories: {
          current: dailyTotals.calories,
          goal: nutritionGoals?.calorieGoal || 2000,
          percentage: Math.round((dailyTotals.calories / (nutritionGoals?.calorieGoal || 2000)) * 100)
        },
        protein: {
          current: dailyTotals.protein,
          goal: nutritionGoals?.proteinGoal || 100,
          percentage: Math.round((dailyTotals.protein / (nutritionGoals?.proteinGoal || 100)) * 100)
        },
        carbs: {
          current: dailyTotals.carbs,
          goal: nutritionGoals?.carbsGoal || 250,
          percentage: Math.round((dailyTotals.carbs / (nutritionGoals?.carbsGoal || 250)) * 100)
        },
        fat: {
          current: dailyTotals.fat,
          goal: nutritionGoals?.fatGoal || 60,
          percentage: Math.round((dailyTotals.fat / (nutritionGoals?.fatGoal || 60)) * 100)
        },
        water: {
          current: waterIntake,
          goal: nutritionGoals?.waterIntakeGoal || 2000,
          percentage: Math.round((waterIntake / (nutritionGoals?.waterIntakeGoal || 2000)) * 100)
        }
      }
    };
    
    res.status(200).json(response);
    
  } catch (err) {
    console.error("Get daily nutrition totals error:", err);
    res.status(500).json({ message: "Error retrieving daily nutrition totals" });
  }
});

// POST /nutrition/meals - Add a new meal
router.post("/meals", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      name,
      calories,
      protein,
      carbs,
      fat,
      fiber,
      sugar,
      sodium,
      mealType, // breakfast, lunch, dinner, snack
      notes
    } = req.body;
    
    // Validate required fields
    if (!name || calories === undefined) {
      return res.status(400).json({ 
        message: "Meal name and calories are required" 
      });
    }
    
    const db = getDb();
    
    const newMeal = {
      userId: new ObjectId(userId),
      name,
      calories: Number(calories),
      protein: Number(protein) || 0,
      carbs: Number(carbs) || 0,
      fat: Number(fat) || 0,
      fiber: Number(fiber) || 0,
      sugar: Number(sugar) || 0,
      sodium: Number(sodium) || 0,
      mealType: mealType || 'snack',
      notes: notes || '',
      createdAt: new Date()
    };
    
    const result = await db.collection("meals").insertOne(newMeal);
    
    // Fetch the inserted meal
    const insertedMeal = await db.collection("meals").findOne({ 
      _id: result.insertedId 
    });
    
    res.status(201).json({
      message: "Meal added successfully",
      meal: insertedMeal
    });
    
  } catch (err) {
    console.error("Add meal error:", err);
    res.status(500).json({ message: "Error adding meal" });
  }
});

// GET /nutrition/meals - Get all meals for the current day
router.get("/meals", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const db = getDb();
    
    const { startOfDay, endOfDay } = getDayBounds();
    
    const meals = await db.collection("meals").find({
      userId: new ObjectId(userId),
      createdAt: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    }).sort({ createdAt: -1 }).toArray();
    
    res.status(200).json({ meals });
    
  } catch (err) {
    console.error("Get meals error:", err);
    res.status(500).json({ message: "Error retrieving meals" });
  }
});

// DELETE /nutrition/meals/:id - Delete a meal
router.delete("/meals/:id", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const mealId = req.params.id;
    const db = getDb();
    
    // Ensure user can only delete their own meals
    const result = await db.collection("meals").deleteOne({
      _id: new ObjectId(mealId),
      userId: new ObjectId(userId)
    });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Meal not found or unauthorized" });
    }
    
    res.status(200).json({ message: "Meal deleted successfully" });
    
  } catch (err) {
    console.error("Delete meal error:", err);
    res.status(500).json({ message: "Error deleting meal" });
  }
});

// PUT /nutrition/meals/:id - Update a meal
router.put("/meals/:id", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const mealId = req.params.id;
    const updateData = req.body;
    const db = getDb();
    
    // Ensure user can only update their own meals
    const result = await db.collection("meals").updateOne(
      {
        _id: new ObjectId(mealId),
        userId: new ObjectId(userId)
      },
      {
        $set: {
          name: updateData.name,
          calories: Number(updateData.calories),
          protein: Number(updateData.protein) || 0,
          carbs: Number(updateData.carbs) || 0,
          fat: Number(updateData.fat) || 0,
          fiber: Number(updateData.fiber) || 0,
          sugar: Number(updateData.sugar) || 0,
          sodium: Number(updateData.sodium) || 0,
          mealType: updateData.mealType || 'snack',
          notes: updateData.notes || '',
          updatedAt: new Date()
        }
      }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Meal not found or unauthorized" });
    }
    
    res.status(200).json({ message: "Meal updated successfully" });
    
  } catch (err) {
    console.error("Update meal error:", err);
    res.status(500).json({ message: "Error updating meal" });
  }
});

// GET /nutrition/meals/recent - Get last 10 meals for logged-in user
router.get("/meals/recent", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const db = getDb();
    
    // Get last 10 meals for the user, sorted by most recent first
    const recentMeals = await db.collection("meals").find({
      userId: new ObjectId(userId)
    })
    .sort({ createdAt: -1 }) // Sort by creation date, most recent first
    .limit(10) // Limit to 10 meals
    .toArray();
    
    res.status(200).json({ meals: recentMeals });
    
  } catch (err) {
    console.error("Get recent meals error:", err);
    res.status(500).json({ message: "Error retrieving recent meals" });
  }
});

// GET /nutrition/water - Get today's water intake
router.get("/water", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const db = getDb();
    
    // Get today's date
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // Get today's water intake
    const waterRecord = await db.collection("water_intake").findOne({
      userId: new ObjectId(userId),
      date: todayStr
    });
    
    const waterIntake = waterRecord ? waterRecord.intake : 0;
    
    res.status(200).json({ 
      waterIntake,
      date: todayStr
    });
    
  } catch (err) {
    console.error("Get water intake error:", err);
    res.status(500).json({ message: "Error retrieving water intake" });
  }
});

// POST /nutrition/water - Add water intake
router.post("/water", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { intake } = req.body;
    const db = getDb();
    
    if (typeof intake !== 'number' || intake < 0) {
      return res.status(400).json({ message: "Water intake must be a positive number" });
    }
    
    // Get today's date
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // Upsert water intake for today
    const result = await db.collection("water_intake").updateOne(
      {
        userId: new ObjectId(userId),
        date: todayStr
      },
      {
        $set: {
          intake: intake,
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );
    
    res.status(200).json({ 
      message: "Water intake updated successfully",
      waterIntake: intake,
      date: todayStr
    });
    
  } catch (err) {
    console.error("Update water intake error:", err);
    res.status(500).json({ message: "Error updating water intake" });
  }
});

// GET /nutrition/food-items - Get all food items for users (with optional search)
router.get("/food-items", authMiddleware, async (req, res) => {
  try {
    const db = getDb();
    const { search, limit = 100 } = req.query;
    
    // Build search query
    let query = {};
    if (search && search.trim()) {
      query.name = {
        $regex: search.trim(),
        $options: 'i' // Case insensitive
      };
    }
    
    // Get food items with optional search filter
    const foodItems = await db.collection("food_items")
      .find(query)
      .sort({ name: 1 })
      .limit(parseInt(limit))
      .toArray();

    // Format response for frontend (simpler than admin endpoint)
    const formattedItems = foodItems.map(item => ({
      name: item.name,
      calories: item.calories,
      protein: item.protein,
      carbs: item.carbs,
      fats: item.fats
    }));

    res.status(200).json({
      message: "Food items retrieved successfully",
      foodItems: formattedItems,
      total: formattedItems.length
    });
    
  } catch (error) {
    console.error("Error fetching food items:", error);
    res.status(500).json({ message: "Error fetching food items" });
  }
});

export default router; 