import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5050';

// Test the frontend water display flow
async function testFrontendWaterDisplay() {
  console.log("=== Testing Frontend Water Display Flow ===\n");

  try {
    // Step 1: Login
    console.log("1. Logging in as testingUser...");
    
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

    // Step 2: Simulate frontend's fetchDailyNutrition call
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
    console.log("✅ Nutrition data received:");
    console.log("   - Water intake:", nutritionData.totals.water, "ml");
    console.log("   - Water goal:", nutritionData.goals.water, "ml");
    console.log("   - Water progress:", nutritionData.progress.water);

    // Step 3: Simulate what the frontend should do with this data
    console.log("\n3. Simulating frontend data processing...");
    
    // This is what the frontend should do:
    const currentWaterIntake = nutritionData.totals.water || 0;
    const waterGoal = nutritionData.goals.water || 2000;
    const waterProgress = nutritionData.progress.water;

    console.log("   - Frontend should set currentWaterIntake to:", currentWaterIntake);
    console.log("   - Frontend should set waterGoal to:", waterGoal);
    console.log("   - Water progress percentage:", waterProgress.percentage + "%");

    // Verify the data is correct
    if (currentWaterIntake > 0) {
      console.log("✅ Water intake is properly included in the response!");
    } else {
      console.log("❌ Water intake is 0 or missing from the response!");
    }

    if (waterProgress.percentage > 0) {
      console.log("✅ Water progress is being calculated correctly!");
    } else {
      console.log("❌ Water progress is 0%!");
    }

    console.log("\n✅ Frontend water display test completed!");
    console.log("🎯 The frontend should now properly display the water intake!");

  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

testFrontendWaterDisplay(); 