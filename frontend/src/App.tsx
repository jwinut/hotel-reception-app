// src/App.tsx
import React, { useState, Suspense, lazy, useCallback, memo } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import './design-system/tokens.css';
import './App.css';
import './styles/accessibility.css';
import './i18n'; // Initialize i18n
import Navigation from './Navigation';
import ErrorBoundary from './components/ErrorBoundary';
import LanguageSwitcher from './components/LanguageSwitcher';
import { store } from './store';
import { adminAuthRateLimit, sanitizeInput } from './utils/validation';
import { announceToScreenReader } from './utils/accessibility';
import { useTranslation } from './hooks/useTranslation';

// Lazy load page components for code splitting
const MainPage = lazy(() => import('./MainPage'));
const WalkInOptionsPage = lazy(() => import('./WalkInOptionsPage'));
const WalkInDashboardPage = lazy(() => import('./pages/WalkInDashboardPage'));
const NewBookingPage = lazy(() => import('./NewBookingPage'));
const CurrentBookingsPage = lazy(() => import('./CurrentBookingsPage'));
const ExistingGuestPage = lazy(() => import('./ExistingGuestPage'));

// Loading component for Suspense fallback
const LoadingSpinner = memo(() => (
  <div 
    className="loading-container" 
    style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '200px',
      fontSize: '18px',
      color: '#666'
    }}
    role="status"
    aria-busy={true}
    aria-live="polite"
    aria-label="กำลังโหลดหน้าเว็บ"
  >
    <div>กำลังโหลด...</div>
  </div>
));
// Remove unused import for now

interface AppProps {}

const App: React.FC<AppProps> = () => {
  // State and logic are "lifted up" to the parent component
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const { t } = useTranslation();

  // Admin password from environment variable for security
  const ADMIN_SECRET_CODE: string = process.env.REACT_APP_ADMIN_CODE || 'default-dev-code';

  // Memoized handlers to prevent unnecessary re-renders
  const handleAdminIconClick = useCallback((): void => {
    if (isAdminMode) {
      setIsAdminMode(false);
      announceToScreenReader(t('admin.modeExit'), 'polite');
      return;
    }
    
    // Check rate limiting
    const clientId = 'admin-auth'; // In production, use IP or user identifier
    if (!adminAuthRateLimit.isAllowed(clientId)) {
      const remainingTime = adminAuthRateLimit.getRemainingTime(clientId);
      const message = t('admin.rateLimitError', { seconds: remainingTime });
      announceToScreenReader(message, 'assertive');
      alert(message);
      return;
    }
    
    const enteredCode = window.prompt(t('admin.loginPrompt'));
    
    if (enteredCode === null) {
      // User cancelled
      return;
    }
    
    // Sanitize input
    const sanitizedCode = sanitizeInput(enteredCode);
    
    if (sanitizedCode === ADMIN_SECRET_CODE) {
      setIsAdminMode(true);
      announceToScreenReader(t('admin.modeEnter'), 'polite');
    } else if (sanitizedCode !== "") {
      const errorMessage = t('admin.loginError');
      announceToScreenReader(errorMessage, 'assertive');
      alert(errorMessage);
    }
  }, [isAdminMode, ADMIN_SECRET_CODE, t]);

  // Navigation handlers - memoized to prevent unnecessary re-renders
  const handleReserved = useCallback((): void => alert("ฟังก์ชันสำหรับ 'ลูกค้าจองมาแล้ว' จะถูกพัฒนาในลำดับถัดไป"), []);
  const handleCurrentBookings = useCallback((): void => alert("ฟังก์ชัน 'รายการจองปัจจุบัน' จะถูกพัฒนาในลำดับถัดไป"), []);
  const handleAddUser = useCallback((): void => alert("ฟังก์ชัน 'เพิ่มผู้ใช้งานใหม่' จะถูกพัฒนาในลำดับถัดไป"), []);
  const handleViewUsers = useCallback((): void => alert("ฟังก์ชัน 'ดูรายชื่อผู้ใช้งาน' จะถูกพัฒนาในลำดับถัดไป"), []);

  return (
    <Provider store={store}>
      <ErrorBoundary>
        <Router>
          <div className="App">
            {/* Skip Links for Accessibility */}
            <a className="skip-link" href="#main-content">
              {t('accessibility.skipToMain')}
            </a>
            <a className="skip-link" href="#navigation">
              {t('accessibility.skipToNav')}
            </a>
            
            <header className="App-header" role="banner">
              <div className="header-content">
                <h1 id="site-title">{t('app.title')}</h1>
                <div className="header-navigation" id="navigation">
                  <Navigation 
                    isAdminMode={isAdminMode}
                    onReserved={handleReserved}
                    onCurrentBookings={handleCurrentBookings}
                    onAddUser={handleAddUser}
                    onViewUsers={handleViewUsers}
                  />
                </div>
                <div className="header-controls">
                  <LanguageSwitcher variant="buttons" className="header-language-switcher" />
                  {/* Admin Access Button */}
                  <button 
                    className="header-admin-button" 
                    onClick={handleAdminIconClick} 
                    aria-label={isAdminMode ? t('admin.buttonLabel.exit') : t('admin.buttonLabel.enter')}
                    type="button"
                    aria-describedby="site-title"
                  >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  height="28px" 
                  viewBox="0 0 24 24" 
                  width="28px" 
                  fill="#FFFFFF"
                  aria-hidden="true"
                >
                  <path d="M0 0h24v24H0V0z" fill="none"/>
                  <path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69-.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61.22l2 3.46c.13.22.07.49.12.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/>
                </svg>
                <span className="sr-only">
                  {isAdminMode ? t('admin.buttonLabel.current') : t('admin.buttonLabel.idle')}
                </span>
                  </button>
                </div>
              </div>
            </header>
            
            
            <main id="main-content" role="main" tabIndex={-1}>
              <ErrorBoundary>
                <Suspense fallback={<LoadingSpinner />}>
                  <Routes>
                    <Route path="/" element={<MainPage key="main" isAdminMode={isAdminMode} />} />
                    <Route path="/walk-in-options" element={<WalkInOptionsPage key="walk-in" />} />
                    <Route path="/walk-in-dashboard" element={<WalkInDashboardPage key="walk-in-dashboard" />} />
                    <Route path="/new-booking" element={<NewBookingPage key="new-booking" />} />
                    <Route path="/current-bookings" element={<CurrentBookingsPage key="current-bookings" />} />
                    <Route path="/existing-guest" element={<ExistingGuestPage key="existing-guest" />} />
                  </Routes>
                </Suspense>
              </ErrorBoundary>
            </main>
            
            {/* Live region for screen reader announcements */}
            <div 
              id="live-region" 
              aria-live="polite" 
              aria-atomic="true" 
              className="sr-only"
            ></div>
          </div>
        </Router>
      </ErrorBoundary>
    </Provider>
  );
};

// Memoize the App component to prevent unnecessary re-renders
export default memo(App);