// src/components/AdminDashboard.tsx (UPDATED)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Keep useNavigate here
import './AdminDashboard.css';
import type { LoggedMealData, NutrientData } from '../types';
import ManageFoodItems from './ManageFoodItems';
import AdminProfileMenu from './AdminProfileMenu'; // Import the AdminProfileMenu component

export interface UserData {
  id: string;
  name: string;
  email: string;
  registrationDate: string;
}

const INITIAL_USERS: UserData[] = [
  {
    id: 'user-101',
    name: 'Alice Johnson',
    email: 'alice.j@example.com',
    registrationDate: '2025-07-15T10:00:00Z',
  },
  {
    id: 'user-102',
    name: 'Bob Smith',
    email: 'bob.s@example.com',
    registrationDate: '2025-06-20T14:30:00Z',
  },
  {
    id: 'user-103',
    name: 'Charlie Brown',
    email: 'charlie.b@example.com',
    registrationDate: '2025-05-10T08:15:00Z',
  },
  {
    id: 'user-104',
    name: 'Diana Prince',
    email: 'diana.p@example.com',
    registrationDate: '2025-07-01T11:00:00Z',
  },
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

const LOCAL_STORAGE_FOOD_LOOKUP_KEY = 'chompquest_food_lookup';
const LOCAL_STORAGE_USERS_KEY = 'chompquest_users';
const LOCAL_STORAGE_MEALS_KEY = 'chompquest_meals';

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>(() => {
    try {
      const storedUsers = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
      if (storedUsers && storedUsers !== '[]') {
        return JSON.parse(storedUsers) as UserData[];
      }
      return INITIAL_USERS;
    } catch (e) {
      console.error("Failed to load users from localStorage", e);
      return INITIAL_USERS;
    }
  });

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

  const [showFoodItemManagement, setShowFoodItemManagement] = useState(false);

  const [foodLookup, setFoodLookup] = useState<Record<string, NutrientData>>(() => {
    try {
      const storedLookup = localStorage.getItem(LOCAL_STORAGE_FOOD_LOOKUP_KEY);
      return storedLookup ? JSON.parse(storedLookup) as Record<string, NutrientData> : INITIAL_NUTRIENT_LOOKUP;
    } catch (e) {
      console.error("Failed to load food lookup from localStorage", e);
      return INITIAL_NUTRIENT_LOOKUP;
    }
  });

  const navigate = useNavigate(); // Initialize useNavigate hook

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_FOOD_LOOKUP_KEY, JSON.stringify(foodLookup));
      console.log("Food lookup saved to localStorage.");
    } catch (e) {
      console.error("Failed to save food lookup to localStorage", e);
    }
  }, [foodLookup]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(users));
      console.log("Users saved to localStorage.");
    } catch (e) {
      console.error("Failed to save users to localStorage", e);
    }
  }, [users]);

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
      if (storedUsers && storedUsers !== '[]') {
        setUsers(JSON.parse(storedUsers) as UserData[]);
      } else {
        setUsers(INITIAL_USERS);
      }
      console.log("Users refreshed.");
      setLoading(false);
    }, 500);
  };

  const handleAddFoodItem = (foodName: string, nutrients: NutrientData) => {
    setFoodLookup((prevLookup: Record<string, NutrientData>) => {
      if (prevLookup[foodName]) {
        alert('A food item with this name already exists. Please choose a different name.');
        return prevLookup;
      }
      return {
        ...prevLookup,
        [foodName]: nutrients
      };
    });
  };

  const handleDeleteFoodItem = (foodName: string) => {
    setFoodLookup((prevLookup: Record<string, NutrientData>) => {
      const newLookup = { ...prevLookup };
      delete newLookup[foodName];
      return newLookup;
    });
  };

  const handleAdminLogout = () => {
    console.log("Admin is performing logout actions and redirecting...");
    localStorage.removeItem(LOCAL_STORAGE_USERS_KEY);
    localStorage.removeItem(LOCAL_STORAGE_FOOD_LOOKUP_KEY);
    localStorage.removeItem(LOCAL_STORAGE_MEALS_KEY);
    navigate('/signin'); 
  };


  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-dashboard-container">
      <AdminProfileMenu onLogout={handleAdminLogout} /> 

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
                  <th className="action-column">Actions</th>
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
                      <td className="action-column">
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
          <h2>Food Item Management</h2>
          <p>This section allows you to manage pre-defined food items.</p>

          <button
            onClick={() => setShowFoodItemManagement(!showFoodItemManagement)}
            className="action-button primary-button toggle-button"
          >
            {showFoodItemManagement ? 'Hide Add Food Item Form' : 'Show Add Food Item Form'}
          </button>

          {showFoodItemManagement && (
            <div className="food-item-management-section">
                <ManageFoodItems
                    currentLookup={foodLookup}
                    onAdd={handleAddFoodItem}
                    onClose={() => setShowFoodItemManagement(false)}
                />
            </div>
          )}

          <h3 style={{ marginTop: '30px', marginBottom: '15px' }}>Existing Pre-defined Food Items:</h3>
          <p>Below is the list of all food items available for selection and tracking.</p>
          <div className="table-container" style={{ maxHeight: '250px' }}>
              <table>
                  <thead>
                      <tr>
                          <th>Food Name</th>
                          <th>Cal</th>
                          <th>Protein</th>
                          <th>Carbs</th>
                          <th>Fats</th>
                          <th className="action-column">Actions</th>
                      </tr>
                  </thead>
                  <tbody>
                      {Object.keys(foodLookup).length === 0 ? (
                          <tr><td colSpan={6} style={{ textAlign: 'center' }}>No pre-defined food items yet.</td></tr>
                      ) : (
                          Object.entries(foodLookup).map(([name, data]) => (
                              <tr key={name}>
                                  <td>{name}</td>
                                  <td>{data.calories}</td>
                                  <td>{data.protein}</td>
                                  <td>{data.carbs}</td>
                                  <td>{data.fats}</td>
                                  <td className="action-column">
                                      <button
                                          onClick={() => handleDeleteFoodItem(name)}
                                          className="action-button delete-button"
                                      >
                                          Delete
                                      </button>
                                  </td>
                              </tr>
                          ))
                      )}
                  </tbody>
              </table>
          </div>
        </div>
      </div>

      <footer className="admin-footer">
        <p>&copy; 2025 ChompQuest. All rights reserved.</p>
      </footer>
    </div>
  );
};
export default AdminDashboard;