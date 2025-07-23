import React, { useState, useEffect } from 'react';
import NutritionTracker from './NutritionTracker';
import type { NutrientData } from './NutritionTracker'; 
import '../../App.css'; 
import Modal from '../Modal';
import AddMeal from '../AddMeal';
import ProfilePicture from './ProfilePicture';
import ProgressCard from './ProgressCard';
import RecentMealsBox from './RecentMealsBox'; 
import './Dashboard.css'; 

// Define the Meal interface here, or import it from a shared types file
interface Meal {
  id: string;
  name: string;
  date: string; // ISO string (e.g., "2025-07-22T14:30:00Z")
  calories: number;
  // Add other properties if your design or API requires them (e.g., protein, carbs, fats)
}

// Define props for the Dashboard component
interface DashboardProps {
  dailyNutrition: NutrientData;
  dailyGoals: NutrientData;
  logMeal: (newIntake: NutrientData) => void; // Original function to log meal and update daily stats
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ dailyNutrition, dailyGoals, logMeal, onLogout }) => {
  const [showAddMealModal, setShowAddMealModal] = useState(false);
  const [recentMeals, setRecentMeals] = useState<Meal[]>([]);

  // replace this with actual API call to get the last 10 meals
  const fetchRecentMeals = async () => {
    try {
      // Example API call:
      // const response = await fetch('/api/user/meals?limit=10');
      // if (!response.ok) {
      //   throw new Error('Failed to fetch recent meals');
      // }
      // const data: Meal[] = await response.json();
      // setRecentMeals(data);

      // --- Dummy Data for Development (REMOVE THIS WHEN CONNECTING TO API) ---
      const dummyMeals: Meal[] = [
        { id: 'm1', name: 'Chicken & Veggies', date: '2025-07-21T10:00:00Z', calories: 450 },
        { id: 'm2', name: 'Lentil Soup', date: '2025-07-20T18:30:00Z', calories: 320 },
        { id: 'm3', name: 'Oatmeal & Fruit', date: '2025-07-20T08:00:00Z', calories: 280 },
        { id: 'm4', name: 'Grilled Salmon', date: '2025-07-19T13:00:00Z', calories: 550 },
        { id: 'm5', name: 'Greek Yogurt Bowl', date: '2025-07-19T09:00:00Z', calories: 300 },
        { id: 'm6', name: 'Steak & Potato', date: '2025-07-18T19:00:00Z', calories: 700 },
        { id: 'm7', name: 'Quinoa Salad', date: '2025-07-18T12:00:00Z', calories: 400 },
        { id: 'm8', name: 'Avocado Toast', date: '2025-07-17T07:30:00Z', calories: 250 },
        { id: 'm9', name: 'Taco Tuesday', date: '2025-07-17T14:00:00Z', calories: 650 },
        { id: 'm10', name: 'Fruit Smoothie', date: '2025-07-16T10:00:00Z', calories: 200 },
      ];
      setRecentMeals(dummyMeals);
      // --------------------------------------------------------------------
    } catch (error) {
      console.error('Failed to fetch recent meals:', error);
      setRecentMeals([]);
    }
  };

  // Fetch recent meals when the component mounts
  useEffect(() => {
    fetchRecentMeals();
  }, []); // Empty dependency array means this runs only once on mount

  const handleOpenAddMealModal = () => {
    setShowAddMealModal(true);
  };

  const handleCloseAddMealModal = () => {
    setShowAddMealModal(false);
  };

  // This function will be passed to AddMeal.
  // It first calls the original logMeal (to update daily stats),
  // then updates the recent meals list, and finally closes the modal.
  const handleLogMealAndRefreshRecent = async (newIntake: NutrientData) => {
    logMeal(newIntake);
    await fetchRecentMeals();
    handleCloseAddMealModal();
  };

  return (
    <>
      <div className="dashboard-logo-fixed">
        <img src="/214161846.jfif" alt="Logo" style={{ width: '7.2rem', height: '7.2rem', borderRadius: '1.2rem' }} />
      </div>
      <ProfilePicture onLogout={onLogout} />

      <div className="dashboard-container">
        <div className="dashboard-tracker-outer">
          <NutritionTracker
            currentIntake={dailyNutrition}
            dailyGoals={dailyGoals}
          />
        </div>
        <ProgressCard />

        <RecentMealsBox
          meals={recentMeals}
          onAddMealClick={handleOpenAddMealModal}
        />

        {showAddMealModal && (
          <Modal onClose={handleCloseAddMealModal} title="Add New Meal">
            <AddMeal onClose={handleCloseAddMealModal} onAddMeal={handleLogMealAndRefreshRecent} />
          </Modal>
        )}
      </div>
    </>
  );
};

export default Dashboard;