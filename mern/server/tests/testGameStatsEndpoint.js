import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5050';

// Test the /user/game-stats endpoint
async function testGameStatsEndpoint() {
  console.log("=== Testing /user/game-stats Endpoint ===\n");

  try {
    // First, get a JWT token for the testingUser
    console.log("1. Getting JWT token for testingUser...");
    
    const loginResponse = await fetch(`${BASE_URL}/user/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'testingUser',
        password: 'testingUser1'
      })
    });

    if (!loginResponse.ok) {
      console.log("❌ Login failed:", await loginResponse.text());
      return;
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log("✅ Got JWT token");

    // Now test the /user/game-stats endpoint
    console.log("\n2. Testing /user/game-stats endpoint...");
    
    const gameStatsResponse = await fetch(`${BASE_URL}/user/game-stats`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!gameStatsResponse.ok) {
      console.log("❌ Game stats fetch failed:", await gameStatsResponse.text());
      return;
    }

    const gameStatsData = await gameStatsResponse.json();
    console.log("✅ Got game stats data:");
    console.log("   - dailyStreak:", gameStatsData.game_stats.dailyStreak);
    console.log("   - pointTotal:", gameStatsData.game_stats.pointTotal);
    console.log("   - currentRank:", gameStatsData.game_stats.currentRank);

    // Check if the streak is correct (should be 1 from our previous test)
    if (gameStatsData.game_stats.dailyStreak === 1) {
      console.log("✅ Game stats endpoint is returning the correct updated streak!");
    } else {
      console.log("❌ Game stats endpoint is not returning the updated streak!");
      console.log("   Expected: 1, Got:", gameStatsData.game_stats.dailyStreak);
    }

    console.log("\n✅ Game stats endpoint test completed!");

  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

testGameStatsEndpoint(); 