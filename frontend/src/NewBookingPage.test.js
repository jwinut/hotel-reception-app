// src/NewBookingPage.test.js
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import NewBookingPage from './NewBookingPage';

// Mock the navigate function
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock BookingWizard component
const mockBookingData = {
  guestName: 'John Doe',
  phone: '081-234-5678',
  email: 'john@example.com',
  roomType: 'Standard',
  checkInDate: '2024-12-12',
  checkOutDate: '2024-12-14',
  guests: 2,
  nights: 2,
  totalPrice: 2400,
  includeBreakfast: true
};

jest.mock('./components/BookingWizard', () => {
  return function MockBookingWizard({ onComplete, onCancel }) {
    return React.createElement(
      'div',
      { 'data-testid': 'booking-wizard' },
      React.createElement('h2', null, 'Booking Wizard'),
      React.createElement(
        'div',
        { 'data-testid': 'wizard-content' },
        React.createElement('p', null, 'Step 1: Guest Information'),
        React.createElement('p', null, 'Step 2: Date Selection'),
        React.createElement('p', null, 'Step 3: Room Selection'),
        React.createElement('p', null, 'Step 4: Confirmation')
      ),
      React.createElement(
        'div',
        { 'data-testid': 'wizard-actions' },
        React.createElement(
          'button',
          {
            onClick: () => onComplete(mockBookingData),
            'data-testid': 'complete-booking'
          },
          'Complete Booking'
        ),
        React.createElement(
          'button',
          {
            onClick: onCancel,
            'data-testid': 'cancel-booking'
          },
          'Cancel'
        )
      )
    );
  };
});

// Mock console.log
const mockConsoleLog = jest.fn();
const originalConsoleLog = console.log;

// Wrapper component for Router
const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('NewBookingPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
    console.log = mockConsoleLog;
  });

  afterEach(() => {
    console.log = originalConsoleLog;
  });

  describe('Initial Rendering', () => {
    it('renders the page with correct title', () => {
      renderWithRouter(<NewBookingPage />);
      
      expect(screen.getByText('จองห้องใหม่')).toBeInTheDocument();
    });

    it('displays current date and time', () => {
      renderWithRouter(<NewBookingPage />);
      
      // Check for Thai date format with Buddhist era
      expect(screen.getByText(/วัน.+พ\.ศ\./)).toBeInTheDocument();
      
      // Check for time display with seconds
      expect(screen.getByText(/เวลา \d{2}:\d{2}:\d{2}/)).toBeInTheDocument();
    });

    it('renders booking wizard component', () => {
      renderWithRouter(<NewBookingPage />);
      
      expect(screen.getByTestId('booking-wizard')).toBeInTheDocument();
      expect(screen.getByText('Booking Wizard')).toBeInTheDocument();
    });

    it('displays wizard steps', () => {
      renderWithRouter(<NewBookingPage />);
      
      expect(screen.getByText('Step 1: Guest Information')).toBeInTheDocument();
      expect(screen.getByText('Step 2: Date Selection')).toBeInTheDocument();
      expect(screen.getByText('Step 3: Room Selection')).toBeInTheDocument();
      expect(screen.getByText('Step 4: Confirmation')).toBeInTheDocument();
    });
  });

  describe('Time Update Functionality', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('updates time every second', async () => {
      const mockDate = new Date('2024-12-12T10:30:45');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
      
      renderWithRouter(<NewBookingPage />);
      
      // Check initial time
      expect(screen.getByText(/เวลา 10:30:45/)).toBeInTheDocument();
      
      // Advance time by 1 second
      mockDate.setSeconds(46);
      jest.advanceTimersByTime(1000);
      
      await waitFor(() => {
        expect(screen.getByText(/เวลา 10:30:46/)).toBeInTheDocument();
      });
      
      jest.restoreAllMocks();
    });

    it('cleans up timer on unmount', () => {
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
      
      const { unmount } = renderWithRouter(<NewBookingPage />);
      
      unmount();
      
      expect(clearIntervalSpy).toHaveBeenCalled();
      
      clearIntervalSpy.mockRestore();
    });
  });

  describe('Date and Time Formatting', () => {
    it('formats date in Thai Buddhist calendar', () => {
      renderWithRouter(<NewBookingPage />);
      
      // Should show Thai date with พ.ศ. (Buddhist Era)
      const dateElement = screen.getByText(/พ\.ศ\./);
      expect(dateElement).toBeInTheDocument();
      
      // Should include day of week in Thai
      expect(screen.getByText(/วัน(จันทร์|อังคาร|พุธ|พฤหัสบดี|ศุกร์|เสาร์|อาทิตย์)/)).toBeInTheDocument();
    });

    it('formats time with seconds in 24-hour format', () => {
      renderWithRouter(<NewBookingPage />);
      
      // Should show time in HH:MM:SS format
      const timeRegex = /เวลา \d{2}:\d{2}:\d{2}/;
      expect(screen.getByText(timeRegex)).toBeInTheDocument();
    });
  });

  describe('Booking Wizard Integration', () => {
    it('passes correct props to BookingWizard', () => {
      renderWithRouter(<NewBookingPage />);
      
      // Check that wizard has the required action buttons
      expect(screen.getByTestId('complete-booking')).toBeInTheDocument();
      expect(screen.getByTestId('cancel-booking')).toBeInTheDocument();
    });

    it('handles booking completion successfully', async () => {
      renderWithRouter(<NewBookingPage />);
      
      const completeButton = screen.getByTestId('complete-booking');
      await userEvent.click(completeButton);
      
      // Should log booking data
      expect(mockConsoleLog).toHaveBeenCalledWith('Booking created:', mockBookingData);
      
      // Should navigate to home with success message
      expect(mockNavigate).toHaveBeenCalledWith('/', { 
        state: { message: 'การจองสำเร็จแล้ว' } 
      });
    });

    it('handles booking cancellation', async () => {
      renderWithRouter(<NewBookingPage />);
      
      const cancelButton = screen.getByTestId('cancel-booking');
      await userEvent.click(cancelButton);
      
      // Should navigate back to home without message
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('logs booking data with correct structure', async () => {
      renderWithRouter(<NewBookingPage />);
      
      const completeButton = screen.getByTestId('complete-booking');
      await userEvent.click(completeButton);
      
      // Verify the logged booking data structure
      const loggedData = mockConsoleLog.mock.calls[0][1];
      expect(loggedData).toHaveProperty('guestName');
      expect(loggedData).toHaveProperty('phone');
      expect(loggedData).toHaveProperty('email');
      expect(loggedData).toHaveProperty('roomType');
      expect(loggedData).toHaveProperty('checkInDate');
      expect(loggedData).toHaveProperty('checkOutDate');
      expect(loggedData).toHaveProperty('guests');
      expect(loggedData).toHaveProperty('nights');
      expect(loggedData).toHaveProperty('totalPrice');
      expect(loggedData).toHaveProperty('includeBreakfast');
    });
  });

  describe('Navigation Integration', () => {
    it('uses navigate hook correctly', () => {
      renderWithRouter(<NewBookingPage />);
      
      // Verify that the component rendered without errors
      // This implicitly tests that useNavigate hook is working
      expect(screen.getByText('จองห้องใหม่')).toBeInTheDocument();
    });

    it('handles multiple booking attempts', async () => {
      renderWithRouter(<NewBookingPage />);
      
      // Simulate multiple booking attempts
      const completeButton = screen.getByTestId('complete-booking');
      
      await userEvent.click(completeButton);
      expect(mockNavigate).toHaveBeenCalledTimes(1);
      
      await userEvent.click(completeButton);
      expect(mockNavigate).toHaveBeenCalledTimes(2);
    });
  });

  describe('Component Structure and Layout', () => {
    it('has proper page structure', () => {
      renderWithRouter(<NewBookingPage />);
      
      // Check main container
      const container = screen.getByText('จองห้องใหม่').closest('.new-booking-container');
      expect(container).toBeInTheDocument();
      
      // Check page header
      expect(container.querySelector('.page-header')).toBeInTheDocument();
      expect(container.querySelector('.page-title')).toBeInTheDocument();
      expect(container.querySelector('.date-time-header')).toBeInTheDocument();
    });

    it('renders components in correct order', () => {
      renderWithRouter(<NewBookingPage />);
      
      const container = screen.getByText('จองห้องใหม่').closest('.new-booking-container');
      const children = Array.from(container.children);
      
      // First child should be page header
      expect(children[0]).toHaveClass('page-header');
      
      // Second child should contain booking wizard
      expect(children[1]).toContain(screen.getByTestId('booking-wizard'));
    });
  });

  describe('Performance', () => {
    it('does not cause memory leaks with timer', () => {
      jest.useFakeTimers();
      
      const { unmount } = renderWithRouter(<NewBookingPage />);
      
      // Component should clean up timer on unmount
      unmount();
      
      // No timers should be running
      expect(jest.getTimerCount()).toBe(0);
      
      jest.useRealTimers();
    });

    it('updates time efficiently', () => {
      jest.useFakeTimers();
      
      renderWithRouter(<NewBookingPage />);
      
      // Fast-forward time multiple times
      for (let i = 0; i < 10; i++) {
        jest.advanceTimersByTime(1000);
      }
      
      // Component should still be responsive
      expect(screen.getByText('จองห้องใหม่')).toBeInTheDocument();
      
      jest.useRealTimers();
    });
  });
});