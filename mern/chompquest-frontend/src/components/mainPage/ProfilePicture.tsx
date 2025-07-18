import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProfilePicture.css';

interface ProfilePictureProps {
  onLogout: () => void;
}

const ProfilePicture: React.FC<ProfilePictureProps> = ({ onLogout }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  return (
    <div className="profile-picture-container" ref={dropdownRef}>
      <button
        className="profile-icon-btn"
        onClick={() => setDropdownOpen((open) => !open)}
        aria-label="Profile menu"
      >
        <svg width="22" height="22" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="12" r="7" stroke="#333" strokeWidth="2" fill="#fff" />
          <ellipse cx="16" cy="25" rx="10" ry="6" stroke="#333" strokeWidth="2" fill="#fff" />
        </svg>
      </button>
      {dropdownOpen && (
        <div className="profile-dropdown-menu">
          <button
            className="profile-dropdown-item"
            onClick={() => { setDropdownOpen(false); navigate('/nutrition-goals'); }}
          >
            Update Nutrition Goals
          </button>
          <button
            className="profile-dropdown-item logout"
            onClick={() => { setDropdownOpen(false); onLogout(); }}
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfilePicture; 