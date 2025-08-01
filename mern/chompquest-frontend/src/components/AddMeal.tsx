import React, { useState } from 'react';
import './AddMeal.css';
import type { NutrientData, LoggedMealData } from './types';

interface AddMealProps {
  onClose: () => void;
  onAddMeal: (mealData: LoggedMealData) => void;
}

const AddMeal: React.FC<AddMealProps> = ({ onClose, onAddMeal }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const [customFoodName, setCustomFoodName] = useState('');
  const [customCalories, setCustomCalories] = useState<number | ''>(0);
  const [customProtein, setCustomProtein] = useState<number | ''>(0);
  const [customCarbs, setCustomCarbs] = useState<number | ''>(0);
  const [customFats, setCustomFats] = useState<number | ''>(0);

  // API needs to be integrated in here!!
  const nutrientLookup: { [key: string]: NutrientData } = {
    'Apple (100g)': { calories: 52, protein: 0, carbs: 14, fats: 0 },
    'Apple Juice (200ml)': { calories: 96, protein: 0, carbs: 24, fats: 0 },
    'Chicken Breast (100g)': { calories: 165, protein: 31, carbs: 0, fats: 4 },
    'Chicken Thigh (100g)': { calories: 209, protein: 26, carbs: 0, fats: 11 },
    'Grilled Chicken Salad': { calories: 350, protein: 35, carbs: 15, fats: 18 },
    'White Rice (cooked)': { calories: 130, protein: 3, carbs: 28, fats: 0 },
    'Brown Rice (cooked)': { calories: 112, protein: 2, carbs: 23, fats: 1 },
  };

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

    // Generate meal name and ensure it's not empty
    const mealName = mealNameParts.join(', ') || 'Mixed Meal';
    if (!mealName || mealName.trim() === '') {
      alert('Unable to generate a valid meal name. Please try again.');
      return;
    }

    // Validate that nutrition values are not negative (safety check)
    if (totalCalories < 0 || totalProtein < 0 || totalCarbs < 0 || totalFats < 0) {
      alert('Invalid nutrition data detected. Please contact support.');
      return;
    }

    const mealData: LoggedMealData = {
      name: mealName.trim(),
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
    // Check if food name is provided and not just whitespace
    if (!customFoodName || customFoodName.trim() === '') {
      alert('Please provide a name for the food.');
      return;
    }

    // Check if all nutrition fields are filled
    if (customCalories === '' || customProtein === '' || customCarbs === '' || customFats === '') {
      alert('Please fill in all nutrition fields (calories, protein, carbs, fats).');
      return;
    }

    // Convert to numbers for validation
    const calories = Number(customCalories);
    const protein = Number(customProtein);
    const carbs = Number(customCarbs);
    const fats = Number(customFats);

    // Check for negative values
    if (calories < 0 || protein < 0 || carbs < 0 || fats < 0) {
      alert('Nutrition values cannot be negative. Please enter valid positive numbers.');
      return;
    }

    // Check for valid numbers (not NaN)
    if (isNaN(calories) || isNaN(protein) || isNaN(carbs) || isNaN(fats)) {
      alert('Please enter valid numbers for all nutrition fields.');
      return;
    }

    const customMealData: LoggedMealData = {
      name: customFoodName.trim(),
      date: new Date().toISOString(),
      calories: calories,
      protein: protein,
      carbs: carbs,
      fats: fats,
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
              min="0"
              step="1"
              value={customCalories}
              onChange={(e) => {
                const value = e.target.value;
                setCustomCalories(value === '' ? '' : Number(value));
              }}
              placeholder="e.g., 350"
            />
          </label>
          <label>
            Protein (g):
            <input
              type="number"
              min="0"
              step="0.1"
              value={customProtein}
              onChange={(e) => {
                const value = e.target.value;
                setCustomProtein(value === '' ? '' : Number(value));
              }}
              placeholder="e.g., 25"
            />
          </label>
          <label>
            Carbs (g):
            <input
              type="number"
              min="0"
              step="0.1"
              value={customCarbs}
              onChange={(e) => {
                const value = e.target.value;
                setCustomCarbs(value === '' ? '' : Number(value));
              }}
              placeholder="e.g., 40"
            />
          </label>
          <label>
            Fats (g):
            <input
              type="number"
              min="0"
              step="0.1"
              value={customFats}
              onChange={(e) => {
                const value = e.target.value;
                setCustomFats(value === '' ? '' : Number(value));
              }}
              placeholder="e.g., 15"
            />
          </label>
        </div>
        <button onClick={handleAddCustomMeal} className="add-custom-meal-button"
                disabled={!customFoodName || customFoodName.trim() === '' || customCalories === '' || customProtein === '' || customCarbs === '' || customFats === '' || Number(customCalories) < 0 || Number(customProtein) < 0 || Number(customCarbs) < 0 || Number(customFats) < 0}>
          Add Custom Meal
        </button>
      </div>
    </div>
  );
};

export default AddMeal;