# Admin User Implementation Guide

## Overview

This guide explains how admin users are implemented in ChompQuest and how to use them.

## Database Structure

Admin users are stored in the same `users` collection as regular users, with an additional `role` field:

```javascript
{
  _id: ObjectId,
  username: String,
  email: String,
  password: String, // Hashed with bcrypt
  role: String, // 'admin' or 'member' (default)
  createdAt: Date,
  goals: Array,
  progress: Object,
  game_stats: {
    dailyStreak: Number,
    pointTotal: Number,
    currentRank: Number
  }
}
```

## Creating Admin Users

### Method 1: Using the Interactive Admin Creation Script (Recommended)

1. Navigate to the server directory:

   ```bash
   cd mern/server
   ```

2. Run the interactive script:

   ```bash
   node createAdminUser.js
   ```

3. Follow the prompts to enter:

   - Admin email (with validation)
   - Admin username (with validation)
   - Admin password (with validation)

4. The script will create the admin user and display confirmation details.

### Method 2: Manual Database Update

If you need to convert an existing user to admin:

```javascript
// In MongoDB shell or compass
db.users.updateOne(
  { username: "existing_username" },
  { $set: { role: "admin" } }
);
```

## Authentication Flow

### 1. Login Process

- Admin users use the same `/user/login` endpoint as regular users
- The JWT token includes the user's role
- Frontend stores the role in localStorage

### 2. Role-Based Routing

- **Regular users**: Redirected to `/dashboard`
- **Admin users**: Redirected to `/admin/dashboard`

### 3. Route Protection

```javascript
// Frontend route protection
isLoggedIn && isUserAdmin() ? (
  <AdminDashboard />
) : isLoggedIn ? (
  <Navigate to="/dashboard" replace />
) : (
  <Navigate to="/signin" replace />
);
```

## Backend Middleware

### Regular Authentication

Use `authMiddleware` for routes that require any logged-in user:

```javascript
import authMiddleware from "./middleware/authMiddleware.js";
router.get("/protected-route", authMiddleware, (req, res) => {
  // req.user contains user info including role
});
```

### Admin-Only Routes

Use `adminMiddleware` for routes that require admin privileges:

```javascript
import adminMiddleware from "./middleware/adminMiddleware.js";
router.get("/admin-only-route", adminMiddleware, (req, res) => {
  // Only admins can access this route
});
```

## API Endpoints for Admin Features

### User Management

```javascript
// Get all users (admin only)
GET /admin/users
Headers: Authorization: Bearer <admin-jwt-token>

// Get user by ID (admin only)
GET /admin/users/:id
Headers: Authorization: Bearer <admin-jwt-token>

// Update user (admin only)
PUT /admin/users/:id
Headers: Authorization: Bearer <admin-jwt-token>
Body: { /* user data to update */ }

// Delete user (admin only)
DELETE /admin/users/:id
Headers: Authorization: Bearer <admin-jwt-token>
```

### Food Item Management

```javascript
// Get all food items (admin only)
GET /admin/food-items
Headers: Authorization: Bearer <admin-jwt-token>

// Create food item (admin only)
POST /admin/food-items
Headers: Authorization: Bearer <admin-jwt-token>
Body: { name, calories, protein, carbs, fats }

// Update food item (admin only)
PUT /admin/food-items/:id
Headers: Authorization: Bearer <admin-jwt-token>
Body: { /* food item data to update */ }

// Delete food item (admin only)
DELETE /admin/food-items/:id
Headers: Authorization: Bearer <admin-jwt-token>
```

## Frontend Admin Components

### AdminDashboard

- Main admin interface
- Tabs for different admin functions
- User management
- Food item management
- System statistics

### AdminProfileMenu

- Admin-specific profile menu
- Logout functionality
- Admin-specific settings

## Security Considerations

1. **Password Security**: Admin passwords should be strong and unique
2. **Token Expiration**: JWT tokens expire after 3 hours
3. **Role Verification**: Every admin route checks the user's role in the JWT
4. **Frontend Protection**: Admin routes are protected on the frontend
5. **Backend Validation**: All admin endpoints validate admin role on the backend

## Testing Admin Functionality

1. Create an admin user using the script
2. Log in with admin credentials
3. Verify redirection to `/admin/dashboard`
4. Test admin-only features
5. Log out and verify regular user flow still works

## Troubleshooting

### Admin user not redirecting properly

- Check if role is stored correctly in localStorage
- Verify JWT token includes correct role
- Check browser console for routing errors

### Admin routes returning 403

- Verify JWT token is valid
- Check if user role is 'admin' in database
- Ensure admin middleware is applied to the route

### Cannot create admin user

- Check database connection
- Verify no existing user with same username/email
- Check script output for specific errors
