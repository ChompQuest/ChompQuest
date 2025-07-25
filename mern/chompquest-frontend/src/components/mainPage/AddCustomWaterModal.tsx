import React from 'react';
import Modal from '../Modal';
import AddCustomWater from './AddCustomWater'; 

interface AddWaterModalProps {
  onClose: () => void; 
  onAddWater: (amount: number) => void;
}

const AddWaterModal: React.FC<AddWaterModalProps> = ({ onClose, onAddWater }) => {
  return (
    <Modal onClose={onClose} title="Add Custom Water Intake">
      <AddCustomWater onClose={onClose} onAddWater={onAddWater} />
    </Modal>
  );
};

export default AddWaterModal;