import React from 'react';
import './NutritionTracker.css'; // Link to its CSS file

// Define the shape of our nutrition data
interface NutrientData {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

// Define the props for our NutritionTracker component
interface NutritionTrackerProps {
  currentIntake: NutrientData; // The user's current intake for the day
  dailyGoals: NutrientData;    // The daily goals for each nutrient
}

const NutritionTracker: React.FC<NutritionTrackerProps> = ({ currentIntake, dailyGoals }) => {
  // Define the properties for each ring (color, radius, nutrient it tracks)
  const rings = [
    { label: 'Calories', current: currentIntake.calories, goal: dailyGoals.calories, color: '#FF4500', radius: 45, strokeWidth: 8 }, // Orange-Red
    { label: 'Protein', current: currentIntake.protein, goal: dailyGoals.protein, color: '#32CD32', radius: 35, strokeWidth: 8 },  // Lime Green
    { label: 'Carbs', current: currentIntake.carbs, goal: dailyGoals.carbs, color: '#1E90FF', radius: 25, strokeWidth: 8 },    // Dodger Blue
    { label: 'Fats', current: currentIntake.fats, goal: dailyGoals.fats, color: '#FFD700', radius: 15, strokeWidth: 8 },     // Gold
  ];

  return (
    <div className="nutrition-tracker-container">
      {/* SVG for the circular rings */}
      <svg className="nutrition-rings-svg" viewBox="0 0 100 100">
        {rings.map((ring, index) => {
          const circumference = 2 * Math.PI * ring.radius; // Total length of the circle's path
          // Calculate progress, capping at 1 (100%)
          const progress = Math.min(ring.current / ring.goal, 1);
          // Calculate the offset to hide part of the stroke based on progress
          // A smaller offset means more of the circle is visible (progressed)
          const offset = circumference * (1 - progress);

          return (
            <React.Fragment key={ring.label}>
              {/* Background ring (static, lighter color) */}
              <circle
                className="ring-background"
                cx="50" // Center X of the SVG viewBox (50)
                cy="50" // Center Y of the SVG viewBox (50)
                r={ring.radius} // Radius for this specific ring
                stroke={ring.color + '33'} // Lighter version of the main color (e.g., #FF450033)
                strokeWidth={ring.strokeWidth}
                fill="none" // Important: make sure the circle is hollow
              />
              {/* Progress ring (dynamic based on current intake) */}
              <circle
                className="ring-progress"
                cx="50"
                cy="50"
                r={ring.radius}
                stroke={ring.color} // Main color for the progress
                strokeWidth={ring.strokeWidth}
                fill="none"
                strokeDasharray={circumference} // Defines the pattern of dashes and gaps (here, a solid line the full circumference)
                strokeDashoffset={offset} // How far along the path the dash should start (this creates the "fill" effect)
                strokeLinecap="round" // Makes the ends of the progress line rounded, like Apple Watch
                transform="rotate(-90 50 50)" // Rotates the circle so the progress starts from the top (12 o'clock)
              />
            </React.Fragment>
          );
        })}
      </svg>

      {/* Nutritional details text below the rings */}
      <div className="nutrition-details">
        {rings.map(ring => (
          <div key={ring.label} className="nutrient-item">
            <span className="nutrient-label" style={{ color: ring.color }}>{ring.label}:</span>
            <span className="nutrient-value">{ring.current} / {ring.goal}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NutritionTracker;