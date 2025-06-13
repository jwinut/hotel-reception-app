import React, { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { announceToScreenReader } from '../utils/accessibility';
import '../styles/RoomPricingPage.css';

interface PricingData {
  id?: string;
  roomType: string;
  basePrice: number;
  breakfastPrice: number;
  isActive: boolean;
}

const RoomPricingPage: React.FC = () => {
  const { t } = useTranslation();
  const [pricingData, setPricingData] = useState<PricingData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPricingData();
  }, []);

  const fetchPricingData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:4000/api/pricing');
      if (!response.ok) {
        throw new Error('Failed to fetch pricing data');
      }
      const data = await response.json();
      setPricingData(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching pricing:', err);
      setError(t('pricing.fetchError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handlePriceChange = (
    index: number,
    field: 'basePrice' | 'breakfastPrice',
    value: string
  ) => {
    const updatedPricing = [...pricingData];
    const numValue = parseFloat(value) || 0;
    updatedPricing[index] = {
      ...updatedPricing[index],
      [field]: numValue
    };
    setPricingData(updatedPricing);
  };

  const handleSaveAll = async () => {
    try {
      setIsSaving(true);
      
      // Validate all prices
      const hasInvalidPrices = pricingData.some(
        price => price.basePrice <= 0 || price.breakfastPrice < 0
      );

      if (hasInvalidPrices) {
        const errorMessage = t('pricing.validationError');
        announceToScreenReader(errorMessage, 'assertive');
        alert(errorMessage);
        return;
      }

      // Save all pricing data
      const promises = pricingData.map(async (pricing) => {
        const response = await fetch(`http://localhost:4000/api/pricing/${pricing.roomType}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            basePrice: pricing.basePrice,
            breakfastPrice: pricing.breakfastPrice,
            isActive: pricing.isActive
          })
        });

        if (!response.ok) {
          throw new Error(`Failed to update ${pricing.roomType} pricing`);
        }
      });

      await Promise.all(promises);
      
      const successMessage = t('pricing.saveSuccess');
      announceToScreenReader(successMessage, 'polite');
      alert(successMessage);
      
      // Refresh data
      await fetchPricingData();
    } catch (err) {
      console.error('Error saving pricing:', err);
      const errorMessage = t('pricing.saveError');
      announceToScreenReader(errorMessage, 'assertive');
      alert(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="pricing-loading">
        <p role="status" aria-busy={true}>{t('pricing.loading')}</p>
      </div>
    );
  }

  return (
    <div className="room-pricing-page">
      <h1>{t('pricing.title')}</h1>
      
      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}

      <div className="pricing-table-container">
        <table className="pricing-table">
          <thead>
            <tr>
              <th>{t('pricing.roomType')}</th>
              <th>{t('pricing.basePrice')}</th>
              <th>{t('pricing.breakfastPrice')}</th>
              <th>{t('pricing.totalWithBreakfast')}</th>
            </tr>
          </thead>
          <tbody>
            {pricingData.map((pricing, index) => (
              <tr key={pricing.roomType}>
                <td className="room-type">{pricing.roomType}</td>
                <td>
                  <input
                    type="number"
                    value={pricing.basePrice}
                    onChange={(e) => handlePriceChange(index, 'basePrice', e.target.value)}
                    min="0"
                    step="100"
                    disabled={isSaving}
                    aria-label={`${t('pricing.basePrice')} ${pricing.roomType}`}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={pricing.breakfastPrice}
                    onChange={(e) => handlePriceChange(index, 'breakfastPrice', e.target.value)}
                    min="0"
                    step="50"
                    disabled={isSaving}
                    aria-label={`${t('pricing.breakfastPrice')} ${pricing.roomType}`}
                  />
                </td>
                <td className="total-price">
                  ฿{(pricing.basePrice + pricing.breakfastPrice).toLocaleString('th-TH')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pricing-actions">
        <button
          className="save-button"
          onClick={handleSaveAll}
          disabled={isSaving}
        >
          {isSaving ? t('pricing.saving') : t('pricing.saveAll')}
        </button>
      </div>

      <div className="pricing-notes">
        <h3>{t('pricing.notes.title')}</h3>
        <ul>
          <li>{t('pricing.notes.basePrice')}</li>
          <li>{t('pricing.notes.breakfast')}</li>
          <li>{t('pricing.notes.immediate')}</li>
        </ul>
      </div>
    </div>
  );
};

export default RoomPricingPage;