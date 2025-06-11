// src/CurrentBookingsPage.js
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import BookingSearch from './components/BookingSearch';
import BookingCard from './components/BookingCard';
import BookingDetails from './components/BookingDetails';
import './CurrentBookingsPage.css';

// Mock booking data - in real app, this would come from database
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
      notes: 'ต้องการห้องชั้นล่าง'
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
      notes: ''
    },
    {
      id: 'BK24120103',
      guestName: 'สุดา วงศ์ใหญ่',
      phone: '083-456-7890',
      email: 'suda@email.com',
      roomNumber: '502',
      roomType: 'Superior',
      checkInDate: new Date(today.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      checkOutDate: today.toISOString().split('T')[0],
      nights: 1,
      guests: 3,
      includeBreakfast: true,
      totalPrice: 1750,
      status: 'departing_today',
      paymentMethod: 'transfer',
      createdAt: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      notes: 'ครอบครัวมีเด็กเล็ก'
    },
    {
      id: 'BK24120104',
      guestName: 'นางสาวมาลี ดอกไม้',
      phone: '084-567-8901',
      email: 'malee@email.com',
      roomNumber: '418',
      roomType: 'Deluxe',
      checkInDate: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      checkOutDate: new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      nights: 3,
      guests: 2,
      includeBreakfast: true,
      totalPrice: 6750,
      status: 'checked_in',
      paymentMethod: 'card',
      createdAt: new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      notes: 'VIP Guest - ห้องดูวิว'
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
      notes: 'ครอบครัวใหญ่ มีเด็ก 2 คน'
    }
  ];
  
  return bookings;
};

function CurrentBookingsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const timerId = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 60000);

    return () => clearInterval(timerId);
  }, []);

  // Close modal when route changes (fix for navigation issue)
  useEffect(() => {
    setSelectedBooking(null);
  }, [location.pathname]);

  // Add escape key handler for modal dismissal
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
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockBookings = generateMockBookings();
        setBookings(mockBookings);
        setFilteredBookings(mockBookings);
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

  // Get booking statistics
  const bookingStats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    
    return {
      total: bookings.length,
      arrivingToday: bookings.filter(b => b.checkInDate === today).length,
      departingToday: bookings.filter(b => b.checkOutDate === today).length,
      checkedIn: bookings.filter(b => b.status === 'checked_in').length,
      confirmed: bookings.filter(b => b.status === 'confirmed').length
    };
  }, [bookings]);

  // Handle search and filter
  const handleSearchFilter = (searchTerm, statusFilter, dateFilter) => {
    let filtered = [...bookings];

    // Search by name, phone, or booking ID
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(booking =>
        booking.guestName.toLowerCase().includes(term) ||
        booking.phone.includes(term) ||
        booking.id.toLowerCase().includes(term) ||
        booking.roomNumber.includes(term)
      );
    }

    // Filter by status
    if (statusFilter && statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }

    // Filter by date
    if (dateFilter) {
      const filterDate = new Date(dateFilter).toISOString().split('T')[0];
      filtered = filtered.filter(booking =>
        booking.checkInDate === filterDate || booking.checkOutDate === filterDate
      );
    }

    setFilteredBookings(filtered);
  };

  // Handle booking actions
  const handleCheckIn = (bookingId) => {
    setBookings(prev => prev.map(booking =>
      booking.id === bookingId
        ? { ...booking, status: 'checked_in' }
        : booking
    ));
    // Update filtered bookings as well
    setFilteredBookings(prev => prev.map(booking =>
      booking.id === bookingId
        ? { ...booking, status: 'checked_in' }
        : booking
    ));
  };

  const handleCheckOut = (bookingId) => {
    setBookings(prev => prev.map(booking =>
      booking.id === bookingId
        ? { ...booking, status: 'checked_out' }
        : booking
    ));
    setFilteredBookings(prev => prev.map(booking =>
      booking.id === bookingId
        ? { ...booking, status: 'checked_out' }
        : booking
    ));
  };

  const handleModifyBooking = (bookingId) => {
    // In real app, navigate to booking modification page
    alert(`แก้ไขการจอง ${bookingId} - ฟีเจอร์นี้จะถูกพัฒนาในเร็วๆ นี้`);
  };

  const handleCancelBooking = (bookingId) => {
    if (window.confirm('ต้องการยกเลิกการจองนี้หรือไม่?')) {
      setBookings(prev => prev.map(booking =>
        booking.id === bookingId
          ? { ...booking, status: 'cancelled' }
          : booking
      ));
      setFilteredBookings(prev => prev.map(booking =>
        booking.id === bookingId
          ? { ...booking, status: 'cancelled' }
          : booking
      ));
    }
  };

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
  };

  const handleCloseDetails = () => {
    setSelectedBooking(null);
  };

  return (
    <div className="current-bookings-container">
      <div className="page-header">
        <h1 className="page-title">รายการจองปัจจุบัน</h1>
        <h2 className="date-time-header">{formattedDate} | เวลา {formattedTime}</h2>
      </div>

      {/* Booking Statistics */}
      <div className="booking-stats">
        <div className="stat-card">
          <div className="stat-number">{bookingStats.total}</div>
          <div className="stat-label">การจองทั้งหมด</div>
        </div>
        <div className="stat-card arriving">
          <div className="stat-number">{bookingStats.arrivingToday}</div>
          <div className="stat-label">เข้าพักวันนี้</div>
        </div>
        <div className="stat-card departing">
          <div className="stat-number">{bookingStats.departingToday}</div>
          <div className="stat-label">ออกวันนี้</div>
        </div>
        <div className="stat-card checked-in">
          <div className="stat-number">{bookingStats.checkedIn}</div>
          <div className="stat-label">เช็คอินแล้ว</div>
        </div>
        <div className="stat-card confirmed">
          <div className="stat-number">{bookingStats.confirmed}</div>
          <div className="stat-label">ยืนยันแล้ว</div>
        </div>
      </div>

      {/* Search and Filter */}
      <BookingSearch onSearchFilter={handleSearchFilter} />

      {/* Bookings List */}
      <div className="bookings-section">
        <div className="section-header">
          <h3 className="section-title">
            รายการจอง ({filteredBookings.length})
          </h3>
          <button
            onClick={() => navigate('/new-booking')}
            className="btn btn-primary"
          >
            + จองใหม่
          </button>
        </div>

        {isLoading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>กำลังโหลดข้อมูลการจอง...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📅</div>
            <h3>ไม่พบข้อมูลการจอง</h3>
            <p>ไม่มีการจองที่ตรงกับเงื่อนไขการค้นหา</p>
            <button
              onClick={() => navigate('/new-booking')}
              className="btn btn-primary"
            >
              สร้างการจองใหม่
            </button>
          </div>
        ) : (
          <div className="bookings-grid">
            {filteredBookings.map(booking => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onCheckIn={handleCheckIn}
                onCheckOut={handleCheckOut}
                onModify={handleModifyBooking}
                onCancel={handleCancelBooking}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        )}
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <BookingDetails
          booking={selectedBooking}
          onClose={handleCloseDetails}
          onCheckIn={handleCheckIn}
          onCheckOut={handleCheckOut}
          onModify={handleModifyBooking}
          onCancel={handleCancelBooking}
        />
      )}
    </div>
  );
}

export default CurrentBookingsPage;