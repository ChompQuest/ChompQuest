import React, {useState} from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SignIn from './components/SignIn'; 
import SignUp from './components/SignUp';
import NutritionGoals from './components/NutritionGoals';
import Dashboard from './components/mainPage/Dashboard';

import './App.css'; 
function App() {

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    // Check if user is already logged in from localStorage
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user).isLoggedIn : false;
  });

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    // Clear user data from localStorage
    localStorage.removeItem('user');
  };

  // dummy test for nutrition tracker, will change when we have add meal
  const [dailyNutrition, setDailyNutrition] = useState({
    calories: 1200,
    protein: 80,
    carbs: 150,
    fats: 40,
  });

  const dailyGoals = {
    calories: 2000,
    protein: 100,
    carbs: 250,
    fats: 60,
  };

  const logMeal = (newIntake: { calories: number; protein: number; carbs: number; fats: number; }) => {
    setDailyNutrition(prev => ({
      calories: prev.calories + newIntake.calories,
      protein: prev.protein + newIntake.protein,
      carbs: prev.carbs + newIntake.carbs,
      fats: prev.fats + newIntake.fats,
    }));
  };
  // test ends

  return (
    <Router>
      <div className="App">
        
        <Routes>
         {/* checks if person is signed in or not */}
          <Route
            path="/signin"
            element={isLoggedIn ? <Navigate to="/dashboard" replace /> : <SignIn onLogin={handleLogin} />}
          />
          <Route
            path="/signup"
            element={isLoggedIn ? <Navigate to="/dashboard" replace /> : <SignUp onLogin={handleLogin} />}
          />

          {/* only accessible if user is logged in, if not they are taken to sign in  */}
          <Route
            path="/dashboard"
            element={
              isLoggedIn ? (
                <Dashboard 
                  dailyNutrition={dailyNutrition}
                  dailyGoals={dailyGoals}
                  logMeal={logMeal}
                  onLogout={handleLogout} 
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
      </div>
    </Router>
  );
}

export default App;