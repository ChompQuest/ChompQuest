import express from "express";

// This will help us connect to the database
// import db from "../db/connection.js";
import { getDb } from "../db/connection.js";

// This help convert the id from string to ObjectId for the _id.
import { ObjectId } from "mongodb";

// router is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /record.
const router = express.Router();

// This section will help you get a list of all the records.
//Get all records from the database
router.get("/", async (req, res) => {
  try {
    // Get the database instance
    const db = getDb();
    // Check if the database is initialized
    const collection = db.collection("records");
    // Find all records in the collection
    const results = await collection.find({}).toArray();
    // If no records found, return an empty array
    // res.send(results).status(200);
    res.status(200).send(results);
    
  } catch (err) {
    // Handle the case where the database is not initialized
    console.error("Database not initialized:", err);  
    // Return a 500 status code with an error message
    return res.status(500).send("Database not initialized. Please try again later.");
  }

});


// This section will help you get a single record by id
// Get a single record by ID
router.get("/:id", async (req, res) => {

  try {
    // Get the database instance
    const db = getDb();
    const collection = db.collection("records");
    const query = { _id: new ObjectId(req.params.id) };
    const result = await collection.findOne(query);

    // If no record found, return a 404 status code
    if (!result) {
      return res.status(404).send("Not found");
    }
    // If record found, return the record with a 200 status code
    // res.send(result).status(200);
    return res.status(200).send(result);

  } catch (err) {
    // Handle the case where the database is not initialized
    console.error("Database not initialized:", err);
    // Return a 500 status code with an error message
    return res.status(500).send("Database not initialized. Please try again later.");
  }


});


// This section will help you create a new record.
router.post("/", async (req, res) => {
  try {
    // Get the database instance
    const db = getDb();
    const collection = db.collection("records");
    
    // Validate the request body
    if (!req.body.name || !req.body.position || !req.body.level) {
      return res.status(400).send("Missing required fields: name, position, or level.");
    }
    // Create a new record with the data from the request body
    const newRecord = {
      name: req.body.name,
      position: req.body.position,
      level: req.body.level,
    };

    // Insert the new record into the collection
    const result = await collection.insertOne(newRecord);


    // Fetch the inserted document using the insertedId
    const insertedRecord = await collection.findOne({ _id: result.insertedId });

    res.status(201).send(insertedRecord);
  } catch (err) {
    console.error("Error creating record:", err);
    res.status(500).send("Error creating record");
  }
  

  //   // Return the inserted record with a 201 status code
  //   res.send(result.ops[0]).status(201);
  // } catch (err) {
  //   console.error(err);
  //   res.status(500).send("Error creating record");
  // }
    
});

// This section will help you update a record by id.
// Update a record by ID
router.patch("/:id", async (req, res) => {
  try {
    const db = getDb();
    const collection = db.collection("records");
    const query = { _id: new ObjectId(req.params.id) };
    const updates = {
      $set: {
        name: req.body.name,
        position: req.body.position,
        level: req.body.level,
      },
    };
    const result = await collection.updateOne(query, updates);
    res.status(200).send(result);
  } catch (err) {
    console.error("Error updating record:", err);
    res.status(500).send("Internal server error");
  }
});

// Delete a record by ID
router.delete("/:id", async (req, res) => {
  try {
    const db = getDb();
    const collection = db.collection("records");
    const query = { _id: new ObjectId(req.params.id) };
    const result = await collection.deleteOne(query);
    res.status(200).send(result);
  } catch (err) {
    console.error("Error deleting record:", err);
    res.status(500).send("Internal server error");
  }
});

export default router;
