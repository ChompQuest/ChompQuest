import React from 'react';
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

interface DeleteUserConfirmProps {
  onClose: () => void;
  onDelete: (user: UserData) => void;
  user: UserData;
}

const DeleteUserConfirm: React.FC<DeleteUserConfirmProps> = ({ onClose, onDelete, user }) => {
  const handleDelete = () => {
    onDelete(user);
    onClose();
  };

  return (
    <div className="add-custom-water-form">
      <div style={{ textAlign: 'center', fontSize: '1.6rem', color: '#333', marginBottom: '2rem' }}>
        Are you sure you want to delete {user.username}?
      </div>

      <div className="form-actions" style={{ justifyContent: 'center' }}>
        <button onClick={handleDelete} className="submit-button" style={{ backgroundColor: '#dc3545' }}>
          Delete User
        </button>
        <button onClick={onClose} className="cancel-button">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default DeleteUserConfirm;