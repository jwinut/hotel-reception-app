// src/WalkInOptionsPage.js
import React, { useState, useEffect, useMemo } from 'react';
import './WalkInOptionsPage.css';

function WalkInOptionsPage() {

  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [selectedRoomType, setSelectedRoomType] = useState('All');
  const [bookingOptions, setBookingOptions] = useState([]);
  const [hotelLayout, setHotelLayout] = useState([]);
  const [allRoomsData, setAllRoomsData] = useState({});
  const [roomTypes, setRoomTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);

  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  // --- Effect to update the time ---
  useEffect(() => {
    // Set up an interval to update the current time every minute (consistent with other pages)
    const timerId = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 60000);

    // Clean up the interval when the component is unmounted
    return () => clearInterval(timerId);
  }, []);

  // Close modal when route changes (fix for navigation issue)
  useEffect(() => {
    setSelectedRoom(null);
  }, []);

  // Add escape key handler for modal dismissal
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && selectedRoom) {
        setSelectedRoom(null);
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [selectedRoom]);

  // --- Data Loading Effect ---
  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      fetch('/config/bookingOptions.json').then(res => res.json()),
      fetch('/config/roomData.json').then(res => res.json()),
      fetch('/config/hotelLayout.json').then(res => res.json())
    ])
    .then(([bookingOptionsData, roomData, layoutData]) => {
      setBookingOptions(bookingOptionsData.walkInOptions || []);
      const roomsMap = (roomData.rooms || []).reduce((acc, room) => {
        acc[room.roomNumber] = room;
        return acc;
      }, {});
      setAllRoomsData(roomsMap);
      const customSortOrder = ['Standard', 'Superior', 'Deluxe', 'Family', 'Hop in', 'Zenith'];
      const uniqueTypes = [...new Set((roomData.rooms || []).map(r => r.roomType))];
      uniqueTypes.sort((a, b) => {
        const indexA = customSortOrder.indexOf(a);
        const indexB = customSortOrder.indexOf(b);
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        return a.localeCompare(b);
      });
      setRoomTypes(['All', ...uniqueTypes]);
      setHotelLayout(layoutData.layout || []);
      setIsLoading(false);
    })
    .catch(err => {
      console.error("Failed to load hotel data:", err);
      setError("ไม่สามารถโหลดข้อมูลโรงแรมได้ กรุณาลองใหม่อีกครั้ง");
      setIsLoading(false);
    });
  }, []);

  // --- Handlers ---
  const handleRoomSelect = (roomNumber) => {
    const roomDetails = allRoomsData[roomNumber];
    setSelectedRoom({
      ...roomDetails,
      bookingOption: bookingOptions.find(opt => opt.id === selectedOptionId)
    });
  };

  const handleConfirmBooking = () => {
    if (selectedRoom) {
      alert(`เช็คอินสำเร็จ!\n\nห้อง: ${selectedRoom.roomNumber} (${selectedRoom.roomType})\nประเภทการจอง: ${selectedRoom.bookingOption?.label}\n\nระบบจะพัฒนาฟีเจอร์การบันทึกข้อมูลลูกค้าในเร็วๆ นี้`);
      setSelectedRoom(null);
      setSelectedOptionId(null);
      setSelectedRoomType('All');
    }
  };

  const handleCancelSelection = () => {
    setSelectedRoom(null);
  };

  // --- Memoized Formatters for Date and Time ---
  const formattedDate = useMemo(() => {
    return new Intl.DateTimeFormat('th-TH-u-ca-buddhist', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(currentDateTime);
  }, [currentDateTime]);

  const formattedTime = useMemo(() => {
    return new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(currentDateTime);
  }, [currentDateTime]);
  
  // --- Memoized Grid Component ---
  const RoomGrid = useMemo(() => {
    if (!hotelLayout || hotelLayout.length === 0) return null;
    return hotelLayout.map((floorData, floorIndex) => (
      <div key={`floor-${floorData.floor || floorIndex}`} className="floor-container">
        {floorData.rows.map((row, rowIndex) => (
          <div key={`row-${rowIndex}`} className="room-grid-row">
            {row.map((roomNumber, cellIndex) => {
              if (roomNumber === null) return <div key={`cell-empty-${cellIndex}`} className="room-cell empty"></div>;
              const roomDetails = allRoomsData[roomNumber];
              if (!roomDetails) return <div key={`cell-unknown-${cellIndex}`} className="room-cell unknown">{roomNumber}</div>;
              const isEnabled = selectedRoomType === 'All' || roomDetails.roomType === selectedRoomType;
              return (<button key={roomNumber} className={`room-cell ${isEnabled ? 'enabled' : 'disabled'}`} onClick={() => isEnabled && handleRoomSelect(roomNumber)} disabled={!isEnabled}> <span className="room-number">{roomDetails.roomNumber}</span> <span className="room-type">{roomDetails.roomType}</span> </button>);
            })}
          </div>
        ))}
      </div>
    ));
  }, [hotelLayout, allRoomsData, selectedRoomType, handleRoomSelect]);

  return (
    <div className="walk-in-options-container">
      <div className="page-header">
        <h1 className="page-title">เช็คอินลูกค้าใหม่ ยังไม่ได้จอง</h1>
        <h2 className="date-time-header">{formattedDate} | เวลา {formattedTime}</h2>
      </div>

      {/* Instructions Card */}
      <div className="instructions-card">
        <div className="instructions-icon">🚶‍♂️</div>
        <div className="instructions-content">
          <h3>วิธีการเช็คอิน Walk-in</h3>
          <ol>
            <li>เลือกประเภทการจอง (ชั่วคราว/เข้าพักจริง/อื่นๆ)</li>
            <li>เลือกประเภทห้องพักที่ต้องการ</li>
            <li>เลือกห้องที่ว่างจากแผนผังโรงแรม</li>
            <li>ยืนยันการจองและเช็คอิน</li>
          </ol>
        </div>
      </div>

      {/* Step 1: Booking Type Selection */}
      <div className="step-section">
        <div className="step-header">
          <h3 className="step-title">
            <span className="step-number">1</span>
            เลือกประเภทการจอง (Walk-in)
          </h3>
        </div>
        <div className="booking-options-grid">
          {bookingOptions.map(option => (
            <button
              key={option.id}
              onClick={() => setSelectedOptionId(option.id)}
              className={`booking-option-card ${selectedOptionId === option.id ? 'selected' : ''}`}
            >
              <div className="option-icon">📝</div>
              <div className="option-content">
                <div className="option-title">{option.label}</div>
                <div className="option-description">
                  {option.id === 'temporary' && 'สำหรับลูกค้าที่ต้องการพักชั่วคราว'}
                  {option.id === 'standard' && 'การจองปกติสำหรับลูกค้าเข้าพัก'}
                  {option.id === 'vip' && 'บริการพิเศษสำหรับลูกค้า VIP'}
                </div>
              </div>
              {selectedOptionId === option.id && (
                <div className="option-check">✓</div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Step 2: Room Selection */}
      {selectedOptionId && (
        <div className="step-section">
          <div className="step-header">
            <h3 className="step-title">
              <span className="step-number">2</span>
              เลือกประเภทห้องพักและห้อง
            </h3>
          </div>
          
          {/* Room Type Filters */}
          <div className="room-type-section">
            <h4 className="filter-title">ประเภทห้องพัก</h4>
            <div className="room-type-filters">
              {roomTypes.map(type => (
                <button 
                  key={type} 
                  onClick={() => setSelectedRoomType(type)} 
                  className={`filter-button ${selectedRoomType === type ? 'active' : ''}`}
                > 
                  {type === 'All' ? 'ทุกประเภท' : type}
                </button>
              ))}
            </div>
          </div>

          {/* Room Grid */}
          <div className="room-selection-section">
            <h4 className="grid-title">แผนผังห้องพัก</h4>
            <div className="room-grid-container">
              {isLoading ? (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                  <p>กำลังโหลดข้อมูลห้องพัก...</p>
                </div>
              ) : error ? (
                <div className="error-state">
                  <div className="error-icon">⚠️</div>
                  <p className="error-text">{error}</p>
                </div>
              ) : (
                RoomGrid
              )}
            </div>
          </div>
        </div>
      )}

      {/* Room Confirmation Modal */}
      {selectedRoom && (
        <div className="confirmation-overlay">
          <div className="confirmation-modal">
            <div className="modal-header">
              <h3 className="modal-title">ยืนยันการเลือกห้อง</h3>
              <button 
                onClick={handleCancelSelection}
                className="close-button"
              >
                ×
              </button>
            </div>
            
            <div className="modal-content">
              <div className="room-details-card">
                <div className="room-number-display">{selectedRoom.roomNumber}</div>
                <div className="room-info-display">
                  <div className="room-type-display">{selectedRoom.roomType}</div>
                  <div className="booking-type-display">
                    {selectedRoom.bookingOption?.label}
                  </div>
                </div>
              </div>

              <div className="confirmation-details">
                <div className="detail-item">
                  <span className="detail-label">ประเภทการจอง:</span>
                  <span className="detail-value">{selectedRoom.bookingOption?.label}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">ห้อง:</span>
                  <span className="detail-value">{selectedRoom.roomNumber}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">ประเภทห้อง:</span>
                  <span className="detail-value">{selectedRoom.roomType}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">วันที่เช็คอิน:</span>
                  <span className="detail-value">{formattedDate}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">เวลาเช็คอิน:</span>
                  <span className="detail-value">{formattedTime}</span>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button 
                onClick={handleCancelSelection}
                className="cancel-button"
              >
                ยกเลิก
              </button>
              <button 
                onClick={handleConfirmBooking}
                className="confirm-button"
              >
                ยืนยันเช็คอิน
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WalkInOptionsPage;