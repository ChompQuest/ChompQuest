# ChompQuest 🎯

A gamified goal-tracking application that helps you level up your life by turning your goals into quests!

## Features

- 🎮 **Gamified Goal Tracking** - Turn your goals into quests
- 👤 **User Account Management** - Secure signup and login
- 📊 **Progress Visualization** - Track your journey to success
- 🏆 **Achievement System** - Unlock rewards as you progress

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite
- **Backend:** Node.js, Express, MongoDB
- **Database:** MongoDB Atlas

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
   Create `mern/server/.env` with your MongoDB Atlas URI:

   ```
   ATLAS_URI=mongodb+srv://<username>:<password>@<your-cluster>.mongodb.net/
   PORT=5050
   ```

   Additionally, add your JWT secret token
   ```
   JWT_SECRET=TOKEN
   ```

5. **Start the backend server**

   ```bash
   npm start
   ```

6. **Set up the frontend**

   ```bash
   cd ../chompquest-frontend
   npm install
   ```

7. **Start the frontend development server**

   ```bash
   npm run dev
   ```

8. **Open your browser**
   Navigate to `http://localhost:5173` to see ChompQuest in action!

## API Endpoints

### User Management

- `POST /user/signup` - Create a new user account
- `POST /user/login` - Authenticate user login

## Development

- **Frontend:** `http://localhost:5173`
- **Backend:** `http://localhost:5050`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.
