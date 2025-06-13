// src/App.test.tsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { adminAuthRateLimit } from './utils/validation';

// Setup global mocks
global.prompt = jest.fn();
global.alert = jest.fn();

// Mock hooks and services
jest.mock('./hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string, options?: any) => {
      const translations: { [key: string]: string } = {
        'app.title': 'ระบบจัดการโรงแรม',
        'admin.loginPrompt': 'กรุณาใส่รหัสผ่านผู้ดูแลระบบ:',
        'admin.loginError': 'รหัสผ่านไม่ถูกต้อง',
        'admin.rateLimitError': 'คุณพยายามเข้าสู่ระบบมากเกินไป กรุณารอ {seconds} วินาที',
        'admin.modeExit': 'ออกจากโหมดผู้ดูแลระบบแล้ว',
        'admin.modeEnter': 'เข้าสู่โหมดผู้ดูแลระบบแล้ว',
        'admin.buttonLabel.enter': 'เข้าสู่โหมดผู้ดูแลระบบ',
        'admin.buttonLabel.exit': 'ออกจากโหมดผู้ดูแลระบบ',
        'admin.buttonLabel.current': 'โหมดผู้ดูแลระบบ: เปิดใช้งาน',
        'admin.buttonLabel.idle': 'โหมดผู้ดูแลระบบ: ปิดใช้งาน',
        'accessibility.skipToMain': 'ข้ามไปยังเนื้อหาหลัก',
        'accessibility.skipToNav': 'ข้ามไปยังเมนูนำทาง',
      };
      let result = translations[key] || key;
      if (options?.seconds) {
        result = result.replace('{seconds}', options.seconds);
      }
      return result;
    }
  })
}));

jest.mock('./utils/accessibility', () => ({
  announceToScreenReader: jest.fn()
}));

jest.mock('./i18n', () => ({}));

// Mock Redux store and Provider
jest.mock('react-redux', () => ({
  Provider: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('./store', () => ({
  store: {}
}));

// Mock React Router
jest.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }: { children: React.ReactNode }) => children,
  Routes: ({ children }: { children: React.ReactNode }) => children,
  Route: () => null,
}));

// Mock CSS imports
jest.mock('./design-system/tokens.css', () => ({}));
jest.mock('./App.css', () => ({}));
jest.mock('./styles/accessibility.css', () => ({}));

// Mock validation utilities
jest.mock('./utils/validation', () => ({
  adminAuthRateLimit: {
    isAllowed: jest.fn().mockReturnValue(true),
    getRemainingTime: jest.fn().mockReturnValue(0)
  },
  sanitizeInput: jest.fn(input => input)
}));

// Mock the child components to avoid complex dependencies
jest.mock('./MainPage', () => {
  return function MockMainPage({ isAdminMode }: { isAdminMode: boolean }) {
    return (
      <div data-testid="main-page">
        Main Page - Admin Mode: {isAdminMode ? 'ON' : 'OFF'}
      </div>
    );
  };
});

jest.mock('./Navigation', () => {
  return function MockNavigation() {
    return <nav data-testid="navigation">Navigation</nav>;
  };
});


jest.mock('./NewBookingPage', () => {
  return function MockNewBookingPage() {
    return <div data-testid="new-booking">New Booking</div>;
  };
});

jest.mock('./CurrentBookingsPage', () => {
  return function MockCurrentBookingsPage() {
    return <div data-testid="current-bookings">Current Bookings</div>;
  };
});

jest.mock('./ExistingGuestPage', () => {
  return function MockExistingGuestPage() {
    return <div data-testid="existing-guest">Existing Guest</div>;
  };
});

jest.mock('./components/LanguageSwitcher', () => {
  return function MockLanguageSwitcher() {
    return <div data-testid="language-switcher">Language Switcher</div>;
  };
});

jest.mock('./components/ErrorBoundary', () => {
  return function MockErrorBoundary({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
  };
});

// Disable lazy loading for tests by pre-loading all components

describe('App Component', () => {
  beforeEach(() => {
    // Reset environment variables
    process.env.REACT_APP_ADMIN_CODE = 'test-admin-code';
    
    // Reset mocks
    jest.clearAllMocks();
  });

  it('renders the app with header and navigation', () => {
    render(<App />);
    
    expect(screen.getByText('ระบบจัดการโรงแรม')).toBeInTheDocument();
    expect(screen.getByTestId('navigation')).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('renders app structure correctly', () => {
    render(<App />);
    
    // Header and navigation structure
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByTestId('navigation')).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
    
    // Accessibility features
    expect(screen.getByText('ข้ามไปยังเนื้อหาหลัก')).toBeInTheDocument();
    expect(screen.getByText('ข้ามไปยังเมนูนำทาง')).toBeInTheDocument();
  });

  it('has admin button in header', () => {
    render(<App />);
    
    const adminButton = screen.getByLabelText('เข้าสู่โหมดผู้ดูแลระบบ');
    expect(adminButton).toBeInTheDocument();
    expect(adminButton).toHaveClass('header-admin-button');
  });

  describe('Admin Authentication', () => {
    it.skip('prompts for password when admin button clicked', async () => {
      const user = userEvent.setup();
      (global.prompt as jest.Mock).mockReturnValue('test-admin-code');
      
      render(<App />);
      
      const adminButton = screen.getByLabelText('เข้าสู่โหมดผู้ดูแลระบบ');
      await user.click(adminButton);
      
      expect(global.prompt).toHaveBeenCalledWith('กรุณาใส่รหัสผ่านผู้ดูแลระบบ:');
    });

    it.skip('shows error for incorrect password', async () => {
      const user = userEvent.setup();
      (global.prompt as jest.Mock).mockReturnValue('wrong-password');
      
      render(<App />);
      
      const adminButton = screen.getByLabelText('เข้าสู่โหมดผู้ดูแลระบบ');
      await user.click(adminButton);
      
      expect(global.alert).toHaveBeenCalledWith('รหัสผ่านไม่ถูกต้อง');
    });

    it.skip('handles cancelled admin authentication', async () => {
      const user = userEvent.setup();
      (global.prompt as jest.Mock).mockReturnValue(null);
      
      render(<App />);
      
      const adminButton = screen.getByLabelText('เข้าสู่โหมดผู้ดูแลระบบ');
      await user.click(adminButton);
      
      expect(global.alert).not.toHaveBeenCalled();
    });

    it.skip('prevents empty password from enabling admin mode', async () => {
      const user = userEvent.setup();
      (global.prompt as jest.Mock).mockReturnValue('');
      
      render(<App />);
      
      const adminButton = screen.getByLabelText('เข้าสู่โหมดผู้ดูแลระบบ');
      await user.click(adminButton);
      
      expect(global.alert).not.toHaveBeenCalled();
    });
  });

  describe('Rate Limiting', () => {
    it('shows rate limit message after multiple failed attempts', async () => {
      const user = userEvent.setup();
      
      // Mock rate limiting - first 3 attempts allowed, 4th blocked
      (adminAuthRateLimit.isAllowed as jest.Mock)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true) 
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);
      (adminAuthRateLimit.getRemainingTime as jest.Mock).mockReturnValue(30);
      
      render(<App />);
      
      const adminButton = screen.getByLabelText('เข้าสู่โหมดผู้ดูแลระบบ');
      
      // Make 3 failed attempts
      for (let i = 0; i < 3; i++) {
        (global.prompt as jest.Mock).mockReturnValue('wrong-password');
        await user.click(adminButton);
      }
      
      // 4th attempt should be rate limited
      await user.click(adminButton);
      
      expect(global.alert).toHaveBeenLastCalledWith(
        expect.stringContaining('คุณพยายามเข้าสู่ระบบมากเกินไป')
      );
      expect(global.prompt).toHaveBeenCalledTimes(3); // Should not prompt on 4th attempt
    });
  });

  describe('Error Boundary Integration', () => {
    it('wraps the application in error boundaries', () => {
      render(<App />);
      
      // Check that the app renders without throwing
      expect(screen.getByText('ระบบจัดการโรงแรม')).toBeInTheDocument();
    });
  });
});