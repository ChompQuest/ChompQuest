import React from 'react';
import MealListItem from './MealListItem';
import './RecentMealsBox.css';

interface Meal {
  id: string;
  name: string;
  date: string; 
  calories: number;
}

interface RecentMealsBoxProps {
  meals: Meal[];
  onAddMealClick: () => void;
}

const RecentMealsBox: React.FC<RecentMealsBoxProps> = ({ meals, onAddMealClick }) => {
  return (
    <div className="recent-meals-box">
      <h2>Recent Meals</h2>
      <button className="add-meal-dashboard-button" onClick={onAddMealClick}>
        Add Meal
      </button>

      <div className="recent-meals-list">
        {meals && meals.length > 0 ? (
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