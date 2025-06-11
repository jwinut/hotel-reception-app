// src/components/BookingConfirmation.js
import React, { useState } from 'react';
import './BookingConfirmation.css';

function BookingConfirmation({ bookingData, onComplete, onBack, onCancel }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [notes, setNotes] = useState('');

  const { guest, dates, room } = bookingData;

  // Generate booking ID
  const generateBookingId = () => {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `BK${year}${month}${day}${random}`;
  };

  const bookingId = generateBookingId();

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('th-TH-u-ca-buddhist', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  // Handle booking confirmation
  const handleConfirmBooking = async () => {
    setIsProcessing(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const finalBookingData = {
        ...bookingData,
        bookingId,
        paymentMethod,
        notes,
        status: 'confirmed',
        createdAt: new Date().toISOString(),
        staff: 'ระบบ' // In real app, get from authenticated user
      };
      
      // In real app: save to database, send confirmations, etc.
      console.log('Final booking data:', finalBookingData);
      
      onComplete(finalBookingData);
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('เกิดข้อผิดพลาดในการสร้างการจอง กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsProcessing(false);
    }
  };

  // Print receipt function
  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="booking-confirmation-container">
      <div className="confirmation-header">
        <h2 className="form-title">ยืนยันการจอง</h2>
        <div className="booking-id">
          <span className="booking-id-label">หมายเลขการจอง:</span>
          <span className="booking-id-value">{bookingId}</span>
        </div>
      </div>

      <div className="confirmation-content">
        {/* Guest Information */}
        <div className="confirmation-section">
          <h3 className="section-title">ข้อมูลผู้เข้าพัก</h3>
          <div className="info-grid">
            <div className="info-row">
              <span className="label">ชื่อ-นามสกุล:</span>
              <span className="value">{guest.firstName} {guest.lastName}</span>
            </div>
            <div className="info-row">
              <span className="label">เบอร์โทรศัพท์:</span>
              <span className="value">{guest.phone}</span>
            </div>
            <div className="info-row">
              <span className="label">อีเมล:</span>
              <span className="value">{guest.email || '-'}</span>
            </div>
            <div className="info-row">
              <span className="label">เลขบัตรประชาชน:</span>
              <span className="value">{guest.idNumber}</span>
            </div>
            <div className="info-row">
              <span className="label">สัญชาติ:</span>
              <span className="value">{guest.nationality}</span>
            </div>
            <div className="info-row">
              <span className="label">จำนวนผู้เข้าพัก:</span>
              <span className="value">{guest.numGuests} คน</span>
            </div>
          </div>
          {guest.specialRequests && (
            <div className="special-requests">
              <span className="label">ความต้องการพิเศษ:</span>
              <p className="value">{guest.specialRequests}</p>
            </div>
          )}
        </div>

        {/* Booking Details */}
        <div className="confirmation-section">
          <h3 className="section-title">รายละเอียดการจอง</h3>
          <div className="info-grid">
            <div className="info-row">
              <span className="label">วันที่เข้าพัก:</span>
              <span className="value">{formatDate(dates.checkInDate)}</span>
            </div>
            <div className="info-row">
              <span className="label">วันที่ออก:</span>
              <span className="value">{formatDate(dates.checkOutDate)}</span>
            </div>
            <div className="info-row">
              <span className="label">จำนวนคืน:</span>
              <span className="value">{dates.nights} คืน</span>
            </div>
            <div className="info-row">
              <span className="label">ห้องพัก:</span>
              <span className="value">ห้อง {room.roomNumber} ({room.roomType})</span>
            </div>
            <div className="info-row">
              <span className="label">อาหารเช้า:</span>
              <span className="value">{dates.includeBreakfast ? 'รวมอาหารเช้า' : 'ไม่รวมอาหารเช้า'}</span>
            </div>
          </div>
        </div>

        {/* Pricing Summary */}
        <div className="confirmation-section pricing-section">
          <h3 className="section-title">สรุปราคา</h3>
          <div className="pricing-details">
            <div className="price-row">
              <span>ราคาห้องต่อคืน:</span>
              <span>฿{room.pricing.basePrice.toLocaleString()}</span>
            </div>
            <div className="price-row">
              <span>จำนวน {dates.nights} คืน:</span>
              <span>฿{(room.pricing.basePrice * dates.nights).toLocaleString()}</span>
            </div>
            {dates.includeBreakfast && (
              <div className="price-row breakfast">
                <span>รวมอาหารเช้า ({guest.numGuests} คน × {dates.nights} คืน):</span>
                <span>รวมในราคาห้องแล้ว</span>
              </div>
            )}
            <div className="price-row total">
              <span>ราคารวมทั้งสิ้น:</span>
              <span>฿{room.pricing.totalPrice.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="confirmation-section">
          <h3 className="section-title">วิธีการชำระเงิน</h3>
          <div className="payment-options">
            <label className="payment-option">
              <input
                type="radio"
                name="payment"
                value="cash"
                checked={paymentMethod === 'cash'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span className="payment-label">เงินสด</span>
            </label>
            <label className="payment-option">
              <input
                type="radio"
                name="payment"
                value="card"
                checked={paymentMethod === 'card'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span className="payment-label">บัตรเครดิต/เดบิต</span>
            </label>
            <label className="payment-option">
              <input
                type="radio"
                name="payment"
                value="transfer"
                checked={paymentMethod === 'transfer'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span className="payment-label">โอนเงิน</span>
            </label>
            <label className="payment-option">
              <input
                type="radio"
                name="payment"
                value="later"
                checked={paymentMethod === 'later'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span className="payment-label">ชำระภายหลัง</span>
            </label>
          </div>
        </div>

        {/* Additional Notes */}
        <div className="confirmation-section">
          <h3 className="section-title">หมายเหตุเพิ่มเติม</h3>
          <textarea
            className="notes-input"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="บันทึกหมายเหตุเพิ่มเติม (ถ้ามี)"
            rows="3"
            maxLength="500"
          />
          <div className="character-count">{notes.length}/500</div>
        </div>
      </div>

      <div className="form-actions">
        <button
          type="button"
          onClick={onBack}
          className="btn btn-secondary"
          disabled={isProcessing}
        >
          ← ย้อนกลับ
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-ghost"
          disabled={isProcessing}
        >
          ยกเลิก
        </button>
        <button
          type="button"
          onClick={handlePrintReceipt}
          className="btn btn-outline"
          disabled={isProcessing}
        >
          🖨️ พิมพ์
        </button>
        <button
          type="button"
          onClick={handleConfirmBooking}
          className="btn btn-primary"
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <span className="spinner"></span>
              กำลังสร้างการจอง...
            </>
          ) : (
            '✓ ยืนยันการจอง'
          )}
        </button>
      </div>

      {/* Processing Overlay */}
      {isProcessing && (
        <div className="processing-overlay">
          <div className="processing-content">
            <div className="processing-spinner"></div>
            <h3>กำลังสร้างการจอง</h3>
            <p>กรุณารอสักครู่...</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default BookingConfirmation;