// src/Navigation.tsx
import React, { memo, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createBreadcrumbAriaProps } from './utils/accessibility';
import { useTranslation } from './hooks/useTranslation';
import './Navigation.css';

interface NavigationProps {
  isAdminMode: boolean;
  onReserved: () => void;
  onCurrentBookings: () => void;
  onAddUser: () => void;
  onViewUsers: () => void;
}

const Navigation: React.FC<NavigationProps> = memo(({ 
  isAdminMode, 
  onReserved, 
  onCurrentBookings, 
  onAddUser, 
  onViewUsers 
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  // Memoized active path checker
  const isActive = useCallback((path: string): boolean => {
    if (path === '/walk-in-dashboard') {
      // Walk-in is active for all walk-in related paths
      return location.pathname === '/walk-in-dashboard' || 
             location.pathname === '/' || 
             location.pathname.startsWith('/walk-in/');
    }
    return location.pathname === path;
  }, [location.pathname]);

  // Memoized navigation buttons to prevent recreation on every render
  const navigationButtons = useMemo(() => ({
    walkInDashboard: () => navigate('/walk-in-dashboard'),
    existingGuest: () => navigate('/existing-guest'),
    newBooking: () => navigate('/new-booking'),
    currentBookings: () => navigate('/current-bookings'),
    roomPricing: () => navigate('/room-pricing'),
    userManagement: () => navigate('/user-management'),
  }), [navigate]);

  return (
    <nav className="main-navigation" role="navigation" aria-label={t('navigation.main')}>
      <div className="nav-container">
        {/* Primary Navigation */}
        <div className="nav-section">
          <h3 className="nav-section-title" id="checkin-section">{t('navigation.checkin.title')}</h3>
          <div className="nav-buttons" role="group" aria-labelledby="checkin-section">
            <button 
              onClick={navigationButtons.walkInDashboard}
              className={`nav-button primary ${isActive('/walk-in-dashboard') ? 'active' : ''}`}
              type="button"
              aria-describedby="checkin-section"
              {...createBreadcrumbAriaProps(isActive('/walk-in-dashboard'))}
            >
              🏨 Walk-in
            </button>
            <button 
              onClick={navigationButtons.existingGuest}
              className={`nav-button primary ${isActive('/existing-guest') ? 'active' : ''}`}
              type="button"
              aria-describedby="checkin-section"
              {...createBreadcrumbAriaProps(isActive('/existing-guest'))}
            >
              {t('navigation.checkin.existing')}
            </button>
          </div>
        </div>

        {/* Booking Management */}
        <div className="nav-section">
          <h3 className="nav-section-title" id="booking-section">{t('navigation.booking.title')}</h3>
          <div className="nav-buttons" role="group" aria-labelledby="booking-section">
            <button 
              onClick={navigationButtons.newBooking}
              className={`nav-button booking ${isActive('/new-booking') ? 'active' : ''}`}
              type="button"
              aria-describedby="booking-section"
              {...createBreadcrumbAriaProps(isActive('/new-booking'))}
            >
              {t('navigation.booking.new')}
            </button>
            <button 
              onClick={navigationButtons.currentBookings}
              className={`nav-button booking ${isActive('/current-bookings') ? 'active' : ''}`}
              type="button"
              aria-describedby="booking-section"
              {...createBreadcrumbAriaProps(isActive('/current-bookings'))}
            >
              {t('navigation.booking.current')}
            </button>
          </div>
        </div>

        {/* Admin Section */}
        {isAdminMode && (
          <div className="nav-section admin-section">
            <h3 className="nav-section-title" id="admin-section">{t('navigation.admin.title')}</h3>
            <div className="nav-buttons" role="group" aria-labelledby="admin-section">
              <button 
                onClick={navigationButtons.roomPricing}
                className={`nav-button admin ${isActive('/room-pricing') ? 'active' : ''}`}
                type="button"
                aria-describedby="admin-section"
                {...createBreadcrumbAriaProps(isActive('/room-pricing'))}
              >
                {t('navigation.admin.roomPricing')}
              </button>
              <button 
                onClick={navigationButtons.userManagement}
                className={`nav-button admin ${isActive('/user-management') ? 'active' : ''}`}
                type="button"
                aria-describedby="admin-section"
                {...createBreadcrumbAriaProps(isActive('/user-management'))}
              >
                {t('navigation.admin.userManagement')}
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
});

export default Navigation;