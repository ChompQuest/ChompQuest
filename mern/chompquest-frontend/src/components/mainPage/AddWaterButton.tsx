import React from 'react';
import './AddWaterButton.css'; 

interface WaterInputProps {
  onOpenAddWaterModal: () => void;
}

const WaterInput: React.FC<WaterInputProps> = ({ onOpenAddWaterModal }) => {
  return (
    <div className="water-button-container">
      <button onClick={onOpenAddWaterModal} className="add-water-button-main">
        Add Water
      </button>
    </div>
  );
};

export default WaterInput;