// src/App.tsx
import React, { useState, Suspense, lazy, useCallback, memo } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import './App.css';
import Navigation from './Navigation';
import ErrorBoundary from './components/ErrorBoundary';
import { store } from './store';
import { adminAuthRateLimit, sanitizeInput } from './utils/validation';

// Lazy load page components for code splitting
const MainPage = lazy(() => import('./MainPage'));
const WalkInOptionsPage = lazy(() => import('./WalkInOptionsPage'));
const NewBookingPage = lazy(() => import('./NewBookingPage'));
const CurrentBookingsPage = lazy(() => import('./CurrentBookingsPage'));
const ExistingGuestPage = lazy(() => import('./ExistingGuestPage'));

// Loading component for Suspense fallback
const LoadingSpinner = memo(() => (
  <div className="loading-container" style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '200px',
    fontSize: '18px',
    color: '#666'
  }}>
    <div>กำลังโหลด...</div>
  </div>
));
// Remove unused import for now

interface AppProps {}

const App: React.FC<AppProps> = () => {
  // State and logic are "lifted up" to the parent component
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);

  // Admin password from environment variable for security
  const ADMIN_SECRET_CODE: string = process.env.REACT_APP_ADMIN_CODE || 'default-dev-code';

  // Memoized handlers to prevent unnecessary re-renders
  const handleAdminIconClick = useCallback((): void => {
    if (isAdminMode) {
      setIsAdminMode(false);
      return;
    }
    
    // Check rate limiting
    const clientId = 'admin-auth'; // In production, use IP or user identifier
    if (!adminAuthRateLimit.isAllowed(clientId)) {
      const remainingTime = adminAuthRateLimit.getRemainingTime(clientId);
      alert(`คุณพยายามเข้าสู่ระบบมากเกินไป กรุณารออีก ${remainingTime} วินาที`);
      return;
    }
    
    const enteredCode = window.prompt("กรุณาใส่รหัสผ่านผู้ดูแลระบบ:");
    
    if (enteredCode === null) {
      // User cancelled
      return;
    }
    
    // Sanitize input
    const sanitizedCode = sanitizeInput(enteredCode);
    
    if (sanitizedCode === ADMIN_SECRET_CODE) {
      setIsAdminMode(true);
    } else if (sanitizedCode !== "") {
      alert("รหัสผ่านไม่ถูกต้อง");
    }
  }, [isAdminMode, ADMIN_SECRET_CODE]);

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
            <header className="App-header">
              <h1>ระบบจัดการโรงแรม</h1>
              {/* New SVG Icon Button for Admin Access */}
              <button 
                className="header-admin-button" 
                onClick={handleAdminIconClick} 
                title="Admin Panel"
                type="button"
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
              </button>
            </header>
            <Navigation 
              isAdminMode={isAdminMode}
              onReserved={handleReserved}
              onCurrentBookings={handleCurrentBookings}
              onAddUser={handleAddUser}
              onViewUsers={handleViewUsers}
            />
            <main>
              <ErrorBoundary>
                <Suspense fallback={<LoadingSpinner />}>
                  <Routes>
                    <Route path="/" element={<MainPage key="main" isAdminMode={isAdminMode} />} />
                    <Route path="/walk-in-options" element={<WalkInOptionsPage key="walk-in" />} />
                    <Route path="/new-booking" element={<NewBookingPage key="new-booking" />} />
                    <Route path="/current-bookings" element={<CurrentBookingsPage key="current-bookings" />} />
                    <Route path="/existing-guest" element={<ExistingGuestPage key="existing-guest" />} />
                  </Routes>
                </Suspense>
              </ErrorBoundary>
            </main>
          </div>
        </Router>
      </ErrorBoundary>
    </Provider>
  );
};

// Memoize the App component to prevent unnecessary re-renders
export default memo(App);