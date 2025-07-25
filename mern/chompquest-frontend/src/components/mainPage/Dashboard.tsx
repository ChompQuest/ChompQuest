import React, { useState} from 'react';
import NutritionTracker from './NutritionTracker';
import type { NutrientData, LoggedMealData, Meal } from '../types';
import '../../App.css';
import Modal from '../Modal';
import AddMeal from '../AddMeal';
import ProfilePicture from './ProfilePicture';
import ProgressCard from './ProgressCard';
import RecentMealsBox from './RecentMealsBox';
import './Dashboard.css';

interface DashboardProps {
  dailyNutrition: NutrientData;
  dailyGoals: NutrientData;
  logMeal: (newIntake: LoggedMealData) => void;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ dailyNutrition, dailyGoals, logMeal, onLogout }) => {
  const [showAddMealModal, setShowAddMealModal] = useState(false);
  const [recentMeals, setRecentMeals] = useState<Meal[]>([]);


  const handleOpenAddMealModal = () => {
    setShowAddMealModal(true);
  };

  const handleCloseAddMealModal = () => {
    setShowAddMealModal(false);
  };

  const handleLogMealAndRefreshRecent = (newLoggedMealData: LoggedMealData) => {
    logMeal(newLoggedMealData);
    const newMeal: Meal = {
      ...newLoggedMealData, 
      id: `temp-${Date.now()}`,
    };

    setRecentMeals(prevMeals => {
      const updatedMeals = [newMeal, ...prevMeals];
      return updatedMeals.slice(0, 10);
    });
    handleCloseAddMealModal();
  };

  return (
    <div className="dashboard-main-content"> 
      <div className="dashboard-logo-fixed">
        <img src="/214161846.jfif" alt="Logo" style={{ width: '7.2rem', height: '7.2rem', borderRadius: '1.2rem' }} />
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

        <RecentMealsBox
          meals={recentMeals}
          onAddMealClick={handleOpenAddMealModal}
        />

        {showAddMealModal && (
          <Modal onClose={handleCloseAddMealModal} title="Add New Meal">
            <AddMeal onClose={handleCloseAddMealModal} onAddMeal={handleLogMealAndRefreshRecent} />
          </Modal>
        )}
      </div>
    </div>
  );
};

export default Dashboard;