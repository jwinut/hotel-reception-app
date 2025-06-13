import React, { useState } from 'react';
import RoomAvailabilityDashboard from '../components/walkin/RoomAvailabilityDashboard';
import RoomMap from '../components/walkin/RoomMap';
import QuickGuestForm from '../components/walkin/QuickGuestForm';
import BookingSuccess from '../components/walkin/BookingSuccess';
import { RoomAvailability, walkinApi, CreateBookingRequest, BookingResponse, WalkInApiError } from '../services/walkinApi';
import './WalkInDashboardPage.css';

type ViewState = 'dashboard' | 'room-map' | 'guest-form' | 'booking-success';

interface GuestInfo {
  firstName: string;
  lastName: string;
  phone: string;
  idType: 'PASSPORT' | 'NATIONAL_ID';
  idNumber: string;
}

const WalkInDashboardPage: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [selectedRoom, setSelectedRoom] = useState<(RoomAvailability & { includeBreakfast: boolean }) | null>(null);
  const [selectedRoomType, setSelectedRoomType] = useState<string>('ALL');
  const [includeBreakfast, setIncludeBreakfast] = useState(false);
  const [completedBooking, setCompletedBooking] = useState<BookingResponse['booking'] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartBooking = (roomType: string) => {
    setSelectedRoomType(roomType);
    setCurrentView('room-map');
    setError(null);
  };

  const handleRoomSelected = (room: RoomAvailability & { includeBreakfast: boolean }) => {
    setSelectedRoom(room);
    setCurrentView('guest-form');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedRoom(null);
    setSelectedRoomType('ALL');
    setIncludeBreakfast(false);
    setCompletedBooking(null);
    setError(null);
  };

  const handleBookingSubmit = async (guest: GuestInfo, checkOutDate: Date) => {
    if (!selectedRoom) return;

    setLoading(true);
    setError(null);

    try {
      const bookingData: CreateBookingRequest = {
        roomId: selectedRoom.id,
        guest,
        checkOutDate: checkOutDate.toISOString(),
        breakfastIncluded: selectedRoom.includeBreakfast
      };

      const response = await walkinApi.createWalkInBooking(bookingData);
      setCompletedBooking(response.booking);
      setCurrentView('booking-success');
    } catch (error) {
      console.error('Booking creation failed:', error);
      
      if (error instanceof WalkInApiError) {
        setError(`Booking failed: ${error.message}`);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNewBooking = () => {
    setCurrentView('dashboard');
    setSelectedRoom(null);
    setSelectedRoomType('ALL');
    setIncludeBreakfast(false);
    setCompletedBooking(null);
    setError(null);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <RoomAvailabilityDashboard 
            onStartBooking={handleStartBooking}
          />
        );
      
      case 'room-map':
        return (
          <RoomMap
            selectedRoomType={selectedRoomType}
            onSelectRoom={handleRoomSelected}
            onBack={handleBackToDashboard}
            includeBreakfast={includeBreakfast}
            onBreakfastChange={setIncludeBreakfast}
          />
        );
      
      case 'guest-form':
        return selectedRoom ? (
          <QuickGuestForm
            selectedRoom={selectedRoom}
            onSubmit={handleBookingSubmit}
            onCancel={() => setCurrentView('room-map')}
            loading={loading}
          />
        ) : null;
      
      case 'booking-success':
        return completedBooking ? (
          <BookingSuccess
            booking={completedBooking}
            onNewBooking={handleNewBooking}
            onBackToDashboard={handleBackToDashboard}
          />
        ) : null;
      
      default:
        return <RoomAvailabilityDashboard onStartBooking={handleStartBooking} />;
    }
  };

  return (
    <div className="walk-in-dashboard-page">
      {error && (
        <div className="error-banner">
          <span className="error-icon">⚠️</span>
          {error}
          <button 
            onClick={() => setError(null)}
            className="error-dismiss"
          >
            ✕
          </button>
        </div>
      )}
      
      {renderCurrentView()}
    </div>
  );
};

export default WalkInDashboardPage;