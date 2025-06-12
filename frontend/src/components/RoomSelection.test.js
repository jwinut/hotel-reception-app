// src/components/RoomSelection.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RoomSelection from './RoomSelection';

// Mock fetch for config files
const mockRoomData = {
  rooms: [
    { roomNumber: '301', roomType: 'Standard', floor: 3 },
    { roomNumber: '302', roomType: 'Standard', floor: 3 },
    { roomNumber: '401', roomType: 'Superior', floor: 4 },
    { roomNumber: '402', roomType: 'Deluxe', floor: 4 },
    { roomNumber: '501', roomType: 'Family', floor: 5 },
  ]
};

const mockHotelLayout = {
  layout: [
    {
      floor: 3,
      rows: [
        ['301', '302', null],
        [null, null, null]
      ]
    },
    {
      floor: 4,
      rows: [
        ['401', '402', null],
        [null, null, null]
      ]
    }
  ]
};

const mockPriceData = {
  prices: [
    { roomType: 'Standard', noBreakfast: 1000, withBreakfast: 1200 },
    { roomType: 'Superior', noBreakfast: 1500, withBreakfast: 1700 },
    { roomType: 'Deluxe', noBreakfast: 2000, withBreakfast: 2300 },
    { roomType: 'Family', noBreakfast: 2500, withBreakfast: 2800 }
  ]
};

// Mock fetch API
global.fetch = jest.fn();

// Mock data for props
const mockGuestData = {
  firstName: 'John',
  lastName: 'Doe',
  numGuests: 2,
  phone: '081-234-5678',
  email: 'john@test.com'
};

const mockDatesData = {
  checkInDate: '2024-12-15',
  checkOutDate: '2024-12-17',
  nights: 2,
  includeBreakfast: false
};

describe('RoomSelection Component', () => {
  const mockOnComplete = jest.fn();
  const mockOnBack = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup fetch mock to return our mock data
    fetch.mockImplementation((url) => {
      let data;
      if (url.includes('roomData.json')) {
        data = mockRoomData;
      } else if (url.includes('hotelLayout.json')) {
        data = mockHotelLayout;
      } else if (url.includes('priceData.json')) {
        data = mockPriceData;
      }
      
      return Promise.resolve({
        json: () => Promise.resolve(data)
      });
    });
  });

  afterEach(() => {
    fetch.mockRestore();
  });

  const defaultProps = {
    initialData: {},
    guestData: mockGuestData,
    datesData: mockDatesData,
    onComplete: mockOnComplete,
    onBack: mockOnBack,
    onCancel: mockOnCancel
  };

  describe('Loading State', () => {
    it('shows loading state initially', () => {
      render(<RoomSelection {...defaultProps} />);
      
      expect(screen.getByText('กำลังโหลดข้อมูลห้องพัก...')).toBeInTheDocument();
      expect(document.querySelector('.loading-spinner')).toBeInTheDocument();
    });
  });

  describe('Data Loading', () => {
    it('loads and displays room data correctly', async () => {
      render(<RoomSelection {...defaultProps} />);
      
      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.getByText('เลือกห้องพัก')).toBeInTheDocument();
      });

      // Check that guest information is displayed (text might be split)
      expect(screen.getByText('John')).toBeInTheDocument();
      expect(screen.getByText('Doe')).toBeInTheDocument();
      expect(screen.getByText('(2 คน)')).toBeInTheDocument();
      expect(screen.getByText('2 คืน • ไม่รวมอาหารเช้า')).toBeInTheDocument();
    });

    it('displays room type filters', async () => {
      render(<RoomSelection {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('ประเภทห้องพัก')).toBeInTheDocument();
      });

      // Check that all room types are displayed
      expect(screen.getByText('All')).toBeInTheDocument();
      expect(screen.getByText('Standard')).toBeInTheDocument();
      expect(screen.getByText('Superior')).toBeInTheDocument();
      expect(screen.getByText('Deluxe')).toBeInTheDocument();
      expect(screen.getByText('Family')).toBeInTheDocument();
    });

    it('displays room grid with correct floors', async () => {
      render(<RoomSelection {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('ชั้น 3')).toBeInTheDocument();
        expect(screen.getByText('ชั้น 4')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('displays error state when fetch fails', async () => {
      // Mock fetch to fail
      fetch.mockRejectedValueOnce(new Error('Network error'));
      
      render(<RoomSelection {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('ไม่สามารถโหลดข้อมูลห้องพักได้ กรุณาลองใหม่อีกครั้ง')).toBeInTheDocument();
      });

      // Should have back button in error state
      expect(screen.getByText('ย้อนกลับ')).toBeInTheDocument();
    });

    it('calls onBack when back button is clicked in error state', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));
      
      render(<RoomSelection {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('ไม่สามารถโหลดข้อมูลห้องพักได้ กรุณาลองใหม่อีกครั้ง')).toBeInTheDocument();
      });

      const backButton = screen.getByText('ย้อนกลับ');
      fireEvent.click(backButton);
      
      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });
  });

  describe('Room Type Filtering', () => {
    it('filters rooms by type when type button is clicked', async () => {
      render(<RoomSelection {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('Standard')).toBeInTheDocument();
      });

      // Click on Standard filter
      const standardButton = screen.getByRole('button', { name: 'Standard' });
      fireEvent.click(standardButton);

      // Standard button should be active
      expect(standardButton).toHaveClass('active');
    });

    it('shows all rooms when "All" filter is selected', async () => {
      render(<RoomSelection {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('All')).toBeInTheDocument();
      });

      // Click on All filter (should be default)
      const allButton = screen.getByRole('button', { name: 'All' });
      expect(allButton).toHaveClass('active');
    });
  });

  describe('Room Selection', () => {
    it('allows selecting available rooms', async () => {
      render(<RoomSelection {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('301')).toBeInTheDocument();
      });

      // Find and click an available room (301 should be available, 302 is booked in mock)
      const room301 = screen.getByText('301').closest('button');
      expect(room301).not.toBeDisabled();
      
      fireEvent.click(room301);
      
      // Room should be selected
      expect(room301).toHaveClass('selected');
      expect(screen.getByText('✓')).toBeInTheDocument();
    });

    it('shows booked rooms as unavailable', async () => {
      render(<RoomSelection {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('302')).toBeInTheDocument();
      });

      // Room 302 should be marked as booked (302 is in mock bookedRooms)
      const room302Element = screen.getByText('302');
      const room302 = room302Element.closest('button');
      expect(room302).toHaveClass('booked');
      expect(room302).toBeDisabled();
      
      // Check that there is a "จองแล้ว" status somewhere on the page for booked rooms
      const bookedStatusElements = screen.getAllByText('จองแล้ว');
      expect(bookedStatusElements.length).toBeGreaterThan(0);
    });

    it('prevents selection of booked rooms', async () => {
      render(<RoomSelection {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('302')).toBeInTheDocument();
      });

      // Try to click booked room 302
      const room302 = screen.getByText('302').closest('button');
      fireEvent.click(room302);
      
      // Should not be selected
      expect(room302).not.toHaveClass('selected');
    });
  });

  describe('Room Information Display', () => {
    it('displays room details when room is selected', async () => {
      render(<RoomSelection {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('301')).toBeInTheDocument();
      });

      // Select room 301
      const room301 = screen.getByText('301').closest('button');
      fireEvent.click(room301);
      
      // Should show room type in the button
      expect(room301).toHaveTextContent('Standard');
    });

    it('shows breakfast status correctly in summary', async () => {
      const propsWithBreakfast = {
        ...defaultProps,
        datesData: { ...mockDatesData, includeBreakfast: true }
      };
      
      render(<RoomSelection {...propsWithBreakfast} />);
      
      await waitFor(() => {
        expect(screen.getByText('2 คืน • รวมอาหารเช้า')).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('prevents submission when no room is selected', async () => {
      // Mock alert
      window.alert = jest.fn();
      
      render(<RoomSelection {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('ถัดไป: ยืนยันการจอง')).toBeInTheDocument();
      });

      // Try to submit without selecting room
      const submitButton = screen.getByText('ถัดไป: ยืนยันการจอง');
      fireEvent.click(submitButton);
      
      expect(window.alert).toHaveBeenCalledWith('กรุณาเลือกห้องพัก');
      expect(mockOnComplete).not.toHaveBeenCalled();
      
      window.alert.mockRestore();
    });

    it('submits correct data when room is selected', async () => {
      render(<RoomSelection {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('301')).toBeInTheDocument();
      });

      // Select room 301
      const room301 = screen.getByText('301').closest('button');
      fireEvent.click(room301);
      
      // Submit form
      const submitButton = screen.getByText('ถัดไป: ยืนยันการจอง');
      fireEvent.click(submitButton);
      
      expect(mockOnComplete).toHaveBeenCalledWith({
        roomNumber: '301',
        roomType: 'Standard',
        pricing: {
          basePrice: 1000, // noBreakfast price for Standard
          totalPrice: 2000, // 1000 * 2 nights
          includeBreakfast: false,
          nights: 2
        }
      });
    });

    it('calculates correct price with breakfast', async () => {
      const propsWithBreakfast = {
        ...defaultProps,
        datesData: { ...mockDatesData, includeBreakfast: true }
      };
      
      render(<RoomSelection {...propsWithBreakfast} />);
      
      await waitFor(() => {
        expect(screen.getByText('301')).toBeInTheDocument();
      });

      // Select room 301
      const room301 = screen.getByText('301').closest('button');
      fireEvent.click(room301);
      
      // Submit form
      const submitButton = screen.getByText('ถัดไป: ยืนยันการจอง');
      fireEvent.click(submitButton);
      
      expect(mockOnComplete).toHaveBeenCalledWith({
        roomNumber: '301',
        roomType: 'Standard',
        pricing: {
          basePrice: 1200, // withBreakfast price for Standard
          totalPrice: 2400, // 1200 * 2 nights
          includeBreakfast: true,
          nights: 2
        }
      });
    });
  });

  describe('Navigation Actions', () => {
    it('calls onBack when back button is clicked', async () => {
      render(<RoomSelection {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('← ย้อนกลับ')).toBeInTheDocument();
      });

      const backButton = screen.getByText('← ย้อนกลับ');
      fireEvent.click(backButton);
      
      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });

    it('calls onCancel when cancel button is clicked', async () => {
      render(<RoomSelection {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('ยกเลิก')).toBeInTheDocument();
      });

      const cancelButton = screen.getByText('ยกเลิก');
      fireEvent.click(cancelButton);
      
      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe('Initial Data', () => {
    it('preselects room when initialData contains roomNumber', async () => {
      const propsWithInitialData = {
        ...defaultProps,
        initialData: { roomNumber: '301', roomType: 'Standard' }
      };
      
      render(<RoomSelection {...propsWithInitialData} />);
      
      await waitFor(() => {
        expect(screen.getByText('301')).toBeInTheDocument();
      });

      // Room 301 should be preselected
      const room301 = screen.getByText('301').closest('button');
      expect(room301).toHaveClass('selected');
    });

    it('preselects room type filter when initialData contains roomType', async () => {
      const propsWithInitialData = {
        ...defaultProps,
        initialData: { roomType: 'Standard' }
      };
      
      render(<RoomSelection {...propsWithInitialData} />);
      
      await waitFor(() => {
        expect(screen.getByText('Standard')).toBeInTheDocument();
      });

      // Standard filter should be active
      const standardButton = screen.getByRole('button', { name: 'Standard' });
      expect(standardButton).toHaveClass('active');
    });
  });

  describe('Room Availability Logic', () => {
    it('correctly identifies available vs booked rooms', async () => {
      render(<RoomSelection {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('301')).toBeInTheDocument();
      });

      // Room 301 should be available (not in bookedRooms set)
      const room301 = screen.getByText('301').closest('button');
      expect(room301).toHaveClass('available');
      expect(room301).not.toBeDisabled();

      // Room 302 should be booked (in mock bookedRooms)
      const room302 = screen.getByText('302').closest('button');
      expect(room302).toHaveClass('booked');
      expect(room302).toBeDisabled();
    });
  });

  describe('Price Calculation', () => {
    it('handles missing price data gracefully', async () => {
      // Mock price data without Standard room type
      const incompletePriceData = {
        prices: [
          { roomType: 'Superior', noBreakfast: 1500, withBreakfast: 1700 }
        ]
      };

      fetch.mockImplementation((url) => {
        let data;
        if (url.includes('roomData.json')) {
          data = mockRoomData;
        } else if (url.includes('hotelLayout.json')) {
          data = mockHotelLayout;
        } else if (url.includes('priceData.json')) {
          data = incompletePriceData;
        }
        
        return Promise.resolve({
          json: () => Promise.resolve(data)
        });
      });

      render(<RoomSelection {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('301')).toBeInTheDocument();
      });

      // Select room 301 (Standard type, but no price data)
      const room301 = screen.getByText('301').closest('button');
      fireEvent.click(room301);
      
      // Submit should still work with 0 prices
      const submitButton = screen.getByText('ถัดไป: ยืนยันการจอง');
      fireEvent.click(submitButton);
      
      expect(mockOnComplete).toHaveBeenCalledWith({
        roomNumber: '301',
        roomType: 'Standard',
        pricing: {
          basePrice: 0, // Default when no price data
          totalPrice: 0,
          includeBreakfast: false,
          nights: 2
        }
      });
    });
  });
});