import React from 'react';
import Modal from '../Modal';
import DeleteUserConfirm from './DeleteUserConfirm';

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

interface DeleteUserModalProps {
  onClose: () => void;
  onDelete: (user: UserData) => void;
  user: UserData;
}

const DeleteUserModal: React.FC<DeleteUserModalProps> = ({ onClose, onDelete, user }) => {
  return (
    <Modal onClose={onClose} title="">
      <DeleteUserConfirm onClose={onClose} onDelete={onDelete} user={user} />
    </Modal>
  );
};

export default DeleteUserModal;