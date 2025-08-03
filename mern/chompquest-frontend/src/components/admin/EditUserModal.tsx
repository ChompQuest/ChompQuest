import React from 'react';
import Modal from '../Modal';
import EditUserStats from './EditUserStats';

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

interface EditUserModalProps {
  onClose: () => void;
  onSave: (userId: string, points: number, streak: number) => void;
  user: UserData;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ onClose, onSave, user }) => {
  return (
    <Modal onClose={onClose} title="">
      <EditUserStats onClose={onClose} onSave={onSave} user={user} />
    </Modal>
  );
};

export default EditUserModal;