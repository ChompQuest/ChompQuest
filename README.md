# ChompQuest 🎯

A gamified nutrition tracking application that helps you level up your health by turning your nutrition goals into quests!

This repository was forked from [mern-stack-example]([url](https://github.com/mongodb-developer/mern-stack-example)) which is based on this [MongoDB MERN tutorial]([url](https://www.mongodb.com/resources/languages/mern-stack-tutorial))

## Features

- 🎮 **Gamified Nutrition Tracking** - Turn your nutrition goals into quests
- 👤 **User Account Management** - Secure signup and login with JWT authentication
- 🏆 **Achievement System** - Unlock ranks (Bronze, Silver, Gold) based on daily streaks
- 📊 **Progress Visualization** - Track your nutrition journey with detailed stats
- 💧 **Water Intake Tracking** - Monitor daily hydration goals
- 🍽️ **Meal Logging** - Log meals with detailed nutrition information
- 🎯 **Custom Nutrition Goals** - Set personalized calorie, protein, carbs, fat, and water goals
- 👑 **Admin Dashboard** - Complete admin panel for user and food management
- 🔒 **Role-Based Access** - Secure admin and member user roles
- 📈 **Real-time Stats** - Live updates of nutrition progress and game stats

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite, CSS3
- **Backend:** Node.js, Express.js, MongoDB
- **Database:** MongoDB Atlas
- **Authentication:** JWT (JSON Web Tokens)
- **Password Security:** bcryptjs for password hashing

## Project Structure

```
ChompQuest/
├── mern/
│   ├── server/                 # Backend API
│   │   ├── routes/            # API endpoints
│   │   ├── middleware/        # Authentication middleware
│   │   ├── db/               # Database connection
│   │   └── scripts/          # Utility scripts
│   └── chompquest-frontend/   # React frontend
│       ├── src/
│       │   ├── components/   # React components
│       │   │   ├── admin/    # Admin dashboard components
│       │   │   └── mainPage/ # Main app components
│       │   └── types/        # TypeScript type definitions
│       └── public/           # Static assets
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB Atlas account
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd ChompQuest
   ```

2. **Set up the backend**

   ```bash
   cd mern/server
   npm install
   ```

3. **Configure environment variables**
   Create `mern/server/.env` with your MongoDB Atlas URI and JWT secret:

   ```env
   ATLAS_URI=mongodb+srv://<username>:<password>@<your-cluster>.mongodb.net/
   PORT=5050
   JWT_SECRET=your-super-secret-jwt-key-here
   ```

   **Important:**

   - Replace `<username>`, `<password>`, and `<your-cluster>` with your MongoDB Atlas credentials
   - Generate a strong JWT_SECRET (see JWT Setup section below)
   - Never commit your `.env` file to version control

4. **Start the backend server**

   ```bash
   npm start
   ```

5. **Set up the frontend**

   ```bash
   cd ../chompquest-frontend
   npm install
   ```

6. **Start the frontend development server**

   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to `http://localhost:5173` to see ChompQuest in action!

## JWT Token Setup

### Generating a JWT Secret

1. **Using Node.js crypto module:**

   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

2. **Using OpenSSL:**

   ```bash
   openssl rand -hex 64
   ```

3. **Online generator (for development only):**
   Visit a secure random string generator and create a 64+ character string

### Adding JWT Secret to Environment

Add the generated secret to your `mern/server/.env` file:

```env
JWT_SECRET=your-generated-secret-here
```

## Admin Setup

### Creating an Admin User

1. **Run the admin creation script:**

   ```bash
   cd mern/server
   node createAdminUser.js
   ```

2. **Follow the prompts to create your admin account**

3. **Login with admin credentials to access the admin dashboard**

### Admin Features

- **User Management:** View, edit, and delete user accounts
- **Food Item Management:** Add, edit, and delete food items from the database
- **Game Stats Management:** Modify user points and streaks
- **System Overview:** Monitor application usage and user activity

## API Endpoints

### Authentication

- `POST /user/signup` - Create a new user account
- `POST /user/login` - Authenticate user and receive JWT token

### User Management (Protected)

- `GET /user/profile` - Get user profile information
- `PUT /user/profile` - Update user profile
- `PUT /user/change-password` - Change user password
- `GET /user/game-stats` - Get user's game statistics
- `PUT /user/game-stats` - Update user's game statistics

### Nutrition Tracking (Protected)

- `GET /user/nutrition-goals` - Get user's nutrition goals
- `POST /user/nutrition-goals` - Save user's nutrition goals
- `PUT /user/nutrition-goals` - Update user's nutrition goals
- `POST /user/nutrition-streak` - Update nutrition streak and daily goals
- `POST /user/check-daily-goals` - Check daily goal completion status

### Meal Management (Protected)

- `POST /nutrition/meals` - Log a new meal
- `GET /nutrition/meals` - Get user's meal history
- `DELETE /nutrition/meals/:id` - Delete a meal

### Water Tracking (Protected)

- `POST /nutrition/water` - Log water intake
- `GET /nutrition/water` - Get water intake history

### Admin Endpoints (Admin Only)

- `GET /admin/users` - Get all users
- `GET /admin/users/:id` - Get specific user
- `PUT /admin/users/:id/role` - Update user role
- `PUT /admin/users/:id/game-stats` - Update user game stats
- `DELETE /admin/users/:id` - Delete user
- `GET /admin/foods` - Get all food items
- `POST /admin/foods` - Add new food item
- `PUT /admin/foods/:id` - Update food item
- `DELETE /admin/foods/:id` - Delete food item

## Game Mechanics

### Ranking System

- **Bronze (Rank 1):** 0-14 day streak
- **Silver (Rank 2):** 15-29 day streak
- **Gold (Rank 3):** 30+ day streak

### Points System

- **Daily Goal Completion:** +10 points
- **Streak Maintenance:** Points accumulate with daily streaks
- **Real-time Updates:** Points update immediately when goals are met

### Daily Goals

Users must meet all nutrition goals in a single day:

- Calorie goal
- Protein goal
- Carbohydrate goal
- Fat goal
- Water intake goal

## Development

- **Frontend:** `http://localhost:5173`
- **Backend:** `http://localhost:5050`

### Available Scripts

**Backend:**

```bash
npm start          # Start the server
```

**Frontend:**

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
npm test           # Run tests
```

## Security Features

- **JWT Authentication:** Secure token-based authentication
- **Password Hashing:** bcryptjs for secure password storage
- **Role-Based Access:** Admin and member user roles
- **Input Validation:** Comprehensive validation for all user inputs
- **Protected Routes:** Middleware protection for sensitive endpoints

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
