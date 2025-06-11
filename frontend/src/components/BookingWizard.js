// src/components/BookingWizard.js
import React, { useState } from 'react';
import GuestForm from './GuestForm';
import DateSelection from './DateSelection';
import RoomSelection from './RoomSelection';
import BookingConfirmation from './BookingConfirmation';
import './BookingWizard.css';

const STEPS = [
  { id: 'guest', title: 'ข้อมูลผู้เข้าพัก', icon: '👤' },
  { id: 'dates', title: 'วันที่เข้า-ออก', icon: '📅' },
  { id: 'room', title: 'เลือกห้องพัก', icon: '🏠' },
  { id: 'confirm', title: 'ยืนยันการจอง', icon: '✅' }
];

function BookingWizard({ onComplete, onCancel }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [bookingData, setBookingData] = useState({
    guest: {},
    dates: {},
    room: {},
    pricing: {}
  });

  const currentStepId = STEPS[currentStep].id;

  const handleStepComplete = (stepData) => {
    const updatedBookingData = {
      ...bookingData,
      [currentStepId]: stepData
    };
    setBookingData(updatedBookingData);

    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final step - complete booking
      onComplete(updatedBookingData);
    }
  };

  const handleStepBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCancel = () => {
    if (window.confirm('ต้องการยกเลิกการจองหรือไม่? ข้อมูลที่กรอกจะหายไป')) {
      onCancel();
    }
  };

  const renderStepContent = () => {
    switch (currentStepId) {
      case 'guest':
        return (
          <GuestForm
            initialData={bookingData.guest}
            onComplete={handleStepComplete}
            onCancel={handleCancel}
          />
        );
      case 'dates':
        return (
          <DateSelection
            initialData={bookingData.dates}
            guestData={bookingData.guest}
            onComplete={handleStepComplete}
            onBack={handleStepBack}
            onCancel={handleCancel}
          />
        );
      case 'room':
        return (
          <RoomSelection
            initialData={bookingData.room}
            guestData={bookingData.guest}
            datesData={bookingData.dates}
            onComplete={handleStepComplete}
            onBack={handleStepBack}
            onCancel={handleCancel}
          />
        );
      case 'confirm':
        return (
          <BookingConfirmation
            bookingData={bookingData}
            onComplete={handleStepComplete}
            onBack={handleStepBack}
            onCancel={handleCancel}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="booking-wizard">
      {/* Progress Indicator */}
      <div className="wizard-progress">
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
          />
        </div>
        <div className="progress-steps">
          {STEPS.map((step, index) => (
            <div
              key={step.id}
              className={`progress-step ${
                index === currentStep ? 'active' : 
                index < currentStep ? 'completed' : 'pending'
              }`}
            >
              <div className="step-icon">
                {index < currentStep ? '✓' : step.icon}
              </div>
              <div className="step-title">{step.title}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="wizard-content">
        {renderStepContent()}
      </div>
    </div>
  );
}

export default BookingWizard;