import React from 'react';
import NutritionTracker from './NutritionTracker'; 
import '../../App.css'; 

interface NutrientData {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

interface DashboardProps {
  dailyNutrition: NutrientData;
  dailyGoals: NutrientData;
  logMeal: (newIntake: NutrientData) => void;
  onLogout: () => void; // Function to handle logging out
}

const Dashboard: React.FC<DashboardProps> = ({ dailyNutrition, dailyGoals, logMeal, onLogout }) => {
  return (
    <div className="dashboard-container">
      <NutritionTracker
        currentIntake={dailyNutrition}
        dailyGoals={dailyGoals}
      />

      {/* these are just here to test */}
      <div style={{ marginTop: '50px', display: 'flex', gap: '10px' }}>
        <button onClick={() => logMeal({ calories: 200, protein: 10, carbs: 20, fats: 5 })}>Log Small Meal</button>
        <button onClick={() => logMeal({ calories: 500, protein: 25, carbs: 60, fats: 15 })}>Log Big Meal</button>
      </div>
      <button onClick={onLogout} style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
        Log Out
      </button>

    </div>
  );
};

export default Dashboard;