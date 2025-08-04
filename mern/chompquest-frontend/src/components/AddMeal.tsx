import React, { useState, useEffect } from 'react';
import './AddMeal.css';
import type { LoggedMealData } from './types';

interface AddMealProps {
  onClose: () => void;
  onAddMeal: (mealData: LoggedMealData) => void;
}

interface FoodItem {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

const AddMeal: React.FC<AddMealProps> = ({ onClose, onAddMeal }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [customFoodName, setCustomFoodName] = useState('');
  const [customCalories, setCustomCalories] = useState<number | ''>(0);
  const [customProtein, setCustomProtein] = useState<number | ''>(0);
  const [customCarbs, setCustomCarbs] = useState<number | ''>(0);
  const [customFats, setCustomFats] = useState<number | ''>(0);

  // API function to search for food items
  const searchFoodItems = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`http://localhost:5050/nutrition/food-items?search=${encodeURIComponent(searchQuery)}&limit=50`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to search food items: ${response.status}`);
      }

      const data = await response.json();
      setSearchResults(data.foodItems || []);
    } catch (err) {
      console.error('Error searching food items:', err);
      setError(err instanceof Error ? err.message : 'Failed to search food items');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Auto-search with debounce when searchTerm changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim()) {
        searchFoodItems(searchTerm);
      } else {
        setSearchResults([]);
        setError(null);
      }
    }, 300); // 300ms debounce
    
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleSearch = () => {
    searchFoodItems(searchTerm);
  };

  const handleSelectItem = (item: FoodItem) => {
    setSelectedItems(prevItems => {
      // Check if item is already selected by name
      if (!prevItems.some(prevItem => prevItem.name === item.name)) {
        return [...prevItems, item];
      }
      return prevItems;
    });
    setSearchTerm('');
    setSearchResults([]);
  };

  const handleRemoveItem = (itemToRemove: FoodItem) => {
    setSelectedItems(prevItems => prevItems.filter(item => item.name !== itemToRemove.name));
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
      totalCalories += item.calories;
      totalProtein += item.protein;
      totalCarbs += item.carbs;
      totalFats += item.fats;
      mealNameParts.push(item.name.split(' (')[0]);
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
      id: Date.now().toString(),
      name: selectedItems.map(item => item.name).join(', ') || 'Mixed Meal',
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
      id: Date.now().toString(),
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
        <button onClick={handleSearch} className="search-button" disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>

        {error && (
          <div className="error-message" style={{color: 'red', margin: '10px 0'}}>
            {error}
          </div>
        )}

        {searchResults.length > 0 && (
          <div className="search-results">
            <h3>Search Results:</h3>
            <ul>
              {searchResults.map((result, index) => (
                <li key={index} onClick={() => handleSelectItem(result)}>
                  <div>
                    <strong>{result.name}</strong>
                    <br />
                    <small>{result.calories} cal, {result.protein}g protein, {result.carbs}g carbs, {result.fats}g fat</small>
                  </div>
                  <button className="add-item-button">Add</button>
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
                <div>
                  <strong>{item.name}</strong>
                  <br />
                  <small>{item.calories} cal, {item.protein}g protein, {item.carbs}g carbs, {item.fats}g fat</small>
                </div>
                <button onClick={() => handleRemoveItem(item)} className="remove-item-button">Remove</button>
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