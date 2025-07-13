import React, { useState } from 'react';
import NutritionTracker from './NutritionTracker';
import type { NutrientData } from './NutritionTracker';
import '../../App.css';
import Modal from '../Modal';
import AddMeal from '../AddMeal';

import './Dashboard.css';

interface DashboardProps {
  dailyNutrition: NutrientData;
  dailyGoals: NutrientData;
  logMeal: (newIntake: NutrientData) => void;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ dailyNutrition, dailyGoals, logMeal, onLogout }) => {

  const [showAddMealModal, setShowAddMealModal] = useState(false);

  const handleOpenAddMealModal = () => {
    setShowAddMealModal(true);
  };

  const handleCloseAddMealModal = () => {
    setShowAddMealModal(false);
  };

  return (
    <div className="dashboard-container">
      <NutritionTracker
        currentIntake={dailyNutrition}
        dailyGoals={dailyGoals}
      />
        <div className="recent-meals-box">
          <h2>Recent Meals</h2> 
          <button
            onClick={handleOpenAddMealModal}
            className="add-meal-dashboard-button"
          >
            Add New Meal
          </button>
        </div>

      {showAddMealModal && (
        <Modal onClose={handleCloseAddMealModal} title="Add New Meal">
          <AddMeal onClose={handleCloseAddMealModal} onAddMeal={logMeal} />
        </Modal>
      )}
    </div>
  );
};

export default Dashboard;