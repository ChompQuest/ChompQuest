import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { NutritionGoals as NutritionGoalsType } from '../utils/nutritionCalculator';
import { 
  calculateRecommendedMetrics,
  feetInchesToCm,
  lbsToKg,
} from '../utils/nutritionCalculator';
import './NutritionGoals.css';

interface LocationState {
  isNewUser?: boolean;
  userId?: string;
}

interface SetNutritionGoalsProps {
  onLogin: () => void;
}

const SetNutritionGoals: React.FC<SetNutritionGoalsProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userId } = (location.state as LocationState) || {};

  // Form state - matching NutritionGoals exactly
  const [sex, setSex] = useState<'male' | 'female' | ''>('');
  const [heightFeet, setHeightFeet] = useState<number | ''>('');
  const [heightInches, setHeightInches] = useState<number | ''>('');
  const [weightLbs, setWeightLbs] = useState<number | ''>('');
  const [age, setAge] = useState<number | ''>('');
  const [activityLevel, setActivityLevel] = useState<string>('');

  // Goals state - matching NutritionGoals exactly
  const [calorieGoal, setCalorieGoal] = useState<number | ''>('');
  const [waterIntakeGoal, setWaterIntakeGoal] = useState<number | ''>('');
  const [proteinGoal, setProteinGoal] = useState<number | ''>('');
  const [carbsGoal, setCarbsGoal] = useState<number | ''>('');
  const [fatGoal, setFatGoal] = useState<number | ''>('');

  // UI state
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showGoalsSection, setShowGoalsSection] = useState<boolean>(false);

  // Check if basic info is complete
  const isBasicInfoComplete = sex && heightFeet !== '' && heightInches !== '' && weightLbs !== '' && age !== '' && activityLevel;

  // Check if all goals are filled
  const isGoalsComplete = calorieGoal !== '' && waterIntakeGoal !== '' && proteinGoal !== '' && carbsGoal !== '' && fatGoal !== '';

  // Check if form can be submitted
  const canSubmit = isBasicInfoComplete && isGoalsComplete;

  // Show goals section when basic info is complete
  useEffect(() => {
    if (isBasicInfoComplete && !showGoalsSection) {
      setShowGoalsSection(true);
    }
  }, [isBasicInfoComplete, showGoalsSection]);

  // Calculate current recommendations for display (only if basic info is complete)
  const getRecommendations = () => {
    if (!isBasicInfoComplete) return null;
    
    return calculateRecommendedMetrics(
      sex as 'male' | 'female', 
      heightFeet as number, 
      heightInches as number, 
      weightLbs as number, 
      age as number, 
      activityLevel as any
    );
  };

  const recommendations = getRecommendations();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!canSubmit) {
      setError('Please fill out all required fields.');
      return;
    }

    try {
      const nutritionGoals = {
        sex,
        heightFeet: Number(heightFeet),
        heightInches: Number(heightInches),
        weightLbs: Number(weightLbs),
        age: Number(age),
        activityLevel,
        goals: {
          calories: Number(calorieGoal),
          protein: Number(proteinGoal),
          carbs: Number(carbsGoal),
          fats: Number(fatGoal),
          water: Number(waterIntakeGoal)
        }
      };

      const endpoint = userId 
        ? `http://localhost:5050/user/nutrition-goals-by-id?userId=${userId}`
        : 'http://localhost:5050/user/nutrition-goals';
      const method = 'POST';

      const response = await fetch(endpoint, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nutritionGoals),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Nutrition goals saved successfully!');
        setTimeout(() => {
          // Update user data to show they're fully logged in
          const userData = localStorage.getItem('user');
          if (userData) {
            const user = JSON.parse(userData);
            const updatedUser = {
              ...user,
              isLoggedIn: true,
              needsNutritionGoals: false
            };
            localStorage.setItem('user', JSON.stringify(updatedUser));
          }
          
          onLogin();
          navigate('/dashboard');
        }, 2000);
      } else {
        setError(data.message || 'Failed to save nutrition goals. Please try again.');
      }
    } catch (err) {
      console.error('Nutrition goals error:', err);
      setError('Network error. Could not connect to the server.');
    }
  };

  return (
    <div className="nutrition-goals-outer">
      <div className="nutrition-goals-title">
        <h2>Set Your Nutrition Goals</h2>
      </div>
      <div className="nutrition-goals-card">
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        <form onSubmit={handleSubmit}>
          <div className="nutrition-goals-halves">
            <div className="nutrition-goals-half">
              <h4>Basic Information</h4>
              <div className="form-group">
                <label htmlFor="sex">Sex *</label>
                <select
                  id="sex"
                  value={sex}
                  onChange={(e) => setSex(e.target.value as 'male' | 'female' | '')}
                  required
                >
                  <option value="">Select your sex</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="height">Height *</label>
                <div className="height-inputs">
                  <input
                    type="number"
                    id="heightFeet"
                    value={heightFeet}
                    onChange={(e) => setHeightFeet(e.target.value === '' ? '' : Number(e.target.value))}
                    min="3"
                    max="8"
                    placeholder="5"
                    required
                  />
                  <span>ft</span>
                  <input
                    type="number"
                    id="heightInches"
                    value={heightInches}
                    onChange={(e) => setHeightInches(e.target.value === '' ? '' : Number(e.target.value))}
                    min="0"
                    max="11"
                    placeholder="8"
                    required
                  />
                  <span>in</span>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="weight">Weight (lbs) *</label>
                <input
                  type="number"
                  id="weight"
                  value={weightLbs}
                  onChange={(e) => setWeightLbs(e.target.value === '' ? '' : Number(e.target.value))}
                  min="50"
                  max="500"
                  placeholder="150"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="age">Age *</label>
                <input
                  type="number"
                  id="age"
                  value={age}
                  onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
                  min="13"
                  max="120"
                  placeholder="25"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="activityLevel">Activity Level *</label>
                <select
                  id="activityLevel"
                  value={activityLevel}
                  onChange={(e) => setActivityLevel(e.target.value as any)}
                  required
                >
                  <option value="">Select your activity level</option>
                  <option value="sedentary">Sedentary (little or no exercise)</option>
                  <option value="lightly_active">Lightly Active (light exercise 1-3 days/week)</option>
                  <option value="moderately_active">Moderately Active (moderate exercise 3-5 days/week)</option>
                  <option value="very_active">Very Active (hard exercise 6-7 days/week)</option>
                </select>
              </div>
            </div>
            {showGoalsSection && (
              <div className="nutrition-goals-half">
                <h4>Your Goals</h4>
                <div className="form-group">
                  <label htmlFor="calorieGoal">
                    Daily Calorie Goal *
                    {recommendations && (
                      <span className="recommended-text">Recommended: {recommendations.recommendedCalories}</span>
                    )}
                  </label>
                  <input
                    type="number"
                    id="calorieGoal"
                    value={calorieGoal}
                    onChange={(e) => setCalorieGoal(e.target.value === '' ? '' : Number(e.target.value))}
                    min="1000"
                    max="5000"
                    placeholder={recommendations ? recommendations.recommendedCalories.toString() : "2000"}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="waterIntakeGoal">
                    Daily Water Intake Goal (ml) *
                    {recommendations && (
                      <span className="recommended-text">Recommended: {recommendations.recommendedWater}</span>
                    )}
                  </label>
                  <input
                    type="number"
                    id="waterIntakeGoal"
                    value={waterIntakeGoal}
                    onChange={(e) => setWaterIntakeGoal(e.target.value === '' ? '' : Number(e.target.value))}
                    min="1000"
                    max="10000"
                    placeholder={recommendations ? recommendations.recommendedWater.toString() : "2500"}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="proteinGoal">
                    Daily Protein Goal (g) *
                    {recommendations && (
                      <span className="recommended-text">Recommended: {recommendations.recommendedProtein}</span>
                    )}
                  </label>
                  <input
                    type="number"
                    id="proteinGoal"
                    value={proteinGoal}
                    onChange={(e) => setProteinGoal(e.target.value === '' ? '' : Number(e.target.value))}
                    min="20"
                    max="300"
                    placeholder={recommendations ? recommendations.recommendedProtein.toString() : "120"}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="carbsGoal">
                    Daily Carbs Goal (g) *
                    {recommendations && (
                      <span className="recommended-text">Recommended: {recommendations.recommendedCarbs}</span>
                    )}
                  </label>
                  <input
                    type="number"
                    id="carbsGoal"
                    value={carbsGoal}
                    onChange={(e) => setCarbsGoal(e.target.value === '' ? '' : Number(e.target.value))}
                    min="50"
                    max="600"
                    placeholder={recommendations ? recommendations.recommendedCarbs.toString() : "225"}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="fatGoal">
                    Daily Fat Goal (g) *
                    {recommendations && (
                      <span className="recommended-text">Recommended: {recommendations.recommendedFat}</span>
                    )}
                  </label>
                  <input
                    type="number"
                    id="fatGoal"
                    value={fatGoal}
                    onChange={(e) => setFatGoal(e.target.value === '' ? '' : Number(e.target.value))}
                    min="20"
                    max="150"
                    placeholder={recommendations ? recommendations.recommendedFat.toString() : "56"}
                    required
                  />
                </div>
              </div>
            )}
          </div>
          <button type="submit" disabled={!canSubmit} className={!canSubmit ? 'disabled' : ''}>
            Save Goals & Continue
          </button>
        </form>
      </div>
    </div>
  );
};

export default SetNutritionGoals; 