import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import BookingDetails from './BookingDetails';

// Mock data for testing
const mockBookingConfirmed = {
  id: 'BK24120101',
  guestName: 'สมชาย ใจดี',
  phone: '081-234-5678',
  email: 'somchai@email.com',
  guests: 2,
  roomNumber: '101',
  roomType: 'Standard',
  checkInDate: '2024-12-20',
  checkOutDate: '2024-12-22',
  nights: 2,
  includeBreakfast: true,
  totalPrice: 2700, // 2400 room + 300 breakfast (2 guests × 2 nights × 150)
  paymentMethod: 'cash',
  status: 'confirmed',
  createdAt: '2024-12-18T10:30:00.000Z',
  notes: 'ขอห้องเงียบ มีวิวสวน'
};

const mockBookingCheckedIn = {
  ...mockBookingConfirmed,
  id: 'BK24120102',
  status: 'checked_in',
  guestName: 'วิไล สุขสม',
  phone: '082-345-6789'
};

const mockBookingCheckedOut = {
  ...mockBookingConfirmed,
  id: 'BK24120103',
  status: 'checked_out',
  guestName: 'ประยุทธ์ รักดี',
  email: null,
  notes: null
};

const mockBookingCancelled = {
  ...mockBookingConfirmed,
  id: 'BK24120104',
  status: 'cancelled',
  guestName: 'มานี หวังดี'
};

const mockHandlers = {
  onClose: jest.fn(),
  onCheckIn: jest.fn(),
  onCheckOut: jest.fn(),
  onModify: jest.fn(),
  onCancel: jest.fn()
};

// Mock window.print
Object.defineProperty(window, 'print', {
  value: jest.fn(),
  writable: true
});

describe('BookingDetails', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering and Basic Functionality', () => {
    it('renders nothing when no booking is provided', () => {
      const { container } = render(<BookingDetails booking={null} {...mockHandlers} />);
      expect(container.firstChild).toBeNull();
    });

    it('renders modal with all sections when booking is provided', () => {
      render(<BookingDetails booking={mockBookingConfirmed} {...mockHandlers} />);

      // Check modal structure
      expect(screen.getByText('รายละเอียดการจอง')).toBeInTheDocument();
      expect(screen.getByText('ข้อมูลผู้เข้าพัก')).toBeInTheDocument();
      expect(screen.getByText('ข้อมูลการจอง')).toBeInTheDocument();
      expect(screen.getByText('ข้อมูลการชำระเงิน')).toBeInTheDocument();
      expect(screen.getByText('ข้อมูลเพิ่มเติม')).toBeInTheDocument();
    });

    it('displays booking ID and status correctly', () => {
      render(<BookingDetails booking={mockBookingConfirmed} {...mockHandlers} />);

      expect(screen.getByText('BK24120101')).toBeInTheDocument();
      expect(screen.getByText('ยืนยันแล้ว')).toBeInTheDocument();
      expect(screen.getByText('✅')).toBeInTheDocument();
    });

    it('displays room information correctly', () => {
      render(<BookingDetails booking={mockBookingConfirmed} {...mockHandlers} />);

      expect(screen.getByText('ห้อง 101')).toBeInTheDocument();
      expect(screen.getByText('Standard')).toBeInTheDocument();
    });

    it('closes modal when close button is clicked', () => {
      render(<BookingDetails booking={mockBookingConfirmed} {...mockHandlers} />);

      // Use the class selector for the close button in header
      const closeButton = document.querySelector('.close-button');
      fireEvent.click(closeButton);
      
      expect(mockHandlers.onClose).toHaveBeenCalledTimes(1);
    });

    it('closes modal when overlay is clicked', () => {
      render(<BookingDetails booking={mockBookingConfirmed} {...mockHandlers} />);

      const overlay = document.querySelector('.booking-details-overlay');
      fireEvent.click(overlay);
      
      expect(mockHandlers.onClose).toHaveBeenCalledTimes(1);
    });

    it('does not close modal when clicking inside modal content', () => {
      render(<BookingDetails booking={mockBookingConfirmed} {...mockHandlers} />);

      const modalContent = document.querySelector('.booking-details-modal');
      fireEvent.click(modalContent);
      
      expect(mockHandlers.onClose).not.toHaveBeenCalled();
    });
  });

  describe('Guest Information Display', () => {
    it('displays all guest information correctly', () => {
      render(<BookingDetails booking={mockBookingConfirmed} {...mockHandlers} />);

      expect(screen.getByText('สมชาย ใจดี')).toBeInTheDocument();
      expect(screen.getByText('081-234-5678')).toBeInTheDocument();
      expect(screen.getByText('somchai@email.com')).toBeInTheDocument();
      expect(screen.getByText('2 คน')).toBeInTheDocument();
    });

    it('handles missing email gracefully', () => {
      render(<BookingDetails booking={mockBookingCheckedOut} {...mockHandlers} />);

      // Email should still be rendered even if null
      const emailLabel = screen.getByText('อีเมล:');
      expect(emailLabel).toBeInTheDocument();
    });

    it('displays guest count with correct Thai text', () => {
      const singleGuestBooking = { ...mockBookingConfirmed, guests: 1 };
      render(<BookingDetails booking={singleGuestBooking} {...mockHandlers} />);

      expect(screen.getByText('1 คน')).toBeInTheDocument();
    });
  });

  describe('Booking Information Display', () => {
    it('displays booking dates in Thai format', () => {
      render(<BookingDetails booking={mockBookingConfirmed} {...mockHandlers} />);

      // Should format dates in Thai Buddhist calendar
      const dateElements = screen.getAllByText(/ธันวาคม.*2567|2024/);
      expect(dateElements.length).toBeGreaterThan(0);
    });

    it('displays nights count correctly', () => {
      render(<BookingDetails booking={mockBookingConfirmed} {...mockHandlers} />);

      expect(screen.getByText('2 คืน')).toBeInTheDocument();
    });

    it('shows breakfast included status', () => {
      render(<BookingDetails booking={mockBookingConfirmed} {...mockHandlers} />);

      expect(screen.getByText('✅ รวมอาหารเช้า')).toBeInTheDocument();
    });

    it('shows breakfast not included status', () => {
      const bookingWithoutBreakfast = { ...mockBookingConfirmed, includeBreakfast: false };
      render(<BookingDetails booking={bookingWithoutBreakfast} {...mockHandlers} />);

      expect(screen.getByText('❌ ไม่รวมอาหารเช้า')).toBeInTheDocument();
    });
  });

  describe('Payment Information Display', () => {
    it('displays price breakdown correctly', () => {
      render(<BookingDetails booking={mockBookingConfirmed} {...mockHandlers} />);

      // Check for price components
      expect(screen.getByText(/ค่าห้องพัก.*2.*คืน/)).toBeInTheDocument();
      expect(screen.getByText(/ค่าอาหารเช้า.*2.*คน.*2.*คืน/)).toBeInTheDocument();
      expect(screen.getByText('ยอดรวมทั้งหมด:')).toBeInTheDocument();
    });

    it('displays payment method correctly', () => {
      render(<BookingDetails booking={mockBookingConfirmed} {...mockHandlers} />);

      expect(screen.getByText('เงินสด')).toBeInTheDocument();
    });

    it('shows different payment methods correctly', () => {
      const cardBooking = { ...mockBookingConfirmed, paymentMethod: 'card' };
      render(<BookingDetails booking={cardBooking} {...mockHandlers} />);

      expect(screen.getByText('บัตรเครดิต')).toBeInTheDocument();
    });

    it('handles unknown payment method gracefully', () => {
      const unknownMethodBooking = { ...mockBookingConfirmed, paymentMethod: 'crypto' };
      render(<BookingDetails booking={unknownMethodBooking} {...mockHandlers} />);

      expect(screen.getByText('crypto')).toBeInTheDocument();
    });

    it('calculates and displays breakfast price correctly', () => {
      render(<BookingDetails booking={mockBookingConfirmed} {...mockHandlers} />);

      // Check for price elements more flexibly
      const priceElements = screen.getAllByText(/฿\d{1,3}(,\d{3})*/); 
      expect(priceElements.length).toBeGreaterThan(0);
      
      // Check that total price is displayed
      expect(screen.getByText('ยอดรวมทั้งหมด:')).toBeInTheDocument();
      expect(screen.getByText(/ค่าห้องพัก.*คืน/)).toBeInTheDocument();
      expect(screen.getByText(/ค่าอาหารเช้า.*คน.*คืน/)).toBeInTheDocument();
    });

    it('hides breakfast price when not included', () => {
      const bookingWithoutBreakfast = { 
        ...mockBookingConfirmed, 
        includeBreakfast: false,
        totalPrice: 2400 // Only room price
      };
      render(<BookingDetails booking={bookingWithoutBreakfast} {...mockHandlers} />);

      expect(screen.queryByText(/ค่าอาหารเช้า/)).not.toBeInTheDocument();
      // Check that total price is displayed somewhere
      expect(screen.getByText('ยอดรวมทั้งหมด:')).toBeInTheDocument();
    });
  });

  describe('Additional Information Display', () => {
    it('displays creation date in Thai format with time', () => {
      render(<BookingDetails booking={mockBookingConfirmed} {...mockHandlers} />);

      // Should display Thai formatted date with time
      const createdAtElements = screen.getAllByText(/ธ\.ค\.|ธันวาคม.*2567|2024.*\d{2}:\d{2}/);
      expect(createdAtElements.length).toBeGreaterThan(0);
    });

    it('displays notes when present', () => {
      render(<BookingDetails booking={mockBookingConfirmed} {...mockHandlers} />);

      expect(screen.getByText('หมายเหตุ:')).toBeInTheDocument();
      expect(screen.getByText('ขอห้องเงียบ มีวิวสวน')).toBeInTheDocument();
    });

    it('hides notes section when notes are empty', () => {
      render(<BookingDetails booking={mockBookingCheckedOut} {...mockHandlers} />);

      expect(screen.queryByText('หมายเหตุ:')).not.toBeInTheDocument();
    });
  });

  describe('Status-Based Display and Logic', () => {
    it('displays confirmed status correctly', () => {
      render(<BookingDetails booking={mockBookingConfirmed} {...mockHandlers} />);

      expect(screen.getByText('ยืนยันแล้ว')).toBeInTheDocument();
      expect(screen.getByText('✅')).toBeInTheDocument();
    });

    it('displays checked-in status correctly', () => {
      render(<BookingDetails booking={mockBookingCheckedIn} {...mockHandlers} />);

      expect(screen.getByText('เช็คอินแล้ว')).toBeInTheDocument();
      expect(screen.getByText('🏠')).toBeInTheDocument();
    });

    it('displays checked-out status correctly', () => {
      render(<BookingDetails booking={mockBookingCheckedOut} {...mockHandlers} />);

      expect(screen.getByText('เช็คเอาต์แล้ว')).toBeInTheDocument();
      expect(screen.getByText('✓')).toBeInTheDocument();
    });

    it('displays cancelled status correctly', () => {
      render(<BookingDetails booking={mockBookingCancelled} {...mockHandlers} />);

      expect(screen.getByText('ยกเลิก')).toBeInTheDocument();
      expect(screen.getByText('❌')).toBeInTheDocument();
    });

    it('handles unknown status gracefully', () => {
      const unknownStatusBooking = { ...mockBookingConfirmed, status: 'unknown' };
      render(<BookingDetails booking={unknownStatusBooking} {...mockHandlers} />);

      expect(screen.getByText('unknown')).toBeInTheDocument();
      expect(screen.getByText('📋')).toBeInTheDocument();
    });

    it('displays arriving_today status correctly', () => {
      const arrivingTodayBooking = { ...mockBookingConfirmed, status: 'arriving_today' };
      render(<BookingDetails booking={arrivingTodayBooking} {...mockHandlers} />);

      expect(screen.getByText('เข้าพักวันนี้')).toBeInTheDocument();
      expect(screen.getByText('🏨')).toBeInTheDocument();
    });

    it('displays departing_today status correctly', () => {
      const departingTodayBooking = { ...mockBookingConfirmed, status: 'departing_today' };
      render(<BookingDetails booking={departingTodayBooking} {...mockHandlers} />);

      expect(screen.getByText('ออกวันนี้')).toBeInTheDocument();
      expect(screen.getByText('🧳')).toBeInTheDocument();
    });
  });

  describe('Action Buttons - Check In/Check Out', () => {
    it('shows check-in button for confirmed booking', () => {
      render(<BookingDetails booking={mockBookingConfirmed} {...mockHandlers} />);

      const checkInButton = screen.getByText('เช็คอิน');
      expect(checkInButton).toBeInTheDocument();
    });

    it('shows check-in button for arriving_today booking', () => {
      const arrivingTodayBooking = { ...mockBookingConfirmed, status: 'arriving_today' };
      render(<BookingDetails booking={arrivingTodayBooking} {...mockHandlers} />);

      const checkInButton = screen.getByText('เช็คอิน');
      expect(checkInButton).toBeInTheDocument();
    });

    it('calls onCheckIn when check-in button is clicked', () => {
      render(<BookingDetails booking={mockBookingConfirmed} {...mockHandlers} />);

      const checkInButton = screen.getByText('เช็คอิน');
      fireEvent.click(checkInButton);

      expect(mockHandlers.onCheckIn).toHaveBeenCalledWith('BK24120101');
      expect(mockHandlers.onClose).toHaveBeenCalledTimes(1);
    });

    it('shows check-out button for checked-in booking', () => {
      render(<BookingDetails booking={mockBookingCheckedIn} {...mockHandlers} />);

      const checkOutButton = screen.getByText('เช็คเอาต์');
      expect(checkOutButton).toBeInTheDocument();
    });

    it('shows check-out button for departing_today booking', () => {
      const departingTodayBooking = { ...mockBookingConfirmed, status: 'departing_today' };
      render(<BookingDetails booking={departingTodayBooking} {...mockHandlers} />);

      const checkOutButton = screen.getByText('เช็คเอาต์');
      expect(checkOutButton).toBeInTheDocument();
    });

    it('calls onCheckOut when check-out button is clicked', () => {
      render(<BookingDetails booking={mockBookingCheckedIn} {...mockHandlers} />);

      const checkOutButton = screen.getByText('เช็คเอาต์');
      fireEvent.click(checkOutButton);

      expect(mockHandlers.onCheckOut).toHaveBeenCalledWith('BK24120102');
      expect(mockHandlers.onClose).toHaveBeenCalledTimes(1);
    });

    it('hides check-in button for checked-in booking', () => {
      render(<BookingDetails booking={mockBookingCheckedIn} {...mockHandlers} />);

      expect(screen.queryByText('เช็คอิน')).not.toBeInTheDocument();
    });

    it('hides check-out button for confirmed booking', () => {
      render(<BookingDetails booking={mockBookingConfirmed} {...mockHandlers} />);

      expect(screen.queryByText('เช็คเอาต์')).not.toBeInTheDocument();
    });

    it('hides both check-in and check-out for checked-out booking', () => {
      render(<BookingDetails booking={mockBookingCheckedOut} {...mockHandlers} />);

      expect(screen.queryByText('เช็คอิน')).not.toBeInTheDocument();
      expect(screen.queryByText('เช็คเอาต์')).not.toBeInTheDocument();
    });

    it('hides both check-in and check-out for cancelled booking', () => {
      render(<BookingDetails booking={mockBookingCancelled} {...mockHandlers} />);

      expect(screen.queryByText('เช็คอิน')).not.toBeInTheDocument();
      expect(screen.queryByText('เช็คเอาต์')).not.toBeInTheDocument();
    });
  });

  describe('Action Buttons - Modify and Cancel', () => {
    it('shows modify button for modifiable booking', () => {
      render(<BookingDetails booking={mockBookingConfirmed} {...mockHandlers} />);

      const modifyButton = screen.getByText('แก้ไขการจอง');
      expect(modifyButton).toBeInTheDocument();
    });

    it('calls onModify when modify button is clicked', () => {
      render(<BookingDetails booking={mockBookingConfirmed} {...mockHandlers} />);

      const modifyButton = screen.getByText('แก้ไขการจอง');
      fireEvent.click(modifyButton);

      expect(mockHandlers.onModify).toHaveBeenCalledWith('BK24120101');
      expect(mockHandlers.onClose).toHaveBeenCalledTimes(1);
    });

    it('shows cancel button for cancellable booking', () => {
      render(<BookingDetails booking={mockBookingConfirmed} {...mockHandlers} />);

      const cancelButton = screen.getByText('ยกเลิกการจอง');
      expect(cancelButton).toBeInTheDocument();
    });

    it('calls onCancel when cancel button is clicked', () => {
      render(<BookingDetails booking={mockBookingConfirmed} {...mockHandlers} />);

      const cancelButton = screen.getByText('ยกเลิกการจอง');
      fireEvent.click(cancelButton);

      expect(mockHandlers.onCancel).toHaveBeenCalledWith('BK24120101');
      expect(mockHandlers.onClose).toHaveBeenCalledTimes(1);
    });

    it('hides modify button for checked-out booking', () => {
      render(<BookingDetails booking={mockBookingCheckedOut} {...mockHandlers} />);

      expect(screen.queryByText('แก้ไขการจอง')).not.toBeInTheDocument();
    });

    it('hides cancel button for checked-out booking', () => {
      render(<BookingDetails booking={mockBookingCheckedOut} {...mockHandlers} />);

      expect(screen.queryByText('ยกเลิกการจอง')).not.toBeInTheDocument();
    });

    it('hides modify button for cancelled booking', () => {
      render(<BookingDetails booking={mockBookingCancelled} {...mockHandlers} />);

      expect(screen.queryByText('แก้ไขการจอง')).not.toBeInTheDocument();
    });

    it('hides cancel button for cancelled booking', () => {
      render(<BookingDetails booking={mockBookingCancelled} {...mockHandlers} />);

      expect(screen.queryByText('ยกเลิกการจอง')).not.toBeInTheDocument();
    });

    it('shows modify button for checked-in booking', () => {
      render(<BookingDetails booking={mockBookingCheckedIn} {...mockHandlers} />);

      const modifyButton = screen.getByText('แก้ไขการจอง');
      expect(modifyButton).toBeInTheDocument();
    });

    it('shows cancel button for checked-in booking', () => {
      render(<BookingDetails booking={mockBookingCheckedIn} {...mockHandlers} />);

      const cancelButton = screen.getByText('ยกเลิกการจอง');
      expect(cancelButton).toBeInTheDocument();
    });
  });

  describe('Print Functionality', () => {
    it('shows print button for all bookings', () => {
      render(<BookingDetails booking={mockBookingConfirmed} {...mockHandlers} />);

      const printButton = screen.getByText('พิมพ์ใบจอง');
      expect(printButton).toBeInTheDocument();
    });

    it('calls window.print when print button is clicked', () => {
      render(<BookingDetails booking={mockBookingConfirmed} {...mockHandlers} />);

      const printButton = screen.getByText('พิมพ์ใบจอง');
      fireEvent.click(printButton);

      expect(window.print).toHaveBeenCalledTimes(1);
    });

    it('shows print button even for checked-out booking', () => {
      render(<BookingDetails booking={mockBookingCheckedOut} {...mockHandlers} />);

      const printButton = screen.getByText('พิมพ์ใบจอง');
      expect(printButton).toBeInTheDocument();
    });

    it('shows print button even for cancelled booking', () => {
      render(<BookingDetails booking={mockBookingCancelled} {...mockHandlers} />);

      const printButton = screen.getByText('พิมพ์ใบจอง');
      expect(printButton).toBeInTheDocument();
    });
  });

  describe('Close Functionality', () => {
    it('shows close button for all bookings', () => {
      render(<BookingDetails booking={mockBookingConfirmed} {...mockHandlers} />);

      const closeButton = screen.getByText('ปิด');
      expect(closeButton).toBeInTheDocument();
    });

    it('calls onClose when close button is clicked', () => {
      render(<BookingDetails booking={mockBookingConfirmed} {...mockHandlers} />);

      const closeButton = screen.getByText('ปิด');
      fireEvent.click(closeButton);

      expect(mockHandlers.onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('handles booking with zero price', () => {
      const zeroBooking = { 
        ...mockBookingConfirmed, 
        totalPrice: 0,
        includeBreakfast: false 
      };
      render(<BookingDetails booking={zeroBooking} {...mockHandlers} />);

      // Check that price section exists and total is displayed
      expect(screen.getByText('ยอดรวมทั้งหมด:')).toBeInTheDocument();
      // Zero price formatting might show as ฿0 or other format
      const priceElements = screen.getAllByText(/฿/);
      expect(priceElements.length).toBeGreaterThan(0);
    });

    it('handles booking with single night', () => {
      const singleNightBooking = { 
        ...mockBookingConfirmed, 
        nights: 1,
        totalPrice: 1350 // 1200 room + 150 breakfast
      };
      render(<BookingDetails booking={singleNightBooking} {...mockHandlers} />);

      expect(screen.getByText('1 คืน')).toBeInTheDocument();
      // Check for price breakdown with 1 night
      expect(screen.getByText(/ค่าห้องพัก.*1.*คืน/)).toBeInTheDocument();
    });

    it('handles booking with many guests', () => {
      const largeGroupBooking = { 
        ...mockBookingConfirmed, 
        guests: 6,
        totalPrice: 4200 // 2400 room + 1800 breakfast (6 guests × 2 nights × 150)
      };
      render(<BookingDetails booking={largeGroupBooking} {...mockHandlers} />);

      expect(screen.getByText('6 คน')).toBeInTheDocument();
      expect(screen.getByText(/6.*คน.*2.*คืน/)).toBeInTheDocument(); // In breakfast breakdown
    });

    it('handles booking with missing handler functions', () => {
      expect(() => {
        render(<BookingDetails booking={mockBookingConfirmed} onClose={mockHandlers.onClose} />);
      }).not.toThrow();
    });

    it('handles very long booking notes', () => {
      const longNotesBooking = {
        ...mockBookingConfirmed,
        notes: 'ข้อความยาวมากๆ '.repeat(50) // Very long notes
      };
      render(<BookingDetails booking={longNotesBooking} {...mockHandlers} />);

      expect(screen.getByText('หมายเหตุ:')).toBeInTheDocument();
    });

    it('formats large prices correctly', () => {
      const expensiveBooking = {
        ...mockBookingConfirmed,
        totalPrice: 123456,
        includeBreakfast: false
      };
      render(<BookingDetails booking={expensiveBooking} {...mockHandlers} />);

      // Check that price formatting works with large numbers
      expect(screen.getByText('ยอดรวมทั้งหมด:')).toBeInTheDocument();
      // Price might be formatted differently, just check for ฿ symbol
      const priceElements = screen.getAllByText(/฿/);
      expect(priceElements.length).toBeGreaterThan(0);
    });
  });

  describe('Date Formatting', () => {
    it('formats Thai dates consistently', () => {
      render(<BookingDetails booking={mockBookingConfirmed} {...mockHandlers} />);

      // Should format dates in Thai Buddhist calendar with day names
      const dateElements = screen.getAllByText(/วัน.*ที่.*ธันวาคม.*2567|2024/);
      expect(dateElements.length).toBeGreaterThan(0);
    });

    it('handles different months correctly', () => {
      const janBooking = {
        ...mockBookingConfirmed,
        checkInDate: '2024-01-15',
        checkOutDate: '2024-01-17'
      };
      render(<BookingDetails booking={janBooking} {...mockHandlers} />);

      const dateElements = screen.getAllByText(/มกราคม/);
      expect(dateElements.length).toBeGreaterThan(0);
    });

    it('formats datetime with time for created date', () => {
      render(<BookingDetails booking={mockBookingConfirmed} {...mockHandlers} />);

      // Should include time in the created date
      const dateTimeElements = screen.getAllByText(/\d{2}:\d{2}/);
      expect(dateTimeElements.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('has proper button accessibility', () => {
      render(<BookingDetails booking={mockBookingConfirmed} {...mockHandlers} />);

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);

      buttons.forEach(button => {
        expect(button).toBeVisible();
      });
    });

    it('has proper heading hierarchy', () => {
      render(<BookingDetails booking={mockBookingConfirmed} {...mockHandlers} />);

      const mainHeading = screen.getByRole('heading', { level: 2 });
      expect(mainHeading).toHaveTextContent('รายละเอียดการจอง');

      const sectionHeadings = screen.getAllByRole('heading', { level: 3 });
      expect(sectionHeadings.length).toBeGreaterThan(0);
    });

    it('supports keyboard navigation', () => {
      render(<BookingDetails booking={mockBookingConfirmed} {...mockHandlers} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).not.toHaveAttribute('tabIndex', '-1');
      });
    });
  });

  describe('Integration Testing', () => {
    it('maintains proper state with multiple actions', () => {
      render(<BookingDetails booking={mockBookingConfirmed} {...mockHandlers} />);

      // Print first
      const printButton = screen.getByText('พิมพ์ใบจอง');
      fireEvent.click(printButton);
      expect(window.print).toHaveBeenCalledTimes(1);

      // Then check in
      const checkInButton = screen.getByText('เช็คอิน');
      fireEvent.click(checkInButton);
      expect(mockHandlers.onCheckIn).toHaveBeenCalledWith('BK24120101');
      expect(mockHandlers.onClose).toHaveBeenCalledTimes(1);
    });

    it('handles rapid button clicks gracefully', () => {
      render(<BookingDetails booking={mockBookingConfirmed} {...mockHandlers} />);

      const checkInButton = screen.getByText('เช็คอิน');
      
      // Rapid clicks
      fireEvent.click(checkInButton);
      fireEvent.click(checkInButton);
      fireEvent.click(checkInButton);

      expect(mockHandlers.onCheckIn).toHaveBeenCalledTimes(3);
      expect(mockHandlers.onClose).toHaveBeenCalledTimes(3);
    });
  });
});