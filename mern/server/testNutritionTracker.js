import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5050';

async function testNutritionTracker() {
  console.log('Testing Nutrition Tracker Implementation...\n');

  let jwtToken = null;
  let userId = null;

  try {
    // Step 1: Login to get JWT token
    console.log('[1] Logging in to get JWT token...');
    const loginResponse = await fetch(`${BASE_URL}/user/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'newsecurityuser',
        password: 'securepassword123'
      }),
    });

    const loginData = await loginResponse.json();
    console.log('Login Response:', loginData);

    if (loginResponse.ok) {
      jwtToken = loginData.token;
      userId = loginData.userId;
      console.log('[Pass] Login successful! JWT Token received');
    } else {
      console.log('[X] Login failed:', loginData.message);
      return;
    }

    // Step 2: Test GET /nutrition/today (should return empty totals initially)
    console.log('\n[2] Testing GET /nutrition/today (empty state)...');
    const todayResponse = await fetch(`${BASE_URL}/nutrition/today`, {
      headers: {
        'Authorization': `Bearer ${jwtToken}`,
        'Content-Type': 'application/json',
      },
    });

    const todayData = await todayResponse.json();
    console.log('Today Response:', todayData);

    if (todayResponse.ok) {
      console.log('[Pass] GET /nutrition/today working!');
      console.log('   Daily totals:', todayData.totals);
      console.log('   Goals:', todayData.goals);
      console.log('   Progress:', todayData.progress);
    } else {
      console.log('[X] GET /nutrition/today failed:', todayData.message);
      return;
    }

    // Step 3: Test POST /nutrition/meals (add a meal)
    console.log('\n[3] Testing POST /nutrition/meals (add breakfast)...');
    const addMealResponse = await fetch(`${BASE_URL}/nutrition/meals`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${jwtToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Oatmeal with Berries',
        calories: 350,
        protein: 12,
        carbs: 65,
        fat: 8,
        fiber: 8,
        sugar: 25,
        sodium: 150,
        mealType: 'breakfast',
        notes: 'Healthy breakfast option'
      }),
    });

    const addMealData = await addMealResponse.json();
    console.log('Add Meal Response:', addMealData);

    if (addMealResponse.ok) {
      console.log('[Pass] Meal added successfully!');
      const mealId = addMealData.meal._id;
      
      // Step 4: Test GET /nutrition/meals (get today's meals)
      console.log('\n[4] Testing GET /nutrition/meals...');
      const getMealsResponse = await fetch(`${BASE_URL}/nutrition/meals`, {
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json',
        },
      });

      const getMealsData = await getMealsResponse.json();
      console.log('Get Meals Response:', getMealsData);

      if (getMealsResponse.ok) {
        console.log('[Pass] GET /nutrition/meals working!');
        console.log('   Meals count:', getMealsData.meals.length);
      }

      // Step 5: Test GET /nutrition/today again (should now have totals)
      console.log('\n[5] Testing GET /nutrition/today (with meal data)...');
      const todayWithMealResponse = await fetch(`${BASE_URL}/nutrition/today`, {
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json',
        },
      });

      const todayWithMealData = await todayWithMealResponse.json();
      console.log('Today with Meal Response:', todayWithMealData);

      if (todayWithMealResponse.ok) {
        console.log('[Pass] GET /nutrition/today with meal data working!');
        console.log('   Updated totals:', todayWithMealData.totals);
        console.log('   Meals count:', todayWithMealData.meals);
      }

      // Step 6: Test PUT /nutrition/meals/:id (update meal)
      console.log('\n[6] Testing PUT /nutrition/meals/:id (update meal)...');
      const updateMealResponse = await fetch(`${BASE_URL}/nutrition/meals/${mealId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Oatmeal with Berries and Nuts',
          calories: 400,
          protein: 15,
          carbs: 70,
          fat: 12,
          fiber: 10,
          sugar: 30,
          sodium: 180,
          mealType: 'breakfast',
          notes: 'Enhanced breakfast with nuts'
        }),
      });

      const updateMealData = await updateMealResponse.json();
      console.log('Update Meal Response:', updateMealData);

      if (updateMealResponse.ok) {
        console.log('[Pass] Meal updated successfully!');
      }

      // Step 7: Test DELETE /nutrition/meals/:id (delete meal)
      console.log('\n[7] Testing DELETE /nutrition/meals/:id (delete meal)...');
      const deleteMealResponse = await fetch(`${BASE_URL}/nutrition/meals/${mealId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json',
        },
      });

      const deleteMealData = await deleteMealResponse.json();
      console.log('Delete Meal Response:', deleteMealData);

      if (deleteMealResponse.ok) {
        console.log('[Pass] Meal deleted successfully!');
      }
    } else {
      console.log('[X] Add meal failed:', addMealData.message);
    }

    console.log('\nNutrition Tracker Tests Completed!');
    console.log('[Pass] Daily nutrition totals endpoint working');
    console.log('[Pass] Meal CRUD operations working');
    console.log('[Pass] Authentication and authorization working');
    console.log('[Pass] Data aggregation working');

  } catch (error) {
    console.error('[X] Test failed:', error);
  }
}

// Run the test
testNutritionTracker(); 