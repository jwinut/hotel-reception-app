import React, { useState, useEffect } from 'react';
import { walkinApi, RoomAvailability } from '../../services/walkinApi';
import './RoomSelection.css';

interface Props {
  onSelectRoomType: (roomType: string) => void;
  onCancel: () => void;
}

const RoomSelection: React.FC<Props> = ({ onSelectRoomType, onCancel }) => {
  const [rooms, setRooms] = useState<RoomAvailability[]>([]);
  const [loading, setLoading] = useState(true);
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

  // Group rooms by type and calculate stats
  const roomTypeStats = rooms.reduce((acc, room) => {
    if (!acc[room.roomType]) {
      acc[room.roomType] = {
        count: 0,
        minPrice: room.basePrice,
        maxPrice: room.basePrice,
        floors: new Set<number>()
      };
    }
    acc[room.roomType].count++;
    acc[room.roomType].minPrice = Math.min(acc[room.roomType].minPrice, room.basePrice);
    acc[room.roomType].maxPrice = Math.max(acc[room.roomType].maxPrice, room.basePrice);
    acc[room.roomType].floors.add(room.floor);
    return acc;
  }, {} as Record<string, { count: number; minPrice: number; maxPrice: number; floors: Set<number> }>);

  const uniqueRoomTypes = Object.keys(roomTypeStats);

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
        <h3>Select Room Type</h3>
        <button onClick={onCancel} className="cancel-button">
          ← Back to Dashboard
        </button>
      </div>
      
      <div className="room-types-grid">
        {uniqueRoomTypes.length === 0 ? (
          <div className="no-rooms">
            <div className="no-rooms-icon">🚫</div>
            <h4>No rooms available</h4>
            <p>There are currently no rooms available for booking.</p>
          </div>
        ) : (
          uniqueRoomTypes.map(type => {
            const display = getRoomTypeDisplay(type);
            const stats = roomTypeStats[type];
            const priceRange = stats.minPrice === stats.maxPrice 
              ? `฿${stats.minPrice.toLocaleString()}`
              : `฿${stats.minPrice.toLocaleString()} - ฿${stats.maxPrice.toLocaleString()}`;
            
            return (
              <div 
                key={type} 
                className="room-type-card"
                style={{ '--room-color': display.color } as React.CSSProperties}
                onClick={() => onSelectRoomType(type)}
              >
                <div className="room-type-header">
                  <div className="room-type-icon">{display.initial}</div>
                  <h4>{display.name}</h4>
                </div>
                
                <div className="room-type-info">
                  <div className="info-item">
                    <span className="label">Available:</span>
                    <span className="value">{stats.count} rooms</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Price range:</span>
                    <span className="value">{priceRange}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Floors:</span>
                    <span className="value">{Array.from(stats.floors).sort().join(', ')}</span>
                  </div>
                </div>
                
                <button className="select-type-button">
                  View Room Layout
                </button>
              </div>
            );
          })
        )}
      </div>
      
      <div className="selection-summary">
        <p>
          {rooms.length} total rooms available across {uniqueRoomTypes.length} room types
        </p>
      </div>
    </div>
  );
};

export default RoomSelection;