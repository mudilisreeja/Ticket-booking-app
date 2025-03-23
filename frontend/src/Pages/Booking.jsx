// pages/BookingPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const BookingPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    startsFrom: '',
    destination: '',
    travelDate: '',
    adults: 1,
    children: 0,
  });

  const [passengers, setPassengers] = useState([
    { name: '', age: '', isAdult: true, idNumber: '' }
  ]);

  const [totalPrice, setTotalPrice] = useState(500); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => {
      const newData = { ...prev, [name]: value };

      if (name === 'adults' || name === 'children') {
        updatePassengers(
          name === 'adults' ? parseInt(value) : prev.adults,
          name === 'children' ? parseInt(value) : prev.children
        );
        calculateTotalPrice(
          name === 'adults' ? parseInt(value) : prev.adults,
          name === 'children' ? parseInt(value) : prev.children
        );
      }
      return newData;
    });
  };

  const updatePassengers = (adults, children) => {
    const newPassengers = [];
    for (let i = 0; i < adults; i++) {
      newPassengers.push(passengers[i] && passengers[i].isAdult
        ? passengers[i]
        : { name: '', age: '', isAdult: true, idNumber: '' });
    }
    for (let i = 0; i < children; i++) {
      const index = adults + i;
      newPassengers.push(passengers[index] && !passengers[index].isAdult
        ? passengers[index]
        : { name: '', age: '', isAdult: false, idNumber: '' });
    }
    setPassengers(newPassengers);
  };

  const calculateTotalPrice = (adults, children) => {
    const adultPrice = 500;
    const childPrice = 250;
    setTotalPrice((adults * adultPrice) + (children * childPrice));
  };

  const handlePassengerChange = (index, field, value) => {
    const updatedPassengers = [...passengers];
    updatedPassengers[index] = { ...updatedPassengers[index], [field]: value };
    setPassengers(updatedPassengers);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const bookingData = { ...formData, passengers, totalPrice };

    try {
      const response = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(bookingData)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Booking failed');

      alert('Booking created successfully!');
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="booking-page-container">
      <h2>Book Your Ticket</h2>
      {error && <div className="error">{error}</div>}

      <form onSubmit={handleSubmit} className="booking-form">
        <section className="section">
          <h3>Journey Details</h3>
          <div className="row">
            <div className="form-group">
              <label>From</label>
              <input
                type="text"
                name="startsFrom"
                value={formData.startsFrom}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>To</label>
              <input
                type="text"
                name="destination"
                value={formData.destination}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="row">
            <div className="form-group">
              <label>Travel Date</label>
              <input
                type="date"
                name="travelDate"
                value={formData.travelDate}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
          </div>
        </section>

        <section className="section">
          <h3>Passengers</h3>
          <div className="row">
            <div className="form-group">
              <label>Adults</label>
              <select
                name="adults"
                value={formData.adults}
                onChange={handleChange}
              >
                {[...Array(5)].map((_, i) => (
                  <option key={i} value={i + 1}>{i + 1}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Children</label>
              <select
                name="children"
                value={formData.children}
                onChange={handleChange}
              >
                {[...Array(6)].map((_, i) => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section className="section">
          <h3>Passenger Details</h3>
          {passengers.map((passenger, index) => (
            <div key={index} className="passenger-card">
              <h4>{passenger.isAdult ? 'Adult' : 'Child'} #{passenger.isAdult ? index + 1 : index - formData.adults + 1}</h4>
              <div className="row">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={passenger.name}
                    onChange={(e) => handlePassengerChange(index, 'name', e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Age</label>
                  <input
                    type="number"
                    value={passenger.age}
                    onChange={(e) => handlePassengerChange(index, 'age', e.target.value)}
                    min={passenger.isAdult ? 18 : 0}
                    max={passenger.isAdult ? 120 : 17}
                    required
                  />
                </div>
              </div>

              {(passenger.isAdult || passenger.age >= 5) && (
                <div className="form-group">
                  <label>ID Number</label>
                  <input
                    type="text"
                    value={passenger.idNumber}
                    onChange={(e) => handlePassengerChange(index, 'idNumber', e.target.value)}
                    required
                  />
                </div>
              )}
            </div>
          ))}
        </section>

        <section className="section booking-summary">
          <h3>Booking Summary</h3>
          <div className="summary-item">
            <span>Adults ({formData.adults} × ₹500)</span>
            <span>₹{formData.adults * 500}</span>
          </div>
          <div className="summary-item">
            <span>Children ({formData.children} × ₹250)</span>
            <span>₹{formData.children * 250}</span>
          </div>
          <div className="summary-total">
            <span>Total</span>
            <span>₹{totalPrice}</span>
          </div>
        </section>

        <div className="form-actions">
          <button 
            type="submit" 
            className="btn-primary" 
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Book Now'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookingPage;
