import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { auth } = useContext(AuthContext);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/bookings/user/${auth.userId}`, {
          headers: {
            Authorization: `Bearer ${auth.token}`
          }
        });
        setBookings(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load bookings');
        setLoading(false);
      }
    };

    fetchBookings();
  }, [auth.token, auth.userId]);

  if (loading) return <div className="mybookings-loading">Loading your bookings...</div>;
  if (error) return <div className="mybookings-error">{error}</div>;

  return (
    <div className="mybookings-container">
      <div className="mybookings-card">
        <div className="mybookings-header">
          <h3>My Bookings</h3>
        </div>
        <div className="mybookings-body">
          {bookings.length === 0 ? (
            <div className="mybookings-empty">
              <p>You don't have any bookings yet.</p>
              <Link to="/booking" className="mybookings-btn">Book a Ticket Now</Link>
            </div>
          ) : (
            <div className="mybookings-table-wrapper">
              <table className="mybookings-table">
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>From</th>
                    <th>To</th>
                    <th>Travel Date</th>
                    <th>Passengers</th>
                    <th>Total Price</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(booking => (
                    <tr key={booking.id}>
                      <td>{booking.id}</td>
                      <td>{booking.startsFrom}</td>
                      <td>{booking.destination}</td>
                      <td>{new Date(booking.travelDate).toLocaleDateString()}</td>
                      <td>{booking.passengers.length}</td>
                      <td>${booking.totalPrice}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MyBookings;
