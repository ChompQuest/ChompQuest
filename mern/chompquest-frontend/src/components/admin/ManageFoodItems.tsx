// src/components/ManageFoodItems/ManageFoodItems.tsx (Simplified Version)

import React, { useState } from 'react'; // Removed useEffect as editingFood is gone
import './ManageFoodItems.css';
import type { NutrientData } from '../types';

interface ManageFoodItemsProps {
  currentLookup: { [key: string]: NutrientData };
  onAdd: (foodName: string, nutrients: NutrientData) => void;
  // onEdit is removed from props
  onDelete: (foodName: string) => void;
  onClose: () => void; // Keeping for interface consistency, but won't "close" anything in this direct embed setup
}

const ManageFoodItems: React.FC<ManageFoodItemsProps> = ({ currentLookup, onAdd, onDelete, onClose }) => {
  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState<number | ''>('');
  const [protein, setProtein] = useState<number | ''>('');
  const [carbs, setCarbs] = useState<number | ''>('');
  const [fats, setFats] = useState<number | ''>('');
  // Removed editingFood state

  const handleAddFood = () => { // Renamed from handleSaveFood for clarity
    if (!foodName || calories === '' || protein === '' || carbs === '' || fats === '') {
      alert('Please fill in all fields.');
      return;
    }

    const nutrients: NutrientData = {
      calories: Number(calories),
      protein: Number(protein),
      carbs: Number(carbs),
      fats: Number(fats),
    };

    // Only handle adding now
    if (currentLookup[foodName]) {
      alert('A food item with this name already exists. Please choose a different name.');
      return;
    }
    onAdd(foodName, nutrients);

    // Clear form fields
    setFoodName('');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFats('');
  };

  // Removed handleEditClick and handleCancelEdit functions

  return (
    <div className="manage-foods-container">
      <div className="food-form">
        <h3>Add New Pre-defined Food Item</h3> {/* Clarified heading */}
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
              onChange={(e) => setCalories(Number(e.target.value) || '')}
              placeholder="e.g., 105"
            />
          </label>
          <label>
            Protein (g):
            <input
              type="number"
              value={protein}
              onChange={(e) => setProtein(Number(e.target.value) || '')}
              placeholder="e.g., 1.3"
            />
          </label>
          <label>
            Carbs (g):
            <input
              type="number"
              value={carbs}
              onChange={(e) => setCarbs(Number(e.target.value) || '')}
              placeholder="e.g., 27"
            />
          </label>
          <label>
            Fats (g):
            <input
              type="number"
              value={fats}
              onChange={(e) => setFats(Number(e.target.value) || '')}
              placeholder="e.g., 0.3"
            />
          </label>
        </div>
        <div className="food-form-actions">
          <button onClick={handleAddFood} className="action-button primary-button">
            Add Food
          </button>
        </div>
      </div>

      <div className="food-list-section">
        <h3>Existing Pre-defined Food Items:</h3>
        {Object.keys(currentLookup).length === 0 ? (
          <p>No pre-defined food items yet.</p>
        ) : (
          <div className="table-container" style={{ maxHeight: '300px' }}>
            <table>
              <thead>
                <tr>
                  <th>Food Name</th>
                  <th>Cal</th>
                  <th>Protein</th>
                  <th>Carbs</th>
                  <th>Fats</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(currentLookup).map(([name, data]) => (
                  <tr key={name}>
                    <td>{name}</td>
                    <td>{data.calories}</td>
                    <td>{data.protein}</td>
                    <td>{data.carbs}</td>
                    <td>{data.fats}</td>
                    <td>
                      <button onClick={() => onDelete(name)} className="action-button delete-button">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageFoodItems;