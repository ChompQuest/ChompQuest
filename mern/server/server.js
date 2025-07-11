import express from "express";
import cors from "cors";
import users from "./routes/user.js";
import records from "./routes/record.js";
import { connectToDatabase } from "./db/connection.js";

const PORT = process.env.PORT || 5050;
const app = express();

app.use(cors());
app.use(express.json());
app.use("/user", users);
app.use("/record", records);

// start the Express server

connectToDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}).catch((err) => {
  console.error("Failed to connect to the database:", err);
  process.exit(1); // Exit the application if the database connection fails
});
