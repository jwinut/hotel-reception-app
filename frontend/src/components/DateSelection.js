// src/components/DateSelection.js
import React, { useState, useEffect } from 'react';
import './DateSelection.css';

function DateSelection({ initialData, guestData, onComplete, onBack, onCancel }) {
  const [formData, setFormData] = useState({
    checkInDate: initialData?.checkInDate || '',
    checkOutDate: initialData?.checkOutDate || '',
    includeBreakfast: initialData?.includeBreakfast || false
  });

  const [errors, setErrors] = useState({});
  const [nights, setNights] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate number of nights when dates change
  useEffect(() => {
    if (formData.checkInDate && formData.checkOutDate) {
      const checkIn = new Date(formData.checkInDate);
      const checkOut = new Date(formData.checkOutDate);
      const timeDiff = checkOut.getTime() - checkIn.getTime();
      const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
      setNights(dayDiff > 0 ? dayDiff : 0);
    } else {
      setNights(0);
    }
  }, [formData.checkInDate, formData.checkOutDate]);

  // Get today's date in YYYY-MM-DD format
  const getTodayString = () => {
    return new Date().toISOString().split('T')[0];
  };

  // Get max date (1 year from today)
  const getMaxDateString = () => {
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 1);
    return maxDate.toISOString().split('T')[0];
  };

  const validateForm = () => {
    const newErrors = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check-in date validation
    if (!formData.checkInDate) {
      newErrors.checkInDate = 'กรุณาเลือกวันที่เข้าพัก';
    } else {
      const checkInDate = new Date(formData.checkInDate);
      checkInDate.setHours(0, 0, 0, 0);
      
      if (checkInDate < today) {
        newErrors.checkInDate = 'วันที่เข้าพักต้องไม่ก่อนวันนี้';
      }
    }

    // Check-out date validation
    if (!formData.checkOutDate) {
      newErrors.checkOutDate = 'กรุณาเลือกวันที่ออก';
    } else if (formData.checkInDate) {
      const checkInDate = new Date(formData.checkInDate);
      const checkOutDate = new Date(formData.checkOutDate);
      
      if (checkOutDate <= checkInDate) {
        newErrors.checkOutDate = 'วันที่ออกต้องหลังวันที่เข้าพัก';
      }
      
      const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
      const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
      
      if (dayDiff > 30) {
        newErrors.checkOutDate = 'ระยะเวลาเข้าพักต้องไม่เกิน 30 วัน';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user changes input
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }

    // Auto-set check-out date to next day if check-in is selected
    if (field === 'checkInDate' && value && !formData.checkOutDate) {
      const nextDay = new Date(value);
      nextDay.setDate(nextDay.getDate() + 1);
      setFormData(prev => ({
        ...prev,
        checkOutDate: nextDay.toISOString().split('T')[0]
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Add calculated nights to the data
      const dataToSubmit = {
        ...formData,
        nights,
        guestName: `${guestData.firstName} ${guestData.lastName}`
      };
      
      onComplete(dataToSubmit);
    } catch (error) {
      console.error('Error submitting date selection:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('th-TH-u-ca-buddhist', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  return (
    <div className="date-selection-container">
      <div className="form-header">
        <h2 className="form-title">เลือกวันที่เข้าพัก</h2>
        <p className="form-subtitle">
          สำหรับ: {guestData.firstName} {guestData.lastName} ({guestData.numGuests} คน)
        </p>
      </div>

      <form onSubmit={handleSubmit} className="date-form">
        <div className="date-selection-grid">
          <div className="date-group">
            <label htmlFor="checkInDate" className="form-label">
              วันที่เข้าพัก <span className="required">*</span>
            </label>
            <input
              type="date"
              id="checkInDate"
              className={`form-input date-input ${errors.checkInDate ? 'error' : ''}`}
              value={formData.checkInDate}
              onChange={(e) => handleInputChange('checkInDate', e.target.value)}
              min={getTodayString()}
              max={getMaxDateString()}
            />
            {errors.checkInDate && <span className="error-message">{errors.checkInDate}</span>}
            {formData.checkInDate && (
              <div className="date-display">
                {formatDateForDisplay(formData.checkInDate)}
              </div>
            )}
          </div>

          <div className="arrow-indicator">
            <div className="arrow">→</div>
            {nights > 0 && (
              <div className="nights-badge">
                {nights} คืน
              </div>
            )}
          </div>

          <div className="date-group">
            <label htmlFor="checkOutDate" className="form-label">
              วันที่ออก <span className="required">*</span>
            </label>
            <input
              type="date"
              id="checkOutDate"
              className={`form-input date-input ${errors.checkOutDate ? 'error' : ''}`}
              value={formData.checkOutDate}
              onChange={(e) => handleInputChange('checkOutDate', e.target.value)}
              min={formData.checkInDate || getTodayString()}
              max={getMaxDateString()}
            />
            {errors.checkOutDate && <span className="error-message">{errors.checkOutDate}</span>}
            {formData.checkOutDate && (
              <div className="date-display">
                {formatDateForDisplay(formData.checkOutDate)}
              </div>
            )}
          </div>
        </div>

        <div className="breakfast-section">
          <div className="checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.includeBreakfast}
                onChange={(e) => handleInputChange('includeBreakfast', e.target.checked)}
                className="checkbox-input"
              />
              <span className="checkbox-custom"></span>
              <span className="checkbox-text">รวมอาหารเช้า</span>
            </label>
            <div className="checkbox-description">
              อาหารเช้าสำหรับ {guestData.numGuests} คน
            </div>
          </div>
        </div>

        {nights > 0 && (
          <div className="stay-summary">
            <h3 className="summary-title">สรุปการเข้าพัก</h3>
            <div className="summary-details">
              <div className="summary-row">
                <span>จำนวนคืน:</span>
                <span className="summary-value">{nights} คืน</span>
              </div>
              <div className="summary-row">
                <span>จำนวนผู้เข้าพัก:</span>
                <span className="summary-value">{guestData.numGuests} คน</span>
              </div>
              <div className="summary-row">
                <span>อาหารเช้า:</span>
                <span className="summary-value">
                  {formData.includeBreakfast ? 'รวมอาหารเช้า' : 'ไม่รวมอาหารเช้า'}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="form-actions">
          <button
            type="button"
            onClick={onBack}
            className="btn btn-secondary"
            disabled={isSubmitting}
          >
            ← ย้อนกลับ
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-ghost"
            disabled={isSubmitting}
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting || nights === 0}
          >
            {isSubmitting ? 'กำลังดำเนินการ...' : 'ถัดไป: เลือกห้องพัก'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default DateSelection;