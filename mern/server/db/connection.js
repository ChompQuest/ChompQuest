import { MongoClient, ServerApiVersion } from "mongodb";
import dotenv from "dotenv";

// export { connectToDatabase, getDb, client };  //For testing purposes  

// Load environment variables
dotenv.config();

const URI = process.env.ATLAS_URI || ""; 
const DB_NAME = process.env.DB_NAME || "chompDB"; // Default database name if it is not set 
const client = new MongoClient(URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// let dbName = process.env.DB_NAME || "employees";
// const client = new MongoClient(URI, { useNewUrlParser: true, useUnifiedTopology: true });


// let client; // Declare the client variable at the top level
let db;   

// Function to connect to the MongoDB database
async function connectToDatabase() {
try {
  // Connect the client to the server
  await client.connect();
  // Send a ping to confirm a successful connection
  await client.db("admin").command({ ping: 1 });  
  console.log("MongoDB connected successfully!");
  

  // Initialize the database instance
  db = client.db(DB_NAME); // Uses the database name from your environment variable or default
  console.log(`Database initialized: ${DB_NAME}`);  
} catch (err) {     
  console.error("MongoDB connection failed:", err); 
  process.exit(1); //Exits the app if MongoDB connection fails

  }
}

function getDb() {
  if (!db) {
    // db = client.db("employees"); // Uses the database name from the environment variable or default
    throw new Error("Database not initialized. Call connect first.");
  }
  return db;
}

  
// Function to close the database connection
async function closeDatabase() {
  if (client) {
    try {
      await client.close();
      console.log("MongoDB connection closed.");
    } catch (err) {
      console.error("Error closing MongoDB connection:", err);
    }
  } else {
    console.warn("No MongoDB client to close. ");
  }

}


export { connectToDatabase, getDb, closeDatabase };
