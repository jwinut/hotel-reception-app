// src/MainPage.tsx
import React, { useState, useEffect } from 'react';
import { announceToScreenReader, isEnterOrSpace } from './utils/accessibility';
import { useTranslation } from './hooks/useTranslation';

interface PriceData {
  roomType: string;
  noBreakfast: number | '';
  withBreakfast: number | '';
}

interface MainPageProps {
  isAdminMode: boolean;
}

const MainPage: React.FC<MainPageProps> = ({ isAdminMode }) => {
  const { t } = useTranslation();
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
        setError(t('mainPage.priceManager.noData'));
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
        const errorMessage = t('mainPage.priceManager.validationError');
        announceToScreenReader(errorMessage, 'assertive');
        alert(errorMessage);
        return;
      }

      console.log("Saving all price data:", prices);
      const successMessage = t('mainPage.priceManager.saveSuccess');
      announceToScreenReader(successMessage, 'polite');
      alert(`${successMessage} (ตรวจสอบ Console Log สำหรับข้อมูล)`);
    } catch (err) {
      console.error("Error saving prices:", err);
      const errorMessage = t('mainPage.priceManager.saveError');
      announceToScreenReader(errorMessage, 'assertive');
      alert(errorMessage);
    }
  };

  const togglePriceManager = (): void => {
    setIsPriceManagerOpen(!isPriceManagerOpen);
  };

  return (
    <div className="main-page-container">
      <div className="welcome-section">
        <h1 className="welcome-title" id="main-title">{t('mainPage.welcome.title')}</h1>
        <p className="welcome-text" role="region" aria-labelledby="main-title">
          {t('mainPage.welcome.description')}
        </p>
      </div>
      
      {/* Room Price Management (Toggleable) */}
      <div className="action-group" role="region" aria-label={t('mainPage.priceManager.title')}>
        <h2 
          className={`group-title toggleable ${isPriceManagerOpen ? 'open' : ''}`}
          onClick={togglePriceManager}
          role="button"
          tabIndex={0}
          aria-expanded={isPriceManagerOpen}
          aria-controls="price-manager-content"
          onKeyDown={(e) => {
            if (isEnterOrSpace(e.nativeEvent)) {
              e.preventDefault();
              togglePriceManager();
            }
          }}
        >
          {t('mainPage.priceManager.title')}
          <span className="toggle-icon" aria-hidden="true">▲</span>
        </h2>

        {isPriceManagerOpen && (
          <div className="collapsible-content" id="price-manager-content">
            {isLoading ? (
              <p role="status" aria-busy={true} aria-live="polite" aria-label={t('mainPage.priceManager.loading')}>
                {t('mainPage.priceManager.loading')}
              </p>
            ) : error ? (
              <p className="error-message" role="alert" aria-live="assertive">
                {error}
              </p>
            ) : prices.length > 0 ? (
              <>
                <div className="price-table-container" role="region" aria-label={t('mainPage.priceManager.title')}>
                  <table className="price-table" role="table" aria-label={t('mainPage.priceManager.title')}>
                    <thead>
                      <tr role="row">
                        <th scope="col" id="room-type-header">{t('mainPage.priceManager.roomType')}</th>
                        <th scope="col" id="no-breakfast-header">{t('mainPage.priceManager.noBreakfast')}</th>
                        <th scope="col" id="with-breakfast-header">{t('mainPage.priceManager.withBreakfast')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {prices.map((item, index) => (
                        <tr key={`${item.roomType}-${index}`} role="row">
                          <td role="rowheader">{item.roomType}</td>
                          <td role="gridcell">
                            <input 
                              type="number" 
                              className="price-table-input" 
                              value={item.noBreakfast} 
                              onChange={(e) => handlePriceChange(index, 'noBreakfast', e.target.value)} 
                              min="0"
                              aria-label={`${t('mainPage.priceManager.noBreakfast')} ${item.roomType}`}
                              aria-describedby="no-breakfast-header"
                            />
                          </td>
                          <td role="gridcell">
                            <input 
                              type="number" 
                              className="price-table-input" 
                              value={item.withBreakfast} 
                              onChange={(e) => handlePriceChange(index, 'withBreakfast', e.target.value)} 
                              min="0"
                              aria-label={`${t('mainPage.priceManager.withBreakfast')} ${item.roomType}`}
                              aria-describedby="with-breakfast-header"
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
                  aria-describedby="price-manager-content"
                >
                  {t('mainPage.priceManager.saveAll')}
                </button>
              </>
            ) : (
              <p role="status">{t('mainPage.priceManager.noData')}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MainPage;