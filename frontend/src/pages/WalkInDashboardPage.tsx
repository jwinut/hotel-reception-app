import React, { useState } from 'react';
import RoomAvailabilityDashboard from '../components/walkin/RoomAvailabilityDashboard';
import RoomSelection from '../components/walkin/RoomSelection';
import QuickGuestForm from '../components/walkin/QuickGuestForm';
import BookingSuccess from '../components/walkin/BookingSuccess';
import { RoomAvailability, walkinApi, CreateBookingRequest, BookingResponse, WalkInApiError } from '../services/walkinApi';
import './WalkInDashboardPage.css';

type ViewState = 'dashboard' | 'room-selection' | 'guest-form' | 'booking-success';

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
  const [completedBooking, setCompletedBooking] = useState<BookingResponse['booking'] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartBooking = () => {
    setCurrentView('room-selection');
    setError(null);
  };

  const handleRoomSelected = (room: RoomAvailability & { includeBreakfast: boolean }) => {
    setSelectedRoom(room);
    setCurrentView('guest-form');
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

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedRoom(null);
    setCompletedBooking(null);
    setError(null);
  };

  const handleNewBooking = () => {
    setCurrentView('room-selection');
    setSelectedRoom(null);
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
      
      case 'room-selection':
        return (
          <RoomSelection
            onSelectRoom={handleRoomSelected}
            onCancel={handleBackToDashboard}
          />
        );
      
      case 'guest-form':
        return selectedRoom ? (
          <QuickGuestForm
            selectedRoom={selectedRoom}
            onSubmit={handleBookingSubmit}
            onCancel={() => setCurrentView('room-selection')}
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