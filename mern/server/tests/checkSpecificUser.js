import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const URI = process.env.ATLAS_URI || "";
const DB_NAME = process.env.DB_NAME || "chompDB";

async function checkSpecificUser() {
  const client = new MongoClient(URI);
  
  try {
    await client.connect();
    console.log("✅ Connected to MongoDB");
    
    const db = client.db(DB_NAME);
    
    // Find the specific testing user
    const user = await db.collection("users").findOne({ username: "testingUser" });
    
    if (!user) {
      console.log("❌ User 'testingUser' not found in database");
      return;
    }
    
    console.log(`✅ Found user: ${user.username}`);
    console.log(`📊 User ID: ${user._id}`);
    console.log(`📧 Email: ${user.email}`);
    console.log(`📅 Created: ${user.createdAt}`);
    console.log("");
    
    console.log("🎮 Game Stats:");
    console.log(`   - dailyStreak: ${user.game_stats?.dailyStreak || 0}`);
    console.log(`   - pointTotal: ${user.game_stats?.pointTotal || 0}`);
    console.log(`   - currentRank: ${user.game_stats?.currentRank || 1}`);
    console.log(`   - lastNutritionCheck: ${user.game_stats?.lastNutritionCheck || 'null'}`);
    console.log(`   - lastDailyReset: ${user.game_stats?.lastDailyReset || 'null'}`);
    console.log("");
    
    console.log("🎯 Nutrition Goals:");
    if (user.nutritionGoals) {
      console.log(`   - calorieGoal: ${user.nutritionGoals.calorieGoal || 'not set'}`);
      console.log(`   - proteinGoal: ${user.nutritionGoals.proteinGoal || 'not set'}`);
      console.log(`   - carbsGoal: ${user.nutritionGoals.carbsGoal || 'not set'}`);
      console.log(`   - fatGoal: ${user.nutritionGoals.fatGoal || 'not set'}`);
      console.log(`   - waterIntakeGoal: ${user.nutritionGoals.waterIntakeGoal || 'not set'}`);
    } else {
      console.log("   - No nutrition goals set");
    }
    console.log("");
    
    // Check if user has any meals
    const mealCount = await db.collection("meals").countDocuments({ userId: user._id });
    console.log(`🍽️  Total meals: ${mealCount}`);
    
    // Check if user has any water intake records
    const waterCount = await db.collection("water_intake").countDocuments({ userId: user._id });
    console.log(`💧 Water intake records: ${waterCount}`);
    
  } catch (err) {
    console.error("❌ Error:", err);
  } finally {
    await client.close();
    console.log("🔌 Disconnected from MongoDB");
  }
}

checkSpecificUser(); 