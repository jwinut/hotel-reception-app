import React from 'react';
import { useTranslation } from 'react-i18next';
import { BookingResponse } from '../../services/walkinApi';
import { useDateFormat } from '../../utils/dateFormat';
import './BookingSuccess.css';

interface Props {
  booking: BookingResponse['booking'];
  onNewBooking: () => void;
  onBackToDashboard: () => void;
}

const BookingSuccess: React.FC<Props> = ({ booking, onNewBooking, onBackToDashboard }) => {
  const { t: translate } = useTranslation();
  const nightsText = booking.nights !== 1 ? 's' : '';
  const nightsTranslationKey = booking.nights !== 1 ? 'navigation.walkin.bookingSuccess.stayDetails.nights' : 'navigation.walkin.bookingSuccess.stayDetails.night';

  const formatDate = useDateFormat();

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePrintReceipt = () => {
    const nightsThaiText = booking.nights !== 1 ? 'คืน' : 'คืน';
    const breakfastLine = booking.breakfastIncluded 
      ? `อาหารเช้า (${booking.nights} ${nightsThaiText}): ฿${booking.pricing.breakfastTotal.toLocaleString()}\n`
      : '';
    
    const printContent = `
โรงแรม - ใบยืนยันการจอง

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

หมายเลขอ้างอิง: ${booking.reference}
วันที่: ${formatDate(new Date(), { format: 'short' })}
เวลา: ${new Date().toLocaleTimeString('th-TH')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ข้อมูลผู้เข้าพัก
ชื่อผู้เข้าพัก: ${booking.guest}
ห้อง: ${booking.room.number} (${booking.room.type})
ชั้น: ${booking.room.floor}

รายละเอียดการเข้าพัก
วันเข้าพัก: ${formatDate(booking.checkIn, { format: 'short' })} เวลา ${formatTime(booking.checkIn)}
วันเช็คเอาต์: ${formatDate(booking.checkOut, { format: 'short' })} เวลา 12:00 น.
ระยะเวลา: ${booking.nights} ${nightsThaiText}

ค่าใช้จ่าย
ค่าห้อง (${booking.nights} ${nightsThaiText}): ฿${booking.pricing.roomTotal.toLocaleString()}
${breakfastLine}────────────────────────────────────────
ยอดรวมทั้งหมด: ฿${booking.pricing.totalAmount.toLocaleString()}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

สถานะ: ${translate('booking.status.checkedIn')}

ขอบคุณที่เลือกใช้บริการโรงแรมของเรา!
ขอให้เดินทางปลอดภัยและมีความสุขในการเข้าพัก

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
        <h2>{translate('navigation.walkin.bookingSuccess.title')}</h2>
        <p>{translate('navigation.walkin.bookingSuccess.subtitle')}</p>
      </div>

      <div className="booking-details">
        <div className="detail-section">
          <h3>{translate('navigation.walkin.bookingSuccess.bookingInfo.title')}</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <span className="label">{translate('navigation.walkin.bookingSuccess.bookingInfo.reference')}:</span>
              <span className="value reference">{booking.reference}</span>
            </div>
            <div className="detail-item">
              <span className="label">{translate('navigation.walkin.bookingSuccess.bookingInfo.guest')}:</span>
              <span className="value">{booking.guest}</span>
            </div>
            <div className="detail-item">
              <span className="label">{translate('navigation.walkin.bookingSuccess.bookingInfo.status')}:</span>
              <span className="value status-checked-in">{booking.status}</span>
            </div>
          </div>
        </div>

        <div className="detail-section">
          <h3>{translate('navigation.walkin.bookingSuccess.roomAssignment.title')}</h3>
          <div className="room-assignment">
            <div className="room-number">{translate('navigation.walkin.bookingSuccess.roomAssignment.room')} {booking.room.number}</div>
            <div className="room-details">
              <span>{booking.room.type}</span>
              <span>{translate('navigation.walkin.bookingSuccess.roomAssignment.floor')} {booking.room.floor}</span>
            </div>
          </div>
        </div>

        <div className="detail-section">
          <h3>{translate('navigation.walkin.bookingSuccess.stayDetails.title')}</h3>
          <div className="stay-details">
            <div className="stay-dates">
              <div className="date-item">
                <span className="date-label">{translate('navigation.walkin.bookingSuccess.stayDetails.checkIn')}:</span>
                <span className="date-value">
                  {formatDate(booking.checkIn, { format: 'short' })}
                  <span className="time">{translate('navigation.walkin.bookingSuccess.stayDetails.at')} {formatTime(booking.checkIn)}</span>
                </span>
              </div>
              <div className="date-item">
                <span className="date-label">{translate('navigation.walkin.bookingSuccess.stayDetails.checkOut')}:</span>
                <span className="date-value">
                  {formatDate(booking.checkOut, { format: 'short' })}
                  <span className="time">{translate('navigation.walkin.bookingSuccess.stayDetails.at')} 12:00 PM</span>
                </span>
              </div>
              <div className="date-item">
                <span className="date-label">{translate('navigation.walkin.bookingSuccess.stayDetails.duration')}:</span>
                <span className="date-value">
                  {booking.nights} {translate(nightsTranslationKey)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="detail-section">
          <h3>{translate('navigation.walkin.bookingSuccess.pricing.title')}</h3>
          <div className="pricing-breakdown">
            <div className="pricing-line">
              <span>{translate('navigation.walkin.bookingSuccess.pricing.roomRate')} ({booking.nights} {translate(nightsTranslationKey)}):</span>
              <span>฿{booking.pricing.roomTotal.toLocaleString()}</span>
            </div>
            {booking.breakfastIncluded && (
              <div className="pricing-line breakfast">
                <span>{translate('navigation.walkin.bookingSuccess.pricing.breakfast')} ({booking.nights} {translate(nightsTranslationKey)}):</span>
                <span>฿{booking.pricing.breakfastTotal.toLocaleString()}</span>
              </div>
            )}
            <div className="pricing-line total">
              <span>{translate('navigation.walkin.bookingSuccess.pricing.totalAmount')}:</span>
              <span>฿{booking.pricing.totalAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="next-steps">
        <h3>{translate('navigation.walkin.bookingSuccess.nextSteps.title')}</h3>
        <div className="steps-list">
          <div className="step-item completed">
            <span className="step-icon">✅</span>
            <span>{translate('navigation.walkin.bookingSuccess.nextSteps.guestInfoRecorded')}</span>
          </div>
          <div className="step-item completed">
            <span className="step-icon">✅</span>
            <span>{translate('navigation.walkin.bookingSuccess.nextSteps.roomAssigned', { roomNumber: booking.room.number })}</span>
          </div>
          <div className="step-item pending">
            <span className="step-icon">📋</span>
            <span>{translate('navigation.walkin.bookingSuccess.nextSteps.processPayment')}</span>
          </div>
          <div className="step-item pending">
            <span className="step-icon">🔑</span>
            <span>{translate('navigation.walkin.bookingSuccess.nextSteps.issueKeyCard')}</span>
          </div>
          <div className="step-item pending">
            <span className="step-icon">🎯</span>
            <span>{translate('navigation.walkin.bookingSuccess.nextSteps.welcomeGuest')}</span>
          </div>
        </div>
      </div>

      <div className="action-buttons">
        <button onClick={handlePrintReceipt} className="print-button">
          🖨️ {translate('navigation.walkin.bookingSuccess.actions.printReceipt')}
        </button>
        <button onClick={onNewBooking} className="new-booking-button">
          ➕ {translate('navigation.walkin.bookingSuccess.actions.newBooking')}
        </button>
        <button onClick={onBackToDashboard} className="dashboard-button">
          🏠 {translate('navigation.walkin.bookingSuccess.actions.backToDashboard')}
        </button>
      </div>
    </div>
  );
};

export default BookingSuccess;