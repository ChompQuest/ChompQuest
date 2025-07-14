import React, { useState, useRef, useEffect } from 'react'; 
import { useNavigate } from 'react-router-dom'; 
import NutritionTracker from './NutritionTracker';
import type { NutrientData } from './NutritionTracker';
import '../../App.css'; 
import Modal from '../Modal';
import AddMeal from '../AddMeal';
import './Dashboard.css'; 

interface DashboardProps {
  dailyNutrition: NutrientData;
  dailyGoals: NutrientData;
  logMeal: (newIntake: NutrientData) => void;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ dailyNutrition, dailyGoals, logMeal, onLogout }) => {
  const [showAddMealModal, setShowAddMealModal] = useState(false);

  const handleOpenAddMealModal = () => {
    setShowAddMealModal(true);
  };

  const handleCloseAddMealModal = () => {
    setShowAddMealModal(false);
  };

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
    <> 
      <div className="dashboard-pfp-fixed" ref={dropdownRef}>
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

      <div className="dashboard-container">
        <NutritionTracker
          currentIntake={dailyNutrition}
          dailyGoals={dailyGoals}
        />

        <div className="recent-meals-box">
          <h2>Recent Meals</h2>
          <button
            onClick={handleOpenAddMealModal}
            className="add-meal-dashboard-button"
          >
            Add New Meal
          </button>
        </div>

        {showAddMealModal && (
          <Modal onClose={handleCloseAddMealModal} title="Add New Meal">
            <AddMeal onClose={handleCloseAddMealModal} onAddMeal={logMeal} />
          </Modal>
        )}
      </div>
    </>
  );
};

export default Dashboard;