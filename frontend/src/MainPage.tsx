// src/MainPage.tsx
import React, { useState, useEffect } from 'react';

interface PriceData {
  roomType: string;
  noBreakfast: number | '';
  withBreakfast: number | '';
}

interface MainPageProps {
  isAdminMode: boolean;
}

const MainPage: React.FC<MainPageProps> = ({ isAdminMode }) => {

  const [prices, setPrices] = useState<PriceData[]>([]);
  const [isPriceManagerOpen, setIsPriceManagerOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPriceData = async (): Promise<void> => {
      try {
        setIsLoading(true);
        const response = await fetch('/config/priceData.json');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setPrices(data.prices || []);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch price data:", err);
        setError("ไม่สามารถโหลดข้อมูลราคาได้");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPriceData();
  }, []);

  const handlePriceChange = (
    index: number, 
    fieldName: keyof Omit<PriceData, 'roomType'>, 
    value: string
  ): void => {
    const updatedPrices = [...prices];
    const currentPrice = updatedPrices[index];
    if (currentPrice) {
      updatedPrices[index] = {
        ...currentPrice,
        [fieldName]: value === '' ? '' : Number(value)
      };
      setPrices(updatedPrices);
    }
  };

  const handleSaveAllPrices = (): void => {
    try {
      // Validate all prices are numbers
      const hasInvalidPrices = prices.some(price => 
        price.noBreakfast === '' || price.withBreakfast === '' ||
        isNaN(Number(price.noBreakfast)) || isNaN(Number(price.withBreakfast))
      );

      if (hasInvalidPrices) {
        alert("กรุณากรอกราคาให้ครบถ้วนและเป็นตัวเลข");
        return;
      }

      console.log("Saving all price data:", prices);
      alert("บันทึกราคาทั้งหมดแล้ว (ตรวจสอบ Console Log สำหรับข้อมูล)");
    } catch (err) {
      console.error("Error saving prices:", err);
      alert("เกิดข้อผิดพลาดในการบันทึกราคา");
    }
  };

  const togglePriceManager = (): void => {
    setIsPriceManagerOpen(!isPriceManagerOpen);
  };

  return (
    <div className="main-page-container">
      <div className="welcome-section">
        <h1 className="welcome-title">ยินดีต้อนรับสู่ระบบจัดการโรงแรม</h1>
        <p className="welcome-text">
          เลือกเมนูที่ต้องการจากแถบนำทางด้านบน หรือจัดการราคาห้องพักด้านล่าง
        </p>
      </div>
      
      {/* Room Price Management (Toggleable) */}
      <div className="action-group">
        <h2 
          className={`group-title toggleable ${isPriceManagerOpen ? 'open' : ''}`}
          onClick={togglePriceManager}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              togglePriceManager();
            }
          }}
        >
          จัดการราคาห้องพัก
          <span className="toggle-icon" aria-hidden="true">▲</span>
        </h2>

        {isPriceManagerOpen && (
          <div className="collapsible-content">
            {isLoading ? (
              <p>กำลังโหลดข้อมูลราคา...</p>
            ) : error ? (
              <p className="error-message">{error}</p>
            ) : prices.length > 0 ? (
              <>
                <div className="price-table-container">
                  <table className="price-table">
                    <thead>
                      <tr>
                        <th scope="col">ประเภทห้องพัก</th>
                        <th scope="col">ไม่รวมอาหารเช้า (บาท)</th>
                        <th scope="col">รวมอาหารเช้า (บาท)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {prices.map((item, index) => (
                        <tr key={`${item.roomType}-${index}`}>
                          <td>{item.roomType}</td>
                          <td>
                            <input 
                              type="number" 
                              className="price-table-input" 
                              value={item.noBreakfast} 
                              onChange={(e) => handlePriceChange(index, 'noBreakfast', e.target.value)} 
                              min="0"
                              aria-label={`ราคาไม่รวมอาหารเช้าสำหรับ ${item.roomType}`}
                            />
                          </td>
                          <td>
                            <input 
                              type="number" 
                              className="price-table-input" 
                              value={item.withBreakfast} 
                              onChange={(e) => handlePriceChange(index, 'withBreakfast', e.target.value)} 
                              min="0"
                              aria-label={`ราคารวมอาหารเช้าสำหรับ ${item.roomType}`}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button 
                  className="main-button save-all-button" 
                  onClick={handleSaveAllPrices}
                  type="button"
                >
                  บันทึกราคาทั้งหมด
                </button>
              </>
            ) : (
              <p>ไม่พบข้อมูลราคา</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MainPage;