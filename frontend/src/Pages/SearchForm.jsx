import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

function SearchForm() {
  const [fromCity, setFromCity] = useState('');
  const [toCity, setToCity] = useState('');
  const [date, setDate] = useState(new Date());
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    // Validate form
    if (!fromCity || !toCity) {
      alert('Please fill all required fields');
      return;
    }
    
    // Navigate to search results with query params
    navigate(`/search-results?from=${fromCity}&to=${toCity}&date=${date.toISOString().split('T')[0]}`);
  };

  return (
    <form onSubmit={handleSearch}>
      <div className="row justify-content-center align-items-center g-3">
        <div className="col-md-2 text-end">
          <label htmlFor="fromCity" className="form-label text-danger fw-bold fs-5">from</label>
        </div>
        <div className="col-md-2">
          <input
            type="text"
            id="fromCity"
            className="form-control border-danger"
            value={fromCity}
            onChange={(e) => setFromCity(e.target.value)}
            required
          />
        </div>
        
        <div className="col-md-1 text-end">
          <label htmlFor="toCity" className="form-label text-danger fw-bold fs-5">To</label>
        </div>
        <div className="col-md-2">
          <input
            type="text"
            id="toCity"
            className="form-control border-danger"
            value={toCity}
            onChange={(e) => setToCity(e.target.value)}
            required
          />
        </div>
        
        <div className="col-md-1 text-end">
          <label htmlFor="date" className="form-label text-danger fw-bold fs-5">Date</label>
        </div>
        <div className="col-md-2">
          <DatePicker
            id="date"
            selected={date}
            onChange={(date) => setDate(date)}
            className="form-control border-danger"
            dateFormat="dd/MM/yyyy"
            minDate={new Date()}
            required
          />
        </div>
        
        <div className="col-md-2">
          <button type="submit" className="btn btn-danger">search buses</button>
        </div>
      </div>
    </form>
  );
}

export default SearchForm;