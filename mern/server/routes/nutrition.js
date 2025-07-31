import express from "express";
import { getDb } from "../db/connection.js";
import { ObjectId } from "mongodb";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Helper function to get start and end of day in user's timezone
const getDayBounds = (userTimezone = 'UTC') => {
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);
  
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
      { projection: { nutritionGoals: 1 } }
    );
    
    const nutritionGoals = user?.nutritionGoals || null;
    
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
    
    // Structure response for frontend consumption
    const response = {
      date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
      totals: dailyTotals,
      goals: nutritionGoals ? {
        calories: nutritionGoals.calorieGoal || 0,
        protein: nutritionGoals.proteinGoal || 0,
        carbs: nutritionGoals.carbsGoal || 0,
        fat: nutritionGoals.fatGoal || 0,
        water: nutritionGoals.waterIntakeGoal || 0
      } : null,
      meals: meals.length,
      progress: nutritionGoals ? {
        calories: {
          current: dailyTotals.calories,
          goal: nutritionGoals.calorieGoal || 0,
          percentage: Math.round((dailyTotals.calories / (nutritionGoals.calorieGoal || 1)) * 100)
        },
        protein: {
          current: dailyTotals.protein,
          goal: nutritionGoals.proteinGoal || 0,
          percentage: Math.round((dailyTotals.protein / (nutritionGoals.proteinGoal || 1)) * 100)
        },
        carbs: {
          current: dailyTotals.carbs,
          goal: nutritionGoals.carbsGoal || 0,
          percentage: Math.round((dailyTotals.carbs / (nutritionGoals.carbsGoal || 1)) * 100)
        },
        fat: {
          current: dailyTotals.fat,
          goal: nutritionGoals.fatGoal || 0,
          percentage: Math.round((dailyTotals.fat / (nutritionGoals.fatGoal || 1)) * 100)
        }
      } : null
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

export default router; 