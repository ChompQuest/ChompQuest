import React, { useState } from 'react';
import '../mainPage/AddCustomWater.css';

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
    <div className="add-custom-water-form">
      <div style={{ textAlign: 'center', fontSize: '1.6rem', color: '#333', marginBottom: '2rem' }}>
        Edit {user.username} stats
      </div>

      <form onSubmit={handleSubmit}>
        <label className="form-label" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ minWidth: '80px' }}>Points:</span>
          <input
            type="number"
            value={points}
            onChange={(e) => {
              setPoints(e.target.value);
              setError(null);
            }}
            min="0"
            step="1"
            className="form-input"
            style={{ flex: 1, marginLeft: '1rem', marginTop: 0 }}
            required
          />
        </label>
        
        <label className="form-label" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ minWidth: '80px' }}>Streak:</span>
          <input
            type="number"
            value={streak}
            onChange={(e) => {
              setStreak(e.target.value);
              setError(null);
            }}
            min="0"
            step="1"
            className="form-input"
            style={{ flex: 1, marginLeft: '1rem', marginTop: 0 }}
            required
          />
        </label>

        {error && <p className="error-message">{error}</p>}

        <div className="form-actions" style={{ justifyContent: 'center' }}>
          <button type="submit" className="submit-button" disabled={!points || !streak}>
            Save Changes
          </button>
          <button type="button" onClick={onClose} className="cancel-button">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditUserStats;