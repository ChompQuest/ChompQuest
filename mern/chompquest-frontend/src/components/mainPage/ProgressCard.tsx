import React from 'react';
import './ProgressCard.css';

interface ProgressCardProps {
  dailyStreak?: number;
  currentRank?: number;
  pointTotal?: number;
  isLoading?: boolean;
}

const ProgressCard: React.FC<ProgressCardProps> = ({ 
  dailyStreak = 0, 
  currentRank = 1, 
  pointTotal = 0,
  isLoading = false
}) => {
  // Function to get rank name and image based on currentRank
  const getRankInfo = (rank: number) => {
    switch (rank) {
      case 1:
        return {
          name: "Bronze Chomper",
          image: "/chompquest_bronze.png"
        };
      case 2:
        return {
          name: "Silver Chomper", 
          image: "/chompquest_silver.png"
        };
      case 3:
        return {
          name: "Gold Chomper",
          image: "/chompquest_gold.png"
        };
      default:
        return {
          name: "Bronze Chomper",
          image: "/chompquest_bronze.png"
        };
    }
  };

  const rankInfo = getRankInfo(currentRank);

  return (
    <div className="progress-card-container">
      <div className="progress-card">
        <div className="progress-card-title">Your Progress</div>
        <div className="progress-card-medal">
          <img 
            src={rankInfo.image} 
            alt={`${rankInfo.name} Medal`} 
            className={isLoading ? 'loading' : ''}
          />
        </div>
        <div className="progress-card-rank">
          {isLoading ? 'Loading...' : rankInfo.name}
        </div>
        <div className="progress-card-stats">
          {isLoading ? 'Loading stats...' : `${dailyStreak} day streak • ${pointTotal} points`}
        </div>
      </div>
    </div>
  );
};

export default ProgressCard; 