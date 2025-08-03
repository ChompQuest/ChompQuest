import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';
import type { NutrientData } from '../types';
import ManageFoodItems from './ManageFoodItems';
import AdminProfileMenu from './AdminProfileMenu'; 
import DeleteUserModal from './DeleteUserModal';
import EditUserModal from './EditUserModal';

export interface UserData {
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
const LOCAL_STORAGE_MEALS_KEY = 'chompquest_meals';

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [foodSearchTerm, setFoodSearchTerm] = useState(''); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [message, setMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

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

  const fetchMemberUsers = async (searchQuery = '', limit: number | null = null) => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const params = new URLSearchParams();
      params.append('role', 'member');
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      if (limit) {
        params.append('limit', limit.toString());
      }

      const response = await fetch(`http://localhost:5050/admin/users?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Access denied. Admin privileges required.');
        }
        throw new Error(`Failed to fetch users: ${response.status}`);
      }

      const data = await response.json();
      // Filter out admin users on frontend as extra safety
      const memberUsers = (data.users || []).filter((user: any) => user.role !== 'admin');
      return memberUsers;
    } catch (error) {
      console.error('Error fetching users:', error);
      setError(error instanceof Error ? error.message : 'Failed to load users');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Load initial 4 latest member users
  useEffect(() => {
    const loadInitialUsers = async () => {
      const initialUsers = await fetchMemberUsers('', 4);
      setUsers(initialUsers);
    };
    
    loadInitialUsers();
  }, []);

  // Handle user search with debouncing
  useEffect(() => {
    if (!searchTerm.trim()) {
      // If search is empty, show initial 4 users
      const loadInitialUsers = async () => {
        const initialUsers = await fetchMemberUsers('', 4);
        setUsers(initialUsers);
      };
      loadInitialUsers();
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const searchTimeout = setTimeout(async () => {
      const searchResults = await fetchMemberUsers(searchTerm);
      setUsers(searchResults);
      setIsSearching(false);
    }, 500); // 500ms debounce

    return () => clearTimeout(searchTimeout);
  }, [searchTerm]);

  // Show message for 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Delete user function
  const handleDeleteUser = async (user: UserData) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5050/admin/users/${user.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      setMessage({ text: `User ${user.username} has been successfully deleted.`, type: 'success' });
      
      // Refresh the user list
      if (searchTerm) {
        const updatedUsers = await fetchMemberUsers(searchTerm);
        setUsers(updatedUsers);
      } else {
        const updatedUsers = await fetchMemberUsers('', 4);
        setUsers(updatedUsers);
      }
      
    } catch (error) {
      console.error('Error deleting user:', error);
      setMessage({ text: `Failed to delete user ${user.username}. Please try again.`, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Edit user stats function
  const handleEditUserStats = async (userId: string, newPoints: number, newStreak: number) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5050/admin/users/${userId}/stats`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          points: newPoints,
          streak: newStreak
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user stats');
      }

      const updatedUser = selectedUser?.username || 'User';
      setMessage({ text: `${updatedUser}'s stats have been successfully updated.`, type: 'success' });
      
      // Refresh the user list
      if (searchTerm) {
        const updatedUsers = await fetchMemberUsers(searchTerm);
        setUsers(updatedUsers);
      } else {
        const updatedUsers = await fetchMemberUsers('', 4);
        setUsers(updatedUsers);
      }
      
    } catch (error) {
      console.error('Error updating user stats:', error);
      const userName = selectedUser?.username || 'User';
      setMessage({ text: `Failed to update ${userName}'s stats. Please try again.`, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (user: UserData) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const openEditModal = (user: UserData) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const closeModals = () => {
    setShowDeleteModal(false);
    setShowEditModal(false);
    setSelectedUser(null);
  };

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_FOOD_LOOKUP_KEY, JSON.stringify(foodLookup));
    } catch (e) {
      console.error("Failed to save food lookup to localStorage", e);
    }
  }, [foodLookup]);

  const addFoodItem = (name: string, data: NutrientData) => {
    if (foodLookup[name]) {
      alert("Food item already exists!");
      return;
    }
    setFoodLookup((prevLookup: Record<string, NutrientData>) => ({
      ...prevLookup,
      [name]: data,
    }));
  };

  const handleDeleteFoodItem = (foodName: string) => {
    setFoodLookup((prevLookup: Record<string, NutrientData>) => {
      const newLookup = { ...prevLookup };
      delete newLookup[foodName];
      return newLookup;
    });
  };

  const handleAdminLogout = () => {
    console.log("Admin is performing logout actions...");
    localStorage.removeItem(LOCAL_STORAGE_FOOD_LOOKUP_KEY);
    localStorage.removeItem(LOCAL_STORAGE_MEALS_KEY);
    
    onLogout();
  };

  const filteredFoodItems = Object.entries(foodLookup).filter(([name]) =>
    name.toLowerCase().includes(foodSearchTerm.toLowerCase())
  );

  return (
    <div className="admin-dashboard-container">
      <AdminProfileMenu onLogout={handleAdminLogout} /> 

      <div className="admin-header">
        <h1>ChompQuest Admin Panel</h1>
      </div>

      {loading && <p className="loading-message">Loading users...</p>}
      {error && <p className="error-message">{error}</p>}

      <div className="admin-main-content-split">
        <div className="admin-box">
          <h2>Member User Management</h2>
          <p>View and manage registered member users. {!searchTerm && 'Showing 4 most recent accounts.'}</p>
          <div className="search-section">
            <input
              type="text"
              placeholder="Search member users by username or email..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {isSearching && <p className="loading-message">Searching...</p>}
          
          {/* Success/Error Message Display */}
          {message && (
            <div className={`admin-message ${message.type === 'success' ? 'success-message' : 'error-message'}`}>
              {message.text}
            </div>
          )}
          
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Registration Date</th>
                  <th>Streak</th>
                  <th>Points</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center' }}>
                      {searchTerm ? 'No users found matching your search.' : 'No member users found.'}
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.username}</td>
                      <td>{user.email}</td>
                      <td>{new Date(user.registrationDate).toLocaleDateString()}</td>
                      <td>{user.game_stats.dailyStreak}</td>
                      <td>{user.game_stats.pointTotal}</td>
                      <td className="action-column">
                        <button
                          onClick={() => openEditModal(user)}
                          className="action-button edit-button"
                          disabled={loading}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => openDeleteModal(user)}
                          className="action-button delete-button"
                          disabled={loading}
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

        <div className="admin-box">
          <h2>Food Item Management</h2>
          <p>Manage the food database for the app.</p>
          {!showFoodItemManagement ? (
            <button
              onClick={() => setShowFoodItemManagement(true)}
              className="action-button primary-button toggle-button"
            >
              Open Food Item Management
            </button>
          ) : (
            <div>
              <button
                onClick={() => setShowFoodItemManagement(false)}
                className="action-button primary-button toggle-button"
              >
                Close Food Item Management
              </button>
              <ManageFoodItems 
                currentLookup={foodLookup}
                onAdd={addFoodItem}
                onClose={() => setShowFoodItemManagement(false)}
              />
            </div>
          )}

          <div className="food-lookup-display">
              <h3>Current Food Items in Database</h3>
              <div className="food-search-section">
                <input
                  type="text"
                  placeholder="Search pre-defined food items..."
                  className="search-input"
                  value={foodSearchTerm}
                  onChange={(e) => setFoodSearchTerm(e.target.value)}
                />
              </div>

              <div className="food-lookup-display-container">
                <table className="food-lookup-table">
                    <thead>
                        <tr>
                            <th>Food Name</th>
                            <th>Calories</th>
                            <th>Protein</th>
                            <th>Carbs</th>
                            <th>Fats</th>
                            <th className="action-column">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredFoodItems.length === 0 ? (
                            <tr><td colSpan={6} style={{ textAlign: 'center' }}>No pre-defined food items found.</td></tr>
                        ) : (
                            Object.entries(foodLookup)
                              .filter(([name]) => name.toLowerCase().includes(foodSearchTerm.toLowerCase()))
                              .map(([name, data]) => (
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
      </div>

      <footer className="admin-footer">
        <p>&copy; 2025 ChompQuest. All rights reserved.</p>
      </footer>

      {/* Modals */}
      {showDeleteModal && selectedUser && (
        <DeleteUserModal
          onClose={closeModals}
          onDelete={handleDeleteUser}
          user={selectedUser}
        />
      )}

      {showEditModal && selectedUser && (
        <EditUserModal
          onClose={closeModals}
          onSave={handleEditUserStats}
          user={selectedUser}
        />
      )}
    </div>
  );
};
export default AdminDashboard;