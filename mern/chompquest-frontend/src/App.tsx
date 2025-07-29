import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import NutritionGoals from './components/NutritionGoals';
import Dashboard from './components/mainPage/Dashboard';

import type { NutrientData, LoggedMealData } from './components/types';

import AddWaterModal from './components/mainPage/AddCustomWaterModal';

import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user).isLoggedIn : false;
  });

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('user');
    setDailyNutrition({ calories: 0, protein: 0, carbs: 0, fats: 0 });
    setCurrentWaterIntake(0); 
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
            element={isLoggedIn ? <Navigate to="/dashboard" replace /> : <SignUp onLogin={handleLogin} />}
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
                ? <NutritionGoals onLogin={handleLogin} onLogout={handleLogout} />
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