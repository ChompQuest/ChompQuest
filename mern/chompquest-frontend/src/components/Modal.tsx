import React from 'react';
import './Modal.css';

interface ModalProps {
  children: React.ReactNode;
  onClose: () => void;
  title?: string;
}

const Modal: React.FC<ModalProps> = ({ children, onClose, title = "ChompQuest" }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close-button" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;