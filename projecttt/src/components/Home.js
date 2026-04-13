import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Emergency from './Emergency';
import './Home.css';

function Home() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authentication status
    const checkAuth = () => {
      const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
      const email = localStorage.getItem('userEmail');
      
      if (!loggedIn) {
        navigate('/login');
        return;
      }
      
      setIsLoggedIn(loggedIn);
      setUserEmail(email);
      setIsLoading(false);
    };

    checkAuth();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="home-container">
        <div className="home-content">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="home-container">
      <div className="home-content">
        <h1>Welcome, {userEmail}!</h1>
        <Emergency />
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>
    </div>
  );
}

export default Home; 