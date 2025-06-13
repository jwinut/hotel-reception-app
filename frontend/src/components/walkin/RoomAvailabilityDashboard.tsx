import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { walkinApi, RoomSummary, WalkInApiError } from '../../services/walkinApi';
import './RoomAvailabilityDashboard.css';

const RoomAvailabilityDashboard: React.FC = () => {
  const { t } = useTranslation();
  const [summary, setSummary] = useState<RoomSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchRooms = useCallback(async () => {
    try {
      setError(null);
      const data = await walkinApi.getAvailableRooms();
      setSummary(data.summary);
      setLastUpdated(new Date());
    } catch (error) {
      if (error instanceof WalkInApiError) {
        setError(`${t('navigation.walkin.dashboard.errorPrefix')} ${error.statusCode}: ${error.message}`);
      } else {
        setError('Failed to fetch room availability');
      }
      console.error('Failed to fetch rooms:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRefresh = useCallback(() => {
    setLoading(true);
    fetchRooms();
  }, [fetchRooms]);

  const handleRoomSelect = useCallback((roomType: string) => {
    // TODO: Navigate to booking form with selected room type
    console.log('Selected room type:', roomType);
    alert(`Selected ${roomType} room - booking form will be implemented in Milestone 2`);
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchRooms();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, fetchRooms]);

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

  const calculateBreakfastPrice = (roomType: string, basePrice: number) => {
    // Real pricing data from hotel configuration
    const breakfastPricing: Record<string, number> = {
      'STANDARD': 250,  // 1450 - 1200 = 250
      'SUPERIOR': 250,  // 1750 - 1500 = 250
      'DELUXE': 250,    // 2250 - 2000 = 250
      'FAMILY': 350,    // 2850 - 2500 = 350
      'HOP_IN': 150,    // 950 - 800 = 150
      'ZENITH': 350     // 3350 - 3000 = 350
    };
    return basePrice + (breakfastPricing[roomType] || 250);
  };

  if (loading && summary.length === 0) {
    return (
      <div className="availability-dashboard loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>{t('navigation.walkin.dashboard.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="availability-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h2>{t('navigation.walkin.dashboard.title')}</h2>
          <div className="header-controls">
            <label className="auto-refresh-toggle">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
              />
              {t('navigation.walkin.dashboard.autoRefresh')}
            </label>
            <button 
              onClick={handleRefresh}
              disabled={loading}
              className="refresh-button"
            >
              {loading ? '↻' : '🔄'} {t('navigation.walkin.dashboard.refresh')}
            </button>
          </div>
        </div>
        <div className="last-updated">
          {t('navigation.walkin.dashboard.lastUpdated')}: {lastUpdated.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          })}
        </div>
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
          <button onClick={handleRefresh} className="retry-button">
            {t('navigation.walkin.dashboard.retry')}
          </button>
        </div>
      )}
      
      <div className="room-grid">
        {summary.map((room) => {
          const display = getRoomTypeDisplay(room.roomType);
          const isAvailable = room.available > 0;
          
          return (
            <div 
              key={room.roomType} 
              className={`room-card ${isAvailable ? 'available' : 'unavailable'}`}
              style={{ '--room-color': display.color } as React.CSSProperties}
              onClick={isAvailable ? () => handleRoomSelect(room.roomType) : undefined}
            >
              <div className="room-header">
                <div className="room-icon">{display.icon}</div>
                <h3>{display.name}</h3>
              </div>
              
              <div className="availability-info">
                <div className="availability-count">
                  <span className="count">{room.total - room.available}</span>
                  <span className="total">/ {room.total}</span>
                </div>
                <div className="availability-label">
                  {isAvailable ? t('navigation.walkin.dashboard.availableNow') : t('navigation.walkin.dashboard.fullyBooked')}
                </div>
              </div>

              <div className="pricing-info">
                <div className="price-row">
                  <span className="price-label">{t('navigation.walkin.dashboard.roomOnly')}:</span>
                  <span className="price">฿{room.basePrice.toLocaleString()}</span>
                </div>
                <div className="price-row breakfast">
                  <span className="price-label">{t('navigation.walkin.dashboard.withBreakfast')}:</span>
                  <span className="price">฿{calculateBreakfastPrice(room.roomType, room.basePrice).toLocaleString()}</span>
                </div>
                <div className="per-night">{t('navigation.walkin.dashboard.perNight')}</div>
              </div>

            </div>
          );
        })}
      </div>

      {summary.length === 0 && !loading && (
        <div className="no-rooms">
          <div className="no-rooms-icon">🏨</div>
          <h3>{t('navigation.walkin.dashboard.noRooms')}</h3>
          <p>{t('navigation.walkin.dashboard.noRoomsMessage')}</p>
          <button onClick={handleRefresh} className="retry-button">
            {t('navigation.walkin.dashboard.tryAgain')}
          </button>
        </div>
      )}
    </div>
  );
};

export default RoomAvailabilityDashboard;