export interface NutritionGoals {
  sex: 'male' | 'female';
  height: number; // in feet
  heightInches: number; // in inches
  weight: number; // in lbs
  age: number;
  activityLevel: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active';
  calorieGoal: number;
  waterIntakeGoal: number; // in ml
  proteinGoal: number; // in grams
  carbsGoal: number; // in grams
  fatGoal: number; // in grams
}

export interface RecommendedMetrics {
  recommendedCalories: number;
  recommendedWater: number;
  recommendedProtein: number;
  recommendedCarbs: number;
  recommendedFat: number;
}

// Placeholder function for calculating recommended nutrition metrics
export const calculateRecommendedMetrics = (
  sex: 'male' | 'female',
  heightFeet: number,
  heightInches: number,
  weightLbs: number,
  age: number,
  activityLevel: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active'
): RecommendedMetrics => {
  // Convert imperial to metric for calculations
  const heightCm = feetInchesToCm(heightFeet, heightInches);
  const weightKg = lbsToKg(weightLbs);
  
  // Basic BMR calculation (Mifflin-St Jeor Equation)
  // bmr = 10 * weightKg + 6.25 * heightCm - 5 * age; (add 5 for males, subtract 161 for females)
  let bmr = 10 * weightKg + 6.25 * heightCm - 5 * age;
  bmr = sex === 'male' ? bmr + 5 : bmr - 161;
  
  // Activity multipliers
  const activityMultipliers = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
    extremely_active: 1.9
  };
  
  const tdee = bmr * activityMultipliers[activityLevel];
  
  return {
    recommendedCalories: Math.round(tdee),
    recommendedWater: Math.round(weightKg * 35), // 35ml per kg body weight
    recommendedProtein: Math.round(weightKg * 1.6), // 1.6g per kg body weight
    recommendedCarbs: Math.round((tdee * 0.45) / 4), // 45% of calories from carbs
    recommendedFat: Math.round((tdee * 0.25) / 9) // 25% of calories from fat
  };
};

// Helper function to convert height from feet/inches to cm
export const feetInchesToCm = (feet: number, inches: number): number => {
  return (feet * 12 + inches) * 2.54;
};

// Helper function to convert weight from lbs to kg
export const lbsToKg = (lbs: number): number => {
  return lbs * 0.453592;
};

// Helper function to convert cm to feet/inches
export const cmToFeetInches = (cm: number): { feet: number, inches: number } => {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return { feet, inches };
};

// Helper function to convert kg to lbs
export const kgToLbs = (kg: number): number => {
  return kg * 2.20462;
}; 