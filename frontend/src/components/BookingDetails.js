// src/components/BookingDetails.js
import React from 'react';
import './BookingDetails.css';

function BookingDetails({ booking, onClose, onCheckIn, onCheckOut, onModify, onCancel }) {
  if (!booking) return null;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('th-TH-u-ca-buddhist', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('th-TH-u-ca-buddhist', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      confirmed: { label: 'ยืนยันแล้ว', className: 'confirmed', icon: '✅' },
      arriving_today: { label: 'เข้าพักวันนี้', className: 'arriving', icon: '🏨' },
      checked_in: { label: 'เช็คอินแล้ว', className: 'checked-in', icon: '🏠' },
      departing_today: { label: 'ออกวันนี้', className: 'departing', icon: '🧳' },
      checked_out: { label: 'เช็คเอาต์แล้ว', className: 'checked-out', icon: '✓' },
      cancelled: { label: 'ยกเลิก', className: 'cancelled', icon: '❌' }
    };
    return statusMap[status] || { label: status, className: 'default', icon: '📋' };
  };

  const getPaymentMethodLabel = (method) => {
    const methodMap = {
      cash: 'เงินสด',
      card: 'บัตรเครดิต',
      transfer: 'โอนเงิน',
      later: 'ชำระภายหลัง'
    };
    return methodMap[method] || method;
  };

  const statusInfo = getStatusInfo(booking.status);

  const canCheckIn = booking.status === 'confirmed' || booking.status === 'arriving_today';
  const canCheckOut = booking.status === 'checked_in' || booking.status === 'departing_today';
  const canModify = !['checked_out', 'cancelled'].includes(booking.status);
  const canCancel = !['checked_out', 'cancelled'].includes(booking.status);

  const handlePrint = () => {
    window.print();
  };

  // Calculate price breakdown
  const basePrice = booking.totalPrice;
  const breakfastPrice = booking.includeBreakfast ? booking.nights * booking.guests * 150 : 0; // Assuming 150 THB per person per night for breakfast
  const roomPrice = basePrice - breakfastPrice;

  return (
    <div className="booking-details-overlay" onClick={onClose}>
      <div className="booking-details-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">รายละเอียดการจอง</h2>
          <button className="close-button" onClick={onClose}>
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        <div className="modal-content">
          {/* Booking Header */}
          <div className="booking-header-section">
            <div className="booking-id-status">
              <div className="booking-id-large">{booking.id}</div>
              <div className={`booking-status-large ${statusInfo.className}`}>
                <span className="status-icon">{statusInfo.icon}</span>
                {statusInfo.label}
              </div>
            </div>
            <div className="room-info-large">
              <div className="room-number-large">ห้อง {booking.roomNumber}</div>
              <div className="room-type-large">{booking.roomType}</div>
            </div>
          </div>

          {/* Guest Information */}
          <div className="detail-section">
            <h3 className="section-title">ข้อมูลผู้เข้าพัก</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">ชื่อผู้เข้าพัก:</span>
                <span className="detail-value">{booking.guestName}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">เบอร์โทรศัพท์:</span>
                <span className="detail-value">{booking.phone}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">อีเมล:</span>
                <span className="detail-value">{booking.email}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">จำนวนผู้เข้าพัก:</span>
                <span className="detail-value">{booking.guests} คน</span>
              </div>
            </div>
          </div>

          {/* Booking Information */}
          <div className="detail-section">
            <h3 className="section-title">ข้อมูลการจอง</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">วันที่เข้าพัก:</span>
                <span className="detail-value">{formatDate(booking.checkInDate)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">วันที่ออก:</span>
                <span className="detail-value">{formatDate(booking.checkOutDate)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">จำนวนคืน:</span>
                <span className="detail-value">{booking.nights} คืน</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">อาหารเช้า:</span>
                <span className="detail-value">
                  {booking.includeBreakfast ? (
                    <span className="breakfast-yes">✅ รวมอาหารเช้า</span>
                  ) : (
                    <span className="breakfast-no">❌ ไม่รวมอาหารเช้า</span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="detail-section">
            <h3 className="section-title">ข้อมูลการชำระเงิน</h3>
            <div className="payment-breakdown">
              <div className="price-line">
                <span>ค่าห้องพัก ({booking.nights} คืน):</span>
                <span>{formatPrice(roomPrice)}</span>
              </div>
              {booking.includeBreakfast && (
                <div className="price-line">
                  <span>ค่าอาหารเช้า ({booking.guests} คน × {booking.nights} คืน):</span>
                  <span>{formatPrice(breakfastPrice)}</span>
                </div>
              )}
              <div className="price-line total">
                <span>ยอดรวมทั้งหมด:</span>
                <span>{formatPrice(booking.totalPrice)}</span>
              </div>
              <div className="payment-method-info">
                <span className="payment-label">วิธีการชำระเงิน:</span>
                <span className="payment-value">{getPaymentMethodLabel(booking.paymentMethod)}</span>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="detail-section">
            <h3 className="section-title">ข้อมูลเพิ่มเติม</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">วันที่สร้างการจอง:</span>
                <span className="detail-value">{formatDateTime(booking.createdAt)}</span>
              </div>
              {booking.notes && (
                <div className="detail-item full-width">
                  <span className="detail-label">หมายเหตุ:</span>
                  <div className="notes-display">{booking.notes}</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="modal-actions">
          <div className="primary-actions">
            {canCheckIn && (
              <button
                onClick={() => {
                  onCheckIn(booking.id);
                  onClose();
                }}
                className="action-button check-in"
              >
                เช็คอิน
              </button>
            )}
            {canCheckOut && (
              <button
                onClick={() => {
                  onCheckOut(booking.id);
                  onClose();
                }}
                className="action-button check-out"
              >
                เช็คเอาต์
              </button>
            )}
            <button
              onClick={handlePrint}
              className="action-button print"
            >
              พิมพ์ใบจอง
            </button>
          </div>

          <div className="secondary-actions">
            {canModify && (
              <button
                onClick={() => {
                  onModify(booking.id);
                  onClose();
                }}
                className="action-button modify"
              >
                แก้ไขการจอง
              </button>
            )}
            {canCancel && (
              <button
                onClick={() => {
                  onCancel(booking.id);
                  onClose();
                }}
                className="action-button cancel"
              >
                ยกเลิกการจอง
              </button>
            )}
            <button
              onClick={onClose}
              className="action-button close"
            >
              ปิด
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookingDetails;