// App.js - Main application component
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import HomePage from './Pages/Home.jsx';
import LoginPage from './Pages/Login.jsx';
import RegisterPage from './Pages/Register.jsx';
import ForgotPasswordPage from './Pages/ForgotPassword.jsx';
import BookingPage from './Pages/Booking.jsx';
import MyBookings from './Pages/MyBookings.jsx';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [username, setUsername] = useState(localStorage.getItem('username') || '');

  const handleLogin = (userData) => {
    localStorage.setItem('token', userData.token);
    localStorage.setItem('userId', userData.user_id);
    localStorage.setItem('username', userData.username);
    setIsLoggedIn(true);
    setUsername(userData.username);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    setIsLoggedIn(false);
    setUsername('');
  };

  return (
    <Router>
      <div className="App">
        <Navbar isLoggedIn={isLoggedIn} username={username} onLogout={handleLogout} />
        <div className="container">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route 
              path="/login" 
              element={isLoggedIn ? <Navigate to="/booking" /> : <LoginPage onLogin={handleLogin} />} 
            />
            <Route 
              path="/register" 
              element={isLoggedIn ? <Navigate to="/booking" /> : <RegisterPage />} 
            />
            <Route 
              path="/booking" 
              element={isLoggedIn ? <BookingPage /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/my-bookings" 
              element={isLoggedIn ? <MyBookings /> : <Navigate to="/login" />} 
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;