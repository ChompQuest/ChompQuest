// src/components/admin/AdminDashboard.tsx

import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';
import type { LoggedMealData, NutrientData } from '../types';
import AddMeal from '../AddMeal';
import ManageFoodItems from './ManageFoodItems';

export interface UserData {
  id: string;
  name: string;
  email: string;
  registrationDate: string;
}

//connect to backend API to fetch users
const INITIAL_USERS: UserData[] = [
];

const INITIAL_NUTRIENT_LOOKUP: Record<string, NutrientData> = {
  'Apple (100g)': { calories: 52, protein: 0, carbs: 14, fats: 0 },
  'Apple Juice (200ml)': { calories: 96, protein: 0, carbs: 24, fats: 0 },
  'Chicken Breast (100g)': { calories: 165, protein: 31, carbs: 0, fats: 4 },
  'Chicken Thigh (100g)': { calories: 209, protein: 26, carbs: 0, fats: 11 },
  'Grilled Chicken Salad': { calories: 350, protein: 35, carbs: 15, fats: 18 },
  'White Rice (cooked)': { calories: 130, protein: 3, carbs: 28, fats: 0 },
  'Brown Rice (cooked)': { calories: 112, protein: 2, carbs: 23, fats: 1 },
};

// here i define localstorage but idk how to get it to append to list 
const LOCAL_STORAGE_FOOD_LOOKUP_KEY = 'chompquest_food_lookup';
const LOCAL_STORAGE_USERS_KEY = 'chompquest_users';
const LOCAL_STORAGE_MEALS_KEY = 'chompquest_meals'; 

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>(() => {
    try {
      const storedUsers = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
      return storedUsers ? JSON.parse(storedUsers) as UserData[] : INITIAL_USERS;
    } catch (e) {
      console.error("Failed to load users from localStorage", e);
      return INITIAL_USERS;
    }
  });

  // INITIALIZE MEALS STATE FROM LOCALSTORAGE
  const [meals, setMeals] = useState<LoggedMealData[]>(() => {
    try {
      const storedMeals = localStorage.getItem(LOCAL_STORAGE_MEALS_KEY);
      return storedMeals ? JSON.parse(storedMeals) as LoggedMealData[] : [];
    } catch (e) {
      console.error("Failed to load meals from localStorage", e);
      return [];
    }
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddMealModal, setShowAddMealModal] = useState(false);

  const [foodLookup, setFoodLookup] = useState<Record<string, NutrientData>>(() => {
    try {
      const storedLookup = localStorage.getItem(LOCAL_STORAGE_FOOD_LOOKUP_KEY);
      return storedLookup ? JSON.parse(storedLookup) as Record<string, NutrientData> : INITIAL_NUTRIENT_LOOKUP;
    } catch (e) {
      console.error("Failed to load food lookup from localStorage", e);
      return INITIAL_NUTRIENT_LOOKUP;
    }
  });

  const [showManageFoodsModal, setShowManageFoodsModal] = useState(false);

  // useEffect to save foodLookup to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_FOOD_LOOKUP_KEY, JSON.stringify(foodLookup));
      console.log("Food lookup saved to localStorage.");
    } catch (e) {
      console.error("Failed to save food lookup to localStorage", e);
    }
  }, [foodLookup]);

  // useEffect to save users to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(users));
      console.log("Users saved to localStorage.");
    } catch (e) {
      console.error("Failed to save users to localStorage", e);
    }
  }, [users]);

  // NEW useEffect to save meals to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_MEALS_KEY, JSON.stringify(meals));
      console.log("Meals saved to localStorage.");
    } catch (e) {
      console.error("Failed to save meals to localStorage", e);
    }
  }, [meals]);


  const handleDeleteUser = (userId: string) => {
    setLoading(true);
    setError(null);
    setTimeout(() => {
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
      setLoading(false);
      alert(`User ${userId} deleted.`);
    }, 500);
  };

  const handleRefreshUsers = () => {
    setLoading(true);
    setError(null);
    setTimeout(() => {
      const storedUsers = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
      if (storedUsers) {
        setUsers(JSON.parse(storedUsers) as UserData[]);
      } else {
        setUsers(INITIAL_USERS);
      }
      console.log("Users refreshed.");
      setLoading(false);
    }, 500);
  };

  const handleAddMeal = (newMeal: LoggedMealData) => {
    setMeals(prevMeals => [...prevMeals, newMeal]);
    console.log('Meal added:', newMeal);
  };

  const handleAddFoodItem = (foodName: string, nutrients: NutrientData) => {
    setFoodLookup((prevLookup: Record<string, NutrientData>) => ({
      ...prevLookup,
      [foodName]: nutrients
    }));
  };
  
  const handleDeleteFoodItem = (foodName: string) => {
    setFoodLookup((prevLookup: Record<string, NutrientData>) => {
      const newLookup = { ...prevLookup };
      delete newLookup[foodName];
      return newLookup;
    });
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-dashboard-container">
      <div className="admin-header">
        <h1>ChompQuest Admin Panel</h1>
      </div>

      {loading && <p className="loading-message">Loading data...</p>}
      {error && <p className="error-message">{error}</p>}

      <div className="admin-main-content-split">
        <div className="admin-box">
          <h2>User Management</h2>
          <p>View and manage registered users.</p>
          <div className="search-section">
            <input
              type="text"
              placeholder="Search users by name or email..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button onClick={handleRefreshUsers} className="action-button refresh-button">Refresh Users</button>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Registration Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{new Date(user.registrationDate).toLocaleDateString()}</td>
                      <td>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="action-button delete-button"
                          disabled={loading}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center' }}>No users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="admin-box">
          <h2>Meal & Food Item Management</h2>
          <p>Add new meals to the tracker, or manage the list of pre-defined food items.</p>

          <button onClick={() => setShowAddMealModal(true)} className="primary-button">
            Add New Meal Entry
          </button>

          <button onClick={() => setShowManageFoodsModal(true)} className="action-button refresh-button" style={{ marginTop: '15px' }}>
            Manage Pre-defined Food Items
          </button>

          <h3 style={{ marginTop: '30px', marginBottom: '15px' }}>Recent Meal Entries:</h3>
          <div className="table-container" style={{ maxHeight: '250px' }}>
              <table>
                  <thead>
                      <tr>
                          <th>Name</th>
                          <th>Calories</th>
                          <th>Date</th>
                      </tr>
                  </thead>
                  <tbody>
                      {/* Display up to 5 most recent meals, newest first */}
                      {meals.slice(-5).reverse().map((meal) => (
                          <tr key={meal.id}>
                              <td>{meal.name}</td>
                              <td>{meal.calories}</td>
                              <td>{new Date(meal.date).toLocaleDateString()}</td>
                          </tr>
                      ))}
                      {meals.length === 0 && (
                          <tr><td colSpan={3} style={{ textAlign: 'center' }}>No meals added yet.</td></tr>
                      )}
                  </tbody>
              </table>
          </div>
        </div>
      </div>

      {showAddMealModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Add New Meal Entry</h2>
            <AddMeal
              onClose={() => setShowAddMealModal(false)}
              onAddMeal={handleAddMeal}
              nutrientLookup={foodLookup}
            />
            <button onClick={() => setShowAddMealModal(false)} className="action-button delete-button" style={{ marginTop: '20px' }}>Close</button>
          </div>
        </div>
      )}

      {showManageFoodsModal && (
          <div className="modal-overlay">
              <div className="modal-content">
                  <h2>Manage Pre-defined Food Items</h2>
                  <ManageFoodItems
                      currentLookup={foodLookup}
                      onAdd={handleAddFoodItem}
                      onDelete={handleDeleteFoodItem}
                      onClose={() => setShowManageFoodsModal(false)}
                  />
                  <button onClick={() => setShowManageFoodsModal(false)} className="action-button delete-button" style={{ marginTop: '20px' }}>Close</button>
              </div>
          </div>
      )}

      <footer className="admin-footer">
        <p>&copy; 2025 ChompQuest. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default AdminDashboard;