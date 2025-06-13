import React, { useState } from 'react';
import { RoomAvailability } from '../../services/walkinApi';
import './QuickGuestForm.css';

interface GuestInfo {
  firstName: string;
  lastName: string;
  phone: string;
  idType: 'PASSPORT' | 'NATIONAL_ID';
  idNumber: string;
}

interface Props {
  selectedRoom: RoomAvailability & { includeBreakfast: boolean };
  onSubmit: (guest: GuestInfo, checkOutDate: Date) => void;
  onCancel: () => void;
  loading?: boolean;
}

const QuickGuestForm: React.FC<Props> = ({ 
  selectedRoom, 
  onSubmit, 
  onCancel,
  loading = false
}) => {
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
        newErrors.idNumber = 'National ID must be 13 digits';
      } else if (guest.idType === 'PASSPORT' && guest.idNumber.length < 6) {
        newErrors.idNumber = 'Passport number too short';
      }
    }

    if (nights < 1 || nights > 30) {
      newErrors.nights = 'Nights must be between 1 and 30';
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
      STANDARD: { name: 'Standard', icon: '🏨' },
      SUPERIOR: { name: 'Superior', icon: '⭐' },
      DELUXE: { name: 'Deluxe', icon: '💎' },
      FAMILY: { name: 'Family', icon: '👨‍👩‍👧‍👦' },
      HOP_IN: { name: 'Hop In', icon: '🎒' },
      ZENITH: { name: 'Zenith', icon: '👑' }
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
  const nightlyRate = selectedRoom.basePrice + (selectedRoom.includeBreakfast ? breakfastPrice : 0);
  const totalAmount = nightlyRate * nights;

  return (
    <div className="quick-guest-form">
      <div className="form-header">
        <h3>Guest Information</h3>
        <button onClick={onCancel} className="cancel-button" disabled={loading}>
          ← Back to Room Selection
        </button>
      </div>

      <div className="selected-room-summary">
        <div className="room-summary-header">
          <div className="room-icon">{roomDisplay.icon}</div>
          <div className="room-details">
            <h4>Room {selectedRoom.roomNumber}</h4>
            <p>{roomDisplay.name} • Floor {selectedRoom.floor}</p>
          </div>
        </div>
        
        <div className="pricing-summary">
          <div className="price-line">
            <span>Room Rate:</span>
            <span>฿{selectedRoom.basePrice.toLocaleString()}/night</span>
          </div>
          {selectedRoom.includeBreakfast && (
            <div className="price-line breakfast">
              <span>Breakfast:</span>
              <span>+฿{breakfastPrice.toLocaleString()}/night</span>
            </div>
          )}
          <div className="price-line total">
            <span>Nightly Rate:</span>
            <span>฿{nightlyRate.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="guest-form">
        <div className="form-section">
          <h4>Personal Information</h4>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">
                First Name <span className="required">*</span>
              </label>
              <input
                id="firstName"
                type="text"
                value={guest.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className={errors.firstName ? 'error' : ''}
                disabled={loading}
                placeholder="Enter first name"
              />
              {errors.firstName && <span className="error-text">{errors.firstName}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="lastName">
                Last Name <span className="required">*</span>
              </label>
              <input
                id="lastName"
                type="text"
                value={guest.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className={errors.lastName ? 'error' : ''}
                disabled={loading}
                placeholder="Enter last name"
              />
              {errors.lastName && <span className="error-text">{errors.lastName}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="phone">
              Phone Number <span className="required">*</span>
            </label>
            <input
              id="phone"
              type="tel"
              value={guest.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className={errors.phone ? 'error' : ''}
              disabled={loading}
              placeholder="e.g., +66 2 123 4567 or 02-123-4567"
            />
            {errors.phone && <span className="error-text">{errors.phone}</span>}
          </div>
        </div>

        <div className="form-section">
          <h4>Identification</h4>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="idType">
                ID Type <span className="required">*</span>
              </label>
              <select
                id="idType"
                value={guest.idType}
                onChange={(e) => handleInputChange('idType', e.target.value as 'PASSPORT' | 'NATIONAL_ID')}
                disabled={loading}
              >
                <option value="NATIONAL_ID">National ID Card</option>
                <option value="PASSPORT">Passport</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="idNumber">
                {guest.idType === 'NATIONAL_ID' ? 'National ID Number' : 'Passport Number'} <span className="required">*</span>
              </label>
              <input
                id="idNumber"
                type="text"
                value={guest.idNumber}
                onChange={(e) => handleInputChange('idNumber', e.target.value)}
                className={errors.idNumber ? 'error' : ''}
                disabled={loading}
                placeholder={guest.idType === 'NATIONAL_ID' ? 'e.g., 1234567890123' : 'e.g., A1234567'}
              />
              {errors.idNumber && <span className="error-text">{errors.idNumber}</span>}
            </div>
          </div>
        </div>

        <div className="form-section">
          <h4>Stay Duration</h4>
          
          <div className="form-group">
            <label htmlFor="nights">
              Number of Nights <span className="required">*</span>
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
              <span>Check-in:</span>
              <span>{new Date().toLocaleDateString('en-GB')}</span>
            </div>
            <div className="summary-line">
              <span>Check-out:</span>
              <span>{new Date(Date.now() + nights * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB')}</span>
            </div>
            <div className="summary-line">
              <span>Duration:</span>
              <span>{nights} night{nights !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>

        <div className="total-section">
          <div className="total-breakdown">
            <div className="breakdown-line">
              <span>Room ({nights} night{nights !== 1 ? 's' : ''}):</span>
              <span>฿{(selectedRoom.basePrice * nights).toLocaleString()}</span>
            </div>
            {selectedRoom.includeBreakfast && (
              <div className="breakdown-line breakfast">
                <span>Breakfast ({nights} night{nights !== 1 ? 's' : ''}):</span>
                <span>฿{(breakfastPrice * nights).toLocaleString()}</span>
              </div>
            )}
            <div className="breakdown-line total">
              <span>Total Amount:</span>
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
            Cancel
          </button>
          <button
            type="submit"
            className="primary-button"
            disabled={loading}
          >
            {loading ? 'Creating Booking...' : `Create Booking - ฿${totalAmount.toLocaleString()}`}
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuickGuestForm;