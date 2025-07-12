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

const NutritionGoals: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isNewUser = false, userId } = (location.state as LocationState) || {};

  // Form state
  const [sex, setSex] = useState<'male' | 'female' | ''>('');
  const [heightFeet, setHeightFeet] = useState<number | ''>('');
  const [heightInches, setHeightInches] = useState<number | ''>('');
  const [weightLbs, setWeightLbs] = useState<number | ''>('');
  const [age, setAge] = useState<number | ''>('');
  const [activityLevel, setActivityLevel] = useState<'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | ''>('');
  
  // Goals state
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

  // Calculate recommendations when basic info changes (for display only)
  useEffect(() => {
    if (isBasicInfoComplete) {
      // Recommendations are calculated and stored for display purposes
      // but don't auto-populate the form fields
    }
  }, [sex, heightFeet, heightInches, weightLbs, age, activityLevel]);

  // Fetch and populate current user goals if not a new user
  useEffect(() => {
    if (!isNewUser && userId) {
      const fetchUserGoals = async () => {
        try {
          const response = await fetch(`http://localhost:5050/user/nutrition-goals?userId=${userId}`);
          const data = await response.json();

          if (response.ok && data.nutritionGoals) {
            const goals = data.nutritionGoals;
            
            setSex(goals.sex);
            setHeightFeet(goals.height);
            setHeightInches(goals.heightInches);
            setWeightLbs(goals.weight);
            setAge(goals.age);
            setActivityLevel(goals.activityLevel);
            setCalorieGoal(goals.calorieGoal);
            setWaterIntakeGoal(goals.waterIntakeGoal);
            setProteinGoal(goals.proteinGoal);
            setCarbsGoal(goals.carbsGoal);
            setFatGoal(goals.fatGoal);
          }
        } catch (err) {
          console.error('Error fetching nutrition goals:', err);
          setError('Failed to load existing nutrition goals.');
        }
      };
      fetchUserGoals();
    }
  }, [isNewUser, userId]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!canSubmit) {
      setError('Please fill in all required fields.');
      return;
    }

    // Validation
    if (heightFeet < 3 || heightFeet > 8 || heightInches < 0 || heightInches > 11) {
      setError('Please enter a valid height.');
      return;
    }

    if (weightLbs < 50 || weightLbs > 500) {
      setError('Please enter a valid weight.');
      return;
    }

    if (age < 13 || age > 120) {
      setError('Please enter a valid age.');
      return;
    }

    try {
      const nutritionGoals: NutritionGoalsType = {
        sex: sex as 'male' | 'female',
        height: heightFeet as number,
        heightInches: heightInches as number,
        weight: weightLbs as number,
        age: age as number,
        activityLevel: activityLevel as any,
        calorieGoal: calorieGoal as number,
        waterIntakeGoal: waterIntakeGoal as number,
        proteinGoal: proteinGoal as number,
        carbsGoal: carbsGoal as number,
        fatGoal: fatGoal as number
      };

      const endpoint = `http://localhost:5050/user/nutrition-goals?userId=${userId}`;
      const method = isNewUser ? 'POST' : 'PUT';

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
          if (isNewUser) {
            navigate('/dashboard'); // Navigate to dashboard for new users
          } else {
            navigate(-1); // Go back for existing users
          }
        }, 2000);
      } else {
        setError(data.message || 'Failed to save nutrition goals. Please try again.');
      }
    } catch (err) {
      console.error('Nutrition goals error:', err);
      setError('Network error. Could not connect to the server.');
    }
  };

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

  return (
    <div className="nutrition-goals-outer">
      <div className="nutrition-goals-title">
        <h2>{isNewUser ? 'Set Your Nutrition Goals' : 'Update Nutrition Goals'}</h2>
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
            {isNewUser ? 'Save Goals & Continue' : 'Update Goals'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default NutritionGoals; 