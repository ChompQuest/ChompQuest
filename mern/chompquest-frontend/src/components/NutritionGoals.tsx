import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { NutritionGoals as NutritionGoalsType } from '../utils/nutritionCalculator';
import { 
  calculateRecommendedMetrics,
  feetInchesToCm,
  lbsToKg,
  cmToFeetInches,
  kgToLbs
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

  // Calculate recommendations when basic info changes
  useEffect(() => {
    if (isBasicInfoComplete) {
      const heightCm = feetInchesToCm(heightFeet as number, heightInches as number);
      const weightKg = lbsToKg(weightLbs as number);
      const recommendations = calculateRecommendedMetrics(sex as 'male' | 'female', heightCm, weightKg, age as number, activityLevel as any);
      
      // Only auto-populate if goals are empty
      if (calorieGoal === '') setCalorieGoal(recommendations.recommendedCalories);
      if (waterIntakeGoal === '') setWaterIntakeGoal(recommendations.recommendedWater);
      if (proteinGoal === '') setProteinGoal(recommendations.recommendedProtein);
      if (carbsGoal === '') setCarbsGoal(recommendations.recommendedCarbs);
      if (fatGoal === '') setFatGoal(recommendations.recommendedFat);
    }
  }, [sex, heightFeet, heightInches, weightLbs, age, activityLevel]);

  // Fetch and populate current user goals if not a new user
  useEffect(() => {
    if (!isNewUser) {
      // TODO: Replace this with a real API call to fetch current user goals
      // Example: fetch('/user/nutrition-goals').then(...)
      // For now, use placeholder/mock data:
      const fetchUserGoals = async () => {
        // PASS: Simulate API call
        // await new Promise((resolve) => setTimeout(resolve, 500));
        // Example mock data (replace with real data mapping):
        const mockData = {
          sex: 'male',
          height: 175, // cm
          weight: 70, // kg
          age: 30,
          activityLevel: 'moderately_active',
          calorieGoal: 2200,
          waterIntakeGoal: 2500,
          proteinGoal: 120,
          carbsGoal: 250,
          fatGoal: 60,
        };
        // Convert height (cm) to feet/inches
        const feet = Math.floor(mockData.height / 30.48);
        const inches = Math.round((mockData.height / 2.54) % 12);
        // Convert weight (kg) to lbs
        const lbs = Math.round(mockData.weight * 2.20462);
        setSex(mockData.sex as 'male' | 'female');
        setHeightFeet(feet);
        setHeightInches(inches);
        setWeightLbs(lbs);
        setAge(mockData.age);
        setActivityLevel(mockData.activityLevel as any);
        setCalorieGoal(mockData.calorieGoal);
        setWaterIntakeGoal(mockData.waterIntakeGoal);
        setProteinGoal(mockData.proteinGoal);
        setCarbsGoal(mockData.carbsGoal);
        setFatGoal(mockData.fatGoal);
      };
      fetchUserGoals();
    }
  }, [isNewUser]);

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
      const heightCm = feetInchesToCm(heightFeet as number, heightInches as number);
      const weightKg = lbsToKg(weightLbs as number);

      const nutritionGoals: NutritionGoalsType = {
        sex: sex as 'male' | 'female',
        height: heightCm,
        weight: weightKg,
        age: age as number,
        activityLevel: activityLevel as any,
        calorieGoal: calorieGoal as number,
        waterIntakeGoal: waterIntakeGoal as number,
        proteinGoal: proteinGoal as number,
        carbsGoal: carbsGoal as number,
        fatGoal: fatGoal as number
      };

      // TODO: Replace with actual API endpoint
      const endpoint = isNewUser 
        ? `http://localhost:5050/user/${userId}/nutrition-goals` 
        : 'http://localhost:5050/user/nutrition-goals';

      const response = await fetch(endpoint, {
        method: isNewUser ? 'POST' : 'PUT',
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
    
    const heightCm = feetInchesToCm(heightFeet as number, heightInches as number);
    const weightKg = lbsToKg(weightLbs as number);
    return calculateRecommendedMetrics(sex as 'male' | 'female', heightCm, weightKg, age as number, activityLevel as any);
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
                  <option value="extremely_active">Extremely Active (very hard exercise, physical job)</option>
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
                    placeholder="2000"
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
                    placeholder="2500"
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
                    placeholder="120"
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
                    placeholder="225"
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
                    placeholder="56"
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