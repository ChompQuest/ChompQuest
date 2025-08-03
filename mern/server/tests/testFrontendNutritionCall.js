import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5050';

// Simulate the frontend's call to /nutrition/today
async function testFrontendNutritionCall() {
  console.log("=== Testing Frontend Nutrition Call ===\n");

  try {
    // First, we need to get a JWT token for the testingUser
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

    // Now simulate the frontend's fetchDailyNutrition call
    console.log("\n2. Simulating frontend's fetchDailyNutrition call...");
    
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
    console.log("✅ Got nutrition data:");
    console.log("   - Date:", nutritionData.date);
    console.log("   - Totals:", nutritionData.totals);
    console.log("   - Goals:", nutritionData.goals);
    console.log("   - Meals count:", nutritionData.meals);
    console.log("   - Game Stats:", nutritionData.gameStats);
    console.log("   - Progress:", nutritionData.progress);

    // Check if the streak was updated
    if (nutritionData.gameStats) {
      console.log("\n🎮 Game Stats from response:");
      console.log(`   - dailyStreak: ${nutritionData.gameStats.dailyStreak}`);
      console.log(`   - pointTotal: ${nutritionData.gameStats.pointTotal}`);
      console.log(`   - currentRank: ${nutritionData.gameStats.currentRank}`);
    } else {
      console.log("\n❌ No game stats in response");
    }

    console.log("\n✅ Frontend nutrition call test completed!");

  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

testFrontendNutritionCall(); 