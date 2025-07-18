import React, { useState } from 'react'; 
import NutritionTracker from './NutritionTracker';
import type { NutrientData } from './NutritionTracker';
import '../../App.css'; 
import Modal from '../Modal';
import AddMeal from '../AddMeal';
import ProfilePicture from './ProfilePicture';
import ProgressCard from './ProgressCard';
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
    <> 
      {/* Absolutely fixed logo in the top left corner */}
      <div className="dashboard-logo-fixed">
        <img src="/214161846.jfif" alt="Logo" style={{ width: 72, height: 72, borderRadius: '12px' }} />
      </div>
      <ProfilePicture onLogout={onLogout} />

      <div className="dashboard-container">
        <div className="dashboard-tracker-outer">
          <NutritionTracker
            currentIntake={dailyNutrition}
            dailyGoals={dailyGoals}
          />
        </div>
        <ProgressCard />

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
    </>
  );
};

export default Dashboard;