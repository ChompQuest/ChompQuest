import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// Import your SignUp component.
// Make sure the path is correct based on where you saved SignUp.tsx (e.g., './components/SignUp' or './SignUp')
import SignUp from './components/SignUp'; // Assuming it's in src/components

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* This route will display your SignUp component when the URL is /signup */}
          <Route path="/signup" element={<SignUp />} />

          {/* This route will display your SignUp component when the URL is the root (/) */}
          {/* This means when you go to http://localhost:5173/, you'll see the signup page */}
          <Route path="/" element={<SignUp />} />

          {/* You can remove or comment out any other routes for now, like a placeholder login page */}
          {/* When you're ready to create the Login page, you'll add its route here. */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;