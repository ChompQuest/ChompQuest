import React from 'react';
import './NutritionTracker.css';

export interface NutrientData {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

interface NutritionTrackerProps {
  currentIntake: NutrientData;
  dailyGoals: NutrientData;
}

const NutritionTracker: React.FC<NutritionTrackerProps> = ({ currentIntake, dailyGoals }) => {
  // defines color and radius of ring per macro
  const rings = [
    { label: 'Calories', current: currentIntake.calories, goal: dailyGoals.calories, color: '#FF6B00', radius: 45, strokeWidth: 8 },
    { label: 'Protein', current: currentIntake.protein, goal: dailyGoals.protein, color: '#00C2C7', radius: 35, strokeWidth: 8 },
    { label: 'Carbs', current: currentIntake.carbs, goal: dailyGoals.carbs, color: '#F9D423', radius: 25, strokeWidth: 8 },
    { label: 'Fats', current: currentIntake.fats, goal: dailyGoals.fats, color: '#FF4D6D', radius: 15, strokeWidth: 8 },
  ];

  return (
    <div className="nutrition-tracker-container">
      <svg className="nutrition-rings-svg" viewBox="0 0 100 100">
        {rings.map((ring) => { // this line iterated through all macros
          const circumference = 2 * Math.PI * ring.radius;
          const progress = Math.min(ring.current / ring.goal, 1); // either progress or 100%
          const offset = circumference * (1 - progress); // calculates what has not been filled

          return (
            // fragment is so we render the list & so we can use key which tracks any changes
            <React.Fragment key={ring.label}> 
              <circle // draws circle for rings
                className="ring-background"
                cx="50" // use 50 bc viewBox is 100
                cy="50" 
                r={ring.radius} 
                stroke={ring.color + '25'} //lighter color for what's left
                strokeWidth={ring.strokeWidth}
                fill="none" 
              />

              {/* moves the progress bar */}
              <circle
                className="ring-progress"
                cx="50"
                cy="50"
                r={ring.radius}
                stroke={ring.color}
                strokeWidth={ring.strokeWidth}
                fill="none"
                strokeDasharray={circumference} // solid line that fills gap
                strokeDashoffset={offset} // where next stroke should start
                strokeLinecap="round" // rounds out fill bar
                transform="rotate(-90 50 50)" // fill starts at top
              />
            </React.Fragment>
          );
        })}
      </svg>

      {/* details for written macros under rings */}
      <div className="nutrition-details">
        {rings.map(ring => (
          <div key={ring.label} className="nutrient-item">
            <span className="nutrient-label" style={{ color:ring.color }}>{ring.label}:</span>
            <span className="nutrient-value">{ring.current} / {ring.goal}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NutritionTracker;