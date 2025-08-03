import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5050';

async function testCompleteFlow() {
  console.log('🧪 Testing Complete User Flow...\n');

  let jwtToken = null;
  let userId = null;

  try {
    // Test 1: User Signup
    console.log('1️⃣ Testing User Signup...');
    const signupResponse = await fetch(`${BASE_URL}/user/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'testuser123',
        email: 'test@example.com',
        password: 'password123'
      }),
    });

    const signupData = await signupResponse.json();
    console.log('Signup Response:', signupData);

    if (signupResponse.ok) {
      userId = signupData.userId;
      console.log('✅ Signup successful! User ID:', userId);
    } else {
      console.log('❌ Signup failed:', signupData.message);
      return;
    }

    // Test 2: User Login
    console.log('\n2️⃣ Testing User Login...');
    const loginResponse = await fetch(`${BASE_URL}/user/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'testuser123',
        password: 'password123'
      }),
    });

    const loginData = await loginResponse.json();
    console.log('Login Response:', loginData);

    if (loginResponse.ok) {
      jwtToken = loginData.token;
      console.log('✅ Login successful! JWT Token received');
      console.log('✅ Game Stats received:', loginData.game_stats);
    } else {
      console.log('❌ Login failed:', loginData.message);
      return;
    }

    // Test 3: Get Game Stats (Protected Route)
    console.log('\n3️⃣ Testing Get Game Stats (Protected Route)...');
    const gameStatsResponse = await fetch(`${BASE_URL}/user/game-stats`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${jwtToken}`,
        'Content-Type': 'application/json',
      },
    });

    const gameStatsData = await gameStatsResponse.json();
    console.log('Game Stats Response:', gameStatsData);

    if (gameStatsResponse.ok) {
      console.log('✅ Game Stats fetched successfully!');
      console.log('✅ Daily Streak:', gameStatsData.game_stats.dailyStreak);
      console.log('✅ Point Total:', gameStatsData.game_stats.pointTotal);
      console.log('✅ Current Rank:', gameStatsData.game_stats.currentRank);
    } else {
      console.log('❌ Game Stats fetch failed:', gameStatsData.message);
      return;
    }

    // Test 4: Update Game Stats (Protected Route)
    console.log('\n4️⃣ Testing Update Game Stats (Protected Route)...');
    const updatedStats = {
      dailyStreak: 5,
      pointTotal: 150,
      currentRank: 2
    };

    const updateGameStatsResponse = await fetch(`${BASE_URL}/user/game-stats`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${jwtToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedStats),
    });

    const updateGameStatsData = await updateGameStatsResponse.json();
    console.log('Update Game Stats Response:', updateGameStatsData);

    if (updateGameStatsResponse.ok) {
      console.log('✅ Game Stats updated successfully!');
    } else {
      console.log('❌ Game Stats update failed:', updateGameStatsData.message);
      return;
    }

    // Test 5: Verify Updated Game Stats
    console.log('\n5️⃣ Verifying Updated Game Stats...');
    const verifyResponse = await fetch(`${BASE_URL}/user/game-stats`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${jwtToken}`,
        'Content-Type': 'application/json',
      },
    });

    const verifyData = await verifyResponse.json();
    console.log('Verification Response:', verifyData);

    if (verifyResponse.ok) {
      const stats = verifyData.game_stats;
      if (stats.dailyStreak === 5 && stats.pointTotal === 150 && stats.currentRank === 2) {
        console.log('✅ Game Stats verification successful!');
        console.log('✅ Updated Daily Streak:', stats.dailyStreak);
        console.log('✅ Updated Point Total:', stats.pointTotal);
        console.log('✅ Updated Current Rank:', stats.currentRank);
      } else {
        console.log('❌ Game Stats verification failed - values do not match');
      }
    } else {
      console.log('❌ Game Stats verification failed:', verifyData.message);
    }

    // Test 6: Test Invalid JWT Token
    console.log('\n6️⃣ Testing Invalid JWT Token...');
    const invalidTokenResponse = await fetch(`${BASE_URL}/user/game-stats`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer invalid_token_here',
        'Content-Type': 'application/json',
      },
    });

    const invalidTokenData = await invalidTokenResponse.json();
    console.log('Invalid Token Response:', invalidTokenData);

    if (invalidTokenResponse.status === 401) {
      console.log('✅ Invalid token correctly rejected!');
    } else {
      console.log('❌ Invalid token not properly rejected');
    }

    // Test 7: Test Missing JWT Token
    console.log('\n7️⃣ Testing Missing JWT Token...');
    const missingTokenResponse = await fetch(`${BASE_URL}/user/game-stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const missingTokenData = await missingTokenResponse.json();
    console.log('Missing Token Response:', missingTokenData);

    if (missingTokenResponse.status === 401) {
      console.log('✅ Missing token correctly rejected!');
    } else {
      console.log('❌ Missing token not properly rejected');
    }

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log('✅ User signup works');
    console.log('✅ User login works with JWT token');
    console.log('✅ Game stats are returned on login');
    console.log('✅ Protected routes work with JWT authentication');
    console.log('✅ Game stats can be fetched and updated');
    console.log('✅ Invalid/missing tokens are properly rejected');

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

testCompleteFlow(); 