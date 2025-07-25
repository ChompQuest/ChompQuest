import React from 'react';
import './NutritionTracker.css';
import type { NutrientData, SelectableNutrient } from '../types';

interface NutritionTrackerProps {
  currentIntake: NutrientData;
  dailyGoals: NutrientData;
  nutrientToSwapOut: SelectableNutrient | null;
  currentWaterIntake: number;
  waterGoal: number;
}

const NutritionTracker: React.FC<NutritionTrackerProps> = ({
  currentIntake,
  dailyGoals,
  nutrientToSwapOut,
  currentWaterIntake,
  waterGoal,
}) => {
  const baseRingsConfig = [
    { label: 'Calories', key: 'calories', current: currentIntake.calories, goal: dailyGoals.calories, color: '#FF6B00', unit: 'kcal', radius: 45, strokeWidth: 8 },
    { label: 'Protein', key: 'protein', current: currentIntake.protein, goal: dailyGoals.protein, color: '#00C2C7', unit: 'g', radius: 35, strokeWidth: 8 },
    { label: 'Carbs', key: 'carbs', current: currentIntake.carbs, goal: dailyGoals.carbs, color: '#F9D423', unit: 'g', radius: 25, strokeWidth: 8 }, // Fixed: Removed duplicate 'label'
    { label: 'Fats', key: 'fats', current: currentIntake.fats, goal: dailyGoals.fats, color: '#FF4D6D', unit: 'g', radius: 15, strokeWidth: 8 },     // Fixed: Removed duplicate 'label'
  ];

  const waterRingData = {
    label: 'Water',
    key: 'water',
    current: currentWaterIntake,
    goal: waterGoal,
    color: '#17a2b8',
    unit: 'ml',
  };

  const ringsToRender = baseRingsConfig.map(ring => {
    if (ring.key === nutrientToSwapOut) {
      return {
        ...waterRingData,
        radius: ring.radius,
        strokeWidth: ring.strokeWidth,
      };
    }
    return ring;
  });

  return (
    <div className="nutrition-tracker-container">
      <svg className="nutrition-rings-svg" viewBox="0 0 100 100">
        {ringsToRender.map((ring) => {
          const circumference = 2 * Math.PI * ring.radius;
          const progress = ring.goal === 0 ? 0 : Math.min(ring.current / ring.goal, 1);
          const offset = circumference * (1 - progress);

          return (
            <React.Fragment key={ring.key}>
              <circle
                className="ring-background"
                cx="50"
                cy="50"
                r={ring.radius}
                stroke={ring.color + '25'}
                strokeWidth={ring.strokeWidth}
                fill="none"
              />

              <circle
                className="ring-progress"
                cx="50"
                cy="50"
                r={ring.radius}
                stroke={ring.color}
                strokeWidth={ring.strokeWidth}
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
              />
            </React.Fragment>
          );
        })}
      </svg>

      <div className="nutrition-details">
        {ringsToRender.map(ring => (
          <div key={ring.key} className="nutrient-item">
            <span className="nutrient-label" style={{ color: ring.color }}>{ring.label}:</span>
            <span className="nutrient-value">{ring.current.toFixed(0)} / {ring.goal.toFixed(0)} {ring.unit}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NutritionTracker;