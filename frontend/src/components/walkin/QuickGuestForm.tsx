import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RoomAvailability } from '../../services/walkinApi';
import { useDateFormat } from '../../utils/dateFormat';
import './QuickGuestForm.css';

interface GuestInfo {
  firstName: string;
  lastName: string;
  phone: string;
  idType: 'PASSPORT' | 'NATIONAL_ID';
  idNumber: string;
}

interface Props {
  selectedRoom: RoomAvailability;
  onSubmit: (guest: GuestInfo, checkOutDate: Date) => void;
  onCancel: () => void;
  loading?: boolean;
  includeBreakfast: boolean;
  onBreakfastChange: (include: boolean) => void;
}

const QuickGuestForm: React.FC<Props> = ({ 
  selectedRoom, 
  onSubmit, 
  onCancel,
  loading = false,
  includeBreakfast,
  onBreakfastChange
}) => {
  const { t: translate } = useTranslation();
  const formatDate = useDateFormat();
  const [guest, setGuest] = useState<GuestInfo>({
    firstName: '',
    lastName: '',
    phone: '',
    idType: 'NATIONAL_ID',
    idNumber: ''
  });
  const [nights, setNights] = useState(1);
  const [errors, setErrors] = useState<Partial<GuestInfo & { nights: string }>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<GuestInfo & { nights: string }> = {};

    if (!guest.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!guest.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!guest.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9+\-\s()]+$/.test(guest.phone)) {
      newErrors.phone = 'Invalid phone number format';
    }

    if (!guest.idNumber.trim()) {
      newErrors.idNumber = 'ID number is required';
    } else {
      if (guest.idType === 'NATIONAL_ID' && !/^\d{13}$/.test(guest.idNumber.replace(/\D/g, ''))) {
        newErrors.idNumber = translate('navigation.walkin.guestForm.validation.idNumberInvalid');
      } else if (guest.idType === 'PASSPORT' && guest.idNumber.length < 6) {
        newErrors.idNumber = translate('navigation.walkin.guestForm.validation.idNumberInvalid');
      }
    }

    if (nights < 1 || nights > 30) {
      newErrors.nights = translate('navigation.walkin.guestForm.validation.nightsInvalid');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const checkOutDate = new Date();
    checkOutDate.setDate(checkOutDate.getDate() + nights);
    
    onSubmit(guest, checkOutDate);
  };

  const handleInputChange = (field: keyof GuestInfo, value: string) => {
    setGuest(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const getRoomTypeDisplay = (type: string) => {
    const displays = {
      STANDARD: { name: translate('navigation.walkin.roomMap.roomTypes.STANDARD'), icon: '🏨' },
      SUPERIOR: { name: translate('navigation.walkin.roomMap.roomTypes.SUPERIOR'), icon: '⭐' },
      DELUXE: { name: translate('navigation.walkin.roomMap.roomTypes.DELUXE'), icon: '💎' },
      FAMILY: { name: translate('navigation.walkin.roomMap.roomTypes.FAMILY'), icon: '👨‍👩‍👧‍👦' },
      HOP_IN: { name: translate('navigation.walkin.roomMap.roomTypes.HOP_IN'), icon: '🎒' },
      ZENITH: { name: translate('navigation.walkin.roomMap.roomTypes.ZENITH'), icon: '👑' }
    };
    return displays[type as keyof typeof displays] || { name: type, icon: '🏨' };
  };

  const calculateBreakfastPrice = (roomType: string) => {
    const breakfastPricing: Record<string, number> = {
      'STANDARD': 250,
      'SUPERIOR': 250,
      'DELUXE': 250,
      'FAMILY': 350,
      'HOP_IN': 150,
      'ZENITH': 350
    };
    return breakfastPricing[roomType] || 250;
  };

  const roomDisplay = getRoomTypeDisplay(selectedRoom.roomType);
  const breakfastPrice = calculateBreakfastPrice(selectedRoom.roomType);
  const nightlyRate = selectedRoom.basePrice + (includeBreakfast ? breakfastPrice : 0);
  const totalAmount = nightlyRate * nights;

  return (
    <div className="quick-guest-form">
      <div className="form-header">
        <h3>{translate('navigation.walkin.guestForm.title')}</h3>
        <button onClick={onCancel} className="cancel-button" disabled={loading}>
          {translate('navigation.walkin.guestForm.backToRoom')}
        </button>
      </div>

      <div className="selected-room-summary">
        <div className="room-summary-header">
          <div className="room-icon">{roomDisplay.icon}</div>
          <div className="room-details">
            <h4>{translate('navigation.walkin.guestForm.roomDetails.room')} {selectedRoom.roomNumber}</h4>
            <p>{roomDisplay.name} • {translate('navigation.walkin.guestForm.roomDetails.floor')} {selectedRoom.floor}</p>
          </div>
        </div>
        
        <div className="pricing-summary">
          <div className="price-line">
            <span>{translate('navigation.walkin.guestForm.roomDetails.roomRate')}:</span>
            <span>฿{selectedRoom.basePrice.toLocaleString()}{translate('navigation.walkin.guestForm.roomDetails.perNight')}</span>
          </div>
          {includeBreakfast && (
            <div className="price-line breakfast">
              <span>{translate('navigation.walkin.guestForm.roomDetails.breakfast')}:</span>
              <span>+฿{breakfastPrice.toLocaleString()}{translate('navigation.walkin.guestForm.roomDetails.perNight')}</span>
            </div>
          )}
          <div className="price-line total">
            <span>{translate('navigation.walkin.guestForm.roomDetails.nightlyRate')}:</span>
            <span>฿{nightlyRate.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="breakfast-section">
        <div className="breakfast-toggle">
          <label>
            <input
              type="checkbox"
              checked={includeBreakfast}
              onChange={(e) => onBreakfastChange(e.target.checked)}
              disabled={loading}
            />
            <span className="checkbox-custom"></span>
            {translate('navigation.walkin.roomMap.includeBreakfast')}
          </label>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="guest-form">
        <div className="form-section">
          <h4>{translate('navigation.walkin.guestForm.personalInfo.title')}</h4>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">
                {translate('navigation.walkin.guestForm.personalInfo.firstName')} <span className="required">*</span>
              </label>
              <input
                id="firstName"
                type="text"
                value={guest.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className={errors.firstName ? 'error' : ''}
                disabled={loading}
                placeholder={translate('navigation.walkin.guestForm.personalInfo.firstNamePlaceholder')}
              />
              {errors.firstName && <span className="error-text">{errors.firstName}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="lastName">
                {translate('navigation.walkin.guestForm.personalInfo.lastName')} <span className="required">*</span>
              </label>
              <input
                id="lastName"
                type="text"
                value={guest.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className={errors.lastName ? 'error' : ''}
                disabled={loading}
                placeholder={translate('navigation.walkin.guestForm.personalInfo.lastNamePlaceholder')}
              />
              {errors.lastName && <span className="error-text">{errors.lastName}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="phone">
              {translate('navigation.walkin.guestForm.personalInfo.phone')} <span className="required">*</span>
            </label>
            <input
              id="phone"
              type="tel"
              value={guest.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className={errors.phone ? 'error' : ''}
              disabled={loading}
              placeholder={translate('navigation.walkin.guestForm.personalInfo.phonePlaceholder')}
            />
            {errors.phone && <span className="error-text">{errors.phone}</span>}
          </div>
        </div>

        <div className="form-section">
          <h4>{translate('navigation.walkin.guestForm.identification.title')}</h4>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="idType">
                {translate('navigation.walkin.guestForm.identification.idType')} <span className="required">*</span>
              </label>
              <select
                id="idType"
                value={guest.idType}
                onChange={(e) => handleInputChange('idType', e.target.value as 'PASSPORT' | 'NATIONAL_ID')}
                disabled={loading}
              >
                <option value="NATIONAL_ID">{translate('navigation.walkin.guestForm.identification.nationalId')}</option>
                <option value="PASSPORT">{translate('navigation.walkin.guestForm.identification.passport')}</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="idNumber">
                {guest.idType === 'NATIONAL_ID' ? translate('navigation.walkin.guestForm.identification.nationalIdNumber') : translate('navigation.walkin.guestForm.identification.passportNumber')} <span className="required">*</span>
              </label>
              <input
                id="idNumber"
                type="text"
                value={guest.idNumber}
                onChange={(e) => handleInputChange('idNumber', e.target.value)}
                className={errors.idNumber ? 'error' : ''}
                disabled={loading}
                placeholder={guest.idType === 'NATIONAL_ID' ? translate('navigation.walkin.guestForm.identification.nationalIdPlaceholder') : translate('navigation.walkin.guestForm.identification.passportPlaceholder')}
              />
              {errors.idNumber && <span className="error-text">{errors.idNumber}</span>}
            </div>
          </div>
        </div>

        <div className="form-section">
          <h4>{translate('navigation.walkin.guestForm.stayDuration.title')}</h4>
          
          <div className="form-group">
            <label htmlFor="nights">
              {translate('navigation.walkin.guestForm.stayDuration.numberOfNights')} <span className="required">*</span>
            </label>
            <input
              id="nights"
              type="number"
              min="1"
              max="30"
              value={nights}
              onChange={(e) => setNights(parseInt(e.target.value) || 1)}
              className={errors.nights ? 'error' : ''}
              disabled={loading}
            />
            {errors.nights && <span className="error-text">{errors.nights}</span>}
          </div>

          <div className="stay-summary">
            <div className="summary-line">
              <span>{translate('navigation.walkin.guestForm.stayDuration.checkIn')}:</span>
              <span>{formatDate(new Date(), { format: 'short' })}</span>
            </div>
            <div className="summary-line">
              <span>{translate('navigation.walkin.guestForm.stayDuration.checkOut')}:</span>
              <span>{formatDate(new Date(Date.now() + nights * 24 * 60 * 60 * 1000), { format: 'short' })}</span>
            </div>
            <div className="summary-line">
              <span>{translate('navigation.walkin.guestForm.stayDuration.duration')}:</span>
              <span>{nights} {nights !== 1 ? translate('navigation.walkin.guestForm.stayDuration.nights') : translate('navigation.walkin.guestForm.stayDuration.night')}</span>
            </div>
          </div>
        </div>

        <div className="total-section">
          <div className="total-breakdown">
            <div className="breakdown-line">
              <span>{translate('navigation.walkin.guestForm.pricing.room')} ({nights} {nights !== 1 ? translate('navigation.walkin.guestForm.stayDuration.nights') : translate('navigation.walkin.guestForm.stayDuration.night')}):</span>
              <span>฿{(selectedRoom.basePrice * nights).toLocaleString()}</span>
            </div>
            {includeBreakfast && (
              <div className="breakdown-line breakfast">
                <span>{translate('navigation.walkin.guestForm.pricing.breakfast')} ({nights} {nights !== 1 ? translate('navigation.walkin.guestForm.stayDuration.nights') : translate('navigation.walkin.guestForm.stayDuration.night')}):</span>
                <span>฿{(breakfastPrice * nights).toLocaleString()}</span>
              </div>
            )}
            <div className="breakdown-line total">
              <span>{translate('navigation.walkin.guestForm.pricing.totalAmount')}:</span>
              <span>฿{totalAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
            className="secondary-button"
            disabled={loading}
          >
            {translate('navigation.walkin.guestForm.actions.cancel')}
          </button>
          <button
            type="submit"
            className="primary-button"
            disabled={loading}
          >
            {loading ? translate('navigation.walkin.guestForm.actions.creatingBooking') : `${translate('navigation.walkin.guestForm.actions.createBooking')} - ฿${totalAmount.toLocaleString()}`}
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuickGuestForm;