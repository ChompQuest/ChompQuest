import { connectToDatabase, getDb, closeDatabase } from "./db/connection.js";

// This script is used to test the database connection and insert a test user into the "users" collection.
async function runTest() {
  await connectToDatabase(); // Connects to MongoDB
  const db = getDb();        // Gets the chompDb database

  const result = await db.collection("users").insertOne({
    name: "Test User",
    email: "test@example.com",
    createdAt: new Date()
  });

  console.log("Test user inserted with ID:", result.insertedId);
 
  await closeDatabase(); // Close the connection
}

runTest();
