import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NutritionTracker from './NutritionTracker';
import type { NutrientData, LoggedMealData, Meal, SelectableNutrient } from '../types';
import '../../App.css';
import Modal from '../Modal'; 
import AddMeal from '../AddMeal';
import ProfilePicture from './ProfilePicture';
import ProgressCard from './ProgressCard';
import RecentMealsBox from './RecentMealsBox';
import ProgressBar from './ProgressBar'; 
import NutrientSelector from './NutrientSelector'; 
import WaterInput from './AddWaterButton'; 
import './Dashboard.css';

interface DashboardProps {
  dailyNutrition: NutrientData;
  dailyGoals: NutrientData;
  logMeal: (newIntake: LoggedMealData) => void;
  onLogout: () => void;
  currentWaterIntake: number;
  waterGoal: number;
  onOpenAddWaterModal: () => void; 
}

const Dashboard: React.FC<DashboardProps> = ({
  dailyNutrition,
  dailyGoals,
  logMeal,
  onLogout,
  currentWaterIntake,
  waterGoal,
  onOpenAddWaterModal,
}) => {
  const navigate = useNavigate();
  const [showAddMealModal, setShowAddMealModal] = useState(false);
  const [recentMeals, setRecentMeals] = useState<Meal[]>([]);
  const [selectedNutrientForProgressBar, setSelectedNutrientForProgressBar] = useState<SelectableNutrient>('calories');
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

  const getProgressData = (nutrient: SelectableNutrient) => {
    let current = 0;
    let goal = 1;
    let label = '';
    let color = '';

    const currentNutrition = dailyNutrition || {};
    const currentGoals = dailyGoals || {};

    switch (nutrient) {
      case 'calories':
        current = currentNutrition.calories || 0;
        goal = currentGoals.calories || 1;
        label = 'Calories';
        color = '#FF6B00';
        break;
      case 'protein':
        current = currentNutrition.protein || 0;
        goal = currentGoals.protein || 1;
        label = 'Protein';
        color = '#00C2C7';
        break;
      case 'carbs':
        current = currentNutrition.carbs || 0;
        goal = currentGoals.carbs || 1;
        label = 'Carbs';
        color = '#F9D423';
        break;
      case 'fats':
        current = currentNutrition.fats || 0;
        goal = currentGoals.fats || 1;
        label = 'Fats';
        color = '#FF4D6D';
        break;
      case 'water':
        current = currentWaterIntake;
        goal = waterGoal;
        label = 'Water';
        color = '#17A2B8';
        break;
      default:
        label = 'N/A';
        color = '#6c757d';
    }

    const percentage = (current / goal) * 100;
    return { percentage: isNaN(percentage) || !isFinite(percentage) ? 0 : Math.max(0, Math.min(100, percentage)), label, color };
  };

  const progressBarData = getProgressData(selectedNutrientForProgressBar);

  const nutrientsList: SelectableNutrient[] = ['calories', 'protein', 'carbs', 'fats', 'water'];


  return (
    <div className="dashboard-main-content">
      <div className="dashboard-logo-fixed">
        <button 
          onClick={() => window.location.reload()}
          className="logo-button"
          style={{ 
            background: 'none', 
            border: 'none', 
            padding: 0, 
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <img src="/214161846.jfif" alt="Logo" style={{ width: '7.2rem', height: '7.2rem', borderRadius: '1.2rem' }} />
        </button>
      </div>
      <ProfilePicture onLogout={onLogout} />

      <div className="top-progress-section">
        <ProgressBar
          percentage={progressBarData.percentage}
          label={progressBarData.label}
          color={progressBarData.color}
        />
        <NutrientSelector
          selectedNutrient={selectedNutrientForProgressBar}
          onSelectNutrient={setSelectedNutrientForProgressBar}
          nutrients={nutrientsList}
        />
      </div>

      <div className="dashboard-container">
        <div className="dashboard-tracker-outer">
          <NutritionTracker
            currentIntake={dailyNutrition}
            dailyGoals={dailyGoals}
            nutrientToSwapOut={selectedNutrientForProgressBar === 'water' ? null : selectedNutrientForProgressBar}
            currentWaterIntake={currentWaterIntake}
            waterGoal={waterGoal}
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

        <WaterInput
            onOpenAddWaterModal={onOpenAddWaterModal} 
        />
      </div>
    </div>
  );
};

export default Dashboard;