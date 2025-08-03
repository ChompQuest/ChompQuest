import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import NutritionGoals from './components/NutritionGoals';
import SetNutritionGoals from './components/SetNutritionGoals';
import Dashboard from './components/mainPage/Dashboard';
import type { NutrientData, LoggedMealData } from './components/types';
import AddWaterModal from './components/mainPage/AddCustomWaterModal';

import AdminDashboard from './components/admin/AdminDashboard';

import './App.css';

interface GameStats {
  dailyStreak: number;
  pointTotal: number;
  currentRank: number;
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      // User is only considered "fully logged in" if they completed nutrition goals
      return userData.isLoggedIn === true;
    }
    return false;
  });

  // Helper function to check if current user is admin
  const isUserAdmin = () => {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      return userData.role === 'admin';
    }
    return false;
  };

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
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
  });

  const [dailyGoals, setDailyGoals] = useState<NutrientData>({
    calories: 2000,
    protein: 100,
    carbs: 250,
    fats: 60,
  });

  // Fetch daily nutrition data from backend
  const fetchDailyNutrition = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No JWT token found');
        return;
      }

      const response = await fetch('http://localhost:5050/nutrition/today', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        // Update daily nutrition totals
        setDailyNutrition({
          calories: data.totals.calories || 0,
          protein: data.totals.protein || 0,
          carbs: data.totals.carbs || 0,
          fats: data.totals.fat || 0,
        });

        // Update water intake from backend
        setCurrentWaterIntake(data.totals.water || 0);

        // Update daily goals if available
        if (data.goals) {
          setDailyGoals({
            calories: data.goals.calories || 2000,
            protein: data.goals.protein || 100,
            carbs: data.goals.carbs || 250,
            fats: data.goals.fat || 60,
          });
          // Update water goal from backend
          setWaterGoal(data.goals.water || 2000);
        }

        // Update game stats if available
        if (data.gameStats) {
          updateGameStats(data.gameStats);
        }
      } else {
        console.error('Failed to fetch daily nutrition:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching daily nutrition:', error);
    }
  };

  // Fetch nutrition data when user logs in
  useEffect(() => {
    if (isLoggedIn) {
      fetchDailyNutrition();
    }
  }, [isLoggedIn]);

  const logMeal = async (newIntake: LoggedMealData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No JWT token found');
        return;
      }

      // Add meal to backend
      const response = await fetch('http://localhost:5050/nutrition/meals', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newIntake.name,
          calories: newIntake.calories,
          protein: newIntake.protein,
          carbs: newIntake.carbs,
          fat: newIntake.fats,
          mealType: 'snack', // Default to snack, could be made configurable if we have time, but I kept it like this for now
          notes: ''  // notes are optional and can be added later
        }),
      });

      if (response.ok) {
        // Refresh nutrition data from backend
        await fetchDailyNutrition();
      } else {
        console.error('Failed to add meal:', response.statusText);
      }
    } catch (error) {
      console.error('Error adding meal:', error);
    }
  };
  // Test ends

  const [currentWaterIntake, setCurrentWaterIntake] = useState<number>(0);
  const [waterGoal, setWaterGoal] = useState<number>(2000); // get water goal from backend

  const [showAddCustomWaterModal, setShowAddCustomWaterModal] = useState(false);

  const handleAddWater = async (amount: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No JWT token found');
        return;
      }

      // Calculate new total water intake
      const newTotal = currentWaterIntake + amount;

      // Send water intake to backend
      const response = await fetch('http://localhost:5050/nutrition/water', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          intake: newTotal
        }),
      });

      if (response.ok) {
        // Update local state
        setCurrentWaterIntake(newTotal);
        console.log('Water intake updated successfully');
      } else {
        console.error('Failed to update water intake:', response.statusText);
      }
    } catch (error) {
      console.error('Error updating water intake:', error);
    }
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
            element={
              isLoggedIn ? (
                isUserAdmin() ? <Navigate to="/admin/dashboard" replace /> : <Navigate to="/dashboard" replace />
              ) : (
                <SignIn onLogin={handleLogin} />
              )
            }
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
                  isWaterModalOpen={showAddCustomWaterModal}
                />
              ) : (
                <Navigate to="/signin" replace /> // if not logged in, go sign in
              )
            }
          />

          {/* if they are logged in -> appropriate dashboard, if not -> login */}
          <Route
            path="/"
            element={
              isLoggedIn ? (
                isUserAdmin() ? <Navigate to="/admin/dashboard" replace /> : <Navigate to="/dashboard" replace />
              ) : (
                <Navigate to="/signin" replace />
              )
            }
          />

          {/* set nutrition goals route - for new users after signup */}
          <Route
            path="/set-nutrition-goals"
            element={<SetNutritionGoals onLogin={handleLogin} />}
          />
          
          {/* update nutrition goals route - for existing logged-in users */}
          <Route
            path="/nutrition-goals"
            element={
              isLoggedIn
                ? <NutritionGoals onLogin={handleLogin} onLogout={handleLogout} />
                : <Navigate to="/signin" replace />
            }
          />

          {/* Admin dashboard - only accessible if user is logged in and is an admin */}
          <Route
            path="/admin/dashboard"
            element={
              isLoggedIn && isUserAdmin() ? (
                <AdminDashboard onLogout={handleLogout} />
              ) : isLoggedIn ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Navigate to="/signin" replace />
              )
            }
          />

          {/* Legacy admin test route - redirect to new admin dashboard */}
          <Route 
            path="/admin-test" 
            element={<Navigate to="/admin/dashboard" replace />} 
          />

          {/* catch all route for any issues */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* The WaterInput button is no longer rendered directly here.
            It is now rendered inside RecentMealsBox. */}

        {/* Render the AddWaterModal conditionally */}
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