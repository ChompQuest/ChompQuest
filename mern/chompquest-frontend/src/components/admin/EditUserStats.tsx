import React, { useState } from 'react';
import './DeleteFoodModal.css';

interface UserData {
  id: string;
  name: string;
  username: string;
  email: string;
  role: string;
  registrationDate: string;
  game_stats: {
    dailyStreak: number;
    pointTotal: number;
    currentRank: number;
  };
}

interface EditUserStatsProps {
  onClose: () => void;
  onSave: (userId: string, points: number, streak: number) => void;
  user: UserData;
}

const EditUserStats: React.FC<EditUserStatsProps> = ({ onClose, onSave, user }) => {
  const [points, setPoints] = useState<string>(user.game_stats.pointTotal.toString());
  const [streak, setStreak] = useState<string>(user.game_stats.dailyStreak.toString());
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const numPoints = parseInt(points);
    const numStreak = parseInt(streak);

    if (isNaN(numPoints) || numPoints < 0) {
      setError('Please enter a valid non-negative number for points.');
      return;
    }
    if (isNaN(numStreak) || numStreak < 0) {
      setError('Please enter a valid non-negative number for streak.');
      return;
    }

    onSave(user.id, numPoints, numStreak);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Edit {user.username} stats</h2>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
              <span style={{ minWidth: '80px', fontWeight: '500' }}>Points:</span>
              <input
                type="number"
                value={points}
                onChange={(e) => {
                  setPoints(e.target.value);
                  setError(null);
                }}
                min="0"
                step="1"
                style={{ 
                  flex: 1, 
                  marginLeft: '1rem', 
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
                required
              />
            </label>
            
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ minWidth: '80px', fontWeight: '500' }}>Streak:</span>
              <input
                type="number"
                value={streak}
                onChange={(e) => {
                  setStreak(e.target.value);
                  setError(null);
                }}
                min="0"
                step="1"
                style={{ 
                  flex: 1, 
                  marginLeft: '1rem', 
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
                required
              />
            </label>
          </div>

          {error && <p style={{ color: 'red', textAlign: 'center', margin: '10px 0' }}>{error}</p>}

          <div className="modal-actions">
            <button 
              type="button" 
              onClick={onClose}
              className="modal-button cancel-button"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="modal-button"
              style={{ backgroundColor: '#28a745', color: 'white' }}
              disabled={!points || !streak}
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserStats;