# ChompQuest Admin Guide

## Overview

This guide covers everything you need to know about admin users in ChompQuest, from creation to implementation details.

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

### Method 1: Interactive Admin Creation Script (Recommended)

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

#### Example Session

```
🚀 ChompQuest Admin User Creation

This script will create a new admin user for your ChompQuest application.
Please provide the following information:

📧 Enter admin email: admin@mydomain.com
👤 Enter admin username: chompquest_admin
🔒 Enter admin password: MySecurePassword123!

⏳ Validating and creating admin user...

✅ Admin user created successfully!

🎉 Admin Details:
- User ID: 507f1f77bcf86cd799439011
- Username: chompquest_admin
- Email: admin@mydomain.com
- Role: admin
- Game Rank: Gold (Level 3)

🔐 Security Note:
Your password has been securely hashed and stored in the database.
Make sure to remember your credentials as they are not stored in plain text.

🚀 Next Steps:
1. Start your ChompQuest server
2. Go to the sign-in page
3. Log in with your admin credentials
4. You'll be automatically redirected to the admin dashboard!
```

#### Validation Examples

**Invalid Email:**

```
📧 Enter admin email: not-an-email
❌ Please enter a valid email address
📧 Enter admin email: admin@mydomain.com
```

**Invalid Username:**

```
👤 Enter admin username: ab
❌ Username must be at least 3 characters long
👤 Enter admin username: chompquest_admin
```

**Invalid Password:**

```
🔒 Enter admin password: weak
❌ Password must be at least 6 characters long
🔒 Enter admin password: MySecurePassword123!
```

**User Already Exists:**

```
📧 Enter admin email: existing@user.com
👤 Enter admin username: existing_user
🔒 Enter admin password: MySecurePassword123!

⏳ Validating and creating admin user...

❌ User already exists!
A user with this username or email already exists:
- Username: existing_user
- Email: existing@user.com
- Role: member

Please choose different credentials and try again.
```

### Method 2: Manual Database Update

If you need to convert an existing user to admin:

```javascript
// In MongoDB shell or compass
db.users.updateOne(
  { username: "existing_username" },
  { $set: { role: "admin" } }
);
```

## Testing Admin Login

1. Start your server: `npm start`
2. Navigate to the sign-in page
3. Log in with your admin credentials
4. You should be automatically redirected to the admin dashboard

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

### Admin Authentication

Use `adminMiddleware` for routes that require admin privileges:

```javascript
import adminMiddleware from "./middleware/adminMiddleware.js";
router.get("/admin/users", adminMiddleware, (req, res) => {
  // Only admins can access this route
});
```

## Admin Features

### User Management

- **View All Users**: List all registered users with their stats
- **Edit User Stats**: Modify user points, streaks, and ranks
- **Delete Users**: Remove user accounts (with confirmation)
- **Search Users**: Find specific users by username or email

### Food Item Management

- **Add Food Items**: Add new foods to the database
- **Edit Food Items**: Update nutritional information
- **Delete Food Items**: Remove foods from the database
- **Search Foods**: Find specific foods by name

### System Overview

- **User Statistics**: Monitor application usage
- **Activity Tracking**: View user engagement metrics
- **Database Management**: Manage application data

## API Endpoints (Admin Only)

### User Management

- `GET /admin/users` - Get all users
- `GET /admin/users/:id` - Get specific user
- `PUT /admin/users/:id/role` - Update user role
- `PUT /admin/users/:id/game-stats` - Update user game stats
- `DELETE /admin/users/:id` - Delete user

### Food Management

- `GET /admin/foods` - Get all food items
- `POST /admin/foods` - Add new food item
- `PUT /admin/foods/:id` - Update food item
- `DELETE /admin/foods/:id` - Delete food item

## Security Considerations

### Password Security

- All passwords are hashed using bcrypt with salt rounds of 12
- Passwords are never stored in plain text
- Password validation ensures minimum security requirements

### Role-Based Access

- Admin routes are protected by middleware
- JWT tokens include user role information
- Frontend validates admin status before rendering admin components

### Data Validation

- All admin inputs are validated server-side
- User IDs are validated as valid ObjectIds
- Food data is validated for proper nutritional information

## Troubleshooting

### Common Issues

1. **Admin user not created**

   - Check MongoDB connection
   - Verify environment variables are set
   - Ensure no duplicate username/email exists

2. **Admin login not working**

   - Verify admin user exists in database
   - Check JWT_SECRET is properly set
   - Ensure server is running

3. **Admin dashboard not accessible**
   - Check user role in database
   - Verify JWT token includes role
   - Check frontend route protection

### Testing Admin Functionality

1. **Create test admin user**

   ```bash
   node createAdminUser.js
   ```

2. **Test admin login**

   - Login with admin credentials
   - Verify redirect to admin dashboard

3. **Test admin features**
   - Try viewing all users
   - Test food item management
   - Verify user editing capabilities

## Production Checklist

- [ ] JWT_SECRET is a strong, randomly generated string
- [ ] Admin passwords meet security requirements
- [ ] All admin routes are properly protected
- [ ] Database indexes are optimized
- [ ] Error handling is comprehensive
- [ ] Logging is implemented for admin actions
- [ ] Rate limiting is configured for admin endpoints
