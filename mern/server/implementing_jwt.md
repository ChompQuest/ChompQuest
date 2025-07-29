# JWT Implementation Guide for MERN Stack (ChompQuest)

This guide provides a step-by-step process for implementing JSON Web Token (JWT) authentication in a MERN (MongoDB, Express.js, React, Node.js) application.

---

## Backend: Express.js & Node.js

The backend server is responsible for creating JWTs upon successful login and verifying them on subsequent requests to protected API routes.

### 1. Installation

First, install the necessary npm packages. `jsonwebtoken` is used for creating and verifying tokens, and `bcryptjs` is for securely hashing and comparing user passwords.

Navigate to your server directory (`/mern/server`) and run:

```bash
npm install jsonwebtoken bcryptjs
```

### 2. User Login and Token Creation

When a user logs in, the server must:

1.  Find the user in the database.
2.  Verify their password.
3.  If credentials are correct, create and sign a JWT to send back to the client.

Here is an example of a login route (`/routes/auth.js`):

```javascript
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/userModel"); // Assuming a user model exists

const router = express.Router();

// --- POST /api/auth/login ---
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // 1. Find the user by email in the database
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  // 2. Compare the provided password with the stored hash
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  // 3. Create the JWT payload
  const payload = {
    user: {
      id: user.id, // User ID from MongoDB
      role: user.role, // e.g., 'member' or 'admin'
    },
  };

  // 4. Sign the token with a secret key
  jwt.sign(
    payload,
    process.env.JWT_SECRET, // Your secret key from environment variables
    { expiresIn: "3h" }, // Set an expiration time for the token
    (err, token) => {
      if (err) throw err;
      res.json({ token }); // Send the token to the client
    }
  );
});

module.exports = router;
```

**Important:**

- **Password Hashing**: Never store passwords in plain text. Always hash them with a strong algorithm like bcrypt.
- **JWT Secret**: Your `JWT_SECRET` is critical for security. Store it in an environment variable (`.env` file) and do not expose it in your source code.

### 3. Protecting Routes with Middleware

Middleware is used to protect routes by ensuring that incoming requests have a valid JWT.

Create a middleware file (`/middleware/authMiddleware.js`):

```javascript
const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  // 1. Get token from the Authorization header
  const authHeader = req.header("Authorization");

  // 2. Check if the header exists
  if (!authHeader) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  // 3. Check if the token is in the "Bearer <token>" format
  const token = authHeader.split(" ")[1];
  if (!token) {
    return res
      .status(401)
      .json({ message: "Token format is invalid, authorization denied" });
  }

  // 4. Verify the token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user; // Attach the decoded payload (user info) to the request object
    next(); // Proceed to the route handler
  } catch (err) {
    res.status(401).json({ message: "Token is not valid" });
  }
};
```

You can now apply this middleware to any route you want to protect:

```javascript
// In chompquest/mern/server/routes/record.js
const authMiddleware = require("../middleware/authMiddleware");

// This route is now protected.
recordRoutes.get("/progress", authMiddleware, (req, res) => {
  // The middleware has validated the token, so we can access user info
  console.log(req.user.id); // The ID of the logged-in user
  // ... logic to fetch the user's progress ...
});
```

---

## Frontend: React

The React client is responsible for storing the JWT after login and attaching it to all subsequent requests to protected backend endpoints.

### 1. Storing the JWT

Upon successful login, store the token received from the backend in `localStorage`. This makes it persist across browser sessions.

```javascript
// In your login component
const handleLogin = async (formData) => {
  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    const data = await response.json();

    if (data.token) {
      // Store the token in localStorage
      localStorage.setItem("token", data.token);
      // Redirect to a protected page
      window.location.href = "/dashboard";
    } else {
      console.error(data.message); // Handle login error
    }
  } catch (error) {
    console.error("Login request failed:", error);
  }
};
```

### 2. Sending the JWT with API Requests

Create a centralized API client (e.g., using `axios`) that automatically attaches the token to the `Authorization` header of every request.

```javascript
// In a utility file like src/utils/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Use an interceptor to add the token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
```

Now, you can use this `api` instance for all your API calls.

### 3. Handling Logout

To log out, simply remove the token from `localStorage` and redirect the user to the login page.

```javascript
const handleLogout = () => {
  // Remove the token from client storage
  localStorage.removeItem("token");
  // Redirect to a public page
  window.location.href = "/login";
};
```

This effectively logs the user out on the client side, as they no longer have the token required to access protected resources.
