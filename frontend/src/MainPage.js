// src/MainPage.js
import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

function MainPage() {
  const navigate = useNavigate(); // Initialize navigate

  const handleWalkIn = () => {
    console.log("ลูกค้าไม่ได้จองมาก่อน button clicked");
    navigate('/walk-in-options'); // Navigate to the new page
  };

  const handleReserved = () => {
    console.log("ลูกค้าจองมาแล้ว button clicked");
    // Later: Navigate to reserved guest lookup
    alert("ฟังก์ชันสำหรับ 'ลูกค้าจองมาแล้ว' จะถูกพัฒนาในลำดับถัดไป");
  };

  return (
    <div className="main-page-container">
      <h2>กรุณาเลือกประเภทผู้เข้าพัก:</h2>
      <div className="button-container">
        <button onClick={handleWalkIn} className="main-button">
          ลูกค้าไม่ได้จองมาก่อน
        </button>
        <button onClick={handleReserved} className="main-button">
          ลูกค้าจองมาแล้ว
        </button>
      </div>
    </div>
  );
}

export default MainPage;