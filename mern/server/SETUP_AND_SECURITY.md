# ChompQuest Setup & Security Guide

## Environment Setup

### Required Environment Variables

Create a `.env` file in the server directory with the following variables:

```env
# MongoDB Connection
ATLAS_URI=mongodb+srv://<username>:<password>@<your-cluster>.mongodb.net/
DB_NAME=chompDB

# JWT Secret (generate a secure random string)
JWT_SECRET=your_super_secret_jwt_key_here

# Server Port
PORT=5050
```

### JWT Secret Generation

To generate a secure JWT secret, you can use:

```bash
# Option 1: Using Node.js crypto module
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Option 2: Using OpenSSL
openssl rand -hex 64

# Option 3: Online generator (for development only)
# Visit: https://generate-secret.vercel.app/64
```

**Important:** Never use a weak or predictable secret in production!

## JWT Implementation

### Installation

Install the necessary npm packages:

```bash
cd mern/server
npm install jsonwebtoken bcryptjs
```

### User Login and Token Creation

When a user logs in, the server:

1. Finds the user in the database
2. Verifies their password using bcrypt
3. Creates and signs a JWT to send back to the client

#### Example Login Route

```javascript
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const router = express.Router();

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  // 1. Find the user by username in the database
  const user = await db.collection("users").findOne({ username });
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
      id: user._id.toString(),
      username: user.username,
      role: user.role || "member",
    },
  };

  // 4. Sign the token with a secret key
  jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: "3h" },
    (err, token) => {
      if (err) throw err;
      res.json({
        message: "Login successful",
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role || "member",
        },
        game_stats: user.game_stats,
        token,
      });
    }
  );
});
```

### Protecting Routes with Middleware

Create middleware to protect routes by ensuring incoming requests have a valid JWT.

#### Authentication Middleware (`middleware/authMiddleware.js`)

```javascript
import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  // 1. Get token from the Authorization header
  const authHeader = req.header("Authorization");

  // 2. Check if the header exists
  if (!authHeader) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  // 3. Extract the token (remove "Bearer " prefix)
  const token = authHeader.replace("Bearer ", "");

  try {
    // 4. Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 5. Add user info to request object
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ message: "Token is not valid" });
  }
};

export default authMiddleware;
```

#### Admin Middleware (`middleware/adminMiddleware.js`)

```javascript
import jwt from "jsonwebtoken";

const adminMiddleware = (req, res, next) => {
  // 1. Get token from the Authorization header
  const authHeader = req.header("Authorization");

  if (!authHeader) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  const token = authHeader.replace("Bearer ", "");

  try {
    // 2. Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Check if user is admin
    if (decoded.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Access denied. Admin privileges required." });
    }

    // 4. Add user info to request object
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ message: "Token is not valid" });
  }
};

export default adminMiddleware;
```

### Using Middleware in Routes

```javascript
import authMiddleware from "./middleware/authMiddleware.js";
import adminMiddleware from "./middleware/adminMiddleware.js";

// Protected route (any authenticated user)
router.get("/user/profile", authMiddleware, (req, res) => {
  // req.user contains user info
});

// Admin-only route
router.get("/admin/users", adminMiddleware, (req, res) => {
  // Only admins can access this
});
```

## Security Best Practices

### Password Security

- **Never store passwords in plain text**
- **Use bcrypt for hashing** with salt rounds of 12 or higher
- **Validate password strength** (minimum length, complexity)

```javascript
// Password hashing example
const saltRounds = 12;
const hashedPassword = await bcrypt.hash(password, saltRounds);

// Password verification example
const isPasswordValid = await bcrypt.compare(password, user.password);
```

### JWT Security

- **Use strong, random secrets** (64+ characters)
- **Set appropriate expiration times** (3h for regular tokens)
- **Store secrets in environment variables**
- **Never expose secrets in client-side code**

### Input Validation

- **Validate all user inputs** server-side
- **Sanitize data** before database operations
- **Use parameterized queries** to prevent injection

```javascript
// Example validation
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  return password.length >= 6 && password.length <= 128;
};
```

### Rate Limiting

Consider implementing rate limiting for authentication endpoints:

```javascript
import rateLimit from "express-rate-limit";

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: "Too many login attempts, please try again later",
});

router.post("/login", loginLimiter, loginHandler);
```

## Testing the Setup

### 1. Test Database Connection

```bash
node checkDatabase.js
```

### 2. Start the Server

```bash
npm start
```

### 3. Test API Endpoints

- **Create a user**: `POST /user/signup`
- **Login**: `POST /user/login`
- **Get game stats**: `GET /user/game-stats` (with JWT token)
- **Update game stats**: `PUT /user/game-stats` (with JWT token)

### 4. Test Admin Functionality

```bash
# Create admin user
node createAdminUser.js

# Test admin login and dashboard access
```

## Game Stats Structure

New users automatically have the following game stats:

```json
{
  "game_stats": {
    "dailyStreak": 0,
    "pointTotal": 0,
    "currentRank": 1
  }
}
```

## Rank System

- **1** = Bronze (default)
- **2** = Silver
- **3** = Gold

## Troubleshooting

### Common Issues

1. **JWT_SECRET not set**

   - Error: "JWT_SECRET is not defined"
   - Solution: Add JWT_SECRET to your .env file

2. **Invalid JWT token**

   - Error: "Token is not valid"
   - Solution: Check token format and expiration

3. **Database connection failed**

   - Error: "MongoDB connection error"
   - Solution: Verify ATLAS_URI in .env file

4. **Admin access denied**
   - Error: "Access denied. Admin privileges required"
   - Solution: Check user role in database

### Security Checklist

- [ ] JWT_SECRET is a strong, randomly generated string
- [ ] All passwords are hashed with bcrypt
- [ ] Input validation is implemented
- [ ] Protected routes use appropriate middleware
- [ ] Environment variables are properly set
- [ ] No sensitive data is logged
- [ ] Rate limiting is configured (optional)
- [ ] HTTPS is used in production
