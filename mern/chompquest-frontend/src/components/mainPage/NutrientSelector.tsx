import React from 'react';
import './NutrientSelector.css';
import type { SelectableNutrient } from '../types';

interface NutrientSelectorProps {
  selectedNutrient: SelectableNutrient;
  onSelectNutrient: (nutrient: SelectableNutrient) => void;
  nutrients: SelectableNutrient[];
}

const NutrientSelector: React.FC<NutrientSelectorProps> = ({
  selectedNutrient,
  onSelectNutrient,
  nutrients,
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onSelectNutrient(event.target.value as SelectableNutrient);
  };

  return (
    <div className="nutrient-selector-container">
      <select
        className="nutrient-dropdown"
        value={selectedNutrient}
        onChange={handleChange}
      >
        {nutrients.map(nutrient => (
          <option key={nutrient} value={nutrient}>
            {nutrient.charAt(0).toUpperCase() + nutrient.slice(1)}
          </option>
        ))}
      </select>
    </div>
  );
};

export default NutrientSelector;