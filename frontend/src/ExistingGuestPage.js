// src/ExistingGuestPage.js
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import GuestLookup from './components/GuestLookup';
import CheckInProcess from './components/CheckInProcess';
import './ExistingGuestPage.css';

// Mock booking data - in real app, this would come from API
const generateMockBookings = () => {
  const today = new Date();
  const bookings = [
    {
      id: 'BK24120101',
      guestName: 'สมชาย ใจดี',
      phone: '081-234-5678',
      email: 'somchai@email.com',
      roomNumber: '301',
      roomType: 'Deluxe',
      checkInDate: new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      checkOutDate: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      nights: 2,
      guests: 2,
      includeBreakfast: true,
      totalPrice: 4500,
      status: 'confirmed',
      paymentMethod: 'card',
      createdAt: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      notes: 'ต้องการห้องชั้นล่าง',
      idNumber: '1234567890123',
      nationality: 'Thai'
    },
    {
      id: 'BK24120102',
      guestName: 'John Smith',
      phone: '082-345-6789',
      email: 'john@email.com',
      roomNumber: '405',
      roomType: 'Standard',
      checkInDate: today.toISOString().split('T')[0],
      checkOutDate: new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      nights: 1,
      guests: 1,
      includeBreakfast: false,
      totalPrice: 1200,
      status: 'arriving_today',
      paymentMethod: 'cash',
      createdAt: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      notes: '',
      idNumber: 'P123456789',
      nationality: 'American'
    },
    {
      id: 'BK24120105',
      guestName: 'David Johnson',
      phone: '085-678-9012',
      email: 'david@email.com',
      roomNumber: '511',
      roomType: 'Family',
      checkInDate: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      checkOutDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      nights: 4,
      guests: 4,
      includeBreakfast: false,
      totalPrice: 10000,
      status: 'confirmed',
      paymentMethod: 'later',
      createdAt: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      notes: 'ครอบครัวใหญ่ มีเด็ก 2 คน',
      idNumber: 'P987654321',
      nationality: 'Canadian'
    }
  ];
  
  return bookings;
};

function ExistingGuestPage() {
  const location = useLocation();
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Update time every minute
  useEffect(() => {
    const timerId = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 60000);

    return () => clearInterval(timerId);
  }, []);

  // Close any open states when route changes (fix for navigation issue)
  useEffect(() => {
    setSelectedBooking(null);
  }, [location.pathname]);

  // Add escape key handler for dismissing check-in process
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && selectedBooking) {
        setSelectedBooking(null);
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [selectedBooking]);

  // Load bookings data
  useEffect(() => {
    const loadBookings = async () => {
      try {
        setIsLoading(true);
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const mockBookings = generateMockBookings();
        setBookings(mockBookings);
      } catch (error) {
        console.error('Error loading bookings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadBookings();
  }, []);

  // Format date and time for display
  const formattedDate = new Intl.DateTimeFormat('th-TH-u-ca-buddhist', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(currentDateTime);

  const formattedTime = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(currentDateTime);

  const handleBookingSelect = (booking) => {
    setSelectedBooking(booking);
  };

  const handleBackToSearch = () => {
    setSelectedBooking(null);
  };

  const handleCheckInComplete = (bookingId) => {
    // Update booking status to checked_in
    setBookings(prev => prev.map(booking =>
      booking.id === bookingId
        ? { ...booking, status: 'checked_in' }
        : booking
    ));
    
    // Show success message and return to search
    alert(`เช็คอินสำเร็จ! ยินดีต้อนรับ คุณ${selectedBooking.guestName}`);
    setSelectedBooking(null);
  };

  return (
    <div className="existing-guest-container">
      <div className="page-header">
        <h1 className="page-title">เช็คอินลูกค้าจองมาแล้ว</h1>
        <h2 className="date-time-header">{formattedDate} | เวลา {formattedTime}</h2>
      </div>

      {!selectedBooking ? (
        <>
          {/* Instructions */}
          <div className="instructions-card">
            <div className="instructions-icon">🔍</div>
            <div className="instructions-content">
              <h3>วิธีการเช็คอิน</h3>
              <ol>
                <li>ค้นหาการจองด้วยชื่อ เบอร์โทร หรือรหัสจอง</li>
                <li>ตรวจสอบข้อมูลการจองกับลูกค้า</li>
                <li>ขอเอกสารประจำตัวจากลูกค้า</li>
                <li>ดำเนินการเช็คอินและมอบกุญแจห้อง</li>
              </ol>
            </div>
          </div>

          {/* Guest Lookup */}
          <GuestLookup 
            bookings={bookings}
            onBookingSelect={handleBookingSelect}
            isLoading={isLoading}
          />

          {/* Quick Stats */}
          <div className="quick-stats">
            <div className="stat-item">
              <span className="stat-number">{bookings.filter(b => b.status === 'arriving_today').length}</span>
              <span className="stat-label">เข้าพักวันนี้</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{bookings.filter(b => b.status === 'confirmed' || b.status === 'arriving_today').length}</span>
              <span className="stat-label">รอเช็คอิน</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{bookings.length}</span>
              <span className="stat-label">การจองทั้งหมด</span>
            </div>
          </div>
        </>
      ) : (
        <CheckInProcess 
          booking={selectedBooking}
          onBack={handleBackToSearch}
          onCheckInComplete={handleCheckInComplete}
        />
      )}
    </div>
  );
}

export default ExistingGuestPage;