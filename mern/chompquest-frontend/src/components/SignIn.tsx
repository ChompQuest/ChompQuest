import React, { useState } from 'react';
import './SignIn.css'; // Make sure this CSS file exists and is linked

const SignIn: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault(); // can't submit on default

    // clears any prev errors
    setError(null); 
    setSuccess(null);

    if (!username) {
      setError('Please fill in your username.');
      return;
    }
    if (username && !password) {
      setError('Please fill in your password.');
      return;
    }

    try {
      // Connect to backend API for sign in
      const response = await fetch('http://localhost:5050/user/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Successfully signed in!');
        // TODO: Store auth token and redirect to dashboard
      }
      else {
        setError(data.message || 'Invalid username or password.');
      }
    }
    catch (err) {
      // this is to test if backend is connected or not
      console.error('Sign in error:', err);
      setError('Network error. Could not connect to the server.');
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
        <button type="submit">Sign In</button>
      </form>
      <div className="signup-link">
        <p>Don't have an account? <a href="/signup">Sign Up</a></p>
      </div>
    </div>
  );
};

export default SignIn;