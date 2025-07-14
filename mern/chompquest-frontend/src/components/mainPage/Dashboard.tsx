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
      {/* Absolutely fixed logo in the top left corner */}
      <div className="dashboard-logo-fixed">
        <img src="/214161846.jfif" alt="Logo" style={{ width: 72, height: 72, borderRadius: '12px' }} />
      </div>
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
        <div className="dashboard-tracker-outer">
          <NutritionTracker
            currentIntake={dailyNutrition}
            dailyGoals={dailyGoals}
          />
        </div>
        {/* Progress card in its own absolutely positioned div */}
        <div className="progress-card-outer">
          <div style={{
            width: 290,
            height: 275,
            background: '#fff',
            borderRadius: 16,
            boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'inherit',
          }}>
            <div style={{ fontSize: '1.35rem', fontWeight: 600, color: '#222', marginBottom: 18, width: '100%', textAlign: 'center' }}>Your Progress</div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
              <img src="/chompquest_bronze.png" alt="Bronze Medal" style={{ width: 100, height: 100, borderRadius: '50%' }} />
            </div>
            <div style={{ fontWeight: 700, color: '#b08d57', marginBottom: 10, fontSize: '1.15rem', textAlign: 'center' }}>Bronze Chomper</div>
            <div style={{ color: '#444', opacity: 0.95, fontSize: '1.05rem', textAlign: 'center' }}>0 day streak &bull; Level 1</div>
          </div>
        </div>

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