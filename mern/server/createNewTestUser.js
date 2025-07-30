import { getDb, connectToDatabase } from "./db/connection.js";
import bcrypt from "bcryptjs";

async function createNewTestUser() {
  try {
    console.log('🔒 Creating new test user with password hashing...\n');
    
    // Connect to database first
    await connectToDatabase();
    
    const db = getDb();
    
    // Create a new test user with proper hashing
    const testUser = {
      username: "newsecurityuser",
      email: "newsecurity@test.com",
      password: await bcrypt.hash("securepassword123", 12), // Properly hashed
      createdAt: new Date(),
      goals: [],
      progress: {},
      game_stats: {
        dailyStreak: 0,
        pointTotal: 0,
        currentRank: 1
      }
    };
    
    // Check if user already exists
    const existingUser = await db.collection("users").findOne({ 
      username: testUser.username 
    });
    
    if (existingUser) {
      console.log('⚠️ User already exists, updating password to hashed version...');
      
      // Update the existing user with hashed password
      await db.collection("users").updateOne(
        { username: testUser.username },
        { $set: { password: testUser.password } }
      );
      
      console.log('✅ User updated with hashed password!');
    } else {
      // Insert new user
      const result = await db.collection("users").insertOne(testUser);
      console.log('✅ New test user created with hashed password!');
      console.log('User ID:', result.insertedId);
    }
    
    // Verify the user was created/updated properly
    const createdUser = await db.collection("users").findOne({ 
      username: testUser.username 
    });
    
    console.log('\n📋 User Details:');
    console.log('Username:', createdUser.username);
    console.log('Email:', createdUser.email);
    console.log('Password is hashed:', createdUser.password.startsWith('$2a$'));
    console.log('Password hash starts with:', createdUser.password.substring(0, 20) + '...');
    console.log('Created at:', createdUser.createdAt);
    
    // Test password verification
    const isPasswordValid = await bcrypt.compare("securepassword123", createdUser.password);
    console.log('Password verification test:', isPasswordValid ? '✅ PASS' : '❌ FAIL');
    
    console.log('\n🎉 New test user ready for testing!');
    console.log('You can now test login with:');
    console.log('Username: newsecurityuser');
    console.log('Password: securepassword123');
    
  } catch (error) {
    console.error('Error creating test user:', error);
  }
}

// Run the creation
createNewTestUser(); 