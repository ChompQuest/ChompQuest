import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5050';

// Test the complete water intake flow
async function testWaterIntakeFlow() {
  console.log("=== Testing Complete Water Intake Flow ===\n");

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
      console.log("[X] Login failed:", await loginResponse.text());
      return;
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log("[Pass] Login successful");

    // Step 2: Check initial water intake
    console.log("\n2. Checking initial water intake...");
    
    const initialNutritionResponse = await fetch(`${BASE_URL}/nutrition/today`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!initialNutritionResponse.ok) {
      console.log("[X] Initial nutrition fetch failed:", await initialNutritionResponse.text());
      return;
    }

    const initialNutritionData = await initialNutritionResponse.json();
    console.log("[Pass] Initial water intake:", initialNutritionData.totals.water, "ml");

    // Step 3: Add water (simulating user adding 500ml)
    console.log("\n3. Adding 500ml of water...");
    
    const currentWater = initialNutritionData.totals.water || 0;
    const newWaterTotal = currentWater + 500;

    const addWaterResponse = await fetch(`${BASE_URL}/nutrition/water`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intake: newWaterTotal
      }),
    });

    if (!addWaterResponse.ok) {
      console.log("[X] Add water failed:", await addWaterResponse.text());
      return;
    }

    console.log("[Pass] Water added successfully");

    // Step 4: Check water intake after adding
    console.log("\n4. Checking water intake after adding...");
    
    const updatedNutritionResponse = await fetch(`${BASE_URL}/nutrition/today`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!updatedNutritionResponse.ok) {
      console.log("[X] Updated nutrition fetch failed:", await updatedNutritionResponse.text());
      return;
    }

    const updatedNutritionData = await updatedNutritionResponse.json();
    console.log("[Pass] Water intake after adding:", updatedNutritionData.totals.water, "ml");

    // Step 5: Simulate a "reload" by fetching again
    console.log("\n5. Simulating page reload (fetching again)...");
    
    const reloadNutritionResponse = await fetch(`${BASE_URL}/nutrition/today`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!reloadNutritionResponse.ok) {
      console.log("[X] Reload nutrition fetch failed:", await reloadNutritionResponse.text());
      return;
    }

    const reloadNutritionData = await reloadNutritionResponse.json();
    console.log("[Pass] Water intake after 'reload':", reloadNutritionData.totals.water, "ml");

    // Verify that water intake persisted
    if (reloadNutritionData.totals.water === updatedNutritionData.totals.water) {
      console.log("[Pass] Water intake persisted correctly after 'reload'!");
    } else {
      console.log("[X] Water intake did not persist after 'reload'!");
      console.log("   Expected:", updatedNutritionData.totals.water, "Got:", reloadNutritionData.totals.water);
    }

    console.log("\n[Pass] Complete water intake flow test completed!");

  } catch (error) {
    console.error("[X] Test failed:", error);
  }
}

testWaterIntakeFlow(); 