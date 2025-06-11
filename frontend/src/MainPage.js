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




  return (
    <div className="main-page-container">
      <div className="welcome-section">
        <h1 className="welcome-title">ยินดีต้อนรับสู่ระบบจัดการโรงแรม</h1>
        <p className="welcome-text">เลือกเมนูที่ต้องการจากแถบนำทางด้านบน หรือจัดการราคาห้องพักด้านล่าง</p>
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

    </div>
  );
}

export default MainPage;