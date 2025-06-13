import React, { useState, useEffect } from 'react';
import { walkinApi, RoomAvailability } from '../../services/walkinApi';
import './RoomSelection.css';

interface Props {
  onSelectRoom: (room: RoomAvailability & { includeBreakfast: boolean }) => void;
  onCancel: () => void;
}

const RoomSelection: React.FC<Props> = ({ onSelectRoom, onCancel }) => {
  const [rooms, setRooms] = useState<RoomAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [includeBreakfast, setIncludeBreakfast] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setError(null);
      const data = await walkinApi.getAvailableRooms();
      setRooms(data.rooms);
    } catch (error) {
      setError('Failed to fetch available rooms');
      console.error('Failed to fetch rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRooms = selectedType === 'ALL' 
    ? rooms 
    : rooms.filter(r => r.roomType === selectedType);

  const getRoomTypeDisplay = (type: string) => {
    const displays = {
      STANDARD: { name: 'Standard', icon: '🏨', color: '#4f46e5' },
      SUPERIOR: { name: 'Superior', icon: '⭐', color: '#059669' },
      DELUXE: { name: 'Deluxe', icon: '💎', color: '#dc2626' },
      FAMILY: { name: 'Family', icon: '👨‍👩‍👧‍👦', color: '#7c2d12' },
      HOP_IN: { name: 'Hop In', icon: '🎒', color: '#ea580c' },
      ZENITH: { name: 'Zenith', icon: '👑', color: '#7c3aed' }
    };
    return displays[type as keyof typeof displays] || { name: type, icon: '🏨', color: '#6b7280' };
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

  const calculateTotalPrice = (room: RoomAvailability) => {
    const breakfastPrice = includeBreakfast ? calculateBreakfastPrice(room.roomType) : 0;
    return room.basePrice + breakfastPrice;
  };

  const uniqueRoomTypes = Array.from(new Set(rooms.map(r => r.roomType)));

  if (loading) {
    return (
      <div className="room-selection loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading available rooms...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="room-selection error">
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

  return (
    <div className="room-selection">
      <div className="selection-header">
        <h3>Select Room for Walk-in Booking</h3>
        <button onClick={onCancel} className="cancel-button">
          ← Back to Dashboard
        </button>
      </div>
      
      <div className="filters">
        <div className="filter-group">
          <label>Room Type:</label>
          <select 
            value={selectedType} 
            onChange={(e) => setSelectedType(e.target.value)}
            className="room-type-filter"
          >
            <option value="ALL">All Types ({rooms.length} available)</option>
            {uniqueRoomTypes.map(type => {
              const count = rooms.filter(r => r.roomType === type).length;
              const display = getRoomTypeDisplay(type);
              return (
                <option key={type} value={type}>
                  {display.name} ({count} available)
                </option>
              );
            })}
          </select>
        </div>
        
        <div className="filter-group">
          <label className="breakfast-toggle">
            <input
              type="checkbox"
              checked={includeBreakfast}
              onChange={(e) => setIncludeBreakfast(e.target.checked)}
            />
            <span className="checkbox-custom"></span>
            Include Breakfast
          </label>
        </div>
      </div>

      {filteredRooms.length === 0 ? (
        <div className="no-rooms">
          <div className="no-rooms-icon">🚫</div>
          <h4>No rooms available</h4>
          <p>No {selectedType === 'ALL' ? '' : getRoomTypeDisplay(selectedType).name.toLowerCase()} rooms are currently available.</p>
          <button onClick={() => setSelectedType('ALL')} className="show-all-button">
            Show All Types
          </button>
        </div>
      ) : (
        <div className="room-list">
          {filteredRooms.map(room => {
            const display = getRoomTypeDisplay(room.roomType);
            const totalPrice = calculateTotalPrice(room);
            const breakfastPrice = calculateBreakfastPrice(room.roomType);
            
            return (
              <div 
                key={room.id} 
                className="room-option"
                style={{ '--room-color': display.color } as React.CSSProperties}
              >
                <div className="room-header">
                  <div className="room-icon">{display.icon}</div>
                  <div className="room-info">
                    <h4>Room {room.roomNumber}</h4>
                    <span className="room-details">{display.name} • Floor {room.floor}</span>
                  </div>
                </div>
                
                <div className="room-pricing">
                  <div className="price-breakdown">
                    <div className="price-line">
                      <span>Room Rate:</span>
                      <span>฿{room.basePrice.toLocaleString()}</span>
                    </div>
                    {includeBreakfast && (
                      <div className="price-line breakfast">
                        <span>Breakfast:</span>
                        <span>+฿{breakfastPrice.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="price-line total">
                      <span>Total per night:</span>
                      <span>฿{totalPrice.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={() => onSelectRoom({...room, includeBreakfast})}
                  className="select-room-button"
                >
                  Select Room {room.roomNumber}
                </button>
              </div>
            );
          })}
        </div>
      )}
      
      <div className="selection-summary">
        <p>
          Showing {filteredRooms.length} of {rooms.length} available rooms
          {includeBreakfast && ' with breakfast included'}
        </p>
      </div>
    </div>
  );
};

export default RoomSelection;