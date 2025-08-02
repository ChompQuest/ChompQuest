import { getDb, connectToDatabase } from "./db/connection.js";
import bcrypt from "bcryptjs";
import readline from "readline";

// Validation functions (same as in routes/user.js)
const validatePassword = (password) => {
  if (password.length < 6) {
    return { isValid: false, message: "Password must be at least 6 characters long" };
  }
  if (password.length > 128) {
    return { isValid: false, message: "Password must be less than 128 characters" };
  }
  return { isValid: true };
};

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, message: "Please enter a valid email address" };
  }
  return { isValid: true };
};

const validateUsername = (username) => {
  if (username.length < 3) {
    return { isValid: false, message: "Username must be at least 3 characters long" };
  }
  if (username.length > 30) {
    return { isValid: false, message: "Username must be less than 30 characters" };
  }
  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  if (!usernameRegex.test(username)) {
    return { isValid: false, message: "Username can only contain letters, numbers, and underscores" };
  }
  return { isValid: true };
};

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper function to prompt for input with validation
const promptWithValidation = (question, validator) => {
  return new Promise((resolve) => {
    const askQuestion = () => {
      rl.question(question, (answer) => {
        const validation = validator(answer.trim());
        if (!validation.isValid) {
          console.log(`❌ ${validation.message}`);
          askQuestion(); // Ask again if validation fails
        } else {
          resolve(answer.trim());
        }
      });
    };
    askQuestion();
  });
};

// Helper function for password input (simple text input)
const promptPassword = (question) => {
  return promptWithValidation(question, validatePassword);
};

async function createAdminUser() {
  try {
    console.log('🚀 ChompQuest Admin User Creation\n');
    console.log('This script will create a new admin user for your ChompQuest application.');
    console.log('Please provide the following information:\n');
    
    // Connect to database first
    await connectToDatabase();
    const db = getDb();
    
    // Prompt for admin details
    const email = await promptWithValidation('📧 Enter admin email: ', validateEmail);
    const username = await promptWithValidation('👤 Enter admin username: ', validateUsername);
    const password = await promptPassword('🔒 Enter admin password: ');
    
    console.log('\n⏳ Validating and creating admin user...\n');
    
    // Check if admin user already exists
    const existingUser = await db.collection("users").findOne({ 
      $or: [
        { username: username },
        { email: email }
      ]
    });
    
    if (existingUser) {
      console.log('❌ User already exists!');
      console.log('A user with this username or email already exists:');
      console.log('- Username:', existingUser.username);
      console.log('- Email:', existingUser.email);
      console.log('- Role:', existingUser.role || 'member');
      console.log('\nPlease choose different credentials and try again.');
      rl.close();
      return;
    }
    
    // Hash the password using same settings as regular users
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Create admin user with all required fields
    const adminUser = {
      username: username,
      email: email,
      password: hashedPassword,
      role: 'admin', // This is the key difference from regular users
      createdAt: new Date(),
      goals: [],
      progress: {},
      game_stats: {
        dailyStreak: 0,
        pointTotal: 0,
        currentRank: 3 // Start admin with Gold rank
      }
    };
    
    // Insert the admin user
    const result = await db.collection("users").insertOne(adminUser);
    
    console.log('✅ Admin user created successfully!');
    console.log('\n🎉 Admin Details:');
    console.log('- User ID:', result.insertedId);
    console.log('- Username:', adminUser.username);
    console.log('- Email:', adminUser.email);
    console.log('- Role:', adminUser.role);
    console.log('- Game Rank: Gold (Level 3)');
    console.log('\n🔐 Security Note:');
    console.log('Your password has been securely hashed and stored in the database.');
    console.log('Make sure to remember your credentials as they are not stored in plain text.');
    console.log('\n🚀 Next Steps:');
    console.log('1. Start your ChompQuest server');
    console.log('2. Go to the sign-in page');
    console.log('3. Log in with your admin credentials');
    console.log('4. You\'ll be automatically redirected to the admin dashboard!');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    rl.close();
    process.exit(0);
  }
}

// Run the script
createAdminUser();