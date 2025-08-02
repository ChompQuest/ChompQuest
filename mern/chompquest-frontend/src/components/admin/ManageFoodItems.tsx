import React, { useState } from 'react';
import './ManageFoodItems.css';
import type { NutrientData } from '../types';

interface ManageFoodItemsProps {
  currentLookup: { [key: string]: NutrientData };
  onAdd: (foodName: string, nutrients: NutrientData) => void;
  onClose: () => void;
}

const ManageFoodItems: React.FC<ManageFoodItemsProps> = ({ currentLookup, onAdd, onClose }) => {
  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState<number | ''>('');
  const [protein, setProtein] = useState<number | ''>('');
  const [carbs, setCarbs] = useState<number | ''>('');
  const [fats, setFats] = useState<number | ''>('');

  const handleAddFood = () => {
    if (!foodName || calories === '' || protein === '' || carbs === '' || fats === '') {
      alert('Please fill in all fields.');
      return;
    }

    const numCalories = Number(calories);
    const numProtein = Number(protein);
    const numCarbs = Number(carbs);
    const numFats = Number(fats);

    if (isNaN(numCalories) || numCalories < 0) {
      alert('Calories must be a non-negative number.');
      return;
    }
    if (isNaN(numProtein) || numProtein < 0) {
      alert('Protein must be a non-negative number.');
      return;
    }
    if (isNaN(numCarbs) || numCarbs < 0) {
      alert('Carbohydrates must be a non-negative number.');
      return;
    }
    if (isNaN(numFats) || numFats < 0) {
      alert('Fats must be a non-negative number.');
      return;
    }

    const nutrients: NutrientData = {
      calories: numCalories,
      protein: numProtein,
      carbs: numCarbs,
      fats: numFats,
    };

    if (currentLookup[foodName]) {
      alert('A food item with this name already exists. Please choose a different name.');
      return;
    }
    onAdd(foodName, nutrients);

    setFoodName('');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFats('');
    onClose();
  };

  return (
    <div className="manage-foods-container">
      <div className="food-form">
        <div className="food-inputs-grid">
          <label>
            Food Name:
            <input
              type="text"
              value={foodName}
              onChange={(e) => setFoodName(e.target.value)}
              placeholder="e.g., Banana (1 medium)"
            />
          </label>
          <label>
            Calories:
            <input
              type="number"
              value={calories}
              onChange={(e) => setCalories(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="e.g., 105"
            />
          </label>
          <label>
            Protein (g):
            <input
              type="number"
              value={protein}
              onChange={(e) => setProtein(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="e.g., 1.3"
            />
          </label>
          <label>
            Carbs (g):
            <input
              type="number"
              value={carbs}
              onChange={(e) => setCarbs(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="e.g., 27"
            />
          </label>
          <label>
            Fats (g):
            <input
              type="number"
              value={fats}
              onChange={(e) => setFats(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="e.g., 0.3"
            />
          </label>
        </div>
        <div className="food-form-actions">
          <button onClick={handleAddFood} className="action-button primary-button">
            Add Food Item
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageFoodItems;