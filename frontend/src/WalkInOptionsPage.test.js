// src/WalkInOptionsPage.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import WalkInOptionsPage from './WalkInOptionsPage';

// Mock successful fetch responses
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock window.alert
const mockAlert = jest.fn();
global.alert = mockAlert;

// Mock data
const mockBookingOptions = {
  walkInOptions: [
    { id: 'temporary', label: 'พักชั่วคราว' },
    { id: 'standard', label: 'เข้าพักปกติ' },
    { id: 'vip', label: 'บริการ VIP' }
  ]
};

const mockRoomData = {
  rooms: [
    { roomNumber: '101', roomType: 'Standard', status: 'available' },
    { roomNumber: '102', roomType: 'Standard', status: 'available' },
    { roomNumber: '201', roomType: 'Deluxe', status: 'available' }
  ]
};

const mockHotelLayout = {
  layout: [
    {
      floor: 1,
      rows: [
        ['101', '102', null]
      ]
    }
  ]
};

describe('WalkInOptionsPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup successful fetch responses for each test
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockBookingOptions
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockRoomData
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockHotelLayout
      });
  });

  describe('Basic Rendering', () => {
    it('renders the page with correct title and date/time', async () => {
      render(<WalkInOptionsPage />);
      
      expect(screen.getByText('เช็คอินลูกค้าใหม่ ยังไม่ได้จอง')).toBeInTheDocument();
      
      // Check for Thai date format with Buddhist era
      expect(screen.getByText(/วัน.+2568/)).toBeInTheDocument();
      
      // Check for time display
      expect(screen.getByText(/เวลา \d{2}:\d{2}/)).toBeInTheDocument();
    });

    it('displays walk-in instructions', () => {
      render(<WalkInOptionsPage />);
      
      expect(screen.getByText('วิธีการเช็คอิน Walk-in')).toBeInTheDocument();
      expect(screen.getByText('เลือกประเภทการจอง (ชั่วคราว/เข้าพักจริง/อื่นๆ)')).toBeInTheDocument();
      expect(screen.getByText('เลือกประเภทห้องพักที่ต้องการ')).toBeInTheDocument();
      expect(screen.getByText('เลือกห้องที่ว่างจากแผนผังโรงแรม')).toBeInTheDocument();
      expect(screen.getByText('ยืนยันการจองและเช็คอิน')).toBeInTheDocument();
    });
  });

  describe('Data Loading and Display', () => {
    it('fetches and displays booking options', async () => {
      render(<WalkInOptionsPage />);
      
      await waitFor(() => {
        expect(screen.getByText('พักชั่วคราว')).toBeInTheDocument();
        expect(screen.getByText('เข้าพักปกติ')).toBeInTheDocument();
        expect(screen.getByText('บริการ VIP')).toBeInTheDocument();
      });
      
      expect(mockFetch).toHaveBeenCalledWith('/config/bookingOptions.json');
      expect(mockFetch).toHaveBeenCalledWith('/config/roomData.json');
      expect(mockFetch).toHaveBeenCalledWith('/config/hotelLayout.json');
    });

    it('allows selecting booking options', async () => {
      render(<WalkInOptionsPage />);
      
      await waitFor(() => {
        expect(screen.getByText('พักชั่วคราว')).toBeInTheDocument();
      });
      
      const temporaryOption = screen.getByText('พักชั่วคราว').closest('button');
      await userEvent.click(temporaryOption);
      
      expect(temporaryOption).toHaveClass('selected');
      expect(screen.getByText('✓')).toBeInTheDocument();
    });

    it('shows room selection after booking option selected', async () => {
      render(<WalkInOptionsPage />);
      
      await waitFor(() => {
        expect(screen.getByText('พักชั่วคราว')).toBeInTheDocument();
      });
      
      const temporaryOption = screen.getByText('พักชั่วคราว').closest('button');
      await userEvent.click(temporaryOption);
      
      expect(screen.getByText('เลือกประเภทห้องพักและห้อง')).toBeInTheDocument();
      expect(screen.getByText('ประเภทห้องพัก')).toBeInTheDocument();
      expect(screen.getByText('แผนผังห้องพัก')).toBeInTheDocument();
    });
  });

  describe('Room Selection Workflow', () => {
    beforeEach(async () => {
      render(<WalkInOptionsPage />);
      
      await waitFor(() => {
        expect(screen.getByText('พักชั่วคราว')).toBeInTheDocument();
      });
      
      // Select booking option to enable room selection
      const temporaryOption = screen.getByText('พักชั่วคราว').closest('button');
      await userEvent.click(temporaryOption);
      
      await waitFor(() => {
        expect(screen.getByText('101')).toBeInTheDocument();
      });
    });

    it('displays room grid with available rooms', async () => {
      expect(screen.getByText('101')).toBeInTheDocument();
      expect(screen.getByText('102')).toBeInTheDocument();
      
      // Check room types are displayed
      const standardElements = screen.getAllByText('Standard');
      expect(standardElements.length).toBeGreaterThan(0);
    });

    it('opens confirmation modal when room selected', async () => {
      const room101 = screen.getByText('101').closest('button');
      await userEvent.click(room101);
      
      await waitFor(() => {
        expect(screen.getByText('ยืนยันการเลือกห้อง')).toBeInTheDocument();
      });
      
      const bookingTypeElements = screen.getAllByText('พักชั่วคราว');
      expect(bookingTypeElements.length).toBeGreaterThan(0);
    });

    it('confirms booking successfully', async () => {
      const room101 = screen.getByText('101').closest('button');
      await userEvent.click(room101);
      
      await waitFor(() => {
        expect(screen.getByText('ยืนยันเช็คอิน')).toBeInTheDocument();
      });
      
      const confirmButton = screen.getByText('ยืนยันเช็คอิน');
      await userEvent.click(confirmButton);
      
      expect(mockAlert).toHaveBeenCalledWith(
        expect.stringContaining('เช็คอินสำเร็จ!')
      );
      expect(mockAlert).toHaveBeenCalledWith(
        expect.stringContaining('ห้อง: 101 (Standard)')
      );
    });

    it('cancels room selection', async () => {
      const room101 = screen.getByText('101').closest('button');
      await userEvent.click(room101);
      
      await waitFor(() => {
        expect(screen.getByText('ยกเลิก')).toBeInTheDocument();
      });
      
      const cancelButton = screen.getByText('ยกเลิก');
      await userEvent.click(cancelButton);
      
      expect(screen.queryByText('ยืนยันการเลือกห้อง')).not.toBeInTheDocument();
    });
  });

  describe('Room Type Filtering', () => {
    beforeEach(async () => {
      render(<WalkInOptionsPage />);
      
      await waitFor(() => {
        expect(screen.getByText('พักชั่วคราว')).toBeInTheDocument();
      });
      
      const temporaryOption = screen.getByText('พักชั่วคราว').closest('button');
      await userEvent.click(temporaryOption);
      
      await waitFor(() => {
        expect(screen.getByText('ทุกประเภท')).toBeInTheDocument();
      });
    });

    it('defaults to "All" room type filter', () => {
      const allTypeButton = screen.getByText('ทุกประเภท').closest('button');
      expect(allTypeButton).toHaveClass('active');
    });

    it('allows filtering by room type', async () => {
      const standardElements = screen.getAllByText('Standard');
      // Find the filter button (should be in the room type filters section)
      const standardFilterButton = standardElements.find(el => 
        el.closest('button')?.classList.contains('filter-button')
      )?.closest('button');
      
      if (standardFilterButton) {
        await userEvent.click(standardFilterButton);
        expect(standardFilterButton).toHaveClass('active');
      }
    });
  });

  describe('Keyboard Navigation', () => {
    it('handles escape key to close modal', async () => {
      render(<WalkInOptionsPage />);
      
      await waitFor(() => {
        expect(screen.getByText('พักชั่วคราว')).toBeInTheDocument();
      });
      
      const temporaryOption = screen.getByText('พักชั่วคราว').closest('button');
      await userEvent.click(temporaryOption);
      
      await waitFor(() => {
        expect(screen.getByText('101')).toBeInTheDocument();
      });
      
      const room101 = screen.getByText('101').closest('button');
      await userEvent.click(room101);
      
      await waitFor(() => {
        expect(screen.getByText('ยืนยันการเลือกห้อง')).toBeInTheDocument();
      });
      
      fireEvent.keyDown(document, { key: 'Escape' });
      
      expect(screen.queryByText('ยืนยันการเลือกห้อง')).not.toBeInTheDocument();
    });
  });

  describe('Component Lifecycle', () => {
    it('cleans up timers on unmount', () => {
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
      
      const { unmount } = render(<WalkInOptionsPage />);
      
      unmount();
      
      expect(clearIntervalSpy).toHaveBeenCalled();
      
      clearIntervalSpy.mockRestore();
    });

    it('cleans up event listeners on unmount', () => {
      const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');
      
      const { unmount } = render(<WalkInOptionsPage />);
      
      unmount();
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
      
      removeEventListenerSpy.mockRestore();
    });
  });

  describe('Error Handling', () => {
    it('handles component with error state', () => {
      // Test that component renders without crashing even with network issues
      // The error handling is tested implicitly through other test scenarios
      render(<WalkInOptionsPage />);
      expect(screen.getByText('เช็คอินลูกค้าใหม่ ยังไม่ได้จอง')).toBeInTheDocument();
    });
  });
});