import React, { useState, useEffect } from 'react';
import { walkinApi, RoomAvailability } from '../../services/walkinApi';
import './RoomMap.css';

interface Props {
  selectedRoomType?: string;
  onSelectRoom: (room: RoomAvailability & { includeBreakfast: boolean }) => void;
  onBack: () => void;
  includeBreakfast: boolean;
  onBreakfastChange: (include: boolean) => void;
}

interface RoomMapData extends RoomAvailability {
  status: 'available' | 'occupied' | 'maintenance' | 'cleaning';
  x: number; // X position on the map (percentage)
  y: number; // Y position on the map (percentage)
}

const RoomMap: React.FC<Props> = ({ 
  selectedRoomType, 
  onSelectRoom, 
  onBack, 
  includeBreakfast, 
  onBreakfastChange 
}) => {
  const [rooms, setRooms] = useState<RoomMapData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredRoom, setHoveredRoom] = useState<string | null>(null);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setError(null);
      const data = await walkinApi.getAvailableRooms();
      
      // Determine which building layout to use
      const isSpecialTypeSelected = selectedRoomType === 'HOP_IN' || selectedRoomType === 'ZENITH';
      
      const hfBuildingLayout = {
        floors: [3, 4, 5],
        layout: [
          {
            floor: 5,
            rows: [
              ["509", "510", "511", "512", "513", "514", "515", "516", "517", "518", null, null, null, null, null],
              ["508", "507", null, "506", "505", "504", "503", "502", "501", null, null, null, null, null, null]
            ]
          },
          {
            floor: 4,
            rows: [
              ["409", "410", "411", "412", "413", "414", "415", "416", "417", "418", null, null, null, null, null],
              ["408", "407", null, "406", "405", "404", "403", "402", "401", null, null, null, null, null, null]
            ]
          },
          {
            floor: 3,
            rows: [
              ["307", "308", "309", "310", "311", "312", "313", null, null, null, null, null, null, null, null],
              ["306", "305", null, "304", "303", "302", "301", null, null, null, null, null, null, null, null]
            ]
          }
        ]
      };
      
      const hopInBuildingLayout = {
        floors: [2, 3, 4],
        layout: [
          {
            floor: 4,
            rows: [
              ["A 4-1", "A 4-2", "A 4-3", null, null, null, null, null, null, null, null, null, null, null, null],
              [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
            ]
          },
          {
            floor: 3,
            rows: [
              ["A 3-1", "A 3-2", "A 3-3", null, null, null, null, null, null, null, null, null, null, null, null],
              [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
            ]
          },
          {
            floor: 2,
            rows: [
              ["201", "A 2-1", "A 2-3", null, null, null, null, null, null, null, null, null, null, null, null],
              [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
            ]
          }
        ]
      };
      
      const currentLayout = isSpecialTypeSelected ? hopInBuildingLayout : hfBuildingLayout;

      // Master room data
      const masterRooms = [
        { "roomNumber": "301", "roomType": "DELUXE", "floor": 3, "bedType": "king" },
        { "roomNumber": "302", "roomType": "STANDARD", "floor": 3, "bedType": "queen" },
        { "roomNumber": "303", "roomType": "STANDARD", "floor": 3, "bedType": "twin" },
        { "roomNumber": "304", "roomType": "STANDARD", "floor": 3, "bedType": "queen" },
        { "roomNumber": "305", "roomType": "STANDARD", "floor": 3, "bedType": "twin" },
        { "roomNumber": "306", "roomType": "STANDARD", "floor": 3, "bedType": "double" },
        { "roomNumber": "307", "roomType": "FAMILY", "floor": 3, "bedType": "king_twin" },
        { "roomNumber": "308", "roomType": "SUPERIOR", "floor": 3, "bedType": "queen" },
        { "roomNumber": "309", "roomType": "STANDARD", "floor": 3, "bedType": "twin" },
        { "roomNumber": "310", "roomType": "STANDARD", "floor": 3, "bedType": "double" },
        { "roomNumber": "311", "roomType": "STANDARD", "floor": 3, "bedType": "queen" },
        { "roomNumber": "312", "roomType": "STANDARD", "floor": 3, "bedType": "twin" },
        { "roomNumber": "313", "roomType": "STANDARD", "floor": 3, "bedType": "double" },
        { "roomNumber": "401", "roomType": "DELUXE", "floor": 4, "bedType": "king" },
        { "roomNumber": "402", "roomType": "STANDARD", "floor": 4, "bedType": "queen" },
        { "roomNumber": "403", "roomType": "STANDARD", "floor": 4, "bedType": "twin" },
        { "roomNumber": "404", "roomType": "STANDARD", "floor": 4, "bedType": "double" },
        { "roomNumber": "405", "roomType": "STANDARD", "floor": 4, "bedType": "queen" },
        { "roomNumber": "406", "roomType": "STANDARD", "floor": 4, "bedType": "twin" },
        { "roomNumber": "407", "roomType": "SUPERIOR", "floor": 4, "bedType": "queen" },
        { "roomNumber": "408", "roomType": "STANDARD", "floor": 4, "bedType": "double" },
        { "roomNumber": "409", "roomType": "FAMILY", "floor": 4, "bedType": "king_twin" },
        { "roomNumber": "410", "roomType": "FAMILY", "floor": 4, "bedType": "king_twin" },
        { "roomNumber": "411", "roomType": "SUPERIOR", "floor": 4, "bedType": "queen" },
        { "roomNumber": "412", "roomType": "STANDARD", "floor": 4, "bedType": "twin" },
        { "roomNumber": "413", "roomType": "STANDARD", "floor": 4, "bedType": "double" },
        { "roomNumber": "414", "roomType": "STANDARD", "floor": 4, "bedType": "queen" },
        { "roomNumber": "415", "roomType": "STANDARD", "floor": 4, "bedType": "twin" },
        { "roomNumber": "416", "roomType": "STANDARD", "floor": 4, "bedType": "double" },
        { "roomNumber": "417", "roomType": "STANDARD", "floor": 4, "bedType": "queen" },
        { "roomNumber": "418", "roomType": "DELUXE", "floor": 4, "bedType": "king" },
        { "roomNumber": "501", "roomType": "DELUXE", "floor": 5, "bedType": "king" },
        { "roomNumber": "502", "roomType": "STANDARD", "floor": 5, "bedType": "queen" },
        { "roomNumber": "503", "roomType": "STANDARD", "floor": 5, "bedType": "twin" },
        { "roomNumber": "504", "roomType": "STANDARD", "floor": 5, "bedType": "double" },
        { "roomNumber": "505", "roomType": "STANDARD", "floor": 5, "bedType": "queen" },
        { "roomNumber": "506", "roomType": "STANDARD", "floor": 5, "bedType": "twin" },
        { "roomNumber": "507", "roomType": "SUPERIOR", "floor": 5, "bedType": "queen" },
        { "roomNumber": "508", "roomType": "STANDARD", "floor": 5, "bedType": "double" },
        { "roomNumber": "509", "roomType": "FAMILY", "floor": 5, "bedType": "king_twin" },
        { "roomNumber": "510", "roomType": "FAMILY", "floor": 5, "bedType": "king_twin" },
        { "roomNumber": "511", "roomType": "FAMILY", "floor": 5, "bedType": "king_twin" },
        { "roomNumber": "512", "roomType": "STANDARD", "floor": 5, "bedType": "twin" },
        { "roomNumber": "513", "roomType": "STANDARD", "floor": 5, "bedType": "double" },
        { "roomNumber": "514", "roomType": "STANDARD", "floor": 5, "bedType": "queen" },
        { "roomNumber": "515", "roomType": "STANDARD", "floor": 5, "bedType": "twin" },
        { "roomNumber": "516", "roomType": "STANDARD", "floor": 5, "bedType": "double" },
        { "roomNumber": "517", "roomType": "STANDARD", "floor": 5, "bedType": "queen" },
        { "roomNumber": "518", "roomType": "DELUXE", "floor": 5, "bedType": "king" },
        { "roomNumber": "A 2-1", "roomType": "HOP_IN", "floor": 2, "bedType": "single" },
        { "roomNumber": "A 2-3", "roomType": "HOP_IN", "floor": 2, "bedType": "single" },
        { "roomNumber": "A 3-1", "roomType": "HOP_IN", "floor": 3, "bedType": "single" },
        { "roomNumber": "A 3-2", "roomType": "HOP_IN", "floor": 3, "bedType": "single" },
        { "roomNumber": "A 3-3", "roomType": "HOP_IN", "floor": 3, "bedType": "single" },
        { "roomNumber": "A 4-1", "roomType": "HOP_IN", "floor": 4, "bedType": "single" },
        { "roomNumber": "A 4-2", "roomType": "HOP_IN", "floor": 4, "bedType": "single" },
        { "roomNumber": "A 4-3", "roomType": "HOP_IN", "floor": 4, "bedType": "single" },
        { "roomNumber": "201", "roomType": "ZENITH", "floor": 2, "bedType": "king" }
      ];

      const allRooms: RoomMapData[] = [];
      const availableRoomNumbers = new Set(data.rooms.map(r => r.roomNumber));
      
      // Process each floor layout
      currentLayout.layout.forEach(floorLayout => {
        floorLayout.rows.forEach((row, rowIndex) => {
          row.forEach((roomNumber, colIndex) => {
            if (!roomNumber) return; // Skip null positions
            
            // Find master room data
            const masterRoom = masterRooms.find(r => r.roomNumber === roomNumber);
            if (!masterRoom) return;
            
            // No additional filtering needed since we're using the correct layout
            
            // Find API room data or generate status
            const apiRoom = data.rooms.find(r => r.roomNumber === roomNumber);
            const isAvailable = availableRoomNumbers.has(roomNumber);
            
            // Generate features based on room type
            const getFeaturesByType = (type: string, bedType: string) => {
              const baseFeatures = { wifi: true, aircon: true, tv: true, bedType };
              switch (type) {
                case 'DELUXE':
                  return { ...baseFeatures, minibar: true, balcony: true, cityView: true };
                case 'SUPERIOR':
                  return { ...baseFeatures, minibar: true, cityView: true };
                case 'FAMILY':
                  return { ...baseFeatures, minibar: true, balcony: true, cityView: true };
                case 'ZENITH':
                  return { ...baseFeatures, minibar: true, balcony: true, cityView: true, jacuzzi: true, suite: true, premium: true };
                case 'HOP_IN':
                  return { ...baseFeatures, tv: false, compact: true };
                default:
                  return baseFeatures;
              }
            };
            
            // Get max occupancy by room type
            const getMaxOccupancy = (type: string) => {
              switch (type) {
                case 'FAMILY': return 4;
                case 'HOP_IN': return 1;
                case 'DELUXE': return 3;
                default: return 2;
              }
            };
            
            // Calculate position based on grid layout with equal top/bottom spacing
            const cellWidth = 9; // percentage - horizontal spacing
            const floorHeight = 250; // px - floor height from CSS
            const roomHeight = 90; // px - room square height
            const rowSpacing = 20; // px - spacing between rows
            
            // Calculate total height needed for all rows
            const totalRows = 2; // max rows per floor in layout
            const totalRoomsHeight = totalRows * roomHeight; // 180px
            const totalSpacingHeight = (totalRows - 1) * rowSpacing; // 20px
            const totalContentHeight = totalRoomsHeight + totalSpacingHeight; // 200px
            
            // Calculate top margin to center content vertically
            const topMargin = (floorHeight - totalContentHeight) / 2; // 25px
            
            const x = 3 + (colIndex * cellWidth);
            const y = (topMargin + rowIndex * (roomHeight + rowSpacing)) / floorHeight * 100; // convert to percentage
            
            const roomData: RoomMapData = {
              id: apiRoom?.id || `room-${roomNumber}`,
              roomNumber,
              roomType: masterRoom.roomType as 'STANDARD' | 'SUPERIOR' | 'DELUXE' | 'FAMILY' | 'HOP_IN' | 'ZENITH',
              floor: masterRoom.floor,
              basePrice: apiRoom?.basePrice || 1500,
              maxOccupancy: getMaxOccupancy(masterRoom.roomType),
              features: getFeaturesByType(masterRoom.roomType, masterRoom.bedType),
              status: isAvailable ? 'available' : (['occupied', 'maintenance', 'cleaning'][Math.floor(Math.random() * 3)] as 'occupied' | 'maintenance' | 'cleaning'),
              x,
              y
            };
            
            allRooms.push(roomData);
          });
        });
      });

      setRooms(allRooms);
    } catch (error) {
      setError('Failed to fetch room layout');
      console.error('Failed to fetch rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoomTypeDisplay = (type: string) => {
    const displays = {
      STANDARD: { name: 'Standard', initial: 'ST', color: '#4f46e5' },
      SUPERIOR: { name: 'Superior', initial: 'SU', color: '#059669' },
      DELUXE: { name: 'Deluxe', initial: 'DX', color: '#dc2626' },
      FAMILY: { name: 'Family', initial: 'FM', color: '#7c2d12' },
      HOP_IN: { name: 'Hop In', initial: 'HI', color: '#ea580c' },
      ZENITH: { name: 'Zenith', initial: 'ZN', color: '#7c3aed' }
    };
    return displays[type as keyof typeof displays] || { name: type, initial: 'RM', color: '#6b7280' };
  };

  const calculateBreakfastPrice = (roomType: string) => {
    const breakfastPricing: Record<string, number> = {
      'STANDARD': 250,
      'SUPERIOR': 250,
      'DELUXE': 250,
      'FAMILY': 350,
      'HOP_IN': 150,
      'ZENITH': 350
    };
    return breakfastPricing[roomType] || 250;
  };

  const calculateTotalPrice = (room: RoomMapData) => {
    const breakfastPrice = includeBreakfast ? calculateBreakfastPrice(room.roomType) : 0;
    return room.basePrice + breakfastPrice;
  };

  const handleRoomClick = (room: RoomMapData) => {
    // Only allow clicking on available rooms of the selected type
    if (room.status !== 'available') return;
    if (selectedRoomType && selectedRoomType !== 'ALL' && room.roomType !== selectedRoomType) return;
    
    onSelectRoom({
      ...room,
      includeBreakfast
    });
  };

  // Show all rooms - floors arranged from top to bottom based on building type
  const isSpecialTypeSelected = selectedRoomType === 'HOP_IN' || selectedRoomType === 'ZENITH';
  const allFloors = isSpecialTypeSelected ? [4, 3, 2] : [5, 4, 3];


  if (loading) {
    return (
      <div className="room-map loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading room layout...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="room-map error">
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
          <button onClick={fetchRooms} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const hoveredRoomData = hoveredRoom ? rooms.find(r => r.id === hoveredRoom) : null;

  return (
    <div className="room-map">
      <div className="map-header">
        <div className="map-title">
          <h3>{(selectedRoomType === 'HOP_IN' || selectedRoomType === 'ZENITH') ? 'Hop In Building Map' : 'HF Building Map'}</h3>
          {selectedRoomType && selectedRoomType !== 'ALL' && (
            <span className="selected-type">
              {getRoomTypeDisplay(selectedRoomType).initial} {getRoomTypeDisplay(selectedRoomType).name} Rooms
            </span>
          )}
        </div>
        <button onClick={onBack} className="back-button">
          ← Back to Room Types
        </button>
      </div>

      <div className="map-controls">
        <div className="breakfast-toggle">
          <label>
            <input
              type="checkbox"
              checked={includeBreakfast}
              onChange={(e) => onBreakfastChange(e.target.checked)}
            />
            <span className="checkbox-custom"></span>
            Include Breakfast
          </label>
        </div>
      </div>

      <div className="map-legend">
        <div className="legend-item">
          <div className="legend-color available"></div>
          <span>Available</span>
        </div>
        <div className="legend-item">
          <div className="legend-color reserved"></div>
          <span>Reserved</span>
        </div>
        <div className="legend-item">
          <div className="legend-color occupied"></div>
          <span>Occupied</span>
        </div>
        <div className="legend-item">
          <div className="legend-color maintenance"></div>
          <span>Maintenance/Cleaning</span>
        </div>
      </div>

      <div className="hotel-layout">
        {allFloors.map(floor => {
          const roomsOnFloor = rooms.filter(room => room.floor === floor);
          
          return (
            <div key={floor} className="floor-section">
              <div className="floor-header">
                <h4 className="floor-title">Floor {floor}</h4>
              </div>
              
              <div className="floor-plan">
                {/* Render rooms for this floor */}
                {roomsOnFloor.map(room => {
                  const display = getRoomTypeDisplay(room.roomType);
                  const isHovered = hoveredRoom === room.id;
                  const isMatchingType = !selectedRoomType || selectedRoomType === 'ALL' || room.roomType === selectedRoomType;
                  
                  return (
                    <div
                      key={room.id}
                      className={`room-on-map ${room.status} ${isHovered ? 'hovered' : ''} ${!isMatchingType ? 'grayed-out' : ''}`}
                      style={{
                        left: `${room.x}%`,
                        top: `${room.y}%`,
                        '--room-color': display.color
                      } as React.CSSProperties}
                      onMouseEnter={() => setHoveredRoom(room.id)}
                      onMouseLeave={() => setHoveredRoom(null)}
                      onClick={() => handleRoomClick(room)}
                    >
                      <div className="room-number">{room.roomNumber}</div>
                      <div className="room-type-indicator">{display.name}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Room details tooltip */}
      {hoveredRoomData && (
        <div className="room-tooltip">
          <div className="tooltip-header">
            <strong>Room {hoveredRoomData.roomNumber}</strong>
          </div>
          <div className="tooltip-details">
            <div>Type: {getRoomTypeDisplay(hoveredRoomData.roomType).name}</div>
            <div>Floor: {hoveredRoomData.floor}</div>
            <div>Status: {hoveredRoomData.status}</div>
            {hoveredRoomData.status === 'available' && (
              <>
                <div>Base Price: ฿{hoveredRoomData.basePrice.toLocaleString()}</div>
                {includeBreakfast && (
                  <div>Breakfast: +฿{calculateBreakfastPrice(hoveredRoomData.roomType).toLocaleString()}</div>
                )}
                <div className="total-price">
                  Total: ฿{calculateTotalPrice(hoveredRoomData).toLocaleString()}
                </div>
              </>
            )}
          </div>
          {hoveredRoomData.status === 'available' && 
           (!selectedRoomType || selectedRoomType === 'ALL' || hoveredRoomData.roomType === selectedRoomType) && (
            <div className="tooltip-action">Click to select this room</div>
          )}
        </div>
      )}
    </div>
  );
};

export default RoomMap;