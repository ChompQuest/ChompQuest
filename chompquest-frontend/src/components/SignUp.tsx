import React, { useState } from 'react';
import './SignUp.css'; // This line imports your CSS file

const SignUp: React.FC = () => {
  // State variables to hold the input values
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string>(''); // For displaying error messages
  const [success, setSuccess] = useState<string>(''); // For displaying success messages

  // Function to handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault(); // Prevent default form submission (page reload)
    setError(''); // Clear any previous errors
    setSuccess(''); // Clear any previous success messages

    // Basic client-side validation
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

    // --- IMPORTANT: This is where you will integrate with your backend ---
    // For now, we'll just log the data and simulate a successful response.
    console.log('Attempting to create account with:', { username, email, password });

    try {
      // Replace 'YOUR_BACKEND_SIGNUP_API_ENDPOINT' with the actual URL
      // your backend team will provide for user registration.
      // Example: 'http://localhost:3001/api/auth/signup'
      const response = await fetch('YOUR_BACKEND_SIGNUP_API_ENDPOINT', {
        method: 'POST', // Use POST for creating new resources
        headers: {
          'Content-Type': 'application/json', // Indicate that you're sending JSON
        },
        body: JSON.stringify({ username, email, password }), // Send data as JSON
      });

      const data = await response.json(); // Parse the JSON response from the backend

      if (response.ok) { // Check if the response status is 2xx (success)
        setSuccess('Account created successfully! You can now log in.');
        // In a real app, you might redirect to the login page
        // For example, if you set up react-router-dom: navigate('/login');
      } else {
        // Handle errors from the backend (e.g., user already exists)
        setError(data.message || 'Failed to create account. Please try again.');
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError('Network error. Could not connect to the server.');
    }
  };

  return (
    <div className="signup-container">
      <form onSubmit={handleSubmit}>
        <h2>Create Your ChompQuest Account</h2>
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}

        <div className="form-group">
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password:</label>
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
    </div>
  );
};

export default SignUp;