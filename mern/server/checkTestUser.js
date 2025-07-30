import { getDb, connectToDatabase } from "./db/connection.js";

async function checkTestUser() {
  try {
    console.log('🔍 Checking for test user in database...\n');
    
    // Connect to database first
    await connectToDatabase();
    
    const db = getDb();
    
    // Look for the security test user
    const testUser = await db.collection("users").findOne({ 
      username: "securitytestuser" 
    });
    
    if (testUser) {
      console.log('✅ Test user found!');
      console.log('Username:', testUser.username);
      console.log('Email:', testUser.email);
      console.log('Password is hashed:', testUser.password.startsWith('$2a$') || testUser.password.startsWith('$2b$'));
      console.log('Password hash starts with:', testUser.password.substring(0, 20) + '...');
      console.log('Created at:', testUser.createdAt);
      console.log('User ID:', testUser._id);
    } else {
      console.log('❌ Test user not found');
      
      // Let's see how many users we have
      const totalUsers = await db.collection("users").countDocuments();
      console.log('Total users in database:', totalUsers);
      
      // Show the most recent 5 users
      const recentUsers = await db.collection("users")
        .find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .toArray();
      
      console.log('\nMost recent 5 users:');
      recentUsers.forEach((user, index) => {
        const isHashed = user.password.startsWith('$2a$') || user.password.startsWith('$2b$');
        console.log(`${index + 1}. ${user.username} (${user.email}) - Hashed: ${isHashed} - Created: ${user.createdAt}`);
      });
    }
    
  } catch (error) {
    console.error('Error checking test user:', error);
  }
}

// Run the check
checkTestUser(); 