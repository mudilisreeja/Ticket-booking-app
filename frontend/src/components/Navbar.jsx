// components/Navbar.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';


const Navbar = ({ isLoggedIn, username, onLogout }) => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    onLogout();
    navigate('/');
  };
  
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">TicketBooking</Link>
      </div>
      <div className="navbar-menu">
        {isLoggedIn ? (
          <>
            <span className="welcome-message">Welcome, {username}</span>
            <Link to="/my-bookings" className="my-bookings-link">My Bookings</Link>
            <button className="logout-button" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <Link to="/login" className="login-link">Login</Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;