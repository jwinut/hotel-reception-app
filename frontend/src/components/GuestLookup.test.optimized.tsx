// src/components/GuestLookup.test.optimized.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import GuestLookup from './GuestLookup';
import type { Booking, BookingStatus } from '../types';

// OPTIMIZATION 1: Simpler mock implementation
jest.mock('../utils/validation', () => ({
  sanitizeInput: (input: string) => input ? input.trim() : ''
}));

// OPTIMIZATION 2: Minimal mock data
const createMockBooking = (id: string, guestName: string, status: BookingStatus, checkInDate: string): Booking => ({
  id,
  guestName,
  status,
  checkInDate,
  phone: '0812345678',
  email: 'test@email.com',
  roomNumber: '101',
  roomType: 'Standard',
  checkOutDate: '2024-01-17',
  guests: 2,
  nights: 2,
  totalPrice: 3000,
  createdAt: '2024-01-10T10:00:00Z',
  updatedAt: '2024-01-10T10:00:00Z'
});

const mockBookings = [
  createMockBooking('BK001', 'สมชาย ใจดี', 'confirmed', '2024-01-15'),
  createMockBooking('BK002', 'วินัย รักษ์ดี', 'arriving_today', new Date().toISOString().split('T')[0]!)
];

describe('GuestLookup Component - Optimized', () => {
  const defaultProps = {
    bookings: mockBookings,
    onBookingSelect: jest.fn(),
    isLoading: false
  };

  // OPTIMIZATION 3: Minimal beforeEach
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // OPTIMIZATION 4: Use fake timers for debouncing
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe('Basic Rendering', () => {
    it('renders component with main sections', () => {
      render(<GuestLookup {...defaultProps} />);
      
      expect(screen.getByText('ค้นหาการจอง')).toBeInTheDocument();
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });
  });

  describe('Search Functionality - Optimized', () => {
    it('shows search suggestions when typing', () => {
      render(<GuestLookup {...defaultProps} />);

      const searchInput = screen.getByRole('textbox');
      
      // OPTIMIZATION 5: Use fireEvent instead of userEvent
      fireEvent.change(searchInput, { target: { value: 'สมชาย' } });
      fireEvent.focus(searchInput);
      
      // OPTIMIZATION 6: Fast-forward timers instead of waiting
      jest.runAllTimers();

      expect(screen.getByRole('listbox')).toBeInTheDocument();
      expect(screen.getByText('สมชาย ใจดี')).toBeInTheDocument();
    });

    it('filters bookings by phone number', () => {
      render(<GuestLookup {...defaultProps} />);

      const searchInput = screen.getByRole('textbox');
      fireEvent.change(searchInput, { target: { value: '0812345678' } });
      fireEvent.focus(searchInput);
      
      jest.runAllTimers();

      expect(screen.getByText('สมชาย ใจดี')).toBeInTheDocument();
    });

    it('handles clear search', () => {
      render(<GuestLookup {...defaultProps} />);

      const searchInput = screen.getByRole('textbox');
      fireEvent.change(searchInput, { target: { value: 'test' } });
      
      const clearButton = screen.getByRole('button', { name: 'ล้างคำค้นหา' });
      fireEvent.click(clearButton);

      expect(searchInput).toHaveValue('');
    });
  });

  describe('Booking Selection', () => {
    it('calls onBookingSelect when suggestion is clicked', () => {
      const mockOnBookingSelect = jest.fn();
      render(<GuestLookup {...defaultProps} onBookingSelect={mockOnBookingSelect} />);

      const searchInput = screen.getByRole('textbox');
      fireEvent.change(searchInput, { target: { value: 'สมชาย' } });
      fireEvent.focus(searchInput);
      
      jest.runAllTimers();

      const suggestionItem = screen.getByRole('button', { 
        name: /เลือกการจองของ สมชาย ใจดี/ 
      });
      fireEvent.click(suggestionItem);

      expect(mockOnBookingSelect).toHaveBeenCalledWith(mockBookings[0]);
    });

    it('handles keyboard selection', () => {
      const mockOnBookingSelect = jest.fn();
      render(<GuestLookup {...defaultProps} onBookingSelect={mockOnBookingSelect} />);

      const searchInput = screen.getByRole('textbox');
      fireEvent.change(searchInput, { target: { value: 'สมชาย' } });
      fireEvent.focus(searchInput);
      
      jest.runAllTimers();

      const suggestionItem = screen.getByRole('button', { 
        name: /เลือกการจองของ สมชาย ใจดี/ 
      });
      fireEvent.keyDown(suggestionItem, { key: 'Enter' });

      expect(mockOnBookingSelect).toHaveBeenCalledWith(mockBookings[0]);
    });
  });

  describe('Loading State', () => {
    it('shows loading spinner', () => {
      render(<GuestLookup {...defaultProps} isLoading={true} />);

      const searchInput = screen.getByRole('textbox');
      fireEvent.change(searchInput, { target: { value: 'test' } });
      fireEvent.focus(searchInput);
      
      jest.runAllTimers();

      expect(screen.getByText('กำลังค้นหา...')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty bookings array', () => {
      render(<GuestLookup {...defaultProps} bookings={[]} />);
      expect(screen.getByText('ค้นหาการจอง')).toBeInTheDocument();
    });

    it('handles no search results', () => {
      render(<GuestLookup {...defaultProps} />);

      const searchInput = screen.getByRole('textbox');
      fireEvent.change(searchInput, { target: { value: 'nonexistent' } });
      fireEvent.focus(searchInput);
      
      jest.runAllTimers();

      expect(screen.getByText('ไม่พบการจองที่ตรงกับคำค้นหา')).toBeInTheDocument();
    });
  });
});