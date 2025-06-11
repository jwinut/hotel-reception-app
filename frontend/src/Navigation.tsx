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

  // Memoized navigation handler
  const handleNavigation = useCallback((path: string | null, action?: () => void): void => {
    if (action) {
      action();
    } else if (path) {
      navigate(path);
    }
  }, [navigate]);

  // Memoized active path checker
  const isActive = useCallback((path: string): boolean => location.pathname === path, [location.pathname]);

  // Memoized navigation buttons to prevent recreation on every render
  const navigationButtons = useMemo(() => ({
    walkInOptions: () => navigate('/walk-in-options'),
    existingGuest: () => navigate('/existing-guest'),
    newBooking: () => navigate('/new-booking'),
    currentBookings: () => navigate('/current-bookings'),
    home: () => navigate('/'),
  }), [navigate]);

  return (
    <nav className="main-navigation" role="navigation" aria-label={t('navigation.main')}>
      <div className="nav-container">
        {/* Primary Navigation */}
        <div className="nav-section">
          <h3 className="nav-section-title" id="checkin-section">{t('navigation.checkin.title')}</h3>
          <div className="nav-buttons" role="group" aria-labelledby="checkin-section">
            <button 
              onClick={navigationButtons.walkInOptions}
              className={`nav-button primary ${isActive('/walk-in-options') ? 'active' : ''}`}
              type="button"
              aria-describedby="checkin-section"
              {...createBreadcrumbAriaProps(isActive('/walk-in-options'))}
            >
              {t('navigation.checkin.walkIn')}
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

        {/* Quick Access */}
        <div className="nav-section">
          <h3 className="nav-section-title" id="main-section">{t('navigation.main')}</h3>
          <div className="nav-buttons" role="group" aria-labelledby="main-section">
            <button 
              onClick={navigationButtons.home}
              className={`nav-button secondary ${isActive('/') ? 'active' : ''}`}
              type="button"
              aria-describedby="main-section"
              {...createBreadcrumbAriaProps(isActive('/'))}
            >
              {t('navigation.home')}
            </button>
          </div>
        </div>

        {/* Admin Section */}
        {isAdminMode && (
          <div className="nav-section admin-section">
            <h3 className="nav-section-title" id="admin-section">{t('navigation.admin.title')}</h3>
            <div className="nav-buttons" role="group" aria-labelledby="admin-section">
              <button 
                onClick={() => handleNavigation(null, onAddUser)}
                className="nav-button admin"
                type="button"
                aria-describedby="admin-section"
              >
                {t('navigation.admin.addUser')}
              </button>
              <button 
                onClick={() => handleNavigation(null, onViewUsers)}
                className="nav-button admin"
                type="button"
                aria-describedby="admin-section"
              >
                {t('navigation.admin.viewUsers')}
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
});

export default Navigation;