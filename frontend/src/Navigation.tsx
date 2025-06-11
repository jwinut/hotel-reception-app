// src/Navigation.tsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Navigation.css';

interface NavigationProps {
  isAdminMode: boolean;
  onReserved: () => void;
  onCurrentBookings: () => void;
  onAddUser: () => void;
  onViewUsers: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ 
  isAdminMode, 
  onReserved, 
  onCurrentBookings, 
  onAddUser, 
  onViewUsers 
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path: string | null, action?: () => void): void => {
    if (action) {
      action();
    } else if (path) {
      navigate(path);
    }
  };

  const isActive = (path: string): boolean => location.pathname === path;

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
              type="button"
            >
              ลูกค้าใหม่ ยังไม่ได้จอง
            </button>
            <button 
              onClick={() => navigate('/existing-guest')}
              className={`nav-button primary ${isActive('/existing-guest') ? 'active' : ''}`}
              type="button"
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
              type="button"
            >
              จองห้องใหม่
            </button>
            <button 
              onClick={() => navigate('/current-bookings')}
              className={`nav-button booking ${isActive('/current-bookings') ? 'active' : ''}`}
              type="button"
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
              type="button"
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
                type="button"
              >
                เพิ่มผู้ใช้งาน
              </button>
              <button 
                onClick={() => handleNavigation(null, onViewUsers)}
                className="nav-button admin"
                type="button"
              >
                ดูรายชื่อผู้ใช้งาน
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;