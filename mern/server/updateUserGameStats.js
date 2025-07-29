import { getDb } from "./db/connection.js";
import { connectToDatabase } from "./db/connection.js";
import { ObjectId } from "mongodb";

async function updateUserGameStats() {
  try {
    await connectToDatabase();
    const db = getDb();
    
    console.log('🔧 Updating User Game Stats for Testing...\n');

    // Find the test user we created
    const user = await db.collection("users").findOne({ 
      username: "testuser123" 
    });

    if (!user) {
      console.log('❌ Test user not found. Please run the testCompleteFlow.js first to create a user.');
      return;
    }

    console.log('✅ Found user:', user.username);
    console.log('📊 Current game stats:', user.game_stats);

    // Test different scenarios
    const testScenarios = [
      {
        name: "Bronze Rank - Low Streak",
        stats: { dailyStreak: 3, pointTotal: 50, currentRank: 1 }
      },
      {
        name: "Bronze Rank - High Streak", 
        stats: { dailyStreak: 15, pointTotal: 200, currentRank: 1 }
      },
      {
        name: "Silver Rank - Medium Streak",
        stats: { dailyStreak: 8, pointTotal: 300, currentRank: 2 }
      },
      {
        name: "Gold Rank - High Streak",
        stats: { dailyStreak: 25, pointTotal: 500, currentRank: 3 }
      },
      {
        name: "Gold Rank - Max Streak",
        stats: { dailyStreak: 100, pointTotal: 1000, currentRank: 3 }
      }
    ];

    console.log('\n🎯 Available test scenarios:');
    testScenarios.forEach((scenario, index) => {
      console.log(`${index + 1}. ${scenario.name}: ${scenario.stats.dailyStreak} day streak, ${scenario.stats.pointTotal} points, Rank ${scenario.stats.currentRank}`);
    });

    // For demonstration, let's update to Silver Rank
    const selectedScenario = testScenarios[2]; // Silver Rank - Medium Streak
    
    console.log(`\n🔄 Updating to: ${selectedScenario.name}`);
    
    const result = await db.collection("users").updateOne(
      { _id: user._id },
      { 
        $set: { 
          game_stats: selectedScenario.stats
        } 
      }
    );

    if (result.modifiedCount > 0) {
      console.log('✅ Game stats updated successfully!');
      
      // Verify the update
      const updatedUser = await db.collection("users").findOne({ _id: user._id });
      console.log('📊 New game stats:', updatedUser.game_stats);
      
      console.log('\n🎨 Expected ProgressCard Display:');
      console.log(`- Medal Image: ${selectedScenario.stats.currentRank === 1 ? 'Bronze' : selectedScenario.stats.currentRank === 2 ? 'Silver' : 'Gold'} medal`);
      console.log(`- Rank Name: ${selectedScenario.stats.currentRank === 1 ? 'Bronze' : selectedScenario.stats.currentRank === 2 ? 'Silver' : 'Gold'} Chomper`);
      console.log(`- Stats Text: "${selectedScenario.stats.dailyStreak} day streak • ${selectedScenario.stats.pointTotal} points"`);
      
    } else {
      console.log('❌ Failed to update game stats');
    }

    console.log('\n💡 To test different scenarios, you can:');
    console.log('1. Modify the selectedScenario variable in this script');
    console.log('2. Run this script again');
    console.log('3. Refresh your frontend to see the changes');

  } catch (error) {
    console.error('❌ Error updating game stats:', error);
  }
}

updateUserGameStats(); 