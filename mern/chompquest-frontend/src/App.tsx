import React, {useState} from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SignIn from './components/SignIn'; 
import SignUp from './components/SignUp';
import Dashboard from './components/mainPage/Dashboard';

import './App.css'; 
function App() {

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
    // once we have backend, we can check that here
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    // here we need to clear any tokens
  };

  // dummy test for nutrition tracker
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
  // test ends, delete when done

  return (
    <Router>
      <div className="App">
        {/* <Routes>
          <Route path="/" element={<SignIn />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes> */}

        <Routes>
          {/* Public Routes: Accessible regardless of login status */}
          {/* If already logged in, navigating to /signin or /signup will redirect to /dashboard */}
          <Route
            path="/signin"
            element={isLoggedIn ? <Navigate to="/dashboard" replace /> : <SignIn onLogin={handleLogin} />}
          />
          <Route
            path="/signup"
            element={isLoggedIn ? <Navigate to="/dashboard" replace /> : <SignUp />}
          />

          {/* only accessible if user is logged in, if not they are taken to sign in  */}
          <Route
            path="/dashboard"
            element={
              isLoggedIn ? (
                <Dashboard // Render Dashboard and pass necessary props
                  dailyNutrition={dailyNutrition}
                  dailyGoals={dailyGoals}
                  logMeal={logMeal}
                  onLogout={handleLogout} // Pass the logout handler
                />
              ) : (
                <Navigate to="/signin" replace /> // Redirect if not logged in
              )
            }
          />

          {/* if they are logged in -> dashboard, if not -> login */}
          <Route
            path="/"
            element={isLoggedIn ? <Navigate to="/dashboard" replace /> : <Navigate to="/signin" replace />}
          />

          {/* Catch-all Route: For any unmatched paths, redirect to the default route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;