import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import NutritionGoals from './components/NutritionGoals';
import Dashboard from './components/mainPage/Dashboard';

import type { NutrientData, LoggedMealData } from './components/types';

import AddWaterModal from './components/mainPage/AddCustomWaterModal';

import './App.css';

interface GameStats {
  dailyStreak: number;
  pointTotal: number;
  currentRank: number;
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user).isLoggedIn : false;
  });

  const [gameStats, setGameStats] = useState<GameStats>(() => {
    // Try to get game stats from localStorage on app start
    const storedStats = localStorage.getItem('gameStats');
    if (storedStats) {
      try {
        const parsedStats = JSON.parse(storedStats);
        // Validate that we have proper game stats
        if (parsedStats && typeof parsedStats.dailyStreak === 'number' && 
            typeof parsedStats.pointTotal === 'number' && 
            typeof parsedStats.currentRank === 'number') {
          return parsedStats;
        }
      } catch (error) {
        console.error('Error parsing stored game stats:', error);
      }
    }
    return {
      dailyStreak: 0,
      pointTotal: 0,
      currentRank: 1
    };
  });

  const handleLogin = () => {
    setIsLoggedIn(true);
    
    // Check for fresh game stats that were loaded during sign in
    const freshGameStats = localStorage.getItem('freshGameStats');
    if (freshGameStats) {
      try {
        const parsedStats = JSON.parse(freshGameStats);
        if (parsedStats && typeof parsedStats.dailyStreak === 'number' && 
            typeof parsedStats.pointTotal === 'number' && 
            typeof parsedStats.currentRank === 'number') {
          setGameStats(parsedStats);
          localStorage.setItem('gameStats', JSON.stringify(parsedStats));
        }
      } catch (error) {
        console.error('Error parsing fresh game stats:', error);
      }
      // Clean up the temporary storage
      localStorage.removeItem('freshGameStats');
    }
  };

  const handleSignup = () => {
    // For signup, we don't set isLoggedIn to true yet
    // The user will be redirected to nutrition goals first
    // isLoggedIn will be set to true after they complete nutrition goals
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('user');
    localStorage.removeItem('token'); // Clear JWT token
    localStorage.removeItem('gameStats'); // Clear game stats
    setGameStats({ dailyStreak: 0, pointTotal: 0, currentRank: 1 }); // Reset game stats
    setDailyNutrition({ calories: 0, protein: 0, carbs: 0, fats: 0 });
    setCurrentWaterIntake(0); 
  };

  const updateGameStats = (newStats: GameStats) => {
    setGameStats(newStats);
    localStorage.setItem('gameStats', JSON.stringify(newStats));
  };

  //figure out how to get real values from backend
  const [dailyNutrition, setDailyNutrition] = useState<NutrientData>({
    calories: 1200,
    protein: 80,
    carbs: 150,
    fats: 40,
  });

  const dailyGoals: NutrientData = {
    calories: 2000,
    protein: 100,
    carbs: 250,
    fats: 60,
  };

  const logMeal = (newIntake: LoggedMealData) => { 
    setDailyNutrition(prev => ({
      calories: prev.calories + newIntake.calories,
      protein: prev.protein + newIntake.protein,
      carbs: prev.carbs + newIntake.carbs,
      fats: prev.fats + newIntake.fats,
    }));
  };
  // Test ends

  const [currentWaterIntake, setCurrentWaterIntake] = useState<number>(0);
  const waterGoal = 2000; // get water goal from backend

  const [showAddCustomWaterModal, setShowAddCustomWaterModal] = useState(false);

  const handleAddWater = (amount: number) => {
    setCurrentWaterIntake(prev => prev + amount);
  };

  const handleOpenAddCustomWaterModal = () => {
    setShowAddCustomWaterModal(true);
  };

  const handleCloseAddCustomWaterModal = () => {
    setShowAddCustomWaterModal(false);
  };


  return (
    <Router>
      <div className="App">
        <Routes>
          <Route
            path="/signin"
            element={isLoggedIn ? <Navigate to="/dashboard" replace /> : <SignIn onLogin={handleLogin} />}
          />
          <Route
            path="/signup"
            element={isLoggedIn ? <Navigate to="/dashboard" replace /> : <SignUp onSignup={handleSignup} />}
          />

          {/* only accessible if user is logged in, if not they are taken to sign in */}
          <Route
            path="/dashboard"
            element={
              isLoggedIn ? (
                <Dashboard
                  dailyNutrition={dailyNutrition}
                  dailyGoals={dailyGoals}
                  logMeal={logMeal}
                  onLogout={handleLogout}
                  currentWaterIntake={currentWaterIntake}
                  waterGoal={waterGoal}
                  onOpenAddWaterModal={handleOpenAddCustomWaterModal}
                  gameStats={gameStats}
                  updateGameStats={updateGameStats}
                />
              ) : (
                <Navigate to="/signin" replace /> // if not logged in, go sign in
              )
            }
          />

          {/* if they are logged in -> dashboard, if not -> login */}
          <Route
            path="/"
            element={isLoggedIn ? <Navigate to="/dashboard" replace /> : <Navigate to="/signin" replace />}
          />

          {/* nutrition goals route - only accessible if logged in */}
          <Route
            path="/nutrition-goals"
            element={
              isLoggedIn || localStorage.getItem('isNewUser') === 'true'
                ? <NutritionGoals onLogin={handleLogin} />
                : <Navigate to="/signin" replace />
            }
          />

          {/* catch all route for any issues */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* NEW: Render the AddWaterModal conditionally at the root level */}
        {showAddCustomWaterModal && (
          <AddWaterModal
            onClose={handleCloseAddCustomWaterModal}
            onAddWater={handleAddWater}
          />
        )}
      </div>
    </Router>
  );
}

export default App;