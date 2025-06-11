// src/App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import MainPage from './MainPage';
import WalkInOptionsPage from './WalkInOptionsPage';
import NewBookingPage from './NewBookingPage';
import CurrentBookingsPage from './CurrentBookingsPage';
import Navigation from './Navigation';

function App() {
  // State and logic are "lifted up" to the parent component
  const [isAdminMode, setIsAdminMode] = useState(false);

  // IMPORTANT: In a real app, this should be an environment variable.
  const ADMIN_SECRET_CODE = 'banana';

  const handleAdminIconClick = () => {
    if (isAdminMode) {
      setIsAdminMode(false);
      return;
    }
    const enteredCode = window.prompt("กรุณาใส่รหัสผ่านผู้ดูแลระบบ:");
    if (enteredCode === ADMIN_SECRET_CODE) {
      setIsAdminMode(true);
    } else if (enteredCode !== null && enteredCode !== "") {
      alert("รหัสผ่านไม่ถูกต้อง");
    }
  };

  // Navigation handlers - now using navigate directly in Navigation component
  const handleReserved = () => alert("ฟังก์ชันสำหรับ 'ลูกค้าจองมาแล้ว' จะถูกพัฒนาในลำดับถัดไป");
  const handleCurrentBookings = () => alert("ฟังก์ชัน 'รายการจองปัจจุบัน' จะถูกพัฒนาในลำดับถัดไป");
  const handleAddUser = () => alert("ฟังก์ชัน 'เพิ่มผู้ใช้งานใหม่' จะถูกพัฒนาในลำดับถัดไป");
  const handleViewUsers = () => alert("ฟังก์ชัน 'ดูรายชื่อผู้ใช้งาน' จะถูกพัฒนาในลำดับถัดไป");

  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>ระบบจัดการโรงแรม</h1>
          {/* New SVG Icon Button for Admin Access */}
          <button className="header-admin-button" onClick={handleAdminIconClick} title="Admin Panel">
            <svg xmlns="http://www.w3.org/2000/svg" height="28px" viewBox="0 0 24 24" width="28px" fill="#FFFFFF">
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
          <Routes>
            <Route path="/" element={<MainPage isAdminMode={isAdminMode} />} />
            <Route path="/walk-in-options" element={<WalkInOptionsPage />} />
            <Route path="/new-booking" element={<NewBookingPage />} />
            <Route path="/current-bookings" element={<CurrentBookingsPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;