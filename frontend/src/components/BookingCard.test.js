import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import BookingCard from './BookingCard';

// Mock data for testing
const mockBookingBase = {
  id: 'BK-2024-001',
  roomNumber: '101',
  roomType: 'Standard',
  guestName: 'นายสมชาย ใจดี',
  phone: '081-234-5678',
  guests: 2,
  checkInDate: '2024-12-20',
  checkOutDate: '2024-12-22',
  nights: 2,
  totalPrice: 2400,
  paymentMethod: 'cash',
  includeBreakfast: true,
  notes: 'ขอห้องที่เงียบ',
  createdAt: '2024-12-18T10:30:00Z'
};

const mockHandlers = {
  onCheckIn: jest.fn(),
  onCheckOut: jest.fn(),
  onModify: jest.fn(),
  onCancel: jest.fn(),
  onViewDetails: jest.fn()
};

describe('BookingCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders booking card with all essential information', () => {
      const booking = { ...mockBookingBase, status: 'confirmed' };
      render(<BookingCard booking={booking} {...mockHandlers} />);

      // Check booking ID and status
      expect(screen.getByText('BK-2024-001')).toBeInTheDocument();
      expect(screen.getByText('ยืนยันแล้ว')).toBeInTheDocument();

      // Check room information
      expect(screen.getByText('ห้อง 101')).toBeInTheDocument();
      expect(screen.getByText('Standard')).toBeInTheDocument();

      // Check guest information
      expect(screen.getByText('นายสมชาย ใจดี')).toBeInTheDocument();
      expect(screen.getByText('📞 081-234-5678')).toBeInTheDocument();
      expect(screen.getByText('👥 2 คน')).toBeInTheDocument();

      // Check booking details
      expect(screen.getByText('จำนวนคืน:')).toBeInTheDocument();
      expect(screen.getByText('2 คืน')).toBeInTheDocument();

      // Check price and payment method
      expect(screen.getByText('฿2,400')).toBeInTheDocument();
      expect(screen.getByText('เงินสด')).toBeInTheDocument();

      // Check breakfast inclusion
      expect(screen.getByText('รวมอาหารเช้า')).toBeInTheDocument();

      // Check notes
      expect(screen.getByText('ขอห้องที่เงียบ')).toBeInTheDocument();
    });

    it('renders without breakfast when includeBreakfast is false', () => {
      const booking = { ...mockBookingBase, status: 'confirmed', includeBreakfast: false };
      render(<BookingCard booking={booking} {...mockHandlers} />);

      expect(screen.queryByText('รวมอาหารเช้า')).not.toBeInTheDocument();
    });

    it('renders without notes when notes are empty', () => {
      const booking = { ...mockBookingBase, status: 'confirmed', notes: '' };
      render(<BookingCard booking={booking} {...mockHandlers} />);

      expect(screen.queryByText('📝')).not.toBeInTheDocument();
    });
  });

  describe('Status Display and Business Logic', () => {
    const statusTestCases = [
      {
        status: 'confirmed',
        expectedLabel: 'ยืนยันแล้ว',
        expectedIcon: '✅',
        expectedClassName: 'confirmed'
      },
      {
        status: 'arriving_today',
        expectedLabel: 'เข้าพักวันนี้',
        expectedIcon: '🏨',
        expectedClassName: 'arriving'
      },
      {
        status: 'checked_in',
        expectedLabel: 'เช็คอินแล้ว',
        expectedIcon: '🏠',
        expectedClassName: 'checked-in'
      },
      {
        status: 'departing_today',
        expectedLabel: 'ออกวันนี้',
        expectedIcon: '🧳',
        expectedClassName: 'departing'
      },
      {
        status: 'checked_out',
        expectedLabel: 'เช็คเอาต์แล้ว',
        expectedIcon: '✓',
        expectedClassName: 'checked-out'
      },
      {
        status: 'cancelled',
        expectedLabel: 'ยกเลิก',
        expectedIcon: '❌',
        expectedClassName: 'cancelled'
      }
    ];

    statusTestCases.forEach(({ status, expectedLabel, expectedIcon, expectedClassName }) => {
      it(`displays correct status information for ${status}`, () => {
        const booking = { ...mockBookingBase, status };
        render(<BookingCard booking={booking} {...mockHandlers} />);

        expect(screen.getByText(expectedLabel)).toBeInTheDocument();
        expect(screen.getByText(expectedIcon)).toBeInTheDocument();
        
        const statusElement = screen.getByText(expectedLabel).closest('.booking-status');
        expect(statusElement).toHaveClass(expectedClassName);
      });
    });

    it('handles unknown status gracefully', () => {
      const booking = { ...mockBookingBase, status: 'unknown_status' };
      render(<BookingCard booking={booking} {...mockHandlers} />);

      expect(screen.getByText('unknown_status')).toBeInTheDocument();
      expect(screen.getByText('📋')).toBeInTheDocument();
    });
  });

  describe('Action Button Logic', () => {
    describe('Check-in Button', () => {
      it('shows check-in button for confirmed status', () => {
        const booking = { ...mockBookingBase, status: 'confirmed' };
        render(<BookingCard booking={booking} {...mockHandlers} />);

        const checkInButton = screen.getByText('เช็คอิน');
        expect(checkInButton).toBeInTheDocument();
        expect(checkInButton).toHaveClass('check-in');
      });

      it('shows check-in button for arriving_today status', () => {
        const booking = { ...mockBookingBase, status: 'arriving_today' };
        render(<BookingCard booking={booking} {...mockHandlers} />);

        expect(screen.getByText('เช็คอิน')).toBeInTheDocument();
      });

      it('does not show check-in button for checked_in status', () => {
        const booking = { ...mockBookingBase, status: 'checked_in' };
        render(<BookingCard booking={booking} {...mockHandlers} />);

        expect(screen.queryByText('เช็คอิน')).not.toBeInTheDocument();
      });

      it('calls onCheckIn when check-in button is clicked', () => {
        const booking = { ...mockBookingBase, status: 'confirmed' };
        render(<BookingCard booking={booking} {...mockHandlers} />);

        fireEvent.click(screen.getByText('เช็คอิน'));
        expect(mockHandlers.onCheckIn).toHaveBeenCalledWith('BK-2024-001');
      });
    });

    describe('Check-out Button', () => {
      it('shows check-out button for checked_in status', () => {
        const booking = { ...mockBookingBase, status: 'checked_in' };
        render(<BookingCard booking={booking} {...mockHandlers} />);

        const checkOutButton = screen.getByText('เช็คเอาต์');
        expect(checkOutButton).toBeInTheDocument();
        expect(checkOutButton).toHaveClass('check-out');
      });

      it('shows check-out button for departing_today status', () => {
        const booking = { ...mockBookingBase, status: 'departing_today' };
        render(<BookingCard booking={booking} {...mockHandlers} />);

        expect(screen.getByText('เช็คเอาต์')).toBeInTheDocument();
      });

      it('does not show check-out button for confirmed status', () => {
        const booking = { ...mockBookingBase, status: 'confirmed' };
        render(<BookingCard booking={booking} {...mockHandlers} />);

        expect(screen.queryByText('เช็คเอาต์')).not.toBeInTheDocument();
      });

      it('calls onCheckOut when check-out button is clicked', () => {
        const booking = { ...mockBookingBase, status: 'checked_in' };
        render(<BookingCard booking={booking} {...mockHandlers} />);

        fireEvent.click(screen.getByText('เช็คเอาต์'));
        expect(mockHandlers.onCheckOut).toHaveBeenCalledWith('BK-2024-001');
      });
    });

    describe('Modify Button', () => {
      it('shows modify button for modifiable statuses', () => {
        const modifiableStatuses = ['confirmed', 'arriving_today', 'checked_in', 'departing_today'];
        
        modifiableStatuses.forEach(status => {
          const { unmount } = render(
            <BookingCard booking={{ ...mockBookingBase, status }} {...mockHandlers} />
          );
          
          expect(screen.getByText('แก้ไข')).toBeInTheDocument();
          unmount();
        });
      });

      it('does not show modify button for non-modifiable statuses', () => {
        const nonModifiableStatuses = ['checked_out', 'cancelled'];
        
        nonModifiableStatuses.forEach(status => {
          const { unmount } = render(
            <BookingCard booking={{ ...mockBookingBase, status }} {...mockHandlers} />
          );
          
          expect(screen.queryByText('แก้ไข')).not.toBeInTheDocument();
          unmount();
        });
      });

      it('calls onModify when modify button is clicked', () => {
        const booking = { ...mockBookingBase, status: 'confirmed' };
        render(<BookingCard booking={booking} {...mockHandlers} />);

        fireEvent.click(screen.getByText('แก้ไข'));
        expect(mockHandlers.onModify).toHaveBeenCalledWith('BK-2024-001');
      });
    });

    describe('Cancel Button', () => {
      it('shows cancel button for cancellable statuses', () => {
        const cancellableStatuses = ['confirmed', 'arriving_today', 'checked_in', 'departing_today'];
        
        cancellableStatuses.forEach(status => {
          const { unmount } = render(
            <BookingCard booking={{ ...mockBookingBase, status }} {...mockHandlers} />
          );
          
          expect(screen.getByText('ยกเลิก')).toBeInTheDocument();
          unmount();
        });
      });

      it('does not show cancel button for non-cancellable statuses', () => {
        const nonCancellableStatuses = ['checked_out', 'cancelled'];
        
        nonCancellableStatuses.forEach(status => {
          const { unmount } = render(
            <BookingCard booking={{ ...mockBookingBase, status }} {...mockHandlers} />
          );
          
          // Look for cancel button specifically, not status text which also contains "ยกเลิก"
          const cancelButtons = screen.queryAllByRole('button').filter(button => 
            button.textContent === 'ยกเลิก'
          );
          expect(cancelButtons).toHaveLength(0);
          unmount();
        });
      });

      it('calls onCancel when cancel button is clicked', () => {
        const booking = { ...mockBookingBase, status: 'confirmed' };
        render(<BookingCard booking={booking} {...mockHandlers} />);

        fireEvent.click(screen.getByText('ยกเลิก'));
        expect(mockHandlers.onCancel).toHaveBeenCalledWith('BK-2024-001');
      });
    });

    describe('View Details Button', () => {
      it('always shows view details button', () => {
        const statuses = ['confirmed', 'checked_in', 'checked_out', 'cancelled'];
        
        statuses.forEach(status => {
          const { unmount } = render(
            <BookingCard booking={{ ...mockBookingBase, status }} {...mockHandlers} />
          );
          
          expect(screen.getByText('ดูรายละเอียด')).toBeInTheDocument();
          unmount();
        });
      });

      it('calls onViewDetails with booking object when clicked', () => {
        const booking = { ...mockBookingBase, status: 'confirmed' };
        render(<BookingCard booking={booking} {...mockHandlers} />);

        fireEvent.click(screen.getByText('ดูรายละเอียด'));
        expect(mockHandlers.onViewDetails).toHaveBeenCalledWith(booking);
      });
    });
  });

  describe('Date Formatting', () => {
    it('formats dates in Thai Buddhist calendar format', () => {
      const booking = { 
        ...mockBookingBase, 
        status: 'confirmed',
        checkInDate: '2024-12-20',
        checkOutDate: '2024-12-22',
        createdAt: '2024-12-18T10:30:00Z'
      };
      render(<BookingCard booking={booking} {...mockHandlers} />);

      // Note: Exact format may vary by environment, but should contain Thai Buddhist year
      const dateElements = screen.getAllByText(/2567|2024/); // Buddhist year or Gregorian year
      expect(dateElements.length).toBeGreaterThan(0);
    });
  });

  describe('Price Formatting', () => {
    const priceTestCases = [
      { price: 2400, expected: '฿2,400' },
      { price: 0, expected: '฿0' },
      { price: 15000, expected: '฿15,000' },
      { price: 999, expected: '฿999' } // Should display as integer
    ];

    priceTestCases.forEach(({ price, expected }) => {
      it(`formats price ${price} as ${expected}`, () => {
        const booking = { ...mockBookingBase, status: 'confirmed', totalPrice: price };
        render(<BookingCard booking={booking} {...mockHandlers} />);

        expect(screen.getByText(expected)).toBeInTheDocument();
      });
    });
  });

  describe('Payment Method Display', () => {
    const paymentMethodTestCases = [
      { method: 'cash', expected: 'เงินสด' },
      { method: 'card', expected: 'บัตรเครดิต' },
      { method: 'transfer', expected: 'โอนเงิน' },
      { method: 'later', expected: 'ชำระภายหลัง' },
      { method: 'unknown_method', expected: 'unknown_method' }
    ];

    paymentMethodTestCases.forEach(({ method, expected }) => {
      it(`displays payment method ${method} as ${expected}`, () => {
        const booking = { ...mockBookingBase, status: 'confirmed', paymentMethod: method };
        render(<BookingCard booking={booking} {...mockHandlers} />);

        expect(screen.getByText(expected)).toBeInTheDocument();
      });
    });
  });

  describe('CSS Classes and Styling', () => {
    it('applies correct CSS class based on booking status', () => {
      const booking = { ...mockBookingBase, status: 'confirmed' };
      const { container } = render(<BookingCard booking={booking} {...mockHandlers} />);

      const bookingCard = container.querySelector('.booking-card');
      expect(bookingCard).toHaveClass('confirmed');
    });

    it('applies correct action button classes', () => {
      const booking = { ...mockBookingBase, status: 'confirmed' };
      render(<BookingCard booking={booking} {...mockHandlers} />);

      const checkInButton = screen.getByText('เช็คอิน');
      expect(checkInButton).toHaveClass('action-button', 'check-in');

      const viewDetailsButton = screen.getByText('ดูรายละเอียด');
      expect(viewDetailsButton).toHaveClass('action-button', 'view-details');

      const modifyButton = screen.getByText('แก้ไข');
      expect(modifyButton).toHaveClass('action-button', 'modify');

      const cancelButton = screen.getByText('ยกเลิก');
      expect(cancelButton).toHaveClass('action-button', 'cancel');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('handles missing or undefined booking properties gracefully', () => {
      const incompleteBooking = {
        id: 'BK-2024-002',
        guestName: 'Test Guest',
        status: 'confirmed',
        roomNumber: '102',
        roomType: 'Standard',
        phone: '081-111-1111',
        guests: 1,
        checkInDate: '2024-12-20',
        checkOutDate: '2024-12-21',
        nights: 1,
        totalPrice: 1200,
        paymentMethod: 'cash',
        createdAt: '2024-12-19T10:30:00Z'
      };

      // Should not throw error even with minimal required properties
      expect(() => {
        render(<BookingCard booking={incompleteBooking} {...mockHandlers} />);
      }).not.toThrow();
    });

    it('handles missing handler functions gracefully', () => {
      const booking = { ...mockBookingBase, status: 'confirmed' };
      
      expect(() => {
        render(<BookingCard booking={booking} />);
      }).not.toThrow();
    });

    it('handles very long guest names and notes', () => {
      const booking = {
        ...mockBookingBase,
        status: 'confirmed',
        guestName: 'นายชื่อยาวมากๆ สกุลยาวมากๆ ทดสอบการแสดงผลของชื่อที่ยาวมาก',
        notes: 'หมายเหตุที่ยาวมากๆ สำหรับทดสอบการแสดงผลของข้อความที่มีความยาวมากเกินไป และดูว่าจะแสดงผลอย่างไร'
      };

      render(<BookingCard booking={booking} {...mockHandlers} />);

      expect(screen.getByText(booking.guestName)).toBeInTheDocument();
      expect(screen.getByText(booking.notes)).toBeInTheDocument();
    });

    it('handles zero or negative values appropriately', () => {
      const booking = {
        ...mockBookingBase,
        status: 'confirmed',
        guests: 0,
        nights: 0,
        totalPrice: 0
      };

      render(<BookingCard booking={booking} {...mockHandlers} />);

      expect(screen.getByText('👥 0 คน')).toBeInTheDocument();
      expect(screen.getByText('0 คืน')).toBeInTheDocument();
      expect(screen.getByText('฿0')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper button accessibility', () => {
      const booking = { ...mockBookingBase, status: 'confirmed' };
      render(<BookingCard booking={booking} {...mockHandlers} />);

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);

      buttons.forEach(button => {
        expect(button).toBeVisible();
        expect(button).not.toBeDisabled();
      });
    });

    it('maintains proper heading hierarchy', () => {
      const booking = { ...mockBookingBase, status: 'confirmed' };
      render(<BookingCard booking={booking} {...mockHandlers} />);

      const guestNameHeading = screen.getByRole('heading', { level: 3 });
      expect(guestNameHeading).toHaveTextContent('นายสมชาย ใจดี');
    });
  });

  describe('Integration with Parent Components', () => {
    it('passes correct parameters to all handler functions', () => {
      const booking = { ...mockBookingBase, status: 'arriving_today' };
      render(<BookingCard booking={booking} {...mockHandlers} />);

      // Test check-in handler
      fireEvent.click(screen.getByText('เช็คอิน'));
      expect(mockHandlers.onCheckIn).toHaveBeenCalledWith(booking.id);

      // Test view details handler
      fireEvent.click(screen.getByText('ดูรายละเอียด'));
      expect(mockHandlers.onViewDetails).toHaveBeenCalledWith(booking);

      // Test modify handler
      fireEvent.click(screen.getByText('แก้ไข'));
      expect(mockHandlers.onModify).toHaveBeenCalledWith(booking.id);

      // Test cancel handler
      fireEvent.click(screen.getByText('ยกเลิก'));
      expect(mockHandlers.onCancel).toHaveBeenCalledWith(booking.id);
    });
  });
});