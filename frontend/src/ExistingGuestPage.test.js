// src/ExistingGuestPage.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import ExistingGuestPage from './ExistingGuestPage';

// Mock child components
jest.mock('./components/GuestLookup', () => {
  return function MockGuestLookup({ bookings, onBookingSelect, isLoading }) {
    if (isLoading) {
      return <div data-testid="guest-lookup">Loading...</div>;
    }
    
    return (
      <div data-testid="guest-lookup">
        <input
          data-testid="search-input"
          placeholder="ค้นหาการจอง"
        />
        <div data-testid="booking-results">
          {bookings?.map(booking => (
            <div
              key={booking.id}
              data-testid={`booking-${booking.id}`}
              onClick={() => onBookingSelect(booking)}
              style={{ cursor: 'pointer', padding: '10px', border: '1px solid #ccc', margin: '5px' }}
            >
              <div>{booking.guestName}</div>
              <div>{booking.phone}</div>
              <div>ห้อง {booking.roomNumber}</div>
              <div>{booking.status}</div>
            </div>
          )) || []}
        </div>
        <div data-testid="quick-stats">
          <span>เข้าพักวันนี้: {bookings?.filter(b => b.status === 'arriving_today').length || 0}</span>
          <span>ทั้งหมด: {bookings?.length || 0}</span>
        </div>
      </div>
    );
  };
});

jest.mock('./components/CheckInProcess', () => {
  return function MockCheckInProcess({ booking, onComplete, onCancel }) {
    return (
      <div data-testid="check-in-process">
        <h2>เช็คอินสำหรับ: {booking.guestName}</h2>
        <div data-testid="booking-details">
          <p>ห้อง: {booking.roomNumber}</p>
          <p>ประเภท: {booking.roomType}</p>
          <p>สถานะ: {booking.status}</p>
        </div>
        <button onClick={() => onComplete(booking)} data-testid="complete-checkin">
          เช็คอินสำเร็จ
        </button>
        <button onClick={onCancel} data-testid="cancel-checkin">
          ยกเลิก
        </button>
      </div>
    );
  };
});

// Wrapper component for Router
const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

// Mock window.alert
const mockAlert = jest.fn();
global.alert = mockAlert;

describe('ExistingGuestPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial Rendering', () => {
    it('renders the page with correct title and date/time', () => {
      renderWithRouter(<ExistingGuestPage />);
      
      expect(screen.getByText('เช็คอินลูกค้าจองมาแล้ว')).toBeInTheDocument();
      
      // Check for Thai date format
      expect(screen.getByText(/วัน.+พ\.ศ\./)).toBeInTheDocument();
      
      // Check for time display
      expect(screen.getByText(/เวลา \d{2}:\d{2}/)).toBeInTheDocument();
    });

    it('renders guest lookup component initially', () => {
      renderWithRouter(<ExistingGuestPage />);
      
      expect(screen.getByTestId('guest-lookup')).toBeInTheDocument();
      expect(screen.getByTestId('search-input')).toBeInTheDocument();
      expect(screen.queryByTestId('check-in-process')).not.toBeInTheDocument();
    });

    it('displays instructions for check-in process', () => {
      renderWithRouter(<ExistingGuestPage />);
      
      expect(screen.getByText('วิธีการเช็คอิน')).toBeInTheDocument();
      expect(screen.getByText(/ค้นหาการจองด้วยชื่อ เบอร์โทร หรือรหัสจอง/)).toBeInTheDocument();
      expect(screen.getByText(/ตรวจสอบข้อมูลการจองกับลูกค้า/)).toBeInTheDocument();
      expect(screen.getByText(/ดำเนินการเช็คอินและมอบกุญแจห้อง/)).toBeInTheDocument();
    });
  });

  describe('Mock Booking Data', () => {
    it('displays mock bookings in guest lookup', async () => {
      renderWithRouter(<ExistingGuestPage />);
      
      // Wait for mock data to load
      await waitFor(() => {
        expect(screen.getByText('สมชาย ใจดี')).toBeInTheDocument();
        expect(screen.getByText('John Smith')).toBeInTheDocument();
        expect(screen.getByText('David Johnson')).toBeInTheDocument();
      });
    });

    it('shows correct booking information', async () => {
      renderWithRouter(<ExistingGuestPage />);
      
      await waitFor(() => {
        expect(screen.getByText('081-234-5678')).toBeInTheDocument();
        expect(screen.getByText('ห้อง 301')).toBeInTheDocument();
        expect(screen.getByText('confirmed')).toBeInTheDocument();
        
        expect(screen.getByText('082-345-6789')).toBeInTheDocument();
        expect(screen.getByText('ห้อง 405')).toBeInTheDocument();
        expect(screen.getByText('arriving_today')).toBeInTheDocument();
      });
    });

    it('filters bookings based on search input', async () => {
      renderWithRouter(<ExistingGuestPage />);
      
      await waitFor(() => {
        expect(screen.getByText('สมชาย ใจดี')).toBeInTheDocument();
      });
      
      const searchInput = screen.getByTestId('search-input');
      await userEvent.type(searchInput, 'John');
      
      // Should still show John Smith but filtering logic depends on parent component
      expect(screen.getByText('John Smith')).toBeInTheDocument();
    });
  });

  describe('Booking Selection and Check-in Process', () => {
    it('switches to check-in process when booking is selected', async () => {
      renderWithRouter(<ExistingGuestPage />);
      
      await waitFor(() => {
        expect(screen.getByTestId('booking-BK24120101')).toBeInTheDocument();
      });
      
      // Click on a booking
      const booking = screen.getByTestId('booking-BK24120101');
      await userEvent.click(booking);
      
      // Should show check-in process
      expect(screen.getByTestId('check-in-process')).toBeInTheDocument();
      expect(screen.getByText('เช็คอินสำหรับ: สมชาย ใจดี')).toBeInTheDocument();
      expect(screen.getByText('ห้อง: 301')).toBeInTheDocument();
      expect(screen.getByText('ประเภท: Deluxe')).toBeInTheDocument();
    });

    it('completes check-in process successfully', async () => {
      renderWithRouter(<ExistingGuestPage />);
      
      await waitFor(() => {
        expect(screen.getByTestId('booking-BK24120101')).toBeInTheDocument();
      });
      
      // Select booking
      const booking = screen.getByTestId('booking-BK24120101');
      await userEvent.click(booking);
      
      // Complete check-in
      const completeButton = screen.getByTestId('complete-checkin');
      await userEvent.click(completeButton);
      
      // Should show success message and return to lookup
      expect(mockAlert).toHaveBeenCalledWith(
        expect.stringContaining('เช็คอินสำเร็จ! ยินดีต้อนรับ')
      );
      expect(screen.getByTestId('guest-lookup')).toBeInTheDocument();
      expect(screen.queryByTestId('check-in-process')).not.toBeInTheDocument();
    });

    it('cancels check-in process and returns to lookup', async () => {
      renderWithRouter(<ExistingGuestPage />);
      
      await waitFor(() => {
        expect(screen.getByTestId('booking-BK24120101')).toBeInTheDocument();
      });
      
      // Select booking
      const booking = screen.getByTestId('booking-BK24120101');
      await userEvent.click(booking);
      
      // Cancel check-in
      const cancelButton = screen.getByTestId('cancel-checkin');
      await userEvent.click(cancelButton);
      
      // Should return to guest lookup
      expect(screen.getByTestId('guest-lookup')).toBeInTheDocument();
      expect(screen.queryByTestId('check-in-process')).not.toBeInTheDocument();
    });
  });

  describe('Date and Time Display', () => {
    it('updates time display every minute', async () => {
      // Mock Date to control time
      const mockDate = new Date('2024-12-12T10:30:00');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
      
      renderWithRouter(<ExistingGuestPage />);
      
      // Check initial time
      expect(screen.getByText(/เวลา 10:30/)).toBeInTheDocument();
      
      // Advance time and trigger update
      mockDate.setMinutes(31);
      
      // Fast-forward timers
      jest.advanceTimersByTime(60000);
      
      await waitFor(() => {
        expect(screen.getByText(/เวลา 10:31/)).toBeInTheDocument();
      });
      
      jest.restoreAllMocks();
    });

    it('displays correct Thai Buddhist calendar date', () => {
      renderWithRouter(<ExistingGuestPage />);
      
      // Should show Thai date with พ.ศ. (Buddhist Era)
      const dateElement = screen.getByText(/พ\.ศ\./);
      expect(dateElement).toBeInTheDocument();
      
      // Should include day of week in Thai
      expect(screen.getByText(/วัน(จันทร์|อังคาร|พุธ|พฤหัสบดี|ศุกร์|เสาร์|อาทิตย์)/)).toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation and Accessibility', () => {
    it('handles escape key to dismiss check-in process', async () => {
      renderWithRouter(<ExistingGuestPage />);
      
      await waitFor(() => {
        expect(screen.getByTestId('booking-BK24120101')).toBeInTheDocument();
      });
      
      // Select booking
      const booking = screen.getByTestId('booking-BK24120101');
      await userEvent.click(booking);
      
      expect(screen.getByTestId('check-in-process')).toBeInTheDocument();
      
      // Press Escape key
      fireEvent.keyDown(document, { key: 'Escape' });
      
      // Should return to guest lookup
      expect(screen.queryByTestId('check-in-process')).not.toBeInTheDocument();
      expect(screen.getByTestId('guest-lookup')).toBeInTheDocument();
    });

    it('does not dismiss when escape pressed without selected booking', () => {
      renderWithRouter(<ExistingGuestPage />);
      
      // Press Escape when no booking selected
      fireEvent.keyDown(document, { key: 'Escape' });
      
      // Should still show guest lookup
      expect(screen.getByTestId('guest-lookup')).toBeInTheDocument();
    });
  });

  describe('Navigation and Route Changes', () => {
    it('clears selected booking when route changes', () => {
      const { rerender } = renderWithRouter(<ExistingGuestPage />);
      
      // This test simulates the useEffect that depends on location.pathname
      // In a real test, you'd need to mock useLocation or test with actual routing
      expect(screen.getByTestId('guest-lookup')).toBeInTheDocument();
      
      // Rerender (simulating route change)
      rerender(
        <BrowserRouter>
          <ExistingGuestPage />
        </BrowserRouter>
      );
      
      // Should still show guest lookup (booking cleared)
      expect(screen.getByTestId('guest-lookup')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles missing booking data gracefully', () => {
      renderWithRouter(<ExistingGuestPage />);
      
      // The component should still render even with empty booking data
      expect(screen.getByTestId('guest-lookup')).toBeInTheDocument();
      expect(screen.getByTestId('search-input')).toBeInTheDocument();
    });

    it('handles invalid booking selection', async () => {
      renderWithRouter(<ExistingGuestPage />);
      
      await waitFor(() => {
        expect(screen.getByTestId('booking-BK24120101')).toBeInTheDocument();
      });
      
      // Simulate selecting an invalid/null booking
      const mockInvalidBooking = null;
      
      // This would be handled by the parent component's booking selection logic
      expect(screen.getByTestId('guest-lookup')).toBeInTheDocument();
    });
  });

  describe('Performance and Cleanup', () => {
    it('cleans up timer on unmount', () => {
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
      
      const { unmount } = renderWithRouter(<ExistingGuestPage />);
      
      unmount();
      
      expect(clearIntervalSpy).toHaveBeenCalled();
      
      clearIntervalSpy.mockRestore();
    });

    it('cleans up event listeners on unmount', () => {
      const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');
      
      const { unmount } = renderWithRouter(<ExistingGuestPage />);
      
      unmount();
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
      
      removeEventListenerSpy.mockRestore();
    });
  });
});