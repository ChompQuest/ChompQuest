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
    </div>
  );
};

export default Dashboard;