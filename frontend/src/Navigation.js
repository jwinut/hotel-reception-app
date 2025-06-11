// src/Navigation.js
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Navigation.css';

function Navigation({ isAdminMode, onReserved, onCurrentBookings, onAddUser, onViewUsers }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path, action) => {
    if (action) {
      action();
    } else {
      navigate(path);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="main-navigation">
      <div className="nav-container">
        {/* Primary Navigation */}
        <div className="nav-section">
          <h3 className="nav-section-title">เช็คอินลูกค้า</h3>
          <div className="nav-buttons">
            <button 
              onClick={() => navigate('/walk-in-options')}
              className={`nav-button primary ${isActive('/walk-in-options') ? 'active' : ''}`}
            >
              ลูกค้าใหม่ ยังไม่ได้จอง
            </button>
            <button 
              onClick={() => handleNavigation(null, onReserved)}
              className="nav-button primary"
            >
              ลูกค้าจองมาแล้ว
            </button>
          </div>
        </div>

        {/* Booking Management */}
        <div className="nav-section">
          <h3 className="nav-section-title">จองห้อง</h3>
          <div className="nav-buttons">
            <button 
              onClick={() => navigate('/new-booking')}
              className={`nav-button booking ${isActive('/new-booking') ? 'active' : ''}`}
            >
              จองห้องใหม่
            </button>
            <button 
              onClick={() => handleNavigation(null, onCurrentBookings)}
              className="nav-button booking"
            >
              รายการจองปัจจุบัน
            </button>
          </div>
        </div>

        {/* Quick Access */}
        <div className="nav-section">
          <h3 className="nav-section-title">เมนูหลัก</h3>
          <div className="nav-buttons">
            <button 
              onClick={() => handleNavigation('/')}
              className={`nav-button secondary ${isActive('/') ? 'active' : ''}`}
            >
              หน้าหลัก
            </button>
          </div>
        </div>

        {/* Admin Section */}
        {isAdminMode && (
          <div className="nav-section admin-section">
            <h3 className="nav-section-title">จัดการผู้ใช้งาน</h3>
            <div className="nav-buttons">
              <button 
                onClick={() => handleNavigation(null, onAddUser)}
                className="nav-button admin"
              >
                เพิ่มผู้ใช้งาน
              </button>
              <button 
                onClick={() => handleNavigation(null, onViewUsers)}
                className="nav-button admin"
              >
                ดูรายชื่อผู้ใช้งาน
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navigation;