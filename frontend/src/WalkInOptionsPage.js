// src/WalkInOptionsPage.js
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './WalkInOptionsPage.css';

function WalkInOptionsPage() {
  const navigate = useNavigate();

  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [selectedRoomType, setSelectedRoomType] = useState('All');
  const [bookingOptions, setBookingOptions] = useState([]);
  const [hotelLayout, setHotelLayout] = useState([]);
  const [allRoomsData, setAllRoomsData] = useState({});
  const [roomTypes, setRoomTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  // --- Effect to update the time ---
  useEffect(() => {
    // Set up an interval to update the current time every second
    const timerId = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000); // FIX: Changed from 60,000ms to 1,000ms

    // Clean up the interval when the component is unmounted
    return () => clearInterval(timerId);
  }, []);

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
    const bookingDetails = bookingOptions.find(opt => opt.id === selectedOptionId);
    alert(`เลือกห้อง: ${roomNumber} (${roomDetails.roomType})\nประเภทการจอง: ${bookingDetails?.label}`);
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
    // FIX: Added 'second' to the format options
    return new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
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
  }, [hotelLayout, allRoomsData, selectedRoomType]);

  return (
    <div className="walk-in-options-container">
      <h2 className="date-time-header">{formattedDate} | เวลา {formattedTime}</h2>
      
      <div className="action-group">
        <h2 className="group-title">เลือกประเภทการจอง (Walk-in):</h2>
        <div className="options-button-group">
          {bookingOptions.map(option => (
            <button
              key={option.id}
              onClick={() => setSelectedOptionId(option.id)}
              className={`option-button ${selectedOptionId === option.id ? 'active' : ''}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {selectedOptionId && (
        <div className="action-group">
          <h2 className="group-title">เลือกประเภทห้องพักและห้อง</h2>
          <div className="room-type-filters">
            {roomTypes.map(type => (
              <button key={type} onClick={() => setSelectedRoomType(type)} className={`filter-button ${selectedRoomType === type ? 'active' : ''}`}> {type} </button>
            ))}
          </div>
          <div className="room-grid-container">{isLoading ? <p>Loading Grid...</p> : RoomGrid}</div>
        </div>
      )}

      {error && <p className="error-text">{error}</p>}
      <button onClick={() => navigate('/')} className="back-button">กลับไปหน้าหลัก</button>
    </div>
  );
}

export default WalkInOptionsPage;