import { getDb } from "./db/connection.js";
import { connectToDatabase } from "./db/connection.js";

async function testGameStats() {
  try {
    await connectToDatabase();
    const db = getDb();
    
    console.log("Testing game stats functionality...");
    
    // Test creating a user with game stats
    const testUser = {
      username: "testuser",
      email: "test@example.com",
      password: "password123",
      createdAt: new Date(),
      goals: [],
      progress: {},
      game_stats: {
        dailyStreak: 0,
        pointTotal: 0,
        currentRank: 1
      }
    };

    const result = await db.collection("users").insertOne(testUser);
    console.log("✅ Test user created with ID:", result.insertedId);

    // Test retrieving the user with game stats
    const retrievedUser = await db.collection("users").findOne({ _id: result.insertedId });
    console.log("✅ Retrieved user game stats:", retrievedUser.game_stats);

    // Test updating game stats
    const updateResult = await db.collection("users").updateOne(
      { _id: result.insertedId },
      { 
        $set: { 
          game_stats: {
            dailyStreak: 5,
            pointTotal: 150,
            currentRank: 2
          }
        } 
      }
    );
    console.log("✅ Update result:", updateResult.modifiedCount, "documents modified");

    // Test retrieving updated user
    const updatedUser = await db.collection("users").findOne({ _id: result.insertedId });
    console.log("✅ Updated user game stats:", updatedUser.game_stats);

    // Clean up - remove test user
    await db.collection("users").deleteOne({ _id: result.insertedId });
    console.log("✅ Test user cleaned up");

    console.log("🎉 All database tests passed!");
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

testGameStats(); 