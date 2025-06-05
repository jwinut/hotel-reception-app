// src/WalkInOptionsPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './WalkInOptionsPage.css';

function WalkInOptionsPage() {
  const [bookingOptions, setBookingOptions] = useState([]);
  const [selectedOptionId, setSelectedOptionId] = useState(null);

  const [allRooms, setAllRooms] = useState([]); // Store the flat list of rooms
  const [groupedRooms, setGroupedRooms] = useState({}); // Store rooms grouped by type
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);
  const [errorLoadingRooms, setErrorLoadingRooms] = useState(null);
  const navigate = useNavigate();

  // Effect to fetch booking options
  useEffect(() => {
    fetch('/config/bookingOptions.json')
      .then(response => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
      })
      .then(data => setBookingOptions(data.walkInOptions || []))
      .catch(error => {
        console.error("Could not fetch booking options:", error);
        setBookingOptions([
          { "id": "fallback_bf", "label": "ราคาปกติ รับอาหารเช้า (Fallback)" },
          { "id": "fallback_nobf", "label": "ราคาปกติ ไม่รับอาหารเช้า (Fallback)" }
        ]);
      });
  }, []);

  // Effect to fetch and group rooms when a booking option is selected
  useEffect(() => {
    if (selectedOptionId) {
      setIsLoadingRooms(true);
      setErrorLoadingRooms(null);
      setAllRooms([]);
      setGroupedRooms({});

      fetch('/config/roomData.json')
        .then(response => {
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          return response.json();
        })
        .then(data => {
          const fetchedRooms = data.rooms || [];
          setAllRooms(fetchedRooms);

          // Group rooms by roomType
          const GRP_RMS = fetchedRooms.reduce((acc, room) => {
            const { roomType } = room;
            if (!acc[roomType]) {
              acc[roomType] = [];
            }
            acc[roomType].push(room);
            // Optional: Sort rooms within each group by roomNumber
            // acc[roomType].sort((a, b) => a.roomNumber.localeCompare(b.roomNumber, undefined, { numeric: true }));
            return acc;
          }, {});
          setGroupedRooms(GRP_RMS);
          setIsLoadingRooms(false);
        })
        .catch(error => {
          console.error("Could not fetch room data:", error);
          setErrorLoadingRooms("ไม่สามารถโหลดข้อมูลห้องพักได้");
          setIsLoadingRooms(false);
        });
    } else {
      setAllRooms([]);
      setGroupedRooms({});
      setErrorLoadingRooms(null);
    }
  }, [selectedOptionId]);

  const handleOptionClick = (optionId) => {
    setSelectedOptionId(prevId => prevId === optionId ? null : optionId); // Allow deselecting an option
    // If you don't want to allow deselecting, just use: setSelectedOptionId(optionId);
    console.log("Selected option ID:", optionId);
  };

  const handleRoomSelect = (room) => {
    const selectedBookingOption = bookingOptions.find(opt => opt.id === selectedOptionId);
    alert(`คุณเลือกห้อง: ${room.roomNumber} (ประเภท: ${room.roomType})\nตัวเลือกการจอง: ${selectedBookingOption?.label}\n(ขั้นต่อไป: กรอกรายละเอียดลูกค้า)`);
    // Later: navigate to a guest details form, passing selectedOptionId and room.roomNumber
  };

  return (
    <div className="walk-in-options-container">
      <h2>เลือกประเภทการจอง (Walk-in):</h2>
      <div className="options-button-group">
        {bookingOptions.map(option => (
          <button
            key={option.id}
            onClick={() => handleOptionClick(option.id)}
            className={`option-button ${selectedOptionId === option.id ? 'active' : ''}`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {selectedOptionId && (
        <div className="room-selection-area">
          <h3>เลือกห้องพัก:</h3>
          {isLoadingRooms && <p className="loading-text">กำลังโหลดข้อมูลห้องพัก...</p>}
          {errorLoadingRooms && <p className="error-text">{errorLoadingRooms}</p>}
          
          {!isLoadingRooms && !errorLoadingRooms && Object.keys(groupedRooms).length === 0 && allRooms.length > 0 && (
             <p>มีห้องพักแต่ไม่สามารถจัดกลุ่มได้ หรือรูปแบบข้อมูลห้องพักไม่ถูกต้อง</p>
          )}

          {!isLoadingRooms && !errorLoadingRooms && Object.keys(groupedRooms).length === 0 && allRooms.length === 0 && !errorLoadingRooms && (
             <p>ไม่พบห้องพักสำหรับตัวเลือกนี้</p>
          )}

          {!isLoadingRooms && !errorLoadingRooms && Object.keys(groupedRooms).length > 0 && (
            <div className="room-groups-container">
              {Object.entries(groupedRooms)
                // Optional: Sort room groups by type name if desired
                // .sort(([typeA], [typeB]) => typeA.localeCompare(typeB)) 
                .map(([roomType, roomsInGroup]) => (
                <div key={roomType} className="room-group">
                  <h4 className="room-group-label">{roomType} ({roomsInGroup.length})</h4>
                  <div className="room-buttons-grid">
                    {roomsInGroup.map(room => (
                      <button
                        key={room.roomNumber}
                        onClick={() => handleRoomSelect(room)}
                        className="room-button"
                        title={`เลือกห้อง ${room.roomNumber} (${room.roomType})`}
                      >
                        {room.roomNumber}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <button onClick={() => navigate('/')} className="back-button">
        กลับไปหน้าหลัก
      </button>
    </div>
  );
}

export default WalkInOptionsPage;