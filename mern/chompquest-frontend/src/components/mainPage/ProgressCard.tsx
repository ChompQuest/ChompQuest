import React from 'react';
import './ProgressCard.css';

interface ProgressCardProps {
  rank?: string;
  streak?: number;
  level?: number;
  medalImage?: string;
}

const ProgressCard: React.FC<ProgressCardProps> = ({ 
  rank = "Bronze Chomper", 
  streak = 0, 
  level = 1, 
  medalImage = "/chompquest_bronze.png" 
}) => {
  return (
    <div className="progress-card-container">
      <div className="progress-card">
        <div className="progress-card-title">Your Progress</div>
        <div className="progress-card-medal">
          <img src={medalImage} alt={`${rank} Medal`} />
        </div>
        <div className="progress-card-rank">{rank}</div>
        <div className="progress-card-stats">{streak} day streak &bull; Level {level}</div>
      </div>
    </div>
  );
};

export default ProgressCard; 