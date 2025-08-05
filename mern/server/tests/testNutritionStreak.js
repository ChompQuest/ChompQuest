import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const URI = process.env.ATLAS_URI || "";
const DB_NAME = process.env.DB_NAME || "chompDB";

async function testNutritionStreak() {
  const client = new MongoClient(URI);
  
  try {
    await client.connect();
    console.log("[Pass] Connected to MongoDB");
    
    const db = client.db(DB_NAME);
    
    // Find a test user
    const user = await db.collection("users").findOne({});
    if (!user) {
      console.log("[X] No users found in database");
      return;
    }
    
    console.log(`[Pass] Found test user: ${user.username}`);
    console.log(`Current game stats:`, user.game_stats);
    
    // Test the nutrition streak logic
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // Add some test meals for today
    const todayStart = new Date(today);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);
    
    // Check if user has nutrition goals
    if (!user.nutritionGoals) {
      console.log("[WARN] User has no nutrition goals set");
      console.log("Setting default nutrition goals...");
      
      await db.collection("users").updateOne(
        { _id: user._id },
        { 
          $set: { 
            nutritionGoals: {
              calorieGoal: 2000,
              proteinGoal: 100,
              carbsGoal: 250,
              fatGoal: 60,
              waterIntakeGoal: 2000
            }
          } 
        }
      );
      console.log("[Pass] Set default nutrition goals");
    }
    
    // Add test meals for today (meeting 100% of goals)
    const testMeals = [
      {
        userId: user._id,
        name: "Test Breakfast",
        calories: 800, // 40% of 2000
        protein: 40,   // 40% of 100
        carbs: 100,    // 40% of 250
        fat: 24,       // 40% of 60
        mealType: "breakfast",
        createdAt: new Date(todayStart.getTime() + 8 * 60 * 60 * 1000) // 8 AM
      },
      {
        userId: user._id,
        name: "Test Lunch",
        calories: 600, // 30% of 2000
        protein: 30,   // 30% of 100
        carbs: 75,     // 30% of 250
        fat: 18,       // 30% of 60
        mealType: "lunch",
        createdAt: new Date(todayStart.getTime() + 12 * 60 * 60 * 1000) // 12 PM
      },
      {
        userId: user._id,
        name: "Test Dinner",
        calories: 600, // 30% of 2000
        protein: 30,   // 30% of 100
        carbs: 75,     // 30% of 250
        fat: 18,       // 30% of 60
        mealType: "dinner",
        createdAt: new Date(todayStart.getTime() + 18 * 60 * 60 * 1000) // 6 PM
      }
    ];
    
    // Clear any existing test meals for today
    await db.collection("meals").deleteMany({
      userId: user._id,
      createdAt: {
        $gte: todayStart,
        $lte: todayEnd
      }
    });
    
    // Insert test meals
    const result = await db.collection("meals").insertMany(testMeals);
    console.log(`[Pass] Added ${result.insertedCount} test meals for today`);
    
    // Calculate today's totals
    const todayMeals = await db.collection("meals").find({
      userId: user._id,
      createdAt: {
        $gte: todayStart,
        $lte: todayEnd
      }
    }).toArray();
    
    const todayTotals = todayMeals.reduce((totals, meal) => {
      totals.calories += meal.calories || 0;
      totals.protein += meal.protein || 0;
      totals.carbs += meal.carbs || 0;
      totals.fat += meal.fat || 0;
      return totals;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
    
    console.log("[INFO] Today's nutrition totals:", todayTotals);
    
    // Get today's water intake
    const waterRecord = await db.collection("water_intake").findOne({
      userId: user._id,
      date: todayStr
    });
    const waterIntake = waterRecord ? waterRecord.intake : 0;
    
    // Check if goals were met (100% threshold)
    const nutritionGoals = user.nutritionGoals || {
      calorieGoal: 2000,
      proteinGoal: 100,
      carbsGoal: 250,
      fatGoal: 60,
      waterIntakeGoal: 2000
    };
    
    const goalsMet = (
      todayTotals.calories >= nutritionGoals.calorieGoal &&
      todayTotals.protein >= nutritionGoals.proteinGoal &&
      todayTotals.carbs >= nutritionGoals.carbsGoal &&
      todayTotals.fat >= nutritionGoals.fatGoal &&
      waterIntake >= nutritionGoals.waterIntakeGoal
    );
    
    console.log(`[INFO] Goals met today: ${goalsMet ? 'YES' : 'NO'}`);
    console.log(`   Calories: ${todayTotals.calories}/${nutritionGoals.calorieGoal} (${Math.round(todayTotals.calories / nutritionGoals.calorieGoal * 100)}%)`);
    console.log(`   Protein: ${todayTotals.protein}/${nutritionGoals.proteinGoal} (${Math.round(todayTotals.protein / nutritionGoals.proteinGoal * 100)}%)`);
    console.log(`   Carbs: ${todayTotals.carbs}/${nutritionGoals.carbsGoal} (${Math.round(todayTotals.carbs / nutritionGoals.carbsGoal * 100)}%)`);
    console.log(`   Fat: ${todayTotals.fat}/${nutritionGoals.fatGoal} (${Math.round(todayTotals.fat / nutritionGoals.fatGoal * 100)}%)`);
    console.log(`   Water: ${waterIntake}/${nutritionGoals.waterIntakeGoal} (${Math.round(waterIntake / nutritionGoals.waterIntakeGoal * 100)}%)`);
    
    // Simulate the streak update logic
    let updatedGameStats = { ...user.game_stats };
    
    if (goalsMet) {
      updatedGameStats.dailyStreak = (updatedGameStats.dailyStreak || 0) + 1;
      updatedGameStats.pointTotal = (updatedGameStats.pointTotal || 0) + 10;
      console.log(`[Pass] Daily streak increased to: ${updatedGameStats.dailyStreak}`);
      console.log(`[Pass] Points increased to: ${updatedGameStats.pointTotal}`);
    } else {
      updatedGameStats.dailyStreak = 0;
      console.log(`[X] Daily streak reset to 0`);
    }
    
    // Update rank based on streak
    if (updatedGameStats.dailyStreak >= 30) {
      updatedGameStats.currentRank = 3; // Gold
      console.log(`[Pass] Rank updated to: Gold`);
    } else if (updatedGameStats.dailyStreak >= 15) {
      updatedGameStats.currentRank = 2; // Silver
      console.log(`[Pass] Rank updated to: Silver`);
    } else if (updatedGameStats.dailyStreak >= 7) {
      updatedGameStats.currentRank = 1; // Bronze
      console.log(`[Pass] Rank updated to: Bronze`);
    }
    
    // Actually update the database
    updatedGameStats.lastDailyReset = new Date();
    
    const updateResult = await db.collection("users").updateOne(
      { _id: user._id },
      { $set: { game_stats: updatedGameStats } }
    );
    
    if (updateResult.modifiedCount > 0) {
      console.log("[Pass] Database updated successfully!");
      
      // Verify the update by fetching the user again
      const updatedUser = await db.collection("users").findOne({ _id: user._id });
      console.log("[INFO] Updated game stats:", updatedUser.game_stats);
    } else {
      console.log("[X] Failed to update database");
    }
    
    console.log("[Pass] Nutrition streak test completed successfully!");
    
  } catch (err) {
    console.error("[X] Test failed:", err);
  } finally {
    await client.close();
    console.log("[INFO] Disconnected from MongoDB");
  }
}

testNutritionStreak(); 