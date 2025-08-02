# Admin User Quick Start Guide

## 🚀 Getting Started with Admin Users

### Step 1: Create Your First Admin User

```bash
cd mern/server
node createAdminUser.js
```

**Interactive Setup**: The script will prompt you for:

- Admin email (validated)
- Admin username (validated)
- Admin password (validated)

**Important**: Remember your credentials as they're not stored in plain text!

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

### Step 2: Test Admin Login

1. Start your server: `npm start`
2. Go to your ChompQuest app
3. Sign in with the admin credentials
4. You'll be automatically redirected to the admin dashboard at `/admin/dashboard`

### Step 3: Verify Admin Features

- ✅ User management (view, update roles, delete users)
- ✅ Food item management (create, edit, delete food items)
- ✅ System statistics dashboard
- ✅ Admin-only navigation and UI

## 🔐 Security Features

### Script Security

- ✅ **Simple Input**: Clear, straightforward password entry
- ✅ **Input Validation**: Same validation as your signup form
- ✅ **Duplicate Prevention**: Checks for existing users
- ✅ **Secure Hashing**: Uses bcrypt with 12 salt rounds
- ✅ **No Plain Text**: Credentials never stored in files

### Backend Protection

- ✅ **Admin Middleware**: Validates JWT tokens and admin role
- ✅ **Role-Based Routes**: All admin endpoints require admin privileges
- ✅ **Input Validation**: Comprehensive validation on all admin endpoints
- ✅ **Self-Protection**: Admins cannot delete their own accounts

### Frontend Protection

- ✅ **Route Guards**: Admin routes redirect non-admins to regular dashboard
- ✅ **Role-Based Navigation**: Different dashboards for admin vs regular users
- ✅ **Token Storage**: Secure JWT token handling with role information

## 📡 Available Admin API Endpoints

### User Management

```
GET    /admin/users              - Get all users
GET    /admin/users/:id          - Get specific user
PUT    /admin/users/:id/role     - Update user role
DELETE /admin/users/:id          - Delete user
```

### Food Item Management

```
GET    /admin/food-items         - Get all food items
POST   /admin/food-items         - Create food item
PUT    /admin/food-items/:id     - Update food item
DELETE /admin/food-items/:id     - Delete food item
```

### System Statistics

```
GET    /admin/stats              - Get system statistics
```

## 🔧 Managing Admin Users

### Creating Additional Admins

1. Run the script again: `node createAdminUser.js`
2. Or use the admin dashboard to promote existing users to admin role

### What Happens When You Create an Admin

1. Admin user is created in your MongoDB `users` collection
2. Password is securely hashed and stored
3. User gets `role: 'admin'` and Gold rank (level 3)
4. You can immediately log in with these credentials
5. You'll be redirected to `/admin/dashboard` after login

## 🐛 Troubleshooting

### "Access Denied" Errors

- Verify user has `role: 'admin'` in database
- Check JWT token includes correct role
- Ensure `Authorization: Bearer <token>` header is sent

### Admin Not Redirecting

- Clear browser localStorage: `localStorage.clear()`
- Check if role is stored: `localStorage.getItem('user')`
- Verify login response includes role data

### Database Issues

- Ensure MongoDB connection is working
- Check if `users` collection exists
- Verify user document has `role` field

### Script Issues

- Make sure you're in the correct directory: `cd mern/server`
- Check database connection in script output
- Verify no existing user with same credentials

## 📋 Production Checklist

1. **✅ Test Everything**: Create admin user and test all features
2. **✅ Secure Passwords**: Use strong passwords for admin accounts
3. **✅ Monitor Usage**: Check admin activity through system stats
4. **✅ Backup Data**: Regular backups especially before admin operations
5. **✅ Role Management**: Only promote trusted users to admin

## 🎯 What Was Implemented

✅ **Database Schema**: Added `role` field to user documents  
✅ **Authentication**: Role-based JWT tokens  
✅ **Backend Routes**: Complete admin API with 10+ endpoints  
✅ **Middleware**: Admin-only route protection  
✅ **Frontend Routing**: Role-based navigation  
✅ **Security**: Input validation, self-protection, token verification  
✅ **Interactive Script**: User-friendly admin creation process  
✅ **Documentation**: Complete implementation guide

Your admin system is now fully functional and ready for production use!
