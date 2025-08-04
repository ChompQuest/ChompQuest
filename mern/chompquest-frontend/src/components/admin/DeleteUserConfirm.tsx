import React from 'react';
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
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Delete User</h2>
        <p>Are you sure you want to delete "{user.username}"?</p>
        <p>This action cannot be undone.</p>
        
        <div className="modal-actions">
          <button 
            onClick={onClose}
            className="modal-button cancel-button"
          >
            Cancel
          </button>
          <button 
            onClick={handleDelete}
            className="modal-button delete-button"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteUserConfirm;