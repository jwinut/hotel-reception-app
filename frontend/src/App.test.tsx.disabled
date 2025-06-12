// src/App.test.tsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

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

jest.mock('./WalkInOptionsPage', () => {
  return function MockWalkInOptionsPage() {
    return <div data-testid="walk-in-options">Walk-in Options</div>;
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

describe('App Component', () => {
  beforeEach(() => {
    // Reset environment variables
    process.env.REACT_APP_ADMIN_CODE = 'test-admin-code';
  });

  it('renders the app with header and navigation', () => {
    render(<App />);
    
    expect(screen.getByText('ระบบจัดการโรงแรม')).toBeInTheDocument();
    expect(screen.getByTestId('navigation')).toBeInTheDocument();
    expect(screen.getByTestId('main-page')).toBeInTheDocument();
  });

  it('renders main page by default', () => {
    render(<App />);
    
    expect(screen.getByTestId('main-page')).toBeInTheDocument();
    expect(screen.getByText('Main Page - Admin Mode: OFF')).toBeInTheDocument();
  });

  it('has admin button in header', () => {
    render(<App />);
    
    const adminButton = screen.getByTitle('Admin Panel');
    expect(adminButton).toBeInTheDocument();
    expect(adminButton).toHaveClass('header-admin-button');
  });

  describe('Admin Authentication', () => {
    it('toggles admin mode with correct password', async () => {
      const user = userEvent.setup();
      (global.prompt as jest.Mock).mockReturnValue('test-admin-code');
      
      render(<App />);
      
      const adminButton = screen.getByTitle('Admin Panel');
      await user.click(adminButton);
      
      await waitFor(() => {
        expect(screen.getByText('Main Page - Admin Mode: ON')).toBeInTheDocument();
      });
      
      expect(global.prompt).toHaveBeenCalledWith('กรุณาใส่รหัสผ่านผู้ดูแลระบบ:');
    });

    it('shows error for incorrect password', async () => {
      const user = userEvent.setup();
      (global.prompt as jest.Mock).mockReturnValue('wrong-password');
      
      render(<App />);
      
      const adminButton = screen.getByTitle('Admin Panel');
      await user.click(adminButton);
      
      expect(global.alert).toHaveBeenCalledWith('รหัสผ่านไม่ถูกต้อง');
      expect(screen.getByText('Main Page - Admin Mode: OFF')).toBeInTheDocument();
    });

    it('handles cancelled admin authentication', async () => {
      const user = userEvent.setup();
      (global.prompt as jest.Mock).mockReturnValue(null);
      
      render(<App />);
      
      const adminButton = screen.getByTitle('Admin Panel');
      await user.click(adminButton);
      
      expect(global.alert).not.toHaveBeenCalled();
      expect(screen.getByText('Main Page - Admin Mode: OFF')).toBeInTheDocument();
    });

    it('toggles off admin mode when already in admin mode', async () => {
      const user = userEvent.setup();
      (global.prompt as jest.Mock).mockReturnValue('test-admin-code');
      
      render(<App />);
      
      const adminButton = screen.getByTitle('Admin Panel');
      
      // Turn on admin mode
      await user.click(adminButton);
      await waitFor(() => {
        expect(screen.getByText('Main Page - Admin Mode: ON')).toBeInTheDocument();
      });
      
      // Turn off admin mode
      await user.click(adminButton);
      await waitFor(() => {
        expect(screen.getByText('Main Page - Admin Mode: OFF')).toBeInTheDocument();
      });
      
      // Should only prompt once (for turning on)
      expect(global.prompt).toHaveBeenCalledTimes(1);
    });

    it('prevents empty password from enabling admin mode', async () => {
      const user = userEvent.setup();
      (global.prompt as jest.Mock).mockReturnValue('');
      
      render(<App />);
      
      const adminButton = screen.getByTitle('Admin Panel');
      await user.click(adminButton);
      
      expect(global.alert).not.toHaveBeenCalled();
      expect(screen.getByText('Main Page - Admin Mode: OFF')).toBeInTheDocument();
    });
  });

  describe('Rate Limiting', () => {
    it('shows rate limit message after multiple failed attempts', async () => {
      const user = userEvent.setup();
      
      render(<App />);
      
      const adminButton = screen.getByTitle('Admin Panel');
      
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