// src/MainPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function MainPage({ isAdminMode }) {
  const navigate = useNavigate();

  const [prices, setPrices] = useState([]);
  const [isPriceManagerOpen, setIsPriceManagerOpen] = useState(false); // State for the toggle

  useEffect(() => {
    fetch('/config/priceData.json')
      .then(res => res.json())
      .then(data => {
        setPrices(data.prices || []);
      })
      .catch(err => console.error("Failed to fetch price data:", err));
  }, []);

  // --- Handlers for Price Management ---
  const handlePriceChange = (index, fieldName, value) => {
    const updatedPrices = JSON.parse(JSON.stringify(prices));
    updatedPrices[index][fieldName] = value === '' ? '' : Number(value);
    setPrices(updatedPrices);
  };

  const handleSaveAllPrices = () => {
    console.log("Saving all price data:", prices);
    alert("บันทึกราคาทั้งหมดแล้ว (ตรวจสอบ Console Log สำหรับข้อมูล)");
  };


  // --- Placeholder Handlers for other buttons ---
  const handleWalkIn = () => navigate('/walk-in-options');
  const handleReserved = () => alert("ฟังก์ชันสำหรับ 'ลูกค้าจองมาแล้ว' จะถูกพัฒนาในลำดับถัดไป");
  const handleNewBooking = () => alert("ฟังก์ชัน 'จองห้องใหม่' จะถูกพัฒนาในลำดับถัดไป");
  const handleCurrentBookings = () => alert("ฟังก์ชัน 'รายการจองปัจจุบัน' จะถูกพัฒนาในลำดับถัดไป");
  const handleAddUser = () => alert("ฟังก์ชัน 'เพิ่มผู้ใช้งานใหม่' จะถูกพัฒนาในลำดับถัดไป");
  const handleViewUsers = () => alert("ฟังก์ชัน 'ดูรายชื่อผู้ใช้งาน' จะถูกพัฒนาในลำดับถัดไป");


  return (
    <div className="main-page-container">
      {/* --- Group 1 & 2 (Unchanged) --- */}
      <div className="action-group">
        <h2 className="group-title">เช็คอินลูกค้า กรุณาเลือกประเภทผู้เข้าพัก</h2>
        <div className="button-container">
          <button onClick={handleWalkIn} className="main-button">ลูกค้าไม่ได้จองมาก่อน</button>
          <button onClick={handleReserved} className="main-button">ลูกค้าจองมาแล้ว</button>
        </div>
      </div>

      <div className="action-group">
        <h2 className="group-title">จองห้องให้ลูกค้า</h2>
        <div className="button-container">
          <button onClick={handleNewBooking} className="main-button booking-button">จองห้องใหม่</button>
          <button onClick={handleCurrentBookings} className="main-button booking-button">รายการจองปัจจุบัน</button>
        </div>
      </div>
      

      {/* --- Group 3: Room Price Management (Toggleable) --- */}
      <div className="action-group">
        <h2 
          className={`group-title toggleable ${isPriceManagerOpen ? 'open' : ''}`}
          onClick={() => setIsPriceManagerOpen(!isPriceManagerOpen)}
        >
          จัดการราคาห้องพัก
          <span className="toggle-icon">▲</span>
        </h2>

        {isPriceManagerOpen && (
          <div className="collapsible-content">
            {prices.length > 0 ? (
              <>
                <div className="price-table-container">
                  <table className="price-table">
                    <thead>
                      <tr>
                        <th>ประเภทห้องพัก</th>
                        <th>ไม่รวมอาหารเช้า (บาท)</th>
                        <th>รวมอาหารเช้า (บาท)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {prices.map((item, index) => (
                        <tr key={item.roomType}>
                          <td>{item.roomType}</td>
                          <td>
                            <input type="number" className="price-table-input" value={item.noBreakfast} onChange={(e) => handlePriceChange(index, 'noBreakfast', e.target.value)} min="0" />
                          </td>
                          <td>
                            <input type="number" className="price-table-input" value={item.withBreakfast} onChange={(e) => handlePriceChange(index, 'withBreakfast', e.target.value)} min="0" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button className="main-button save-all-button" onClick={handleSaveAllPrices}>
                  บันทึกราคาทั้งหมด
                </button>
              </>
            ) : <p>กำลังโหลดข้อมูลราคา...</p>}
          </div>
        )}
      </div>

      {/* --- Admin Section (Unchanged) --- */}
      {isAdminMode && (
        <div className="action-group admin-panel">
          <h2 className="group-title">จัดการผู้ใช้งาน (Admin)</h2>
          <div className="button-container">
            <button onClick={handleAddUser} className="main-button admin-button">เพิ่มผู้ใช้งานใหม่</button>
            <button onClick={handleViewUsers} className="main-button admin-button">ดูรายชื่อผู้ใช้งาน</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MainPage;