import { getDb } from "../db/connection.js";
import { connectToDatabase } from "../db/connection.js";

async function quickTestScenarios() {
  try {
    await connectToDatabase();
    const db = getDb();
    
    // Find the test user
    const user = await db.collection("users").findOne({ 
      username: "testuser123" 
    });

    if (!user) {
      console.log('❌ Test user not found. Please run testCompleteFlow.js first.');
      return;
    }

    // Quick test scenarios - uncomment the one you want to test
    const scenarios = {
      bronze: { dailyStreak: 5, pointTotal: 100, currentRank: 1 },
      silver: { dailyStreak: 12, pointTotal: 250, currentRank: 2 },
      gold: { dailyStreak: 30, pointTotal: 750, currentRank: 3 },
      maxBronze: { dailyStreak: 20, pointTotal: 150, currentRank: 1 },
      maxSilver: { dailyStreak: 50, pointTotal: 400, currentRank: 2 },
      maxGold: { dailyStreak: 100, pointTotal: 1000, currentRank: 3 }
    };

    // Choose which scenario to test (change this line)
    const selectedScenario = scenarios.silver; // Change to: bronze, silver, gold, maxBronze, maxSilver, maxGold
    
    console.log('🔄 Updating to scenario:', selectedScenario);
    
    const result = await db.collection("users").updateOne(
      { _id: user._id },
      { $set: { game_stats: selectedScenario } }
    );

    if (result.modifiedCount > 0) {
      console.log('✅ Updated successfully!');
      console.log('📊 New stats:', selectedScenario);
      
      const rankNames = { 1: 'Bronze', 2: 'Silver', 3: 'Gold' };
      console.log(`🎨 ProgressCard will show: ${rankNames[selectedScenario.currentRank]} Chomper with ${selectedScenario.dailyStreak} day streak`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

quickTestScenarios(); 