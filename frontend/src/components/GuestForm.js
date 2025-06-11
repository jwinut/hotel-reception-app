// src/components/GuestForm.js
import React, { useState } from 'react';
import './GuestForm.css';
import { validateGuestForm } from '../utils/validation';

function GuestForm({ initialData, onComplete, onCancel }) {
  const [formData, setFormData] = useState({
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    phone: initialData?.phone || '',
    email: initialData?.email || '',
    idNumber: initialData?.idNumber || '',
    nationality: initialData?.nationality || 'ไทย',
    numGuests: initialData?.numGuests || 1,
    specialRequests: initialData?.specialRequests || ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const validation = validateGuestForm(formData);
    setErrors(validation.errors);
    return validation.isValid;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
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
      
      // Get sanitized data from validation
      const validation = validateGuestForm(formData);
      onComplete(validation.sanitizedData);
    } catch (error) {
      console.error('Error submitting guest form:', error);
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="guest-form-container">
      <div className="form-header">
        <h2 className="form-title">ข้อมูลผู้เข้าพัก</h2>
        <p className="form-subtitle">กรุณากรอกข้อมูลผู้เข้าพักหลัก</p>
      </div>

      <form onSubmit={handleSubmit} className="guest-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="firstName" className="form-label">
              ชื่อ <span className="required">*</span>
            </label>
            <input
              type="text"
              id="firstName"
              className={`form-input ${errors.firstName ? 'error' : ''}`}
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              placeholder="กรอกชื่อ"
              maxLength="50"
            />
            {errors.firstName && <span className="error-message">{errors.firstName}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="lastName" className="form-label">
              นามสกุล <span className="required">*</span>
            </label>
            <input
              type="text"
              id="lastName"
              className={`form-input ${errors.lastName ? 'error' : ''}`}
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              placeholder="กรอกนามสกุล"
              maxLength="50"
            />
            {errors.lastName && <span className="error-message">{errors.lastName}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="phone" className="form-label">
              เบอร์โทรศัพท์ <span className="required">*</span>
            </label>
            <input
              type="tel"
              id="phone"
              className={`form-input ${errors.phone ? 'error' : ''}`}
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="08X-XXX-XXXX"
              maxLength="15"
            />
            {errors.phone && <span className="error-message">{errors.phone}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              อีเมล
            </label>
            <input
              type="email"
              id="email"
              className={`form-input ${errors.email ? 'error' : ''}`}
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="example@email.com"
              maxLength="100"
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="idNumber" className="form-label">
              เลขบัตรประชาชน/หนังสือเดินทาง <span className="required">*</span>
            </label>
            <input
              type="text"
              id="idNumber"
              className={`form-input ${errors.idNumber ? 'error' : ''}`}
              value={formData.idNumber}
              onChange={(e) => handleInputChange('idNumber', e.target.value)}
              placeholder="1-XXXX-XXXXX-XX-X"
              maxLength="20"
            />
            {errors.idNumber && <span className="error-message">{errors.idNumber}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="nationality" className="form-label">
              สัญชาติ
            </label>
            <select
              id="nationality"
              className="form-input"
              value={formData.nationality}
              onChange={(e) => handleInputChange('nationality', e.target.value)}
            >
              <option value="ไทย">ไทย</option>
              <option value="อเมริกัน">อเมริกัน</option>
              <option value="อังกฤษ">อังกฤษ</option>
              <option value="ญี่ปุ่น">ญี่ปุ่น</option>
              <option value="เกาหลี">เกาหลี</option>
              <option value="จีน">จีน</option>
              <option value="ฝรั่งเศส">ฝรั่งเศส</option>
              <option value="เยอรมัน">เยอรมัน</option>
              <option value="อื่นๆ">อื่นๆ</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="numGuests" className="form-label">
              จำนวนผู้เข้าพัก <span className="required">*</span>
            </label>
            <select
              id="numGuests"
              className={`form-input ${errors.numGuests ? 'error' : ''}`}
              value={formData.numGuests}
              onChange={(e) => handleInputChange('numGuests', parseInt(e.target.value))}
            >
              {[...Array(10)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1} คน
                </option>
              ))}
            </select>
            {errors.numGuests && <span className="error-message">{errors.numGuests}</span>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="specialRequests" className="form-label">
            ความต้องการพิเศษ
          </label>
          <textarea
            id="specialRequests"
            className="form-input form-textarea"
            value={formData.specialRequests}
            onChange={(e) => handleInputChange('specialRequests', e.target.value)}
            placeholder="เช่น ต้องการห้องชั้นล่าง, ไม่รับผ้าปูที่นอนสีแดง, อื่นๆ"
            rows="3"
            maxLength="500"
          />
          <div className="character-count">
            {formData.specialRequests.length}/500
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary"
            disabled={isSubmitting}
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'กำลังดำเนินการ...' : 'ถัดไป: เลือกวันที่'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default GuestForm;