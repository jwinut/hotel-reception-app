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

// Simple mock for BookingWizard
jest.mock('./components/BookingWizard', () => {
  function MockBookingWizard({ onComplete, onCancel }) {
    const mockData = {
      guestName: 'John Doe',
      phone: '081-234-5678',
      roomType: 'Standard',
      totalPrice: 2400
    };

    return (
      <div data-testid="booking-wizard">
        <h2>Booking Wizard</h2>
        <button onClick={() => onComplete(mockData)} data-testid="complete-booking">
          Complete
        </button>
        <button onClick={onCancel} data-testid="cancel-booking">
          Cancel
        </button>
      </div>
    );
  }
  return MockBookingWizard;
});

// Mock console.log
const mockConsoleLog = jest.fn();

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

  describe('Basic Rendering', () => {
    it('renders the page with correct title', () => {
      renderWithRouter(<NewBookingPage />);
      
      expect(screen.getByText('จองห้องใหม่')).toBeInTheDocument();
    });

    it('displays current date and time', () => {
      renderWithRouter(<NewBookingPage />);
      
      // Check for Thai date format with Buddhist era  
      expect(screen.getByText(/วัน.+2568/)).toBeInTheDocument();
      
      // Check for time display with seconds
      expect(screen.getByText(/เวลา \d{2}:\d{2}:\d{2}/)).toBeInTheDocument();
    });

    it('renders booking wizard component', () => {
      renderWithRouter(<NewBookingPage />);
      
      expect(screen.getByTestId('booking-wizard')).toBeInTheDocument();
      expect(screen.getByText('Booking Wizard')).toBeInTheDocument();
    });
  });

  describe('Time Update Functionality', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('cleans up timer on unmount', () => {
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
      
      const { unmount } = renderWithRouter(<NewBookingPage />);
      
      unmount();
      
      expect(clearIntervalSpy).toHaveBeenCalled();
      
      clearIntervalSpy.mockRestore();
    });
  });

  describe('Booking Wizard Integration', () => {
    it('handles booking completion successfully', async () => {
      renderWithRouter(<NewBookingPage />);
      
      const completeButton = screen.getByTestId('complete-booking');
      await userEvent.click(completeButton);
      
      // Should log booking data
      expect(mockConsoleLog).toHaveBeenCalledWith('Booking created:', expect.objectContaining({
        guestName: 'John Doe',
        phone: '081-234-5678',
        roomType: 'Standard'
      }));
      
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
  });

  describe('Component Structure', () => {
    it('has proper page structure', () => {
      renderWithRouter(<NewBookingPage />);
      
      // Check main container
      const container = screen.getByText('จองห้องใหม่').closest('.new-booking-container');
      expect(container).toBeInTheDocument();
      
      // Check page header
      expect(container.querySelector('.page-header')).toBeInTheDocument();
    });
  });
});