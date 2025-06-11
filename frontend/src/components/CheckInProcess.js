// src/components/CheckInProcess.js
import React, { useState } from 'react';
import './CheckInProcess.css';

function CheckInProcess({ booking, onBack, onCheckInComplete }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [verificationData, setVerificationData] = useState({
    idVerified: false,
    paymentVerified: false,
    documentsChecked: false,
    guestConfirmed: false,
    specialRequests: '',
    keyNumber: '',
    welcomeMessagePrinted: false
  });

  const steps = [
    { id: 1, title: 'ตรวจสอบข้อมูล', icon: '📋' },
    { id: 2, title: 'เอกสารประจำตัว', icon: '🆔' },
    { id: 3, title: 'การชำระเงิน', icon: '💳' },
    { id: 4, title: 'มอบกุญแจ', icon: '🔑' },
    { id: 5, title: 'เสร็จสิ้น', icon: '✅' }
  ];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('th-TH-u-ca-buddhist', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
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

  const getPaymentMethodLabel = (method) => {
    const methodMap = {
      cash: 'เงินสด',
      card: 'บัตรเครดิต',
      transfer: 'โอนเงิน',
      later: 'ชำระภายหลัง'
    };
    return methodMap[method] || method;
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleVerificationChange = (field, value) => {
    setVerificationData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCheckInComplete = () => {
    onCheckInComplete(booking.id);
  };

  const handlePrintWelcome = () => {
    // In real app, this would send to printer
    const welcomeMessage = `
ยินดีต้อนรับสู่โรงแรม

คุณ ${booking.guestName}
ห้อง ${booking.roomNumber} (${booking.roomType})
วันที่เข้าพัก: ${formatDate(booking.checkInDate)}
วันที่ออก: ${formatDate(booking.checkOutDate)}
จำนวน: ${booking.guests} คน, ${booking.nights} คืน

หมายเลขกุญแจ: ${verificationData.keyNumber}

ขอให้พักผ่อนอย่างสบาย!
    `;
    
    alert(`พิมพ์ใบต้อนรับ:\n${welcomeMessage}`);
    handleVerificationChange('welcomeMessagePrinted', true);
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return verificationData.guestConfirmed;
      case 2:
        return verificationData.idVerified && verificationData.documentsChecked;
      case 3:
        return verificationData.paymentVerified;
      case 4:
        return verificationData.keyNumber.trim() !== '';
      default:
        return true;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="step-content">
            <h3 className="step-title">ตรวจสอบข้อมูลการจอง</h3>
            
            <div className="booking-summary">
              <div className="summary-header">
                <h4>ข้อมูลการจอง #{booking.id}</h4>
              </div>
              
              <div className="summary-grid">
                <div className="summary-item">
                  <span className="summary-label">ชื่อผู้เข้าพัก:</span>
                  <span className="summary-value">{booking.guestName}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">เบอร์โทรศัพท์:</span>
                  <span className="summary-value">{booking.phone}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">ห้อง:</span>
                  <span className="summary-value">{booking.roomNumber} ({booking.roomType})</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">วันที่เข้าพัก:</span>
                  <span className="summary-value">{formatDate(booking.checkInDate)}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">วันที่ออก:</span>
                  <span className="summary-value">{formatDate(booking.checkOutDate)}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">จำนวนผู้เข้าพัก:</span>
                  <span className="summary-value">{booking.guests} คน</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">จำนวนคืน:</span>
                  <span className="summary-value">{booking.nights} คืน</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">อาหารเช้า:</span>
                  <span className="summary-value">
                    {booking.includeBreakfast ? '✅ รวมอาหารเช้า' : '❌ ไม่รวมอาหารเช้า'}
                  </span>
                </div>
              </div>

              {booking.notes && (
                <div className="special-notes">
                  <h5>หมายเหตุพิเศษ:</h5>
                  <p>{booking.notes}</p>
                </div>
              )}
            </div>

            <div className="verification-section">
              <label className="verification-checkbox">
                <input
                  type="checkbox"
                  checked={verificationData.guestConfirmed}
                  onChange={(e) => handleVerificationChange('guestConfirmed', e.target.checked)}
                />
                <span className="checkmark"></span>
                ได้ตรวจสอบข้อมูลกับลูกค้าแล้ว ข้อมูลถูกต้อง
              </label>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="step-content">
            <h3 className="step-title">ตรวจสอบเอกสารประจำตัว</h3>
            
            <div className="document-section">
              <div className="document-info">
                <h4>ข้อมูลจากการจอง</h4>
                <div className="guest-info-grid">
                  <div className="info-item">
                    <span className="info-label">ชื่อ:</span>
                    <span className="info-value">{booking.guestName}</span>
                  </div>
                  {booking.idNumber && (
                    <div className="info-item">
                      <span className="info-label">เลขประจำตัว:</span>
                      <span className="info-value">{booking.idNumber}</span>
                    </div>
                  )}
                  {booking.nationality && (
                    <div className="info-item">
                      <span className="info-label">สัญชาติ:</span>
                      <span className="info-value">{booking.nationality}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="document-checklist">
                <h4>รายการตรวจสอบ</h4>
                <div className="checklist">
                  <label className="verification-checkbox">
                    <input
                      type="checkbox"
                      checked={verificationData.idVerified}
                      onChange={(e) => handleVerificationChange('idVerified', e.target.checked)}
                    />
                    <span className="checkmark"></span>
                    ตรวจสอบบัตรประจำตัวประชาชน/หนังสือเดินทาง
                  </label>
                  <label className="verification-checkbox">
                    <input
                      type="checkbox"
                      checked={verificationData.documentsChecked}
                      onChange={(e) => handleVerificationChange('documentsChecked', e.target.checked)}
                    />
                    <span className="checkmark"></span>
                    ข้อมูลในเอกสารตรงกับการจอง
                  </label>
                </div>
              </div>

              <div className="document-note">
                <div className="note-icon">📝</div>
                <div className="note-content">
                  <strong>หมายเหตุ:</strong> ในระบบจริง สามารถสแกนหรืออัพโหลดรูปถ่ายเอกสารได้
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="step-content">
            <h3 className="step-title">ตรวจสอบการชำระเงิน</h3>
            
            <div className="payment-section">
              <div className="payment-summary">
                <h4>สรุปการชำระเงิน</h4>
                <div className="payment-details">
                  <div className="payment-item">
                    <span>ยอดรวม:</span>
                    <span className="amount">{formatPrice(booking.totalPrice)}</span>
                  </div>
                  <div className="payment-item">
                    <span>วิธีการชำระ:</span>
                    <span className="method">{getPaymentMethodLabel(booking.paymentMethod)}</span>
                  </div>
                </div>
              </div>

              <div className="payment-verification">
                <h4>ตรวจสอบการชำระเงิน</h4>
                
                {booking.paymentMethod === 'later' ? (
                  <div className="payment-later">
                    <div className="warning-box">
                      <div className="warning-icon">⚠️</div>
                      <div className="warning-content">
                        <strong>ชำระภายหลัง</strong>
                        <p>ลูกค้าจะชำระเงินเมื่อเช็คเอาต์ กรุณาแจ้งให้ลูกค้าทราบ</p>
                      </div>
                    </div>
                    <label className="verification-checkbox">
                      <input
                        type="checkbox"
                        checked={verificationData.paymentVerified}
                        onChange={(e) => handleVerificationChange('paymentVerified', e.target.checked)}
                      />
                      <span className="checkmark"></span>
                      ได้แจ้งลูกค้าเรื่องการชำระเงินเมื่อเช็คเอาต์แล้ว
                    </label>
                  </div>
                ) : (
                  <div className="payment-completed">
                    <div className="success-box">
                      <div className="success-icon">✅</div>
                      <div className="success-content">
                        <strong>ชำระเงินแล้ว</strong>
                        <p>การจองนี้ได้ชำระเงินครบถ้วนแล้ว</p>
                      </div>
                    </div>
                    <label className="verification-checkbox">
                      <input
                        type="checkbox"
                        checked={verificationData.paymentVerified}
                        onChange={(e) => handleVerificationChange('paymentVerified', e.target.checked)}
                      />
                      <span className="checkmark"></span>
                      ยืนยันสถานะการชำระเงิน
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="step-content">
            <h3 className="step-title">มอบกุญแจห้อง</h3>
            
            <div className="key-section">
              <div className="room-info-large">
                <div className="room-display">
                  <div className="room-number-large">ห้อง {booking.roomNumber}</div>
                  <div className="room-type-large">{booking.roomType}</div>
                </div>
              </div>

              <div className="key-assignment">
                <h4>หมายเลขกุญแจ</h4>
                <input
                  type="text"
                  placeholder="กรอกหมายเลขกุญแจ (เช่น K301A, K301B)"
                  value={verificationData.keyNumber}
                  onChange={(e) => handleVerificationChange('keyNumber', e.target.value)}
                  className="key-input"
                />
              </div>

              <div className="welcome-section">
                <h4>ใบต้อนรับ</h4>
                <button
                  onClick={handlePrintWelcome}
                  className="print-welcome-button"
                  disabled={!verificationData.keyNumber}
                >
                  🖨️ พิมพ์ใบต้อนรับ
                </button>
                {verificationData.welcomeMessagePrinted && (
                  <div className="print-success">
                    ✅ พิมพ์ใบต้อนรับเรียบร้อยแล้ว
                  </div>
                )}
              </div>

              <div className="final-checklist">
                <h4>ก่อนส่งมอบกุญแจ</h4>
                <div className="checklist">
                  <div className="checklist-item">✓ แจ้งเวลาอาหารเช้า (6:00-10:00 น.)</div>
                  <div className="checklist-item">✓ แจ้งสิ่งอำนวยความสะดวก</div>
                  <div className="checklist-item">✓ แจ้งเวลาเช็คเอาต์ (12:00 น.)</div>
                  <div className="checklist-item">✓ มอบใบต้อนรับและกุญแจ</div>
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="step-content">
            <h3 className="step-title">เช็คอินเสร็จสิ้น</h3>
            
            <div className="completion-section">
              <div className="success-message">
                <div className="success-icon-large">🎉</div>
                <h4>เช็คอินสำเร็จ!</h4>
                <p>คุณ {booking.guestName} ได้เช็คอินเรียบร้อยแล้ว</p>
              </div>

              <div className="completion-summary">
                <div className="summary-item">
                  <span>ห้อง:</span>
                  <span>{booking.roomNumber} ({booking.roomType})</span>
                </div>
                <div className="summary-item">
                  <span>กุญแจ:</span>
                  <span>{verificationData.keyNumber}</span>
                </div>
                <div className="summary-item">
                  <span>เช็คเอาต์:</span>
                  <span>{formatDate(booking.checkOutDate)}</span>
                </div>
              </div>

              <div className="completion-actions">
                <button
                  onClick={handleCheckInComplete}
                  className="complete-button"
                >
                  ✅ เสร็จสิ้นการเช็คอิน
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="checkin-process">
      {/* Header */}
      <div className="process-header">
        <button onClick={onBack} className="back-button">
          ← กลับไปค้นหา
        </button>
        <h2 className="process-title">เช็คอิน - {booking.guestName}</h2>
      </div>

      {/* Progress Steps */}
      <div className="progress-steps">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`step ${currentStep >= step.id ? 'active' : ''} ${currentStep === step.id ? 'current' : ''}`}
          >
            <div className="step-circle">
              <span className="step-icon">{step.icon}</span>
            </div>
            <span className="step-label">{step.title}</span>
            {index < steps.length - 1 && <div className="step-connector"></div>}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="step-container">
        {renderStepContent()}
      </div>

      {/* Navigation */}
      <div className="process-navigation">
        <button
          onClick={handlePrevious}
          disabled={currentStep === 1}
          className="nav-button secondary"
        >
          ← ย้อนกลับ
        </button>
        
        {currentStep < steps.length && (
          <button
            onClick={handleNext}
            disabled={!canProceedToNext()}
            className="nav-button primary"
          >
            ถัดไป →
          </button>
        )}
      </div>
    </div>
  );
}

export default CheckInProcess;