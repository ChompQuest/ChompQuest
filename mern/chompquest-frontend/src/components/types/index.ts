export interface NutrientData {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface LoggedMealData {
  name: string;
  date: string; 
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface Meal {
  id: string;
  name: string;
  date: string;
  calories: number;
  protein?: number; 
  carbs?: number;
  fats?: number;
}