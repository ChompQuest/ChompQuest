import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const URI = process.env.ATLAS_URI || "";
const DB_NAME = process.env.DB_NAME || "chompDB";

async function checkUsers() {
  const client = new MongoClient(URI);
  
  try {
    await client.connect();
    console.log("[Pass] Connected to MongoDB");
    
    const db = client.db(DB_NAME);
    
    // Find all users
    const users = await db.collection("users").find({}, {
      username: 1, 
      'game_stats.dailyStreak': 1,
      'game_stats.pointTotal': 1,
      'game_stats.currentRank': 1
    }).toArray();
    
    console.log(`\n[INFO] Found ${users.length} users in database:`);
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.username}`);
      console.log(`   - dailyStreak: ${user.game_stats?.dailyStreak || 0}`);
      console.log(`   - pointTotal: ${user.game_stats?.pointTotal || 0}`);
      console.log(`   - currentRank: ${user.game_stats?.currentRank || 1}`);
      console.log("");
    });
    
  } catch (err) {
    console.error("[X] Error:", err);
  } finally {
    await client.close();
    console.log("[INFO] Disconnected from MongoDB");
  }
}

checkUsers(); 