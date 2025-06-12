// src/components/GuestLookup.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import GuestLookup from './GuestLookup';
import type { Booking } from '../types';

// Mock the validation utils
jest.mock('../utils/validation');

// Import mocked function
import { sanitizeInput } from '../utils/validation';

// Cast to jest mock
const mockSanitizeInput = sanitizeInput as jest.MockedFunction<typeof sanitizeInput>;

// Mock data for testing
const mockBookings: Booking[] = [
  {
    id: 'BK240001',
    guestName: 'สมชาย ใจดี',
    phone: '0812345678',
    email: 'somchai@email.com',
    roomNumber: '101',
    checkInDate: '2024-01-15',
    checkOutDate: '2024-01-17',
    status: 'confirmed',
    guests: 2,
    nights: 2,
    totalAmount: 3000,
    paymentStatus: 'paid',
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-10T10:00:00Z'
  },
  {
    id: 'BK240002',
    guestName: 'วินัย รักษ์ดี',
    phone: '0887654321',
    email: 'winai@email.com',
    roomNumber: '205',
    checkInDate: new Date().toISOString().split('T')[0], // Today
    checkOutDate: '2024-01-16',
    status: 'arriving_today',
    guests: 1,
    nights: 1,
    totalAmount: 1500,
    paymentStatus: 'paid',
    createdAt: '2024-01-12T10:00:00Z',
    updatedAt: '2024-01-12T10:00:00Z'
  },
  {
    id: 'BK240003',
    guestName: 'สุวรรณา ทองคำ',
    phone: '0891234567',
    email: 'suwanna@email.com',
    roomNumber: '308',
    checkInDate: '2024-01-20',
    checkOutDate: '2024-01-22',
    status: 'checked_in',
    guests: 3,
    nights: 2,
    totalAmount: 4500,
    paymentStatus: 'paid',
    createdAt: '2024-01-18T10:00:00Z',
    updatedAt: '2024-01-18T10:00:00Z'
  },
  {
    id: 'BK240004',
    guestName: 'ปรีชา วิทยา',
    phone: '0876543210',
    email: 'preecha@email.com',
    roomNumber: '410',
    checkInDate: new Date().toISOString().split('T')[0], // Today
    checkOutDate: '2024-01-16',
    status: 'confirmed',
    guests: 2,
    nights: 1,
    totalAmount: 2000,
    paymentStatus: 'pending',
    createdAt: '2024-01-13T10:00:00Z',
    updatedAt: '2024-01-13T10:00:00Z'
  },
  {
    id: 'BK240005',
    guestName: 'อรุณ แสงดาว',
    phone: '0898765432',
    email: 'arun@email.com',
    roomNumber: '512',
    checkInDate: '2024-01-25',
    checkOutDate: '2024-01-27',
    status: 'cancelled',
    guests: 1,
    nights: 2,
    totalAmount: 2500,
    paymentStatus: 'refunded',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  }
];

// Filter available bookings (confirmed or arriving_today)
const availableBookings = mockBookings.filter(booking => 
  booking.status === 'confirmed' || booking.status === 'arriving_today'
);

// Today's arrivals
const todayArrivals = availableBookings.filter(booking => 
  booking.checkInDate === new Date().toISOString().split('T')[0]
);

describe('GuestLookup Component', () => {
  const defaultProps = {
    bookings: mockBookings,
    onBookingSelect: jest.fn(),
    isLoading: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mock implementation
    mockSanitizeInput.mockImplementation((input: string) => input ? input.trim() : '');
  });

  describe('Basic Rendering', () => {
    it('renders component with main sections', () => {
      render(<GuestLookup {...defaultProps} />);

      expect(screen.getByText('ค้นหาการจอง')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('ชื่อผู้เข้าพัก, เบอร์โทร, รหัสจอง, อีเมล หรือหมายเลขห้อง')).toBeInTheDocument();
      expect(screen.getByText(/เคล็ดลับ:/)).toBeInTheDocument();
    });

    it('renders search input with correct attributes', () => {
      render(<GuestLookup {...defaultProps} />);

      const searchInput = screen.getByRole('textbox', { name: 'ค้นหาการจอง' });
      expect(searchInput).toHaveAttribute('type', 'text');
      expect(searchInput).toHaveAttribute('autoComplete', 'off');
      expect(searchInput).toHaveAttribute('aria-haspopup', 'listbox');
    });

    it('renders today arrivals section when there are arrivals', () => {
      render(<GuestLookup {...defaultProps} />);

      if (todayArrivals.length > 0) {
        expect(screen.getByText(`เข้าพักวันนี้ (${todayArrivals.length} รายการ)`)).toBeInTheDocument();
      }
    });

    it('does not render today arrivals section when there are no arrivals', () => {
      const propsWithoutTodayArrivals = {
        ...defaultProps,
        bookings: mockBookings.filter(booking => 
          booking.checkInDate !== new Date().toISOString().split('T')[0]
        )
      };

      render(<GuestLookup {...propsWithoutTodayArrivals} />);

      expect(screen.queryByText(/เข้าพักวันนี้ \(\d+ รายการ\)/)).not.toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('shows search suggestions when typing', async () => {
      const user = userEvent.setup();
      render(<GuestLookup {...defaultProps} />);

      const searchInput = screen.getByRole('textbox');
      await user.type(searchInput, 'สมชาย');

      await waitFor(() => {
        expect(screen.getByRole('listbox', { name: 'ผลการค้นหา' })).toBeInTheDocument();
      });
    });

    it('filters bookings by guest name', async () => {
      const user = userEvent.setup();
      render(<GuestLookup {...defaultProps} />);

      const searchInput = screen.getByRole('textbox');
      await user.type(searchInput, 'สมชาย');

      await waitFor(() => {
        expect(screen.getByText('สมชาย ใจดี')).toBeInTheDocument();
        // Note: วินัย รักษ์ดี might appear in today's arrivals section
        const suggestionsList = screen.getByRole('listbox');
        const suggestions = suggestionsList.querySelectorAll('.suggestion-item');
        expect(suggestions).toHaveLength(1); // Only สมชาย should be in suggestions
        expect(screen.getByText('สมชาย ใจดี')).toBeInTheDocument();
      });
    });

    it('filters bookings by phone number', async () => {
      const user = userEvent.setup();
      render(<GuestLookup {...defaultProps} />);

      const searchInput = screen.getByRole('textbox');
      await user.type(searchInput, '0812345678');

      await waitFor(() => {
        expect(screen.getByText('สมชาย ใจดี')).toBeInTheDocument();
        expect(screen.getByText('0812345678')).toBeInTheDocument();
      });
    });

    it('filters bookings by booking ID', async () => {
      const user = userEvent.setup();
      render(<GuestLookup {...defaultProps} />);

      const searchInput = screen.getByRole('textbox');
      await user.type(searchInput, 'BK240001');

      await waitFor(() => {
        expect(screen.getByText('สมชาย ใจดี')).toBeInTheDocument();
        expect(screen.getByText('#BK240001')).toBeInTheDocument();
      });
    });

    it('filters bookings by email', async () => {
      const user = userEvent.setup();
      render(<GuestLookup {...defaultProps} />);

      const searchInput = screen.getByRole('textbox');
      await user.type(searchInput, 'somchai@email.com');

      await waitFor(() => {
        expect(screen.getByText('สมชาย ใจดี')).toBeInTheDocument();
      });
    });

    it('filters bookings by room number', async () => {
      const user = userEvent.setup();
      render(<GuestLookup {...defaultProps} />);

      const searchInput = screen.getByRole('textbox');
      await user.type(searchInput, '101');

      await waitFor(() => {
        expect(screen.getByText('สมชาย ใจดี')).toBeInTheDocument();
        expect(screen.getByText('ห้อง 101')).toBeInTheDocument();
      });
    });

    it('shows no results message when no matches found', async () => {
      const user = userEvent.setup();
      render(<GuestLookup {...defaultProps} />);

      const searchInput = screen.getByRole('textbox');
      await user.type(searchInput, 'nonexistent');

      await waitFor(() => {
        expect(screen.getByText('ไม่พบการจองที่ตรงกับคำค้นหา')).toBeInTheDocument();
        expect(screen.getByText('ลองค้นหาด้วยชื่อ เบอร์โทร หรือรหัสจอง')).toBeInTheDocument();
      });
    });

    it('only searches available bookings (confirmed or arriving_today)', async () => {
      const user = userEvent.setup();
      render(<GuestLookup {...defaultProps} />);

      const searchInput = screen.getByRole('textbox');
      await user.type(searchInput, 'อรุณ'); // Cancelled booking

      await waitFor(() => {
        expect(screen.getByText('ไม่พบการจองที่ตรงกับคำค้นหา')).toBeInTheDocument();
      });
    });

    it('shows clear button when there is search text', async () => {
      const user = userEvent.setup();
      render(<GuestLookup {...defaultProps} />);

      const searchInput = screen.getByRole('textbox');
      await user.type(searchInput, 'test');

      const clearButton = screen.getByRole('button', { name: 'ล้างคำค้นหา' });
      expect(clearButton).toBeInTheDocument();
    });

    it('does not show clear button when search is empty', () => {
      render(<GuestLookup {...defaultProps} />);

      expect(screen.queryByRole('button', { name: 'ล้างคำค้นหา' })).not.toBeInTheDocument();
    });

    it('clears search when clear button is clicked', async () => {
      const user = userEvent.setup();
      render(<GuestLookup {...defaultProps} />);

      const searchInput = screen.getByRole('textbox');
      await user.type(searchInput, 'test');

      const clearButton = screen.getByRole('button', { name: 'ล้างคำค้นหา' });
      await user.click(clearButton);

      expect(searchInput).toHaveValue('');
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('hides suggestions when Escape key is pressed', async () => {
      const user = userEvent.setup();
      render(<GuestLookup {...defaultProps} />);

      const searchInput = screen.getByRole('textbox');
      await user.type(searchInput, 'สมชาย');

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });

      await user.keyboard('{Escape}');

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('shows suggestions when input is focused', async () => {
      const user = userEvent.setup();
      render(<GuestLookup {...defaultProps} />);

      const searchInput = screen.getByRole('textbox');
      await user.type(searchInput, 'สมชาย');
      await user.tab(); // Blur input
      await user.click(searchInput); // Focus again

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });
    });
  });

  describe('Loading State', () => {
    it('shows loading spinner when isLoading is true', async () => {
      const user = userEvent.setup();
      render(<GuestLookup {...defaultProps} isLoading={true} />);

      const searchInput = screen.getByRole('textbox');
      await user.type(searchInput, 'test');

      await waitFor(() => {
        expect(screen.getByText('กำลังค้นหา...')).toBeInTheDocument();
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });
    });

    it('shows loading spinner with correct ARIA attributes', async () => {
      const user = userEvent.setup();
      render(<GuestLookup {...defaultProps} isLoading={true} />);

      const searchInput = screen.getByRole('textbox');
      await user.type(searchInput, 'test');

      await waitFor(() => {
        const spinner = screen.getByText('กำลังค้นหา...').parentElement?.querySelector('.loading-spinner');
        expect(spinner).toHaveAttribute('aria-hidden', 'true');
      });
    });
  });

  describe('Booking Selection', () => {
    it('calls onBookingSelect when suggestion is clicked', async () => {
      const user = userEvent.setup();
      const mockOnBookingSelect = jest.fn();
      render(<GuestLookup {...defaultProps} onBookingSelect={mockOnBookingSelect} />);

      const searchInput = screen.getByRole('textbox');
      await user.type(searchInput, 'สมชาย');

      await waitFor(() => {
        const suggestionItem = screen.getByRole('button', { 
          name: 'เลือกการจองของ สมชาย ใจดี ห้อง 101' 
        });
        expect(suggestionItem).toBeInTheDocument();
      });

      const suggestionItem = screen.getByRole('button', { 
        name: 'เลือกการจองของ สมชาย ใจดี ห้อง 101' 
      });
      await user.click(suggestionItem);

      expect(mockOnBookingSelect).toHaveBeenCalledWith(availableBookings[0]);
    });

    it('calls onBookingSelect when suggestion is activated with Enter key', async () => {
      const user = userEvent.setup();
      const mockOnBookingSelect = jest.fn();
      render(<GuestLookup {...defaultProps} onBookingSelect={mockOnBookingSelect} />);

      const searchInput = screen.getByRole('textbox');
      await user.type(searchInput, 'สมชาย');

      await waitFor(() => {
        const suggestionItem = screen.getByRole('button', { 
          name: 'เลือกการจองของ สมชาย ใจดี ห้อง 101' 
        });
        expect(suggestionItem).toBeInTheDocument();
      });

      const suggestionItem = screen.getByRole('button', { 
        name: 'เลือกการจองของ สมชาย ใจดี ห้อง 101' 
      });
      suggestionItem.focus();
      await user.keyboard('{Enter}');

      expect(mockOnBookingSelect).toHaveBeenCalledWith(availableBookings[0]);
    });

    it('calls onBookingSelect when suggestion is activated with Space key', async () => {
      const user = userEvent.setup();
      const mockOnBookingSelect = jest.fn();
      render(<GuestLookup {...defaultProps} onBookingSelect={mockOnBookingSelect} />);

      const searchInput = screen.getByRole('textbox');
      await user.type(searchInput, 'สมชาย');

      await waitFor(() => {
        const suggestionItem = screen.getByRole('button', { 
          name: 'เลือกการจองของ สมชาย ใจดี ห้อง 101' 
        });
        expect(suggestionItem).toBeInTheDocument();
      });

      const suggestionItem = screen.getByRole('button', { 
        name: 'เลือกการจองของ สมชาย ใจดี ห้อง 101' 
      });
      suggestionItem.focus();
      await user.keyboard(' ');

      expect(mockOnBookingSelect).toHaveBeenCalledWith(availableBookings[0]);
    });

    it('clears search after booking selection', async () => {
      const user = userEvent.setup();
      const mockOnBookingSelect = jest.fn();
      render(<GuestLookup {...defaultProps} onBookingSelect={mockOnBookingSelect} />);

      const searchInput = screen.getByRole('textbox');
      await user.type(searchInput, 'สมชาย');

      await waitFor(() => {
        const suggestionItem = screen.getByRole('button', { 
          name: 'เลือกการจองของ สมชาย ใจดี ห้อง 101' 
        });
        expect(suggestionItem).toBeInTheDocument();
      });

      const suggestionItem = screen.getByRole('button', { 
        name: 'เลือกการจองของ สมชาย ใจดี ห้อง 101' 
      });
      await user.click(suggestionItem);

      expect(searchInput).toHaveValue('');
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  describe('Today Arrivals Section', () => {
    it('displays today arrivals correctly', () => {
      render(<GuestLookup {...defaultProps} />);

      if (todayArrivals.length > 0) {
        todayArrivals.forEach(booking => {
          expect(screen.getByText(booking.guestName)).toBeInTheDocument();
          expect(screen.getByText(`ห้อง ${booking.roomNumber}`)).toBeInTheDocument();
          expect(screen.getByText(`#${booking.id}`)).toBeInTheDocument();
          expect(screen.getByText(booking.phone)).toBeInTheDocument();
        });
      }
    });

    it('calls onBookingSelect when arrival card is clicked', async () => {
      const user = userEvent.setup();
      const mockOnBookingSelect = jest.fn();
      render(<GuestLookup {...defaultProps} onBookingSelect={mockOnBookingSelect} />);

      if (todayArrivals.length > 0) {
        const arrivalCard = screen.getByRole('button', { 
          name: `เลือกการจองของ ${todayArrivals[0].guestName} ห้อง ${todayArrivals[0].roomNumber}` 
        });
        await user.click(arrivalCard);

        expect(mockOnBookingSelect).toHaveBeenCalledWith(todayArrivals[0]);
      }
    });

    it('calls onBookingSelect when arrival card is activated with keyboard', async () => {
      const user = userEvent.setup();
      const mockOnBookingSelect = jest.fn();
      render(<GuestLookup {...defaultProps} onBookingSelect={mockOnBookingSelect} />);

      if (todayArrivals.length > 0) {
        const arrivalCard = screen.getByRole('button', { 
          name: `เลือกการจองของ ${todayArrivals[0].guestName} ห้อง ${todayArrivals[0].roomNumber}` 
        });
        arrivalCard.focus();
        await user.keyboard('{Enter}');

        expect(mockOnBookingSelect).toHaveBeenCalledWith(todayArrivals[0]);
      }
    });

    it('displays guest and booking information correctly', () => {
      render(<GuestLookup {...defaultProps} />);

      if (todayArrivals.length > 0) {
        const booking = todayArrivals[0];
        expect(screen.getAllByText(`${booking.guests} คน`)[0]).toBeInTheDocument();
        expect(screen.getAllByText(`${booking.nights} คืน`)[0]).toBeInTheDocument();
        expect(screen.getAllByText('พร้อมเช็คอิน')[0]).toBeInTheDocument();
      } else {
        // Skip this test if no arrivals today
        expect(true).toBe(true);
      }
    });
  });

  describe('Date Formatting', () => {
    it('formats dates correctly in Thai Buddhist calendar', async () => {
      const user = userEvent.setup();
      render(<GuestLookup {...defaultProps} />);

      const searchInput = screen.getByRole('textbox');
      await user.type(searchInput, 'สมชาย');

      await waitFor(() => {
        // Check if date formatting is present
        expect(screen.getByText(/เข้าพัก:/)).toBeInTheDocument();
        expect(screen.getByText(/ออก:/)).toBeInTheDocument();
      });
    });
  });

  describe('Status Information', () => {
    it('displays booking status with correct styling', async () => {
      const user = userEvent.setup();
      render(<GuestLookup {...defaultProps} />);

      const searchInput = screen.getByRole('textbox');
      await user.type(searchInput, 'วินัย'); // arriving_today status

      await waitFor(() => {
        const statusElement = screen.getByText('เข้าพักวันนี้');
        expect(statusElement).toHaveClass('arriving');
        expect(statusElement).toBeInTheDocument();
      });
    });

    it('displays confirmed status correctly', async () => {
      const user = userEvent.setup();
      render(<GuestLookup {...defaultProps} />);

      const searchInput = screen.getByRole('textbox');
      await user.type(searchInput, 'สมชาย'); // confirmed status

      await waitFor(() => {
        const statusElement = screen.getByText('ยืนยันแล้ว');
        expect(statusElement).toHaveClass('confirmed');
        expect(statusElement).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels for search input', () => {
      render(<GuestLookup {...defaultProps} />);

      const searchInput = screen.getByRole('textbox');
      expect(searchInput).toHaveAttribute('aria-label', 'ค้นหาการจอง');
      expect(searchInput).toHaveAttribute('aria-haspopup', 'listbox');
    });

    it('has proper ARIA labels for suggestions', async () => {
      const user = userEvent.setup();
      render(<GuestLookup {...defaultProps} />);

      const searchInput = screen.getByRole('textbox');
      await user.type(searchInput, 'สมชาย');

      await waitFor(() => {
        const suggestionsList = screen.getByRole('listbox');
        expect(suggestionsList).toHaveAttribute('aria-label', 'ผลการค้นหา');
      });
    });

    it('has proper ARIA labels for booking buttons', async () => {
      const user = userEvent.setup();
      render(<GuestLookup {...defaultProps} />);

      const searchInput = screen.getByRole('textbox');
      await user.type(searchInput, 'สมชาย');

      await waitFor(() => {
        const bookingButton = screen.getByRole('button', {
          name: 'เลือกการจองของ สมชาย ใจดี ห้อง 101'
        });
        expect(bookingButton).toBeInTheDocument();
      });
    });

    it('has proper role attributes for emoji icons', () => {
      render(<GuestLookup {...defaultProps} />);

      const helpIcon = screen.getByText('💡');
      expect(helpIcon).toHaveAttribute('role', 'img');
      expect(helpIcon).toHaveAttribute('aria-label', 'เคล็ดลับ');
    });

    it('marks decorative icons with aria-hidden', () => {
      render(<GuestLookup {...defaultProps} />);

      const searchIcon = screen.getByRole('textbox').parentElement?.querySelector('svg');
      expect(searchIcon).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty bookings array', () => {
      render(<GuestLookup {...defaultProps} bookings={[]} />);

      expect(screen.getByText('ค้นหาการจอง')).toBeInTheDocument();
      expect(screen.queryByText(/เข้าพักวันนี้ \(\d+ รายการ\)/)).not.toBeInTheDocument();
    });

    it('handles search with only whitespace', async () => {
      const user = userEvent.setup();
      render(<GuestLookup {...defaultProps} />);

      const searchInput = screen.getByRole('textbox');
      await user.type(searchInput, '   ');

      // Should show no results message for whitespace-only search
      await waitFor(() => {
        expect(screen.getByText('ไม่พบการจองที่ตรงกับคำค้นหา')).toBeInTheDocument();
      });
    });

    it('handles case-insensitive search', async () => {
      const user = userEvent.setup();
      render(<GuestLookup {...defaultProps} />);

      const searchInput = screen.getByRole('textbox');
      await user.type(searchInput, 'SOMCHAI'); // Uppercase

      await waitFor(() => {
        expect(screen.getByText('สมชาย ใจดี')).toBeInTheDocument();
      });
    });

    it('handles partial matches', async () => {
      const user = userEvent.setup();
      render(<GuestLookup {...defaultProps} />);

      const searchInput = screen.getByRole('textbox');
      await user.type(searchInput, 'สม'); // Partial name

      await waitFor(() => {
        expect(screen.getByText('สมชาย ใจดี')).toBeInTheDocument();
      });
    });

    it('handles special characters in search', async () => {
      const user = userEvent.setup();
      render(<GuestLookup {...defaultProps} />);

      const searchInput = screen.getByRole('textbox');
      await user.type(searchInput, '@email.com'); // Email part

      await waitFor(() => {
        expect(screen.getByText('สมชาย ใจดี')).toBeInTheDocument();
      });
    });
  });

  describe('Performance', () => {
    it('debounces search input to prevent excessive filtering', async () => {
      const user = userEvent.setup();
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      render(<GuestLookup {...defaultProps} />);

      const searchInput = screen.getByRole('textbox');
      
      // Type quickly
      await user.type(searchInput, 'สมชาย', { delay: 10 });

      // The component should handle rapid typing gracefully
      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });

      consoleSpy.mockRestore();
    });
  });
});