import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

function BookingForm() {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    startsFrom: '',
    destination: '',
    travelDate: '',
    adults: 1,
    children: 0
  });
  
  const [passengers, setPassengers] = useState([
    { name: '', age: '', isAdult: true, idNumber: '' }
  ]);
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handlePassengerChange = (index, e) => {
    const { name, value } = e.target;
    const updatedPassengers = [...passengers];
    
    if (name === 'age') {
      const age = parseInt(value);
      updatedPassengers[index] = {
        ...updatedPassengers[index],
        [name]: value,
        isAdult: age >= 18
      };
    } else {
      updatedPassengers[index] = {
        ...updatedPassengers[index],
        [name]: value
      };
    }
    
    setPassengers(updatedPassengers);
  };

  const addPassenger = () => {
    setPassengers([...passengers, { name: '', age: '', isAdult: true, idNumber: '' }]);
  };

  const removePassenger = (index) => {
    const updatedPassengers = [...passengers];
    updatedPassengers.splice(index, 1);
    setPassengers(updatedPassengers);
  };

  const calculateTotalPrice = () => {
    // Simple price calculation: $50 per adult, $25 per child
    const adultPrice = parseInt(formData.adults) * 50;
    const childPrice = parseInt(formData.children) * 25;
    return adultPrice + childPrice;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate passenger details
      for (const passenger of passengers) {
        if (passenger.isAdult && !passenger.idNumber) {
          throw new Error("Adults must provide an ID number");
        }
        if (!passenger.isAdult && parseInt(passenger.age) >= 5 && !passenger.idNumber) {
          throw new Error("Kids 5 years and older must provide an ID number");
        }
      }

      const bookingData = {
        ...formData,
        passengers,
        totalPrice: calculateTotalPrice(),
        userId: currentUser?.user_id || null
      };

      const headers = currentUser?.token ? {
        Authorization: `Bearer ${currentUser.token}`
      } : {};

      await axios.post('http://localhost:5000/api/bookings', bookingData, { headers });
      navigate('/my-bookings');
    } catch (err) {
      setError(err.message || 'An error occurred while creating the booking');
    } finally {
      setLoading(false);
    }
  };

  const updatePassengerCount = () => {
    const totalAdults = parseInt(formData.adults) || 0;
    const totalChildren = parseInt(formData.children) || 0;
    const totalPassengers = totalAdults + totalChildren;
    
    // Adjust passenger array length
    if (passengers.length < totalPassengers) {
      // Add more passenger forms
      const toAdd = totalPassengers - passengers.length;
      for (let i = 0; i < toAdd; i++) {
        addPassenger();
      }
    } else if (passengers.length > totalPassengers) {
      // Remove excess passenger forms
      setPassengers(passengers.slice(0, totalPassengers));
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-8">
        <div className="card">
          <div className="card-header">Book Tickets</div>
          <div className="card-body">
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="row mb-3">
                <div className="col-md-6">
                  <label htmlFor="startsFrom" className="form-label">Origin</label>
                  <input
                    type="text"
                    className="form-control"
                    id="startsFrom"
                    name="startsFrom"
                    value={formData.startsFrom}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="destination" className="form-label">Destination</label>
                  <input
                    type="text"
                    className="form-control"
                    id="destination"
                    name="destination"
                    value={formData.destination}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <label htmlFor="travelDate" className="form-label">Travel Date</label>
                  <input
                    type="date"
                    className="form-control"
                    id="travelDate"
                    name="travelDate"
                    value={formData.travelDate}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <label htmlFor="adults" className="form-label">Adults (18+)</label>
                  <input
                    type="number"
                    className="form-control"
                    id="adults"
                    name="adults"
                    value={formData.adults}
                    onChange={handleChange}
                    min="1"
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="children" className="form-label">Children (0-17)</label>
                  <input
                    type="number"
                    className="form-control"
                    id="children"
                    name="children"
                    value={formData.children}
                    onChange={handleChange}
                    min="0"
                  />
                </div>
              </div>

              <button type="button" className="btn btn-info mb-3" onClick={updatePassengerCount}>
                Update Passenger Forms
              </button>

              <h4>Passenger Details</h4>
              {passengers.map((passenger, index) => (
                <div key={index} className="card mb-3 p-3">
                  <h5>Passenger {index + 1}</h5>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Name</label>
                      <input
                        type="text"
                        className="form-control"
                        name="name"
                        value={passenger.name}
                        onChange={(e) => handlePassengerChange(index, e)}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Age</label>
                      <input
                        type="number"
                        className="form-control"
                        name="age"
                        value={passenger.age}
                        onChange={(e) => handlePassengerChange(index, e)}
                        min="0"
                        required
                      />
                    </div>
                    <div className="col-md-12 mb-3">
                      <label className="form-label">ID Number {passenger.isAdult || passenger.age >= 5 ? '(Required)' : '(Optional)'}</label>
                      <input
                        type="text"
                        className="form-control"
                        name="idNumber"
                        value={passenger.idNumber}
                        onChange={(e) => handlePassengerChange(index, e)}
                        required={passenger.isAdult || passenger.age >= 5}
                      />
                    </div>
                    {index > 0 && (
                      <div className="col-12">
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => removePassenger(index)}
                        >
                          Remove Passenger
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              <div className="alert alert-info">
                Total Price: ${calculateTotalPrice()}
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Processing...' : 'Book Now'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookingForm;
