// src/NewBookingPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BookingWizard from './components/BookingWizard';
import './NewBookingPage.css';

function NewBookingPage() {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const timerId = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timerId);
  }, []);

  const formattedDate = new Intl.DateTimeFormat('th-TH-u-ca-buddhist', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(currentDateTime);

  const formattedTime = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(currentDateTime);

  const handleBookingComplete = (bookingData) => {
    // Handle successful booking creation
    console.log('Booking created:', bookingData);
    // In future: save to database, send confirmation
    navigate('/', { state: { message: 'การจองสำเร็จแล้ว' } });
  };

  const handleBookingCancel = () => {
    navigate('/');
  };

  return (
    <div className="new-booking-container">
      <div className="page-header">
        <h1 className="page-title">จองห้องใหม่</h1>
        <h2 className="date-time-header">{formattedDate} | เวลา {formattedTime}</h2>
      </div>

      <BookingWizard
        onComplete={handleBookingComplete}
        onCancel={handleBookingCancel}
      />
    </div>
  );
}

export default NewBookingPage;