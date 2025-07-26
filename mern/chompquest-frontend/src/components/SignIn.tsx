import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './SignIn.css'; 

interface SignInProps {
  onLogin: () => void;
}

const SignIn: React.FC <SignInProps> = ({onLogin}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Clear any previous errors
    setError(null); 
    setSuccess(null);
    setIsLoading(true);

    if (!username) {
      setError('Please fill in your username.');
      setIsLoading(false);
      return;
    }
    if (username && !password) {
      setError('Please fill in your password.');
      setIsLoading(false);
      return;
    }

    try {
      // Connect to backend API for sign in
      const response = await fetch('http://localhost:5050/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Successfully signed in! Loading your dashboard...');
        
        // Store user data and token in localStorage
        localStorage.setItem('user', JSON.stringify({
          userId: data.userId,
          username: data.username,
          isLoggedIn: true
        }));
        
        // Store JWT token for API calls
        if (data.token) {
          localStorage.setItem('token', data.token);
        }
        
        // Store game stats in localStorage
        if (data.game_stats) {
          localStorage.setItem('gameStats', JSON.stringify(data.game_stats));
        }
        
        // Pre-load dashboard data during the delay
        const preloadDashboardData = async () => {
          try {
            // Fetch any additional data needed for dashboard
            const token = data.token;
            if (token) {
              // Fetch fresh game stats to ensure we have the latest data
              const gameStatsResponse = await fetch('http://localhost:5050/user/game-stats', {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
              });
              
              if (gameStatsResponse.ok) {
                const gameStatsData = await gameStatsResponse.json();
                localStorage.setItem('gameStats', JSON.stringify(gameStatsData.game_stats));
                
                // Update the App state with the fresh game stats
                // This ensures the dashboard gets the updated data
                return gameStatsData.game_stats;
              }
            }
            return data.game_stats; // Fallback to login response data
          } catch (error) {
            console.error('Error preloading dashboard data:', error);
            return data.game_stats; // Fallback to login response data
          }
        };
        
        // Start preloading data and update App state
        preloadDashboardData().then((freshGameStats) => {
          // Update the App state with the fresh game stats
          if (freshGameStats) {
            // We need to update the parent App component's state
            // Since we can't directly call updateGameStats from here,
            // we'll store the data and let the App component pick it up
            localStorage.setItem('freshGameStats', JSON.stringify(freshGameStats));
          }
          
          // Call the onLogin callback to update parent state
          onLogin();
        });
        
        // Add a longer delay to show success message and ensure all data is loaded
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000); // 3 seconds delay
      }
      else {
        setError(data.message || 'Invalid username or password.');
        setIsLoading(false);
      }
    }
    catch (err) {
      console.error('Sign in error:', err);
      setError('Network error. Could not connect to the server.');
      setIsLoading(false);
    }
  };

  return (
    <div className="signin-container">
      <h3>Welcome to ChompQuest!</h3>
      <h2>Sign In</h2>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button 
          type="submit" 
          disabled={isLoading}
          className={isLoading ? 'loading' : ''}
        >
          {isLoading ? 'Signing In...' : 'Sign In'}
        </button>
      </form>
      <div className="signup-link">
        <p>Don't have an account? <a href="/signup">Sign Up</a></p>
      </div>
    </div>
  );
};

export default SignIn;