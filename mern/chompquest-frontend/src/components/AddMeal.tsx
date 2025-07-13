import React, { useState } from 'react';
import './AddMeal.css';
import type { NutrientData } from './mainPage/NutritionTracker';

interface AddMealProps {
  onClose: () => void; 
  onAddMeal: (mealData: NutrientData) => void; 
}

const AddMeal: React.FC<AddMealProps> = ({ onClose, onAddMeal }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // I added this for testing, in real website, we'd have API
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
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFats = 0;

    selectedItems.forEach(item => {
      const nutrients = nutrientLookup[item];
      if (nutrients) { 
        totalCalories += nutrients.calories;
        totalProtein += nutrients.protein;
        totalCarbs += nutrients.carbs;
        totalFats += nutrients.fats;
      }
    });

    const mealData: NutrientData = {
      calories: totalCalories,
      protein: totalProtein,
      carbs: totalCarbs,
      fats: totalFats,
    };

    // passes contents to Dashboard
    onAddMeal(mealData);

    alert('Meal added!'); 
    setSelectedItems([]); 
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
          onKeyPress={(e) => {
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
    </div>
  );
};

export default AddMeal;