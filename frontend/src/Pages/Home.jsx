// pages/HomePage.js
import React from 'react';
import { Link } from 'react-router-dom';


const HomePage = () => {
  return (
    <div className="home-page">
      <div className="welcome-banner">
        <h1>Welcome to Ticket Booking System</h1>
        <p>Your one-stop solution for hassle-free travel bookings</p>
        <Link to="/login" className="get-started-button">Get Started</Link>
      </div>
      
      <div className="features">
        <div className="feature">
          <h3>Easy Booking</h3>
          <p>Book tickets in just a few clicks</p>
        </div>
        <div className="feature">
          <h3>Secure Payments</h3>
          <p>Your transactions are safe with us</p>
        </div>
        <div className="feature">
          <h3>Manage Reservations</h3>
          <p>View and manage your bookings anytime</p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;