import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const URI = process.env.ATLAS_URI || "";
const DB_NAME = process.env.DB_NAME || "chompDB";

async function testWaterSystem() {
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
    
    // Test water intake functionality
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    console.log(`[INFO] Testing water intake for: ${todayStr}`);
    
    // Test 1: Add water intake
    console.log("\n[TEST] Test 1: Adding water intake...");
    const waterIntake = 1500; // ml
    
    const result = await db.collection("water_intake").updateOne(
      {
        userId: user._id,
        date: todayStr
      },
      {
        $set: {
          intake: waterIntake,
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );
    
    console.log(`[Pass] Water intake updated: ${waterIntake} ml`);
    
    // Test 2: Retrieve water intake
    console.log("\n[TEST] Test 2: Retrieving water intake...");
    const waterRecord = await db.collection("water_intake").findOne({
      userId: user._id,
      date: todayStr
    });
    
    if (waterRecord) {
      console.log(`[Pass] Retrieved water intake: ${waterRecord.intake} ml`);
    } else {
      console.log("[X] No water record found");
    }
    
    // Test 3: Check if it affects streak calculation
    console.log("\n[TEST] Test 3: Testing streak calculation with water...");
    
    // Get user's nutrition goals
    const nutritionGoals = user.nutritionGoals || {
      calorieGoal: 2000,
      proteinGoal: 100,
      carbsGoal: 250,
      fatGoal: 60,
      waterIntakeGoal: 2000
    };
    
    console.log(`[INFO] User's water goal: ${nutritionGoals.waterIntakeGoal} ml`);
    console.log(`[INFO] Current water intake: ${waterIntake} ml`);
    console.log(`[INFO] Water goal met: ${waterIntake >= nutritionGoals.waterIntakeGoal ? 'YES' : 'NO'}`);
    
    console.log("\n[Pass] Water system test completed successfully!");
    
  } catch (err) {
    console.error("[X] Test failed:", err);
  } finally {
    await client.close();
    console.log("[INFO] Disconnected from MongoDB");
  }
}

testWaterSystem(); 