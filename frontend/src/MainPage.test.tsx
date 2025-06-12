// src/MainPage.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MainPage from './MainPage';

// Mock translation hook
jest.mock('./hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'mainPage.welcome.title': 'ยินดีต้อนรับสู่ระบบจัดการโรงแรม',
        'mainPage.welcome.description': 'เลือกเมนูที่ต้องการจากด้านบน',
        'mainPage.priceManager.title': 'จัดการราคาห้องพัก',
        'mainPage.priceManager.loading': 'กำลังโหลดข้อมูลราคา...',
        'mainPage.priceManager.noData': 'ไม่พบข้อมูลราคา',
        'mainPage.priceManager.roomType': 'ประเภทห้อง',
        'mainPage.priceManager.noBreakfast': 'ไม่รวมอาหารเช้า',
        'mainPage.priceManager.withBreakfast': 'รวมอาหารเช้า',
        'mainPage.priceManager.saveAll': 'บันทึกทั้งหมด',
        'mainPage.priceManager.validationError': 'กรุณาใส่ราคาที่ถูกต้อง',
        'mainPage.priceManager.saveSuccess': 'บันทึกสำเร็จ',
        'mainPage.priceManager.saveError': 'เกิดข้อผิดพลาดในการบันทึก',
      };
      return translations[key] || key;
    }
  })
}));

// Mock accessibility utilities
jest.mock('./utils/accessibility', () => ({
  announceToScreenReader: jest.fn(),
  isEnterOrSpace: jest.fn((event) => event.key === 'Enter' || event.key === ' ')
}));

// Mock price data
const mockPriceData = {
  prices: [
    { roomType: 'Standard', noBreakfast: 1200, withBreakfast: 1500 },
    { roomType: 'Deluxe', noBreakfast: 1600, withBreakfast: 1900 },
    { roomType: 'Suite', noBreakfast: 3000, withBreakfast: 3500 }
  ]
};

// Set up fetch mock
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock window.alert
const mockAlert = jest.fn();
global.alert = mockAlert;

describe('MainPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockPriceData
    });
  });

  describe('Basic Rendering', () => {
    it('renders welcome section correctly', () => {
      render(<MainPage isAdminMode={false} />);
      
      expect(screen.getByText('ยินดีต้อนรับสู่ระบบจัดการโรงแรม')).toBeInTheDocument();
      expect(screen.getByText('เลือกเมนูที่ต้องการจากด้านบน')).toBeInTheDocument();
    });

    it('renders price manager section when admin mode enabled', () => {
      render(<MainPage isAdminMode={true} />);
      
      expect(screen.getByText('จัดการราคาห้องพัก')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /จัดการราคาห้องพัก/i })).toBeInTheDocument();
    });

    it('does not render price manager when not in admin mode', () => {
      render(<MainPage isAdminMode={false} />);
      
      expect(screen.queryByText('จัดการราคาห้องพัก')).not.toBeInTheDocument();
    });
  });

  describe('Price Manager Functionality', () => {
    it('fetches price data on mount when in admin mode', async () => {
      render(<MainPage isAdminMode={true} />);
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/config/priceData.json');
      });
    });

    it('shows loading state initially', async () => {
      // Make fetch take time to resolve
      mockFetch.mockImplementation(() => new Promise(resolve => 
        setTimeout(() => resolve({ ok: true, json: async () => mockPriceData }), 100)
      ));

      render(<MainPage isAdminMode={true} />);
      
      // Open price manager
      const titleButton = screen.getByRole('button', { name: /จัดการราคาห้องพัก/i });
      await userEvent.click(titleButton);
      
      expect(screen.getByText('กำลังโหลดข้อมูลราคา...')).toBeInTheDocument();
    });

    it('toggles price manager visibility when title clicked', async () => {
      render(<MainPage isAdminMode={true} />);
      
      const titleButton = screen.getByRole('button', { name: /จัดการราคาห้องพัก/i });
      
      // Initially closed
      expect(titleButton).toHaveAttribute('aria-expanded', 'false');
      expect(screen.queryByText('กำลังโหลดข้อมูลราคา...')).not.toBeInTheDocument();
      
      // Click to open
      await userEvent.click(titleButton);
      
      expect(titleButton).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getByText('กำลังโหลดข้อมูลราคา...')).toBeInTheDocument();
      
      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText('Standard')).toBeInTheDocument();
      });
      
      // Click to close
      await userEvent.click(titleButton);
      
      expect(titleButton).toHaveAttribute('aria-expanded', 'false');
      expect(screen.queryByText('Standard')).not.toBeInTheDocument();
    });

    it('supports keyboard navigation for price manager toggle', async () => {
      render(<MainPage isAdminMode={true} />);
      
      const titleButton = screen.getByRole('button', { name: /จัดการราคาห้องพัก/i });
      
      // Test Enter key
      titleButton.focus();
      fireEvent.keyDown(titleButton, { key: 'Enter' });
      
      expect(titleButton).toHaveAttribute('aria-expanded', 'true');
      
      // Test Space key
      fireEvent.keyDown(titleButton, { key: ' ' });
      
      expect(titleButton).toHaveAttribute('aria-expanded', 'false');
    });
  });

  describe('Price Data Display', () => {
    beforeEach(async () => {
      render(<MainPage isAdminMode={true} />);
      
      // Open price manager and wait for data to load
      const titleButton = screen.getByRole('button', { name: /จัดการราคาห้องพัก/i });
      await userEvent.click(titleButton);
      
      await waitFor(() => {
        expect(screen.getByText('Standard')).toBeInTheDocument();
      });
    });

    it('displays price data in table format', () => {
      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getByText('Standard')).toBeInTheDocument();
      expect(screen.getByText('Deluxe')).toBeInTheDocument();
      expect(screen.getByText('Suite')).toBeInTheDocument();
    });

    it('has proper table headers', () => {
      expect(screen.getByText('ประเภทห้อง')).toBeInTheDocument();
      expect(screen.getByText('ไม่รวมอาหารเช้า')).toBeInTheDocument();
      expect(screen.getByText('รวมอาหารเช้า')).toBeInTheDocument();
    });

    it('displays correct price values', () => {
      expect(screen.getByDisplayValue('1200')).toBeInTheDocument();
      expect(screen.getByDisplayValue('1500')).toBeInTheDocument();
      expect(screen.getByDisplayValue('1600')).toBeInTheDocument();
      expect(screen.getByDisplayValue('1900')).toBeInTheDocument();
    });

    it('has save button', () => {
      expect(screen.getByText('บันทึกทั้งหมด')).toBeInTheDocument();
    });
  });

  describe('Price Editing', () => {
    beforeEach(async () => {
      render(<MainPage isAdminMode={true} />);
      
      const titleButton = screen.getByRole('button', { name: /จัดการราคาห้องพัก/i });
      await userEvent.click(titleButton);
      
      await waitFor(() => {
        expect(screen.getByText('Standard')).toBeInTheDocument();
      });
    });

    it('updates price when input value changes', async () => {
      const noBreakfastInput = screen.getByDisplayValue('1200');
      
      await userEvent.clear(noBreakfastInput);
      await userEvent.type(noBreakfastInput, '1300');
      
      expect(noBreakfastInput).toHaveValue(1300);
    });

    it('validates prices before saving - empty values', async () => {
      const noBreakfastInput = screen.getByDisplayValue('1200');
      await userEvent.clear(noBreakfastInput);
      
      const saveButton = screen.getByText('บันทึกทั้งหมด');
      await userEvent.click(saveButton);
      
      expect(mockAlert).toHaveBeenCalledWith('กรุณาใส่ราคาที่ถูกต้อง');
    });

    it('saves valid prices successfully', async () => {
      const noBreakfastInput = screen.getByDisplayValue('1200');
      await userEvent.clear(noBreakfastInput);
      await userEvent.type(noBreakfastInput, '1300');
      
      const saveButton = screen.getByText('บันทึกทั้งหมด');
      await userEvent.click(saveButton);
      
      expect(mockAlert).toHaveBeenCalledWith('บันทึกสำเร็จ (ตรวจสอบ Console Log สำหรับข้อมูล)');
    });
  });

  describe('Error Handling', () => {
    it('shows error state when fetch fails', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));
      
      render(<MainPage isAdminMode={true} />);
      
      const titleButton = screen.getByRole('button', { name: /จัดการราคาห้องพัก/i });
      await userEvent.click(titleButton);
      
      await waitFor(() => {
        expect(screen.getByText('ไม่พบข้อมูลราคา')).toBeInTheDocument();
      });
    });

    it('handles HTTP errors', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404
      });
      
      render(<MainPage isAdminMode={true} />);
      
      const titleButton = screen.getByRole('button', { name: /จัดการราคาห้องพัก/i });
      await userEvent.click(titleButton);
      
      await waitFor(() => {
        expect(screen.getByText('ไม่พบข้อมูลราคา')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes for price manager', () => {
      render(<MainPage isAdminMode={true} />);
      
      const titleButton = screen.getByRole('button', { name: /จัดการราคาห้องพัก/i });
      
      expect(titleButton).toHaveAttribute('aria-expanded', 'false');
      expect(titleButton).toHaveAttribute('aria-controls', 'price-manager-content');
      expect(titleButton).toHaveAttribute('tabIndex', '0');
    });

    it('has proper input labels for screen readers', async () => {
      render(<MainPage isAdminMode={true} />);
      
      const titleButton = screen.getByRole('button', { name: /จัดการราคาห้องพัก/i });
      await userEvent.click(titleButton);
      
      await waitFor(() => {
        const standardNoBreakfastInput = screen.getByLabelText(/ไม่รวมอาหารเช้า Standard/i);
        expect(standardNoBreakfastInput).toBeInTheDocument();
        
        const standardWithBreakfastInput = screen.getByLabelText(/รวมอาหารเช้า Standard/i);
        expect(standardWithBreakfastInput).toBeInTheDocument();
      });
    });

    it('announces changes to screen readers', async () => {
      const mockAnnounce = require('./utils/accessibility').announceToScreenReader;
      
      render(<MainPage isAdminMode={true} />);
      
      const titleButton = screen.getByRole('button', { name: /จัดการราคาห้องพัก/i });
      await userEvent.click(titleButton);
      
      await waitFor(() => {
        expect(screen.getByText('Standard')).toBeInTheDocument();
      });
      
      const noBreakfastInput = screen.getByDisplayValue('1200');
      await userEvent.clear(noBreakfastInput);
      
      const saveButton = screen.getByText('บันทึกทั้งหมด');
      await userEvent.click(saveButton);
      
      expect(mockAnnounce).toHaveBeenCalledWith('กรุณาใส่ราคาที่ถูกต้อง', 'assertive');
    });
  });
});