import React from 'react';
import './DeleteFoodModal.css';

interface DeleteFoodModalProps {
  onClose: () => void;
  onDelete: (foodId: string, foodName: string) => void;
  foodItem: {
    id: string;
    name: string;
  } | null;
}

const DeleteFoodModal: React.FC<DeleteFoodModalProps> = ({ onClose, onDelete, foodItem }) => {
  if (!foodItem) return null;

  const handleDelete = () => {
    onDelete(foodItem.id, foodItem.name);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Delete Food Item</h2>
        <p>Are you sure you want to delete "{foodItem.name}"?</p>
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

export default DeleteFoodModal; 