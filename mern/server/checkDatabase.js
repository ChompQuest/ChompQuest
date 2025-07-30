import { getDb, connectToDatabase } from "./db/connection.js";

async function checkDatabase() {
  try {
    console.log('Checking Database Storage...\n');
    
    // Connect to database
    await connectToDatabase();
    const db = getDb();
    
    // Check users collection
    console.log('Users Collection:');
    const usersCount = await db.collection("users").countDocuments();
    console.log(`Total users: ${usersCount}`);
    
    // Show recent users
    const recentUsers = await db.collection("users")
      .find({})
      .sort({ createdAt: -1 })
      .limit(3)
      .toArray();
    
    console.log('Recent users:');
    recentUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.username} (${user.email}) - Created: ${user.createdAt}`);
      console.log(`   Has nutrition goals: ${user.nutritionGoals ? 'Yes' : 'No'}`);
    });
    
    // Check meals collection
    console.log('\n Meals Collection:');
    const mealsCount = await db.collection("meals").countDocuments();
    console.log(`Total meals: ${mealsCount}`);
    
    if (mealsCount > 0) {
      const recentMeals = await db.collection("meals")
        .find({})
        .sort({ createdAt: -1 })
        .limit(3)
        .toArray();
      
      console.log('Recent meals:');
      recentMeals.forEach((meal, index) => {
        console.log(`${index + 1}. ${meal.name} - ${meal.calories} calories`);
        console.log(`   User: ${meal.userId} - Type: ${meal.mealType} - Created: ${meal.createdAt}`);
      });
    } else {
      console.log('No meals found in database');
    }
    
    // Check collections
    console.log('\n Available Collections:');
    const collections = await db.listCollections().toArray();
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });
    
  } catch (error) {
    console.error('Error checking database:', error);
  }
}

checkDatabase(); 