// src/components/RoomSelection.js
import React, { useState, useEffect, useMemo } from 'react';
import './RoomSelection.css';

function RoomSelection({ initialData, guestData, datesData, onComplete, onBack, onCancel }) {
  const [selectedRoomType, setSelectedRoomType] = useState(initialData?.roomType || 'All');
  const [selectedRoom, setSelectedRoom] = useState(initialData?.roomNumber || null);
  const [allRoomsData, setAllRoomsData] = useState({});
  const [hotelLayout, setHotelLayout] = useState([]);
  const [priceData, setPriceData] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookedRooms] = useState(new Set(['302', '405', '508'])); // Mock booked rooms

  // Load room data, layout, and pricing
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        const [roomDataRes, layoutRes, priceRes] = await Promise.all([
          fetch('/config/roomData.json'),
          fetch('/config/hotelLayout.json'),
          fetch('/config/priceData.json')
        ]);

        const roomData = await roomDataRes.json();
        const layoutData = await layoutRes.json();
        const priceDataResult = await priceRes.json();

        // Process room data
        const roomsMap = (roomData.rooms || []).reduce((acc, room) => {
          acc[room.roomNumber] = room;
          return acc;
        }, {});
        setAllRoomsData(roomsMap);

        // Process room types
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
        setPriceData(priceDataResult.prices || []);
        
      } catch (err) {
        console.error("Failed to load room data:", err);
        setError("ไม่สามารถโหลดข้อมูลห้องพักได้ กรุณาลองใหม่อีกครั้ง");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Check if room is available for selected dates
  const isRoomAvailable = (roomNumber) => {
    // Mock availability check - in real app, this would check against booking database
    return !bookedRooms.has(roomNumber);
  };

  // Get room pricing
  const getRoomPrice = (roomType) => {
    const pricing = priceData.find(p => p.roomType === roomType);
    if (!pricing) return { noBreakfast: 0, withBreakfast: 0 };
    
    return {
      noBreakfast: pricing.noBreakfast,
      withBreakfast: pricing.withBreakfast
    };
  };

  // Calculate total price for selected room
  const calculateTotalPrice = (roomType) => {
    const pricing = getRoomPrice(roomType);
    const basePrice = datesData.includeBreakfast ? pricing.withBreakfast : pricing.noBreakfast;
    return basePrice * datesData.nights;
  };

  // Handle room selection
  const handleRoomSelect = (roomNumber) => {
    const roomDetails = allRoomsData[roomNumber];
    if (!roomDetails || !isRoomAvailable(roomNumber)) return;

    setSelectedRoom(roomNumber);
  };

  // Handle form submission
  const handleSubmit = () => {
    if (!selectedRoom) {
      alert('กรุณาเลือกห้องพัก');
      return;
    }

    const roomDetails = allRoomsData[selectedRoom];
    const pricing = getRoomPrice(roomDetails.roomType);
    const totalPrice = calculateTotalPrice(roomDetails.roomType);

    const roomData = {
      roomNumber: selectedRoom,
      roomType: roomDetails.roomType,
      pricing: {
        basePrice: datesData.includeBreakfast ? pricing.withBreakfast : pricing.noBreakfast,
        totalPrice: totalPrice,
        includeBreakfast: datesData.includeBreakfast,
        nights: datesData.nights
      }
    };

    onComplete(roomData);
  };

  // Memoized room grid component
  const RoomGrid = useMemo(() => {
    if (!hotelLayout || hotelLayout.length === 0) return null;
    
    return hotelLayout.map((floorData, floorIndex) => (
      <div key={`floor-${floorData.floor || floorIndex}`} className="floor-container">
        <div className="floor-header">
          <h3 className="floor-title">ชั้น {floorData.floor}</h3>
        </div>
        {floorData.rows.map((row, rowIndex) => (
          <div key={`row-${rowIndex}`} className="room-grid-row">
            {row.map((roomNumber, cellIndex) => {
              if (roomNumber === null) {
                return <div key={`cell-empty-${cellIndex}`} className="room-cell empty"></div>;
              }

              const roomDetails = allRoomsData[roomNumber];
              if (!roomDetails) {
                return <div key={`cell-unknown-${cellIndex}`} className="room-cell unknown">{roomNumber}</div>;
              }

              const isAvailable = isRoomAvailable(roomNumber);
              const isTypeMatch = selectedRoomType === 'All' || roomDetails.roomType === selectedRoomType;
              const isSelected = selectedRoom === roomNumber;
              const isEnabled = isAvailable && isTypeMatch;

              return (
                <button
                  key={roomNumber}
                  className={`room-cell ${
                    !isAvailable ? 'booked' :
                    !isTypeMatch ? 'disabled' :
                    isSelected ? 'selected' : 'available'
                  }`}
                  onClick={() => isEnabled && handleRoomSelect(roomNumber)}
                  disabled={!isEnabled}
                >
                  <span className="room-number">{roomDetails.roomNumber}</span>
                  <span className="room-type">{roomDetails.roomType}</span>
                  {!isAvailable && <span className="room-status">จองแล้ว</span>}
                  {isSelected && <span className="selected-indicator">✓</span>}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    ));
  }, [hotelLayout, allRoomsData, selectedRoomType, selectedRoom, bookedRooms, isRoomAvailable, handleRoomSelect]);

  if (isLoading) {
    return (
      <div className="room-selection-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>กำลังโหลดข้อมูลห้องพัก...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="room-selection-container">
        <div className="error-state">
          <p className="error-text">{error}</p>
          <button onClick={onBack} className="btn btn-secondary">ย้อนกลับ</button>
        </div>
      </div>
    );
  }

  return (
    <div className="room-selection-container">
      <div className="form-header">
        <h2 className="form-title">เลือกห้องพัก</h2>
        <div className="booking-summary">
          <p><strong>{guestData.firstName} {guestData.lastName}</strong> ({guestData.numGuests} คน)</p>
          <p>{datesData.nights} คืน • {datesData.includeBreakfast ? 'รวมอาหารเช้า' : 'ไม่รวมอาหารเช้า'}</p>
        </div>
      </div>

      {/* Room Type Filters */}
      <div className="room-type-section">
        <h3 className="section-title">ประเภทห้องพัก</h3>
        <div className="room-type-filters">
          {roomTypes.map(type => (
            <button
              key={type}
              onClick={() => setSelectedRoomType(type)}
              className={`filter-button ${selectedRoomType === type ? 'active' : ''}`}
            >
              {type}
              {type !== 'All' && (
                <span className="price-badge">
                  ฿{getRoomPrice(type)[datesData.includeBreakfast ? 'withBreakfast' : 'noBreakfast'].toLocaleString()}/คืน
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Room Grid */}
      <div className="room-grid-section">
        <h3 className="section-title">แผนผังห้องพัก</h3>
        <div className="room-legend">
          <div className="legend-item">
            <div className="legend-color available"></div>
            <span>ว่าง</span>
          </div>
          <div className="legend-item">
            <div className="legend-color booked"></div>
            <span>จองแล้ว</span>
          </div>
          <div className="legend-item">
            <div className="legend-color selected"></div>
            <span>เลือกแล้ว</span>
          </div>
        </div>
        <div className="room-grid-container">
          {RoomGrid}
        </div>
      </div>

      {/* Selected Room Summary */}
      {selectedRoom && (
        <div className="selected-room-summary">
          <h3 className="summary-title">ห้องที่เลือก</h3>
          <div className="summary-content">
            <div className="room-info">
              <h4>ห้อง {selectedRoom}</h4>
              <p>ประเภท: {allRoomsData[selectedRoom].roomType}</p>
            </div>
            <div className="price-info">
              <div className="price-breakdown">
                <div className="price-row">
                  <span>ราคาต่อคืน:</span>
                  <span>฿{getRoomPrice(allRoomsData[selectedRoom].roomType)[datesData.includeBreakfast ? 'withBreakfast' : 'noBreakfast'].toLocaleString()}</span>
                </div>
                <div className="price-row">
                  <span>จำนวน {datesData.nights} คืน:</span>
                  <span className="total-price">฿{calculateTotalPrice(allRoomsData[selectedRoom].roomType).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="form-actions">
        <button
          type="button"
          onClick={onBack}
          className="btn btn-secondary"
        >
          ← ย้อนกลับ
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-ghost"
        >
          ยกเลิก
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="btn btn-primary"
          disabled={!selectedRoom}
        >
          ถัดไป: ยืนยันการจอง
        </button>
      </div>
    </div>
  );
}

export default RoomSelection;