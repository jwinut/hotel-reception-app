// src/components/BookingWizard.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import BookingWizard from './BookingWizard';

// Mock child components
jest.mock('./GuestForm', () => {
  return function MockGuestForm({ initialData, onComplete, onCancel }) {
    return (
      <div data-testid="guest-form">
        <h3>Guest Form</h3>
        <p>Initial Data: {JSON.stringify(initialData)}</p>
        <button 
          onClick={() => onComplete({ 
            firstName: 'John', 
            lastName: 'Doe', 
            numGuests: 2,
            phone: '081-234-5678',
            email: 'john@test.com'
          })}
          data-testid="guest-complete"
        >
          Complete Guest Info
        </button>
        <button onClick={onCancel} data-testid="guest-cancel">
          Cancel
        </button>
      </div>
    );
  };
});

jest.mock('./DateSelection', () => {
  return function MockDateSelection({ initialData, guestData, onComplete, onBack, onCancel }) {
    return (
      <div data-testid="date-selection">
        <h3>Date Selection</h3>
        <p>Guest: {guestData.firstName} {guestData.lastName}</p>
        <p>Initial Data: {JSON.stringify(initialData)}</p>
        <button 
          onClick={() => onComplete({
            checkInDate: '2024-12-15',
            checkOutDate: '2024-12-17',
            nights: 2,
            includeBreakfast: true
          })}
          data-testid="date-complete"
        >
          Complete Date Selection
        </button>
        <button onClick={onBack} data-testid="date-back">
          Back
        </button>
        <button onClick={onCancel} data-testid="date-cancel">
          Cancel
        </button>
      </div>
    );
  };
});

jest.mock('./RoomSelection', () => {
  return function MockRoomSelection({ initialData, guestData, datesData, onComplete, onBack, onCancel }) {
    return (
      <div data-testid="room-selection">
        <h3>Room Selection</h3>
        <p>Guest: {guestData.firstName} {guestData.lastName}</p>
        <p>Dates: {datesData.checkInDate} to {datesData.checkOutDate}</p>
        <p>Initial Data: {JSON.stringify(initialData)}</p>
        <button 
          onClick={() => onComplete({
            roomNumber: '301',
            roomType: 'Deluxe',
            pricing: {
              basePrice: 1900,
              totalPrice: 3800,
              includeBreakfast: true,
              nights: 2
            }
          })}
          data-testid="room-complete"
        >
          Complete Room Selection
        </button>
        <button onClick={onBack} data-testid="room-back">
          Back
        </button>
        <button onClick={onCancel} data-testid="room-cancel">
          Cancel
        </button>
      </div>
    );
  };
});

jest.mock('./BookingConfirmation', () => {
  return function MockBookingConfirmation({ bookingData, onComplete, onBack, onCancel }) {
    return (
      <div data-testid="booking-confirmation">
        <h3>Booking Confirmation</h3>
        <p>Guest: {bookingData.guest.firstName} {bookingData.guest.lastName}</p>
        <p>Room: {bookingData.room.roomNumber} ({bookingData.room.roomType})</p>
        <p>Total: ฿{bookingData.room.pricing.totalPrice}</p>
        <button 
          onClick={() => onComplete({ confirmed: true })}
          data-testid="confirm-complete"
        >
          Confirm Booking
        </button>
        <button onClick={onBack} data-testid="confirm-back">
          Back
        </button>
        <button onClick={onCancel} data-testid="confirm-cancel">
          Cancel
        </button>
      </div>
    );
  };
});

// Mock window.confirm
const mockConfirm = jest.fn();
global.confirm = mockConfirm;

describe('BookingWizard Component', () => {
  const mockOnComplete = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockConfirm.mockReturnValue(true); // Default to confirming cancellation
  });

  describe('Initial Rendering', () => {
    it('renders the wizard with progress indicator', () => {
      render(<BookingWizard onComplete={mockOnComplete} onCancel={mockOnCancel} />);
      
      // Check progress indicator elements
      expect(document.querySelector('.wizard-progress')).toBeInTheDocument();
      expect(document.querySelector('.progress-bar')).toBeInTheDocument();
      expect(document.querySelector('.progress-fill')).toBeInTheDocument();
      
      // Check all step titles are present
      expect(screen.getByText('ข้อมูลผู้เข้าพัก')).toBeInTheDocument();
      expect(screen.getByText('วันที่เข้า-ออก')).toBeInTheDocument();
      expect(screen.getByText('เลือกห้องพัก')).toBeInTheDocument();
      expect(screen.getByText('ยืนยันการจอง')).toBeInTheDocument();
    });

    it('starts with guest form step', () => {
      render(<BookingWizard onComplete={mockOnComplete} onCancel={mockOnCancel} />);
      
      // Should show guest form initially
      expect(screen.getByTestId('guest-form')).toBeInTheDocument();
      expect(screen.getByText('Guest Form')).toBeInTheDocument();
      
      // Should not show other steps
      expect(screen.queryByTestId('date-selection')).not.toBeInTheDocument();
      expect(screen.queryByTestId('room-selection')).not.toBeInTheDocument();
      expect(screen.queryByTestId('booking-confirmation')).not.toBeInTheDocument();
    });

    it('shows correct progress bar width for first step', () => {
      render(<BookingWizard onComplete={mockOnComplete} onCancel={mockOnCancel} />);
      
      const progressFill = document.querySelector('.progress-fill');
      expect(progressFill).toHaveStyle('width: 25%'); // 1/4 steps = 25%
    });

    it('highlights current step and shows completed steps', () => {
      render(<BookingWizard onComplete={mockOnComplete} onCancel={mockOnCancel} />);
      
      const steps = document.querySelectorAll('.progress-step');
      expect(steps[0]).toHaveClass('active'); // First step should be active
      expect(steps[1]).toHaveClass('pending'); // Other steps should be pending
      expect(steps[2]).toHaveClass('pending');
      expect(steps[3]).toHaveClass('pending');
    });
  });

  describe('Step Navigation', () => {
    it('progresses from guest form to date selection', async () => {
      render(<BookingWizard onComplete={mockOnComplete} onCancel={mockOnCancel} />);
      
      // Complete guest form
      const completeButton = screen.getByTestId('guest-complete');
      fireEvent.click(completeButton);
      
      // Should now show date selection
      expect(screen.getByTestId('date-selection')).toBeInTheDocument();
      expect(screen.getByText('Date Selection')).toBeInTheDocument();
      expect(screen.getByText('Guest: John Doe')).toBeInTheDocument();
      
      // Should not show guest form anymore
      expect(screen.queryByTestId('guest-form')).not.toBeInTheDocument();
      
      // Progress should be updated
      const progressFill = document.querySelector('.progress-fill');
      expect(progressFill).toHaveStyle('width: 50%'); // 2/4 steps = 50%
    });

    it('progresses from date selection to room selection', async () => {
      render(<BookingWizard onComplete={mockOnComplete} onCancel={mockOnCancel} />);
      
      // Complete guest form
      fireEvent.click(screen.getByTestId('guest-complete'));
      
      // Complete date selection
      fireEvent.click(screen.getByTestId('date-complete'));
      
      // Should now show room selection
      expect(screen.getByTestId('room-selection')).toBeInTheDocument();
      expect(screen.getByText('Room Selection')).toBeInTheDocument();
      expect(screen.getByText('Guest: John Doe')).toBeInTheDocument();
      expect(screen.getByText('Dates: 2024-12-15 to 2024-12-17')).toBeInTheDocument();
      
      // Progress should be updated
      const progressFill = document.querySelector('.progress-fill');
      expect(progressFill).toHaveStyle('width: 75%'); // 3/4 steps = 75%
    });

    it('progresses from room selection to confirmation', async () => {
      render(<BookingWizard onComplete={mockOnComplete} onCancel={mockOnCancel} />);
      
      // Complete all previous steps
      fireEvent.click(screen.getByTestId('guest-complete'));
      fireEvent.click(screen.getByTestId('date-complete'));
      fireEvent.click(screen.getByTestId('room-complete'));
      
      // Should now show booking confirmation
      expect(screen.getByTestId('booking-confirmation')).toBeInTheDocument();
      expect(screen.getByText('Booking Confirmation')).toBeInTheDocument();
      expect(screen.getByText('Guest: John Doe')).toBeInTheDocument();
      expect(screen.getByText('Room: 301 (Deluxe)')).toBeInTheDocument();
      expect(screen.getByText('Total: ฿3800')).toBeInTheDocument();
      
      // Progress should be at 100%
      const progressFill = document.querySelector('.progress-fill');
      expect(progressFill).toHaveStyle('width: 100%'); // 4/4 steps = 100%
    });

    it('completes booking and calls onComplete with all data', async () => {
      render(<BookingWizard onComplete={mockOnComplete} onCancel={mockOnCancel} />);
      
      // Complete all steps
      fireEvent.click(screen.getByTestId('guest-complete'));
      fireEvent.click(screen.getByTestId('date-complete'));
      fireEvent.click(screen.getByTestId('room-complete'));
      fireEvent.click(screen.getByTestId('confirm-complete'));
      
      // Should call onComplete with consolidated booking data
      expect(mockOnComplete).toHaveBeenCalledWith({
        guest: {
          firstName: 'John',
          lastName: 'Doe',
          numGuests: 2,
          phone: '081-234-5678',
          email: 'john@test.com'
        },
        dates: {
          checkInDate: '2024-12-15',
          checkOutDate: '2024-12-17',
          nights: 2,
          includeBreakfast: true
        },
        room: {
          roomNumber: '301',
          roomType: 'Deluxe',
          pricing: {
            basePrice: 1900,
            totalPrice: 3800,
            includeBreakfast: true,
            nights: 2
          }
        },
        pricing: {},
        confirm: {
          confirmed: true
        }
      });
    });
  });

  describe('Back Navigation', () => {
    it('navigates back from date selection to guest form', async () => {
      render(<BookingWizard onComplete={mockOnComplete} onCancel={mockOnCancel} />);
      
      // Complete guest form to get to date selection
      fireEvent.click(screen.getByTestId('guest-complete'));
      expect(screen.getByTestId('date-selection')).toBeInTheDocument();
      
      // Click back button
      fireEvent.click(screen.getByTestId('date-back'));
      
      // Should be back to guest form
      expect(screen.getByTestId('guest-form')).toBeInTheDocument();
      expect(screen.queryByTestId('date-selection')).not.toBeInTheDocument();
      
      // Should preserve guest data
      expect(screen.getByText('Initial Data: {"firstName":"John","lastName":"Doe","numGuests":2,"phone":"081-234-5678","email":"john@test.com"}')).toBeInTheDocument();
      
      // Progress should be back to 25%
      const progressFill = document.querySelector('.progress-fill');
      expect(progressFill).toHaveStyle('width: 25%');
    });

    it('navigates back from room selection to date selection', async () => {
      render(<BookingWizard onComplete={mockOnComplete} onCancel={mockOnCancel} />);
      
      // Complete first two steps
      fireEvent.click(screen.getByTestId('guest-complete'));
      fireEvent.click(screen.getByTestId('date-complete'));
      expect(screen.getByTestId('room-selection')).toBeInTheDocument();
      
      // Click back button
      fireEvent.click(screen.getByTestId('room-back'));
      
      // Should be back to date selection
      expect(screen.getByTestId('date-selection')).toBeInTheDocument();
      expect(screen.queryByTestId('room-selection')).not.toBeInTheDocument();
      
      // Should preserve previous data
      expect(screen.getByText('Guest: John Doe')).toBeInTheDocument();
    });

    it('navigates back from confirmation to room selection', async () => {
      render(<BookingWizard onComplete={mockOnComplete} onCancel={mockOnCancel} />);
      
      // Complete all steps to reach confirmation
      fireEvent.click(screen.getByTestId('guest-complete'));
      fireEvent.click(screen.getByTestId('date-complete'));
      fireEvent.click(screen.getByTestId('room-complete'));
      expect(screen.getByTestId('booking-confirmation')).toBeInTheDocument();
      
      // Click back button
      fireEvent.click(screen.getByTestId('confirm-back'));
      
      // Should be back to room selection
      expect(screen.getByTestId('room-selection')).toBeInTheDocument();
      expect(screen.queryByTestId('booking-confirmation')).not.toBeInTheDocument();
    });

    it('does not go back from first step', async () => {
      render(<BookingWizard onComplete={mockOnComplete} onCancel={mockOnCancel} />);
      
      // Should be on guest form (first step)
      expect(screen.getByTestId('guest-form')).toBeInTheDocument();
      
      // Guest form doesn't have a back button (it's the first step)
      expect(screen.queryByTestId('guest-back')).not.toBeInTheDocument();
    });
  });

  describe('Cancellation', () => {
    it('shows confirmation dialog when canceling', async () => {
      render(<BookingWizard onComplete={mockOnComplete} onCancel={mockOnCancel} />);
      
      // Try to cancel from guest form
      fireEvent.click(screen.getByTestId('guest-cancel'));
      
      // Should show confirmation dialog
      expect(mockConfirm).toHaveBeenCalledWith('ต้องการยกเลิกการจองหรือไม่? ข้อมูลที่กรอกจะหายไป');
    });

    it('calls onCancel when user confirms cancellation', async () => {
      mockConfirm.mockReturnValue(true);
      render(<BookingWizard onComplete={mockOnComplete} onCancel={mockOnCancel} />);
      
      fireEvent.click(screen.getByTestId('guest-cancel'));
      
      expect(mockOnCancel).toHaveBeenCalled();
    });

    it('does not cancel when user rejects confirmation', async () => {
      mockConfirm.mockReturnValue(false);
      render(<BookingWizard onComplete={mockOnComplete} onCancel={mockOnCancel} />);
      
      fireEvent.click(screen.getByTestId('guest-cancel'));
      
      expect(mockOnCancel).not.toHaveBeenCalled();
      // Should still be on guest form
      expect(screen.getByTestId('guest-form')).toBeInTheDocument();
    });

    it('can cancel from any step', async () => {
      render(<BookingWizard onComplete={mockOnComplete} onCancel={mockOnCancel} />);
      
      // Complete guest form to get to date selection
      fireEvent.click(screen.getByTestId('guest-complete'));
      
      // Cancel from date selection
      fireEvent.click(screen.getByTestId('date-cancel'));
      
      expect(mockConfirm).toHaveBeenCalledWith('ต้องการยกเลิกการจองหรือไม่? ข้อมูลที่กรอกจะหายไป');
      expect(mockOnCancel).toHaveBeenCalled();
    });
  });

  describe('Progress Indicator', () => {
    it('shows correct step icons and completion status', async () => {
      render(<BookingWizard onComplete={mockOnComplete} onCancel={mockOnCancel} />);
      
      // Initially all steps should show their icons
      let stepIcons = document.querySelectorAll('.step-icon');
      expect(stepIcons[0]).toHaveTextContent('👤'); // Current step shows icon
      expect(stepIcons[1]).toHaveTextContent('📅');
      expect(stepIcons[2]).toHaveTextContent('🏠');
      expect(stepIcons[3]).toHaveTextContent('✅');
      
      // Complete first step
      fireEvent.click(screen.getByTestId('guest-complete'));
      
      // First step should now show checkmark, second should be active
      stepIcons = document.querySelectorAll('.step-icon');
      expect(stepIcons[0]).toHaveTextContent('✓'); // Completed step shows checkmark
      expect(stepIcons[1]).toHaveTextContent('📅'); // Current step shows icon
      
      const steps = document.querySelectorAll('.progress-step');
      expect(steps[0]).toHaveClass('completed');
      expect(steps[1]).toHaveClass('active');
    });

    it('updates progress bar width correctly for each step', async () => {
      render(<BookingWizard onComplete={mockOnComplete} onCancel={mockOnCancel} />);
      
      const progressFill = document.querySelector('.progress-fill');
      
      // Step 1 (25%)
      expect(progressFill).toHaveStyle('width: 25%');
      
      fireEvent.click(screen.getByTestId('guest-complete'));
      // Step 2 (50%)
      expect(progressFill).toHaveStyle('width: 50%');
      
      fireEvent.click(screen.getByTestId('date-complete'));
      // Step 3 (75%)
      expect(progressFill).toHaveStyle('width: 75%');
      
      fireEvent.click(screen.getByTestId('room-complete'));
      // Step 4 (100%)
      expect(progressFill).toHaveStyle('width: 100%');
    });
  });

  describe('Data Persistence', () => {
    it('preserves data when navigating back and forth', async () => {
      render(<BookingWizard onComplete={mockOnComplete} onCancel={mockOnCancel} />);
      
      // Complete guest form
      fireEvent.click(screen.getByTestId('guest-complete'));
      
      // Complete date selection
      fireEvent.click(screen.getByTestId('date-complete'));
      
      // Go back to date selection
      fireEvent.click(screen.getByTestId('room-back'));
      
      // Should preserve date data
      expect(screen.getByText('Initial Data: {"checkInDate":"2024-12-15","checkOutDate":"2024-12-17","nights":2,"includeBreakfast":true}')).toBeInTheDocument();
      
      // Go back to guest form
      fireEvent.click(screen.getByTestId('date-back'));
      
      // Should preserve guest data
      expect(screen.getByText('Initial Data: {"firstName":"John","lastName":"Doe","numGuests":2,"phone":"081-234-5678","email":"john@test.com"}')).toBeInTheDocument();
    });

    it('passes correct data between steps', async () => {
      render(<BookingWizard onComplete={mockOnComplete} onCancel={mockOnCancel} />);
      
      // Complete guest form
      fireEvent.click(screen.getByTestId('guest-complete'));
      
      // Date selection should receive guest data
      expect(screen.getByText('Guest: John Doe')).toBeInTheDocument();
      
      // Complete date selection
      fireEvent.click(screen.getByTestId('date-complete'));
      
      // Room selection should receive both guest and date data
      expect(screen.getByText('Guest: John Doe')).toBeInTheDocument();
      expect(screen.getByText('Dates: 2024-12-15 to 2024-12-17')).toBeInTheDocument();
      
      // Complete room selection
      fireEvent.click(screen.getByTestId('room-complete'));
      
      // Confirmation should receive all data
      expect(screen.getByText('Guest: John Doe')).toBeInTheDocument();
      expect(screen.getByText('Room: 301 (Deluxe)')).toBeInTheDocument();
      expect(screen.getByText('Total: ฿3800')).toBeInTheDocument();
    });
  });
});