import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5050';

// Test the complete frontend flow
async function testCompleteFrontendFlow() {
  console.log("=== Testing Complete Frontend Flow ===\n");

  try {
    // Step 1: Login (simulating what happens when user logs in)
    console.log("1. Simulating user login...");
    
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
    console.log("✅ Login successful");
    console.log("   - User ID:", loginData.userId);
    console.log("   - Username:", loginData.username);
    console.log("   - Game Stats from login:", loginData.game_stats);

    // Step 2: Fetch fresh game stats (what SignIn component does)
    console.log("\n2. Fetching fresh game stats (SignIn component behavior)...");
    
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
    console.log("✅ Fresh game stats:");
    console.log("   - dailyStreak:", gameStatsData.game_stats.dailyStreak);
    console.log("   - pointTotal:", gameStatsData.game_stats.pointTotal);
    console.log("   - currentRank:", gameStatsData.game_stats.currentRank);

    // Step 3: Fetch nutrition data (what App component does when dashboard loads)
    console.log("\n3. Fetching nutrition data (App component behavior)...");
    
    const nutritionResponse = await fetch(`${BASE_URL}/nutrition/today`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!nutritionResponse.ok) {
      console.log("❌ Nutrition fetch failed:", await nutritionResponse.text());
      return;
    }

    const nutritionData = await nutritionResponse.json();
    console.log("✅ Nutrition data with game stats:");
    console.log("   - Date:", nutritionData.date);
    console.log("   - Totals:", nutritionData.totals);
    console.log("   - Game Stats from nutrition response:", nutritionData.gameStats);

    // Verify that both endpoints return the same game stats
    if (gameStatsData.game_stats.dailyStreak === nutritionData.gameStats.dailyStreak) {
      console.log("✅ Both endpoints return consistent game stats!");
    } else {
      console.log("❌ Game stats are inconsistent between endpoints!");
      console.log("   /user/game-stats dailyStreak:", gameStatsData.game_stats.dailyStreak);
      console.log("   /nutrition/today dailyStreak:", nutritionData.gameStats.dailyStreak);
    }

    console.log("\n✅ Complete frontend flow test completed!");
    console.log("🎯 The frontend should now display the correct streak!");

  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

testCompleteFrontendFlow(); 