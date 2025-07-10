import React from 'react';
import NutritionTracker from './NutritionTracker'; 
import type { NutrientData } from './NutritionTracker';
import '../../App.css'; 

interface DashboardProps {
  dailyNutrition: NutrientData;
  dailyGoals: NutrientData;
  logMeal: (newIntake: NutrientData) => void;
  onLogout: () => void; 
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
      {/* delete line 27 to 35 once done testing */}

    </div>
  );
};

export default Dashboard;