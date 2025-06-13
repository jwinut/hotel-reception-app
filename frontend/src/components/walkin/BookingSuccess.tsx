import React from 'react';
import { useTranslation } from 'react-i18next';
import { BookingResponse } from '../../services/walkinApi';
import './BookingSuccess.css';

interface Props {
  booking: BookingResponse['booking'];
  onNewBooking: () => void;
  onBackToDashboard: () => void;
}

const BookingSuccess: React.FC<Props> = ({ booking, onNewBooking, onBackToDashboard }) => {
  const { t } = useTranslation();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePrintReceipt = () => {
    const printContent = `
Hotel Reception - Booking Confirmation

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Booking Reference: ${booking.reference}
Date: ${new Date().toLocaleDateString('en-GB')}
Time: ${new Date().toLocaleTimeString('en-GB')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

GUEST INFORMATION
Guest: ${booking.guest}
Room: ${booking.room.number} (${booking.room.type})
Floor: ${booking.room.floor}

STAY DETAILS
Check-in: ${formatDate(booking.checkIn)} at ${formatTime(booking.checkIn)}
Check-out: ${formatDate(booking.checkOut)} at 12:00 PM
Duration: ${booking.nights} night${booking.nights !== 1 ? 's' : ''}

CHARGES
Room Rate (${booking.nights} night${booking.nights !== 1 ? 's' : ''}): ฿${booking.pricing.roomTotal.toLocaleString()}
${booking.breakfastIncluded ? `Breakfast (${booking.nights} night${booking.nights !== 1 ? 's' : ''}): ฿${booking.pricing.breakfastTotal.toLocaleString()}` : ''}
────────────────────────────────────────
TOTAL AMOUNT: ฿${booking.pricing.totalAmount.toLocaleString()}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STATUS: ${booking.status}

Thank you for choosing our hotel!
Safe travels and enjoy your stay.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `.trim();

    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Booking Receipt - ${booking.reference}</title>
            <style>
              body { font-family: monospace; white-space: pre-wrap; margin: 20px; }
              @media print { body { margin: 0; } }
            </style>
          </head>
          <body>${printContent}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="booking-success">
      <div className="success-header">
        <div className="success-icon">🎉</div>
        <h2>Booking Created Successfully!</h2>
        <p>The guest has been checked in and the room is now occupied.</p>
      </div>

      <div className="booking-details">
        <div className="detail-section">
          <h3>Booking Information</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <span className="label">Reference:</span>
              <span className="value reference">{booking.reference}</span>
            </div>
            <div className="detail-item">
              <span className="label">Guest:</span>
              <span className="value">{booking.guest}</span>
            </div>
            <div className="detail-item">
              <span className="label">Status:</span>
              <span className="value status-checked-in">{booking.status}</span>
            </div>
          </div>
        </div>

        <div className="detail-section">
          <h3>Room Assignment</h3>
          <div className="room-assignment">
            <div className="room-number">Room {booking.room.number}</div>
            <div className="room-details">
              <span>{booking.room.type}</span>
              <span>Floor {booking.room.floor}</span>
            </div>
          </div>
        </div>

        <div className="detail-section">
          <h3>Stay Details</h3>
          <div className="stay-details">
            <div className="stay-dates">
              <div className="date-item">
                <span className="date-label">Check-in:</span>
                <span className="date-value">
                  {formatDate(booking.checkIn)}
                  <span className="time">at {formatTime(booking.checkIn)}</span>
                </span>
              </div>
              <div className="date-item">
                <span className="date-label">Check-out:</span>
                <span className="date-value">
                  {formatDate(booking.checkOut)}
                  <span className="time">at 12:00 PM</span>
                </span>
              </div>
              <div className="date-item">
                <span className="date-label">Duration:</span>
                <span className="date-value">
                  {booking.nights} night{booking.nights !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="detail-section">
          <h3>Pricing Breakdown</h3>
          <div className="pricing-breakdown">
            <div className="pricing-line">
              <span>Room Rate ({booking.nights} night{booking.nights !== 1 ? 's' : ''}):</span>
              <span>฿{booking.pricing.roomTotal.toLocaleString()}</span>
            </div>
            {booking.breakfastIncluded && (
              <div className="pricing-line breakfast">
                <span>Breakfast ({booking.nights} night{booking.nights !== 1 ? 's' : ''}):</span>
                <span>฿{booking.pricing.breakfastTotal.toLocaleString()}</span>
              </div>
            )}
            <div className="pricing-line total">
              <span>Total Amount:</span>
              <span>฿{booking.pricing.totalAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="next-steps">
        <h3>Next Steps</h3>
        <div className="steps-list">
          <div className="step-item completed">
            <span className="step-icon">✅</span>
            <span>Guest information recorded</span>
          </div>
          <div className="step-item completed">
            <span className="step-icon">✅</span>
            <span>Room {booking.room.number} assigned and marked as occupied</span>
          </div>
          <div className="step-item pending">
            <span className="step-icon">📋</span>
            <span>Process payment (if required)</span>
          </div>
          <div className="step-item pending">
            <span className="step-icon">🔑</span>
            <span>Issue room key card</span>
          </div>
          <div className="step-item pending">
            <span className="step-icon">🎯</span>
            <span>Welcome guest and provide hotel information</span>
          </div>
        </div>
      </div>

      <div className="action-buttons">
        <button onClick={handlePrintReceipt} className="print-button">
          🖨️ Print Receipt
        </button>
        <button onClick={onNewBooking} className="new-booking-button">
          ➕ New Booking
        </button>
        <button onClick={onBackToDashboard} className="dashboard-button">
          🏠 Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default BookingSuccess;