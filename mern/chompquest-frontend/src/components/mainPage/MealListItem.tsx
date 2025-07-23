import React from 'react';
import './MealListItem.css';

interface Meal {
  id: string;
  name: string;
  date: string;
  calories: number;
}

interface MealListItemProps {
  meal: Meal;
}

const MealListItem: React.FC<MealListItemProps> = ({ meal }) => {
  const formattedDate = new Date(meal.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="meal-list-item">
      <span className="meal-list-item-name">{meal.name}</span>
      <div className="meal-list-item-details">
        <span className="meal-list-item-date">{formattedDate}</span>
        <span className="meal-list-item-calories">{meal.calories} kcal</span>
      </div>
    </div>
  );
};

export default MealListItem;