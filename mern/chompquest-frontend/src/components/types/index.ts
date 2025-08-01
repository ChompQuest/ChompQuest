export interface NutrientData {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface LoggedMealData {
  id: string;
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

export type SelectableNutrient = 'calories' | 'protein' | 'carbs' | 'fats' | 'water' ;
