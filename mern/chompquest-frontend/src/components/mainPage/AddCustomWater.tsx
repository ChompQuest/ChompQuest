import React, { useState } from 'react';
import './AddCustomWater.css';

interface AddCustomWaterProps {
  onClose: () => void;
  onAddWater: (amount: number) => void;
}

const AddCustomWater: React.FC<AddCustomWaterProps> = ({ onClose, onAddWater }) => {
  const [amount, setAmount] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid positive number for water intake.');
      return;
    }
    if (numAmount > 5000) { 
      setError('Amount too high. Please enter a value less than 5000ml.');
      return;
    }

    onAddWater(numAmount); 
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="add-custom-water-form">
      <label className="form-label">
        Amount (ml):
        <input
          type="number"
          value={amount}
          onChange={(e) => {
            setAmount(e.target.value);
            setError(null); 
          }}
          min="1"
          step="any"
          placeholder="e.g., 300"
          className="form-input"
          required
        />
      </label>
      {error && <p className="error-message">{error}</p>}

      <div className="form-actions">
        <button type="submit" className="submit-button" disabled={!amount}>
          Add Water
        </button>
        <button type="button" onClick={onClose} className="cancel-button">
          Cancel
        </button>
      </div>
    </form>
  );
};

export default AddCustomWater;