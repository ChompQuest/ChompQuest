import React, { useState } from 'react';
import './ManageFoodItems.css';

interface ManageFoodItemsProps {
  onClose: () => void;
  onSuccess?: () => void; // Callback when food is successfully added
  onError?: (errorMessage: string) => void; // Callback when food addition fails
}

const ManageFoodItems: React.FC<ManageFoodItemsProps> = ({ onClose, onSuccess, onError }) => {
  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState<number | ''>('');
  const [protein, setProtein] = useState<number | ''>('');
  const [carbs, setCarbs] = useState<number | ''>('');
  const [fats, setFats] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddFood = async () => {
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

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://localhost:5050/admin/food-items', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: foodName.trim(),
          calories: numCalories,
          protein: numProtein,
          carbs: numCarbs,
          fats: numFats,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to add food item: ${response.status}`);
      }

      const data = await response.json();
      console.log('Food item added successfully:', data);

      // Clear form and close modal
      setFoodName('');
      setCalories('');
      setProtein('');
      setCarbs('');
      setFats('');
      
      // Notify parent component of success
      if (onSuccess) {
        onSuccess();
      }
      
      onClose();
    } catch (err) {
      console.error('Error adding food item:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to add food item';
      setError(errorMessage);
      
      // Notify parent component of error
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
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
        
        {error && (
          <div className="error-message" style={{color: 'red', margin: '10px 0', padding: '10px', backgroundColor: '#fee', borderRadius: '4px'}}>
            {error}
          </div>
        )}
        
        <div className="food-form-actions">
          <button 
            onClick={handleAddFood} 
            className="action-button primary-button"
            disabled={loading}
          >
            {loading ? 'Adding Food Item...' : 'Add Food Item'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageFoodItems;