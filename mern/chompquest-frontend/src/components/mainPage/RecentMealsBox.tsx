import React from 'react';
import MealListItem from './MealListItem';
import type { Meal } from '../types';
import './RecentMealsBox.css';

interface RecentMealsBoxProps {
  meals: Meal[];
  onAddMealClick: () => void;
  onOpenAddWaterModal: () => void;
  isWaterModalOpen: boolean;
  // NEW: Loading and error states for recent meals
  isLoading?: boolean;
  error?: string | null;
}

const RecentMealsBox: React.FC<RecentMealsBoxProps> = ({
  meals,
  onAddMealClick,
  onOpenAddWaterModal,
  isWaterModalOpen,
  isLoading = false,
  error = null,
}) => {
  return (
    <div className="recent-meals-box">
      <h2>Recent Meals</h2>
      <button className="add-meal-dashboard-button" onClick={onAddMealClick}>
        Add Meal
      </button>

      <button onClick={onOpenAddWaterModal} className="add-water-button-main">
        Add Water
      </button>

      <div className="recent-meals-list">
        {isLoading ? (
          <div className="loading-spinner">
            <p>Loading recent meals...</p>
            {/* You can add a CSS spinner here if you have one */}
          </div>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : meals && meals.length > 0 ? (
          meals.map(meal => (
            <MealListItem key={meal.id} meal={meal} />
          ))
        ) : (
          <p className="no-meals-message">No recent meals yet! Log your first meal.</p>
        )}
      </div>
    </div>
  );
};

export default RecentMealsBox;