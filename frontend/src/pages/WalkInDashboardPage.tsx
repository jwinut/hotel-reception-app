import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
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
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  
  const [selectedRoom, setSelectedRoom] = useState<RoomAvailability | null>(null);
  const [selectedRoomType, setSelectedRoomType] = useState<string>('ALL');
  const [includeBreakfast, setIncludeBreakfast] = useState(false);
  const [completedBooking, setCompletedBooking] = useState<BookingResponse['booking'] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Determine current view from URL
  const getCurrentView = (): ViewState => {
    if (location.pathname.includes('/room-selection/')) return 'room-map';
    if (location.pathname.includes('/guest-form')) return 'guest-form';
    if (location.pathname.includes('/booking-success')) return 'booking-success';
    return 'dashboard';
  };

  const currentView = getCurrentView();

  // Update selectedRoomType from URL params and restore state
  useEffect(() => {
    // First restore walk-in flow state from sessionStorage on page refresh
    const savedState = sessionStorage.getItem('walkin-flow-state');
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        if (state.selectedRoom) setSelectedRoom(state.selectedRoom);
        if (state.includeBreakfast !== undefined) setIncludeBreakfast(state.includeBreakfast);
        if (state.completedBooking) setCompletedBooking(state.completedBooking);
        // Only restore roomType from session if no URL param is present
        if (state.selectedRoomType && (!params.roomType || params.roomType === 'ALL')) {
          setSelectedRoomType(state.selectedRoomType);
        }
      } catch (error) {
        console.warn('Failed to restore walk-in flow state:', error);
      }
    }

    // URL params take precedence over sessionStorage
    if (params.roomType && params.roomType !== 'ALL') {
      setSelectedRoomType(params.roomType);
    }
  }, [params.roomType]);

  // Save state to sessionStorage when it changes
  useEffect(() => {
    const state = {
      selectedRoom,
      selectedRoomType,
      includeBreakfast,
      completedBooking
    };
    sessionStorage.setItem('walkin-flow-state', JSON.stringify(state));
  }, [selectedRoom, selectedRoomType, includeBreakfast, completedBooking]);

  const handleStartBooking = (roomType: string) => {
    setSelectedRoomType(roomType);
    navigate(`/walk-in/room-selection/${roomType}`);
    setError(null);
  };

  const handleRoomSelected = (room: RoomAvailability) => {
    setSelectedRoom(room);
    navigate('/walk-in/guest-form');
  };

  const handleBackToDashboard = () => {
    navigate('/walk-in-dashboard');
    setSelectedRoom(null);
    setSelectedRoomType('ALL');
    setIncludeBreakfast(false);
    setCompletedBooking(null);
    setError(null);
    // Clear saved state
    sessionStorage.removeItem('walkin-flow-state');
  };

  const handleBackToRoomSelection = () => {
    navigate(`/walk-in/room-selection/${selectedRoomType}`);
  };

  const handleBookingSubmit = async (guest: GuestInfo, checkOutDate: Date) => {
    if (!selectedRoom) return;

    setLoading(true);
    setError(null);

    try {
      // Calculate pricing
      const checkInDate = new Date();
      const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
      
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

      const breakfastPrice = calculateBreakfastPrice(selectedRoom.roomType);
      const roomTotal = selectedRoom.basePrice * nights;
      const breakfastTotal = includeBreakfast ? breakfastPrice * nights : 0;
      const totalAmount = roomTotal + breakfastTotal;

      const bookingData: CreateBookingRequest = {
        roomId: selectedRoom.id,
        guest,
        checkOutDate: checkOutDate.toISOString(),
        breakfastIncluded: includeBreakfast,
        pricing: {
          roomTotal,
          breakfastTotal,
          totalAmount,
          nights
        }
      };

      const response = await walkinApi.createWalkInBooking(bookingData);
      setCompletedBooking(response.booking);
      navigate('/walk-in/booking-success');
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
    navigate('/walk-in-dashboard');
    setSelectedRoom(null);
    setSelectedRoomType('ALL');
    setIncludeBreakfast(false);
    setCompletedBooking(null);
    setError(null);
    // Clear saved state
    sessionStorage.removeItem('walkin-flow-state');
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
            onRoomTypeChange={(roomType) => {
              setSelectedRoomType(roomType);
              navigate(`/walk-in/room-selection/${roomType}`);
            }}
          />
        );
      
      case 'guest-form':
        if (!selectedRoom) {
          // If no room selected, redirect back to room selection
          navigate(`/walk-in/room-selection/${selectedRoomType}`);
          return null;
        }
        return (
          <QuickGuestForm
            selectedRoom={selectedRoom}
            onSubmit={handleBookingSubmit}
            onCancel={handleBackToRoomSelection}
            loading={loading}
            includeBreakfast={includeBreakfast}
            onBreakfastChange={setIncludeBreakfast}
          />
        );
      
      case 'booking-success':
        if (!completedBooking) {
          // If no completed booking, redirect back to dashboard
          navigate('/walk-in-dashboard');
          return null;
        }
        return (
          <BookingSuccess
            booking={completedBooking}
            onNewBooking={handleNewBooking}
            onBackToDashboard={handleBackToDashboard}
          />
        );
      
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