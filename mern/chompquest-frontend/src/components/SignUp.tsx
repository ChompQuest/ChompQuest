import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SignUp.css'; // Make sure this CSS file exists and is linked

interface SignUpProps {
  onLogin: () => void;
}

const SignUp: React.FC<SignUpProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault(); // can't submit on default

    // clears any prev errors
    setError(null); 
    setSuccess(null);

    if (!username || !email || !password || !confirmPassword) {
      setError('All fields are required.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    try {
      // Connect to backend API
      const response = await fetch('http://localhost:5050/user/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json(); 

      if (response.ok) {
        setSuccess('Account created successfully! Redirecting to set up your nutrition goals...');
        
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify({
          userId: data.userId,
          username: username,
          isLoggedIn: true
        }));
        localStorage.setItem('isNewUser', 'true'); // Set new user flag
        
        setRedirecting(true); // Show loading
        
        // Redirect to nutrition goals page after successful signup
        setTimeout(() => {
          navigate('/nutrition-goals', { 
            state: { 
              isNewUser: true, 
              userId: data.userId 
            } 
          });
        }, 2000);
      } 
      else {
        setError(data.message || 'Failed to create account. Please try again.');
      }
    } 
    catch (err) {
      // this is to test if backend is connected or not
      console.error('Signup error:', err);
      setError('Network error. Could not connect to the server.');
    }
  };

  if (redirecting) {
    return <div style={{textAlign: 'center', marginTop: '100px'}}>Redirecting to set your nutrition goals...</div>;
  }

  return (
    <div className="signup-container">
      <h3>Welcome to ChompQuest! <br /> This site was built to help you keep track of your goals while making it fun! Let's play</h3>
      <h2>Create an Account</h2>
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
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Sign Up</button>
      </form>
      <div className="signin-link">
        <p>Already have an account? <a href="/signin">Sign In</a></p>
      </div>
    </div>
  );
};

export default SignUp;