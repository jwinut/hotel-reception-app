// src/components/GuestLookup.tsx
import React, { useState, useMemo } from 'react';
import './GuestLookup.css';
import { sanitizeInput } from '../utils/validation';
import type { Booking, BookingStatus } from '../types';

interface GuestLookupProps {
  bookings: Booking[];
  onBookingSelect: (booking: Booking) => void;
  isLoading?: boolean;
}

interface StatusInfo {
  label: string;
  className: string;
  icon: string;
}

const GuestLookup: React.FC<GuestLookupProps> = ({ 
  bookings, 
  onBookingSelect, 
  isLoading = false 
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

  // Filter bookings that can be checked in
  const availableBookings = useMemo(() => {
    return bookings.filter(booking => 
      booking.status === 'confirmed' || 
      booking.status === 'arriving_today'
    );
  }, [bookings]);

  // Search logic
  const filteredBookings = useMemo(() => {
    const sanitizedTerm = sanitizeInput(searchTerm);
    if (!sanitizedTerm.trim()) return [];

    const term = sanitizedTerm.toLowerCase();
    return availableBookings.filter(booking =>
      booking.guestName.toLowerCase().includes(term) ||
      booking.phone.includes(term) ||
      booking.id.toLowerCase().includes(term) ||
      (booking.email && booking.email.toLowerCase().includes(term)) ||
      booking.roomNumber.includes(term)
    );
  }, [searchTerm, availableBookings]);

  // Get today's arrivals for quick access
  const todayArrivals = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return availableBookings.filter(booking => booking.checkInDate === today);
  }, [availableBookings]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value);
    setShowSuggestions(true);
  };

  const handleBookingClick = (booking: Booking): void => {
    setSearchTerm('');
    setShowSuggestions(false);
    onBookingSelect(booking);
  };

  const handleClearSearch = (): void => {
    setSearchTerm('');
    setShowSuggestions(false);
  };

  const handleFocus = (): void => {
    setShowSuggestions(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('th-TH-u-ca-buddhist', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  const getStatusInfo = (status: BookingStatus): StatusInfo => {
    const statusMap: Record<BookingStatus, StatusInfo> = {
      confirmed: { label: 'ยืนยันแล้ว', className: 'confirmed', icon: '✅' },
      arriving_today: { label: 'เข้าพักวันนี้', className: 'arriving', icon: '🏨' },
      checked_in: { label: 'เช็คอินแล้ว', className: 'checked-in', icon: '🔑' },
      departing_today: { label: 'ออกวันนี้', className: 'departing', icon: '🧳' },
      checked_out: { label: 'เช็คเอาต์แล้ว', className: 'checked-out', icon: '✅' },
      cancelled: { label: 'ยกเลิก', className: 'cancelled', icon: '❌' },
      no_show: { label: 'ไม่มาเช็คอิน', className: 'no-show', icon: '❌' }
    };
    return statusMap[status] || { label: status, className: 'default', icon: '📋' };
  };

  return (
    <div className="guest-lookup">
      <div className="search-section">
        <h3 className="section-title">ค้นหาการจอง</h3>
        
        {/* Search Input */}
        <div className="search-input-container">
          <div className="search-input-wrapper">
            <svg 
              className="search-icon" 
              xmlns="http://www.w3.org/2000/svg" 
              height="20px" 
              viewBox="0 0 24 24" 
              width="20px" 
              fill="#666"
              aria-hidden="true"
            >
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
            <input
              type="text"
              placeholder="ชื่อผู้เข้าพัก, เบอร์โทร, รหัสจอง, อีเมล หรือหมายเลขห้อง"
              value={searchTerm}
              onChange={handleSearchChange}
              onFocus={handleFocus}
              onKeyDown={handleKeyDown}
              className="search-input"
              autoComplete="off"
              aria-label="ค้นหาการจอง"
              aria-haspopup="listbox"
            />
            {searchTerm && (
              <button
                onClick={handleClearSearch}
                className="clear-search-button"
                type="button"
                aria-label="ล้างคำค้นหา"
              >
                ×
              </button>
            )}
          </div>

          {/* Search Suggestions */}
          {showSuggestions && searchTerm && (
            <div className="search-suggestions" role="listbox" aria-label="ผลการค้นหา">
              {isLoading ? (
                <div className="suggestion-loading">
                  <div className="loading-spinner" aria-hidden="true"></div>
                  <span>กำลังค้นหา...</span>
                </div>
              ) : filteredBookings.length > 0 ? (
                <div className="suggestions-list">
                  {filteredBookings.map(booking => {
                    const statusInfo = getStatusInfo(booking.status);
                    return (
                      <div
                        key={booking.id}
                        className="suggestion-item"
                        onClick={() => handleBookingClick(booking)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleBookingClick(booking);
                          }
                        }}
                        aria-label={`เลือกการจองของ ${booking.guestName} ห้อง ${booking.roomNumber}`}
                      >
                        <div className="suggestion-header">
                          <span className="guest-name">{booking.guestName}</span>
                          <span className={`booking-status ${statusInfo.className}`}>
                            <span role="img" aria-label={statusInfo.label}>{statusInfo.icon}</span> {statusInfo.label}
                          </span>
                        </div>
                        <div className="suggestion-details">
                          <span className="booking-id">#{booking.id}</span>
                          <span className="room-number">ห้อง {booking.roomNumber}</span>
                          <span className="phone">{booking.phone}</span>
                        </div>
                        <div className="suggestion-dates">
                          เข้าพัก: {formatDate(booking.checkInDate)} - ออก: {formatDate(booking.checkOutDate)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="no-results">
                  <div className="no-results-icon" role="img" aria-label="ไม่พบผลลัพธ์">😕</div>
                  <div>ไม่พบการจองที่ตรงกับคำค้นหา</div>
                  <div className="no-results-hint">
                    ลองค้นหาด้วยชื่อ เบอร์โทร หรือรหัสจอง
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Today's Arrivals */}
      {todayArrivals.length > 0 && (
        <div className="today-arrivals">
          <h3 className="section-title">
            เข้าพักวันนี้ ({todayArrivals.length} รายการ)
          </h3>
          <div className="arrivals-grid">
            {todayArrivals.map(booking => {
              const statusInfo = getStatusInfo(booking.status);
              return (
                <div
                  key={booking.id}
                  className="arrival-card"
                  onClick={() => handleBookingClick(booking)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleBookingClick(booking);
                    }
                  }}
                  aria-label={`เลือกการจองของ ${booking.guestName} ห้อง ${booking.roomNumber}`}
                >
                  <div className="arrival-header">
                    <span className="guest-name-card">{booking.guestName}</span>
                    <span className="room-number-card">ห้อง {booking.roomNumber}</span>
                  </div>
                  <div className="arrival-details">
                    <span className="booking-id-card">#{booking.id}</span>
                    <span className="phone-card">
                      <span role="img" aria-label="โทรศัพท์">📞</span> {booking.phone}
                    </span>
                  </div>
                  <div className="arrival-info">
                    <span className="guests-count">
                      <span role="img" aria-label="จำนวนผู้เข้าพัก">👥</span> {booking.guests} คน
                    </span>
                    <span className="nights-count">
                      <span role="img" aria-label="จำนวนคืน">🌙</span> {booking.nights} คืน
                    </span>
                  </div>
                  <div className={`arrival-status ${statusInfo.className}`}>
                    <span role="img" aria-label={statusInfo.label}>{statusInfo.icon}</span> พร้อมเช็คอิน
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="help-text">
        <div className="help-icon" role="img" aria-label="เคล็ดลับ">💡</div>
        <div className="help-content">
          <strong>เคล็ดลับ:</strong> พิมพ์อย่างน้อย 2 ตัวอักษรเพื่อเริ่มค้นหา 
          หรือเลือกจากรายการเข้าพักวันนี้ด้านล่าง
        </div>
      </div>
    </div>
  );
};

export default GuestLookup;