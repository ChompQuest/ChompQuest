import React from 'react';
import './ProgressBar.css'; 

interface ProgressBarProps {
  percentage: number;
  label: string;
  color: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ percentage, label, color }) => {
  const boundedPercentage = Math.max(0, Math.min(100, percentage));

  return (
    <div className="progress-bar-container">
      <div className="progress-bar-label">{label}</div>
      <div className="progress-bar-outer">
        <div
          className="progress-bar-inner"
          style={{ width: `${boundedPercentage}%`, backgroundColor: color }}
        ></div>
      </div>
      <div className="progress-bar-percentage">{boundedPercentage.toFixed(0)}%</div>
    </div>
  );
};

export default ProgressBar;