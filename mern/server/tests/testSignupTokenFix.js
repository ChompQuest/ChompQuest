import fetch from 'node-fetch';
import { connectToDatabase, getDb } from './db/connection.js';

async function testSignupTokenFix() {
  try {
    console.log('Testing signup token fix...\n');
    
    // Test data
    const testUser = {
      username: `tokentest_${Date.now()}`,
      email: `tokentest_${Date.now()}@test.com`,
      password: 'testpass123'
    };
    
    console.log('1. Testing signup endpoint with token generation...');
    
    // Make signup request
    const signupResponse = await fetch('http://localhost:5050/user/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser),
    });
    
    const signupData = await signupResponse.json();
    
    console.log('Response status:', signupResponse.status);
    console.log('Response data:', JSON.stringify(signupData, null, 2));
    
    if (signupResponse.ok) {
      console.log('✅ Signup successful');
      console.log('✅ Token provided:', !!signupData.token);
      console.log('✅ Game stats provided:', !!signupData.game_stats);
      console.log('✅ User data provided:', !!signupData.user);
      
      if (signupData.token) {
        console.log('\n2. Testing token validity with protected endpoint...');
        
        // Test the token with a protected endpoint
        const protectedResponse = await fetch('http://localhost:5050/user/game-stats', {
          headers: {
            'Authorization': `Bearer ${signupData.token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (protectedResponse.ok) {
          console.log('✅ Token works with protected endpoint');
        } else {
          console.log('❌ Token failed with protected endpoint:', protectedResponse.status);
        }
        
        console.log('\n3. Testing nutrition goals with token...');
        
        // Test nutrition goals with the token
        const nutritionGoalsData = {
          calories: 2000,
          protein: 150,
          carbs: 250,
          fats: 60,
          water: 2500
        };
        
        const nutritionResponse = await fetch('http://localhost:5050/user/nutrition-goals', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${signupData.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(nutritionGoalsData),
        });
        
        if (nutritionResponse.ok) {
          console.log('✅ Nutrition goals endpoint works with new user token');
        } else {
          console.log('❌ Nutrition goals endpoint failed:', nutritionResponse.status);
          const errorData = await nutritionResponse.json();
          console.log('Error:', errorData.message);
        }
      }
    } else {
      console.log('❌ Signup failed:', signupData.message);
    }
    
    // Clean up - delete the test user
    console.log('\n4. Cleaning up test user...');
    await connectToDatabase();
    const db = getDb();
    await db.collection("users").deleteOne({ username: testUser.username });
    console.log('✅ Test user cleaned up');
    
    console.log('\n✅ Token fix test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testSignupTokenFix();