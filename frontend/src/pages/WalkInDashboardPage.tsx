import React from 'react';
import RoomAvailabilityDashboard from '../components/walkin/RoomAvailabilityDashboard';
import './WalkInDashboardPage.css';

const WalkInDashboardPage: React.FC = () => {
  return (
    <div className="walk-in-dashboard-page">
      <RoomAvailabilityDashboard />
    </div>
  );
};

export default WalkInDashboardPage;