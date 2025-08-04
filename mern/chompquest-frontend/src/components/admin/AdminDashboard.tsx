import React, { useState, useEffect, useRef } from 'react';
import './AdminDashboard.css';

import ManageFoodItems from './ManageFoodItems';
import AdminProfileMenu from './AdminProfileMenu'; 
import DeleteUserModal from './DeleteUserModal';
import EditUserModal from './EditUserModal';
import DeleteFoodModal from './DeleteFoodModal';

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
  const [selectedFoodItem, setSelectedFoodItem] = useState<{id: string, name: string} | null>(null);
  const [showDeleteFoodModal, setShowDeleteFoodModal] = useState(false);

  const [showFoodItemManagement, setShowFoodItemManagement] = useState(false);

  // Food items state for database-driven food management
  const [foodItems, setFoodItems] = useState<any[]>([]);
  const [foodItemsLoading, setFoodItemsLoading] = useState(false);
  const [foodItemsError, setFoodItemsError] = useState<string | null>(null);
  const [foodMessage, setFoodMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);
  const [foodItemsPage, setFoodItemsPage] = useState(0); // page offset
  const [hasMoreFoodItems, setHasMoreFoodItems] = useState(true);
  const [loadingMoreFoodItems, setLoadingMoreFoodItems] = useState(false);
  const foodTableRef = useRef<HTMLDivElement>(null);

  // Fetch food items from database with pagination
  const fetchFoodItems = async (searchQuery = '', skip = 0, append = false) => {
    try {
      if (skip === 0) setFoodItemsLoading(true);
      if (skip > 0) setLoadingMoreFoodItems(true);
      setFoodItemsError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const params = new URLSearchParams();
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      params.append('limit', '50');
      if (skip > 0) params.append('skip', skip.toString());

      const response = await fetch(`http://localhost:5050/admin/food-items?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Access denied. Admin privileges required.');
        }
        throw new Error(`Failed to fetch food items: ${response.status}`);
      }

      const data = await response.json();
      if (append) {
        setFoodItems(prev => [...prev, ...(data.foodItems || [])]);
      } else {
        setFoodItems(data.foodItems || []);
      }
      // Determine if there are more items to load
      const loadedCount = (append ? foodItems.length + (data.foodItems?.length || 0) : (data.foodItems?.length || 0));
      setHasMoreFoodItems(loadedCount < data.total);
    } catch (error) {
      console.error('Error fetching food items:', error);
      setFoodItemsError(error instanceof Error ? error.message : 'Failed to load food items');
      if (!append) setFoodItems([]);
    } finally {
      setFoodItemsLoading(false);
      setLoadingMoreFoodItems(false);
    }
  };

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

  // Load initial 4 latest member users and first 50 food items
  useEffect(() => {
    const loadInitialData = async () => {
      const initialUsers = await fetchMemberUsers('', 4);
      setUsers(initialUsers);
      
      // Load first 50 food items on page load
      await fetchFoodItems('', 0, false);
    };
    
    loadInitialData();
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

  // Show food message for 5 seconds
  useEffect(() => {
    if (foodMessage) {
      const timer = setTimeout(() => {
        setFoodMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [foodMessage]);

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
    setShowDeleteFoodModal(false);
    setSelectedUser(null);
    setSelectedFoodItem(null);
  };

  // Handle food search with debouncing
  useEffect(() => {
    if (!foodSearchTerm.trim()) {
      // Load first 50 items when search is cleared
      fetchFoodItems('', 0, false);
      return;
    }

    const searchTimeout = setTimeout(() => {
      fetchFoodItems(foodSearchTerm, 0, false); // Reset page for new search
    }, 300); // 300ms debounce for faster response

    return () => clearTimeout(searchTimeout);
  }, [foodSearchTerm]);

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      const container = foodTableRef.current;
      if (!container || foodItemsLoading || loadingMoreFoodItems || !hasMoreFoodItems) return;
      const { scrollTop, scrollHeight, clientHeight } = container;
      if (scrollHeight - scrollTop - clientHeight < 100) { // near bottom
        // Load next page
        setFoodItemsPage(prev => {
          const nextPage = prev + 1;
          fetchFoodItems(foodSearchTerm, nextPage * 50, true);
          return nextPage;
        });
      }
    };
    const container = foodTableRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, [foodItemsLoading, loadingMoreFoodItems, hasMoreFoodItems, foodSearchTerm, foodItems.length]);

  // Delete food item function
  const handleDeleteFoodItem = async (foodItemId: string, foodItemName: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5050/admin/food-items/${foodItemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete food item');
      }

      setFoodMessage({ text: `Food item "${foodItemName}" has been successfully deleted.`, type: 'success' });
      
      // Refresh the food list
      await fetchFoodItems(foodSearchTerm, 0, false); // Reset page for new search
      
    } catch (error) {
      console.error('Error deleting food item:', error);
      setFoodMessage({ text: `Failed to delete food item "${foodItemName}". Please try again.`, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogout = () => {
    console.log("Admin is performing logout actions...");
    localStorage.removeItem(LOCAL_STORAGE_MEALS_KEY);
    
    onLogout();
  };

  // Food items are already filtered by the API search, so we just use them directly
  const filteredFoodItems = foodItems;

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
           
           {/* Food Success/Error Message Display */}
           {foodMessage && (
             <div className={`admin-message ${foodMessage.type === 'success' ? 'success-message' : 'error-message'}`}>
               {foodMessage.text}
             </div>
           )}
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
                onClose={() => setShowFoodItemManagement(false)}
                onSuccess={() => {
                  // Refresh food list after adding new item
                  fetchFoodItems(foodSearchTerm, 0, false); // Reset page for new search
                  setFoodMessage({ text: 'Food item has been successfully added to the database.', type: 'success' });
                }}
                onError={(errorMessage: string) => {
                  setFoodMessage({ text: errorMessage, type: 'error' });
                }}
              />
            </div>
          )}

          <div className="food-lookup-display">
              <h3>Current Food Items in Database</h3>
              <div className="food-search-section">
                <input
                  type="text"
                  placeholder="Search pre-defined food items (e.g., banana, chicken, rice)..."
                  className="search-input"
                  value={foodSearchTerm}
                  onChange={(e) => setFoodSearchTerm(e.target.value)}
                />
                {foodItemsLoading && (
                  <div style={{ marginTop: '5px', fontSize: '12px', color: '#666' }}>
                    Searching...
                  </div>
                )}
              </div>

              <div className="food-lookup-display-container" ref={foodTableRef} style={{ maxHeight: 400, overflowY: 'auto' }}>
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
                        {foodItemsLoading ? (
                            <tr><td colSpan={6} style={{ textAlign: 'center' }}>Loading food items...</td></tr>
                        ) : foodItemsError ? (
                            <tr><td colSpan={6} style={{ textAlign: 'center', color: 'red' }}>{foodItemsError}</td></tr>
                        ) : filteredFoodItems.length === 0 && !foodSearchTerm.trim() ? (
                            <tr><td colSpan={6} style={{ textAlign: 'center' }}>Search for food items to see results...</td></tr>
                        ) : filteredFoodItems.length === 0 ? (
                            <tr><td colSpan={6} style={{ textAlign: 'center' }}>No food items found matching your search.</td></tr>
                        ) : (
                            filteredFoodItems.map((item) => (
                                <tr key={item.id}>
                                    <td>{item.name}</td>
                                    <td>{item.calories}</td>
                                    <td>{item.protein}</td>
                                    <td>{item.carbs}</td>
                                    <td>{item.fats}</td>
                                    <td className="action-column">
                                                                                 <button
                                             onClick={() => {
                                               setSelectedFoodItem({ id: item.id, name: item.name });
                                               setShowDeleteFoodModal(true);
                                             }}
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
                {loadingMoreFoodItems && (
                  <div style={{ textAlign: 'center', padding: '10px' }}>Loading more...</div>
                )}
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

       {showDeleteFoodModal && selectedFoodItem && (
         <DeleteFoodModal
           onClose={closeModals}
           onDelete={handleDeleteFoodItem}
           foodItem={selectedFoodItem}
         />
       )}
    </div>
  );
};
export default AdminDashboard;