import React from 'react';
import RoomAvailabilityDashboard from '../components/walkin/RoomAvailabilityDashboard';
import './WalkInDashboardPage.css';

const WalkInDashboardPage: React.FC = () => {
  return (
    <div className="walk-in-dashboard-page">
      <div className="page-header">
        <h1>Walk-in Check-in System</h1>
        <p className="page-description">
          Real-time room availability for immediate guest check-ins
        </p>
      </div>
      
      <RoomAvailabilityDashboard />
    </div>
  );
};

export default WalkInDashboardPage;