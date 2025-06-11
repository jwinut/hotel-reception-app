// src/components/BookingCard.js
import React from 'react';
import './BookingCard.css';

function BookingCard({ booking, onCheckIn, onCheckOut, onModify, onCancel, onViewDetails }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('th-TH-u-ca-buddhist', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
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

  return (
    <div className={`booking-card ${statusInfo.className}`}>
      {/* Card Header */}
      <div className="booking-card-header">
        <div className="booking-id-section">
          <span className="booking-id">{booking.id}</span>
          <span className={`booking-status ${statusInfo.className}`}>
            <span className="status-icon">{statusInfo.icon}</span>
            {statusInfo.label}
          </span>
        </div>
        <div className="room-info">
          <span className="room-number">ห้อง {booking.roomNumber}</span>
          <span className="room-type">{booking.roomType}</span>
        </div>
      </div>

      {/* Guest Information */}
      <div className="guest-info">
        <h3 className="guest-name">{booking.guestName}</h3>
        <div className="guest-details">
          <span className="guest-phone">📞 {booking.phone}</span>
          <span className="guest-count">👥 {booking.guests} คน</span>
        </div>
      </div>

      {/* Booking Details */}
      <div className="booking-details">
        <div className="date-info">
          <div className="date-item">
            <span className="date-label">เข้าพัก:</span>
            <span className="date-value">{formatDate(booking.checkInDate)}</span>
          </div>
          <div className="date-item">
            <span className="date-label">ออก:</span>
            <span className="date-value">{formatDate(booking.checkOutDate)}</span>
          </div>
          <div className="date-item">
            <span className="date-label">จำนวนคืน:</span>
            <span className="date-value">{booking.nights} คืน</span>
          </div>
        </div>

        <div className="booking-extras">
          <div className="price-info">
            <span className="total-price">{formatPrice(booking.totalPrice)}</span>
            <span className="payment-method">{getPaymentMethodLabel(booking.paymentMethod)}</span>
          </div>
          {booking.includeBreakfast && (
            <div className="breakfast-included">
              <span className="breakfast-icon">🍳</span>
              รวมอาหารเช้า
            </div>
          )}
        </div>
      </div>

      {/* Notes */}
      {booking.notes && (
        <div className="booking-notes">
          <span className="notes-icon">📝</span>
          <span className="notes-text">{booking.notes}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="booking-actions">
        <div className="primary-actions">
          {canCheckIn && (
            <button
              onClick={() => onCheckIn(booking.id)}
              className="action-button check-in"
            >
              เช็คอิน
            </button>
          )}
          {canCheckOut && (
            <button
              onClick={() => onCheckOut(booking.id)}
              className="action-button check-out"
            >
              เช็คเอาต์
            </button>
          )}
          <button
            onClick={() => onViewDetails(booking)}
            className="action-button view-details"
          >
            ดูรายละเอียด
          </button>
        </div>

        <div className="secondary-actions">
          {canModify && (
            <button
              onClick={() => onModify(booking.id)}
              className="action-button modify"
            >
              แก้ไข
            </button>
          )}
          {canCancel && (
            <button
              onClick={() => onCancel(booking.id)}
              className="action-button cancel"
            >
              ยกเลิก
            </button>
          )}
        </div>
      </div>

      {/* Created Date */}
      <div className="booking-meta">
        <span className="created-date">
          สร้างเมื่อ: {formatDate(booking.createdAt)}
        </span>
      </div>
    </div>
  );
}

export default BookingCard;