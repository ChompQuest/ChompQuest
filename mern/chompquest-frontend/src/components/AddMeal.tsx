import React, { useState } from 'react';
import './AddMeal.css';
import type { NutrientData, LoggedMealData } from './types';

interface AddMealProps {
  onClose: () => void;
  onAddMeal: (mealData: LoggedMealData) => void;
  nutrientLookup: { [key: string]: NutrientData };
}
const AddMeal: React.FC<AddMealProps> = ({ onClose, onAddMeal, nutrientLookup }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const [customFoodName, setCustomFoodName] = useState('');
  const [customCalories, setCustomCalories] = useState<number | ''>(0);
  const [customProtein, setCustomProtein] = useState<number | ''>(0);
  const [customCarbs, setCustomCarbs] = useState<number | ''>(0);
  const [customFats, setCustomFats] = useState<number | ''>(0);

  const handleSearch = () => {
    const lowerCaseSearch = searchTerm.toLowerCase();
    const filteredResults = Object.keys(nutrientLookup).filter(item =>
      item.toLowerCase().includes(lowerCaseSearch)
    );
    setSearchResults(filteredResults);
  };

  const handleSelectItem = (item: string) => {
    setSelectedItems(prevItems => {
      if (!prevItems.includes(item)) {
        return [...prevItems, item];
      }
      return prevItems;
    });
    setSearchTerm('');
    setSearchResults([]);
  };

  const handleRemoveItem = (itemToRemove: string) => {
    setSelectedItems(prevItems => prevItems.filter(item => item !== itemToRemove));
  };

  const handleAddMeal = () => {
    if (selectedItems.length === 0) {
      alert('Please select at least one item for the meal.');
      return;
    }

    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFats = 0;
    let mealNameParts: string[] = [];

    selectedItems.forEach(item => {
      const nutrients = nutrientLookup[item];
      if (nutrients) {
        totalCalories += nutrients.calories;
        totalProtein += nutrients.protein;
        totalCarbs += nutrients.carbs;
        totalFats += nutrients.fats;
        mealNameParts.push(item.split(' (')[0]);
      }
    });

    const mealData: LoggedMealData = {
      id: Date.now().toString(),
      name: mealNameParts.join(', ') || 'Mixed Meal',
      date: new Date().toISOString(),
      calories: totalCalories,
      protein: totalProtein,
      carbs: totalCarbs,
      fats: totalFats,
    };
    onAddMeal(mealData);

    setSelectedItems([]);
    onClose();
  };

  const handleAddCustomMeal = () => {
    if (!customFoodName || customCalories === '' || customProtein === '' || customCarbs === '' || customFats === '') {
      alert('Please fill in all custom food fields.');
      return;
    }

    const customMealData: LoggedMealData = {
      id: Date.now().toString(),
      name: customFoodName,
      date: new Date().toISOString(),
      calories: Number(customCalories),
      protein: Number(customProtein),
      carbs: Number(customCarbs),
      fats: Number(customFats),
    };

    onAddMeal(customMealData);
    setCustomFoodName('');
    setCustomCalories(0);
    setCustomProtein(0);
    setCustomCarbs(0);
    setCustomFats(0);
    onClose();
  };

  return (
    <div>
      <div className="search-section">
        <input
          type="text"
          placeholder="Search for food items (e.g., apple, chicken, rice)..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            }
          }}
        />
        <button onClick={handleSearch} className="search-button">Search</button>

        {searchResults.length > 0 && (
          <div className="search-results">
            <h3>Search Results:</h3>
            <ul>
              {searchResults.map((result, index) => (
                <li key={index} onClick={() => handleSelectItem(result)}>
                  {result} <button className="add-item-button">Add</button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="selected-items-section">
        <h3>Selected Items for Meal:</h3>
        {selectedItems.length === 0 ? (
          <p>No items selected yet. Search and add items above.</p>
        ) : (
          <ul>
            {selectedItems.map((item, index) => (
              <li key={index}>
                {item} <button onClick={() => handleRemoveItem(item)} className="remove-item-button">Remove</button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button onClick={handleAddMeal} className="add-meal-button" disabled={selectedItems.length === 0}>
        Add Meal to Tracker
      </button>

      <div className="custom-food-section">
        <h3 className="custom-food-heading">
          Didn't find it? Manually enter your food:
        </h3>
        <div id="manual-entry-form" className="manual-inputs-grid">
          <label>
            Food Name:
            <input
              type="text"
              value={customFoodName}
              onChange={(e) => setCustomFoodName(e.target.value)}
              placeholder="e.g., Blueberry Pancakes"
            />
          </label>
          <label>
            Calories:
            <input
              type="number"
              value={customCalories}
              onChange={(e) => setCustomCalories(Number(e.target.value) || '')}
              placeholder="e.g., 350"
            />
          </label>
          <label>
            Protein (g):
            <input
              type="number"
              value={customProtein}
              onChange={(e) => setCustomProtein(Number(e.target.value) || '')}
              placeholder="e.g., 25"
            />
          </label>
          <label>
            Carbs (g):
            <input
              type="number"
              value={customCarbs}
              onChange={(e) => setCustomCarbs(Number(e.target.value) || '')}
              placeholder="e.g., 40"
            />
          </label>
          <label>
            Fats (g):
            <input
              type="number"
              value={customFats}
              onChange={(e) => setCustomFats(Number(e.target.value) || '')}
              placeholder="e.g., 15"
            />
          </label>
        </div>
        <button onClick={handleAddCustomMeal} className="add-custom-meal-button"
                disabled={!customFoodName || customCalories === '' || customProtein === '' || customCarbs === '' || customFats === ''}>
          Add Custom Meal
        </button>
      </div>
    </div>
  );
};

export default AddMeal;