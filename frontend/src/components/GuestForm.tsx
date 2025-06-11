// src/components/GuestForm.tsx
import React, { useState } from 'react';
import './GuestForm.css';
import { validateGuestForm } from '../utils/validation';
import type { Guest, FormErrors } from '../types';

interface GuestFormData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  idNumber: string;
  nationality: string;
  numGuests: number;
  specialRequests: string;
}

interface GuestFormProps {
  initialData?: Partial<Guest>;
  onComplete: (data: Guest) => void;
  onCancel: () => void;
}

const GuestForm: React.FC<GuestFormProps> = ({ initialData, onComplete, onCancel }) => {
  const [formData, setFormData] = useState<GuestFormData>({
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    phone: initialData?.phone || '',
    email: initialData?.email || '',
    idNumber: initialData?.idNumber || '',
    nationality: initialData?.nationality || 'ไทย',
    numGuests: initialData?.numGuests || 1,
    specialRequests: initialData?.specialRequests || ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const validateForm = (): boolean => {
    const validation = validateGuestForm(formData);
    setErrors(validation.errors);
    return validation.isValid;
  };

  const handleInputChange = (field: keyof GuestFormData, value: string | number): void => {
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
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
      if (validation.isValid) {
        onComplete(validation.sanitizedData);
      }
    } catch (error) {
      console.error('Error submitting guest form:', error);
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nationalities = [
    'ไทย', 'อเมริกัน', 'อังกฤษ', 'ญี่ปุ่น', 'เกาหลี', 
    'จีน', 'ฝรั่งเศส', 'เยอรมัน', 'อื่นๆ'
  ];

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
              maxLength={50}
              required
              aria-describedby={errors.firstName ? 'firstName-error' : undefined}
            />
            {errors.firstName && (
              <span id="firstName-error" className="error-message" role="alert">
                {errors.firstName}
              </span>
            )}
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
              maxLength={50}
              required
              aria-describedby={errors.lastName ? 'lastName-error' : undefined}
            />
            {errors.lastName && (
              <span id="lastName-error" className="error-message" role="alert">
                {errors.lastName}
              </span>
            )}
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
              maxLength={15}
              required
              aria-describedby={errors.phone ? 'phone-error' : undefined}
            />
            {errors.phone && (
              <span id="phone-error" className="error-message" role="alert">
                {errors.phone}
              </span>
            )}
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
              maxLength={100}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
            {errors.email && (
              <span id="email-error" className="error-message" role="alert">
                {errors.email}
              </span>
            )}
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
              maxLength={20}
              required
              aria-describedby={errors.idNumber ? 'idNumber-error' : undefined}
            />
            {errors.idNumber && (
              <span id="idNumber-error" className="error-message" role="alert">
                {errors.idNumber}
              </span>
            )}
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
              {nationalities.map(nationality => (
                <option key={nationality} value={nationality}>
                  {nationality}
                </option>
              ))}
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
              onChange={(e) => handleInputChange('numGuests', parseInt(e.target.value, 10))}
              required
              aria-describedby={errors.numGuests ? 'numGuests-error' : undefined}
            >
              {Array.from({ length: 10 }, (_, i) => i + 1).map(num => (
                <option key={num} value={num}>
                  {num} คน
                </option>
              ))}
            </select>
            {errors.numGuests && (
              <span id="numGuests-error" className="error-message" role="alert">
                {errors.numGuests}
              </span>
            )}
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
            rows={3}
            maxLength={500}
          />
          <div className="character-count" aria-live="polite">
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
};

export default GuestForm;