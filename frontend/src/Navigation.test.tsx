// src/Navigation.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock navigation function and location
const mockNavigate = jest.fn();
let mockLocation = '/';

// Mock react-router-dom
jest.doMock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: mockLocation })
}));

// Mock the hooks and utilities
jest.mock('./hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: { [key: string]: string } = {
        'navigation.main': 'Main Navigation',
        'navigation.checkin.title': 'Check-in',
        'navigation.checkin.walkIn': 'Walk-in Guest',
        'navigation.checkin.existing': 'Existing Guest',
        'navigation.booking.title': 'Booking Management',
        'navigation.booking.new': 'New Booking',
        'navigation.booking.current': 'Current Bookings',
        'navigation.home': 'Home',
        'navigation.admin.title': 'Administration',
        'navigation.admin.addUser': 'Add User',
        'navigation.admin.viewUsers': 'View Users'
      };
      return translations[key] || key;
    }
  })
}));

jest.mock('./utils/accessibility', () => ({
  createBreadcrumbAriaProps: (isLast: boolean = false) => ({
    'aria-current': isLast ? 'page' : undefined
  })
}));

// Import Navigation after mocks are set up
const Navigation = require('./Navigation').default;

describe('Navigation Component', () => {
  const defaultProps = {
    isAdminMode: false,
    onReserved: jest.fn(),
    onCurrentBookings: jest.fn(),
    onAddUser: jest.fn(),
    onViewUsers: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockLocation = '/';
  });

  describe('Basic Rendering', () => {
    it('renders navigation with all main sections', () => {
      render(<Navigation {...defaultProps} />);
      
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      expect(screen.getByText('Check-in')).toBeInTheDocument();
      expect(screen.getByText('Booking Management')).toBeInTheDocument();
      expect(screen.getByText('Main Navigation')).toBeInTheDocument();
    });

    it('has correct accessibility attributes', () => {
      render(<Navigation {...defaultProps} />);
      
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveAttribute('aria-label', 'Main Navigation');
      expect(nav).toHaveClass('main-navigation');
    });

    it('renders all navigation buttons', () => {
      render(<Navigation {...defaultProps} />);
      
      expect(screen.getByRole('button', { name: '🏨 Walk-in' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Existing Guest' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'New Booking' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Current Bookings' })).toBeInTheDocument();
    });
  });

  describe('Navigation Actions', () => {
    it('navigates to walk-in dashboard page', async () => {
      const user = userEvent.setup();
      render(<Navigation {...defaultProps} />);
      
      const walkInButton = screen.getByRole('button', { name: '🏨 Walk-in' });
      await user.click(walkInButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('/walk-in-dashboard');
    });

    it('navigates to existing guest page', async () => {
      const user = userEvent.setup();
      render(<Navigation {...defaultProps} />);
      
      const existingGuestButton = screen.getByRole('button', { name: 'Existing Guest' });
      await user.click(existingGuestButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('/existing-guest');
    });

    it('navigates to new booking page', async () => {
      const user = userEvent.setup();
      render(<Navigation {...defaultProps} />);
      
      const newBookingButton = screen.getByRole('button', { name: 'New Booking' });
      await user.click(newBookingButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('/new-booking');
    });

    it('navigates to current bookings page', async () => {
      const user = userEvent.setup();
      render(<Navigation {...defaultProps} />);
      
      const currentBookingsButton = screen.getByRole('button', { name: 'Current Bookings' });
      await user.click(currentBookingsButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('/current-bookings');
    });

    it('navigates to home page', async () => {
      const user = userEvent.setup();
      render(<Navigation {...defaultProps} />);
      
      const homeButton = screen.getByRole('button', { name: 'Home' });
      await user.click(homeButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  describe('Active State Management', () => {
    it('marks walk-in options button as active when on that route', () => {
      mockLocation = '/walk-in-options';
      render(<Navigation {...defaultProps} />);
      
      const walkInButton = screen.getByRole('button', { name: 'Walk-in Guest' });
      expect(walkInButton).toHaveClass('active');
      expect(walkInButton).toHaveAttribute('aria-current', 'page');
    });

    it('marks existing guest button as active when on that route', () => {
      mockLocation = '/existing-guest';
      render(<Navigation {...defaultProps} />);
      
      const existingGuestButton = screen.getByRole('button', { name: 'Existing Guest' });
      expect(existingGuestButton).toHaveClass('active');
      expect(existingGuestButton).toHaveAttribute('aria-current', 'page');
    });

    it('marks new booking button as active when on that route', () => {
      mockLocation = '/new-booking';
      render(<Navigation {...defaultProps} />);
      
      const newBookingButton = screen.getByRole('button', { name: 'New Booking' });
      expect(newBookingButton).toHaveClass('active');
      expect(newBookingButton).toHaveAttribute('aria-current', 'page');
    });

    it('marks current bookings button as active when on that route', () => {
      mockLocation = '/current-bookings';
      render(<Navigation {...defaultProps} />);
      
      const currentBookingsButton = screen.getByRole('button', { name: 'Current Bookings' });
      expect(currentBookingsButton).toHaveClass('active');
      expect(currentBookingsButton).toHaveAttribute('aria-current', 'page');
    });

    it('marks home button as active when on root route', () => {
      mockLocation = '/';
      render(<Navigation {...defaultProps} />);
      
      const homeButton = screen.getByRole('button', { name: 'Home' });
      expect(homeButton).toHaveClass('active');
      expect(homeButton).toHaveAttribute('aria-current', 'page');
    });

    it('does not mark buttons as active when on different route', () => {
      mockLocation = '/some-other-route';
      render(<Navigation {...defaultProps} />);
      
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).not.toHaveClass('active');
        expect(button).not.toHaveAttribute('aria-current', 'page');
      });
    });
  });

  describe('Button Styling Classes', () => {
    it('applies correct CSS classes to check-in buttons', () => {
      render(<Navigation {...defaultProps} />);
      
      const walkInButton = screen.getByRole('button', { name: 'Walk-in Guest' });
      const existingGuestButton = screen.getByRole('button', { name: 'Existing Guest' });
      
      expect(walkInButton).toHaveClass('nav-button', 'primary');
      expect(existingGuestButton).toHaveClass('nav-button', 'primary');
    });

    it('applies correct CSS classes to booking buttons', () => {
      render(<Navigation {...defaultProps} />);
      
      const newBookingButton = screen.getByRole('button', { name: 'New Booking' });
      const currentBookingsButton = screen.getByRole('button', { name: 'Current Bookings' });
      
      expect(newBookingButton).toHaveClass('nav-button', 'booking');
      expect(currentBookingsButton).toHaveClass('nav-button', 'booking');
    });

    it('applies correct CSS classes to home button', () => {
      render(<Navigation {...defaultProps} />);
      
      const homeButton = screen.getByRole('button', { name: 'Home' });
      expect(homeButton).toHaveClass('nav-button', 'secondary');
    });
  });

  describe('Admin Mode', () => {
    it('does not show admin section when not in admin mode', () => {
      render(<Navigation {...defaultProps} isAdminMode={false} />);
      
      expect(screen.queryByText('Administration')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Add User' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'View Users' })).not.toBeInTheDocument();
    });

    it('shows admin section when in admin mode', () => {
      render(<Navigation {...defaultProps} isAdminMode={true} />);
      
      expect(screen.getByText('Administration')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Add User' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'View Users' })).toBeInTheDocument();
    });

    it('applies correct CSS classes to admin buttons', () => {
      render(<Navigation {...defaultProps} isAdminMode={true} />);
      
      const addUserButton = screen.getByRole('button', { name: 'Add User' });
      const viewUsersButton = screen.getByRole('button', { name: 'View Users' });
      
      expect(addUserButton).toHaveClass('nav-button', 'admin');
      expect(viewUsersButton).toHaveClass('nav-button', 'admin');
    });

    it('applies admin-section class to admin container', () => {
      render(<Navigation {...defaultProps} isAdminMode={true} />);
      
      const adminSection = screen.getByText('Administration').closest('.nav-section');
      expect(adminSection).toHaveClass('admin-section');
    });
  });

  describe('Admin Actions', () => {
    it('calls onAddUser when Add User button is clicked', async () => {
      const user = userEvent.setup();
      const onAddUser = jest.fn();
      
      render(<Navigation {...defaultProps} isAdminMode={true} onAddUser={onAddUser} />);
      
      const addUserButton = screen.getByRole('button', { name: 'Add User' });
      await user.click(addUserButton);
      
      expect(onAddUser).toHaveBeenCalledTimes(1);
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('calls onViewUsers when View Users button is clicked', async () => {
      const user = userEvent.setup();
      const onViewUsers = jest.fn();
      
      render(<Navigation {...defaultProps} isAdminMode={true} onViewUsers={onViewUsers} />);
      
      const viewUsersButton = screen.getByRole('button', { name: 'View Users' });
      await user.click(viewUsersButton);
      
      expect(onViewUsers).toHaveBeenCalledTimes(1);
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility Features', () => {
    it('has proper section headings with correct IDs', () => {
      render(<Navigation {...defaultProps} isAdminMode={true} />);
      
      expect(screen.getByRole('heading', { name: 'Check-in' })).toHaveAttribute('id', 'checkin-section');
      expect(screen.getByRole('heading', { name: 'Booking Management' })).toHaveAttribute('id', 'booking-section');
      expect(screen.getByRole('heading', { name: 'Main Navigation' })).toHaveAttribute('id', 'main-section');
      expect(screen.getByRole('heading', { name: 'Administration' })).toHaveAttribute('id', 'admin-section');
    });

    it('has button groups properly labeled', () => {
      render(<Navigation {...defaultProps} isAdminMode={true} />);
      
      // Check that button groups have correct aria-labelledby
      const buttonGroups = screen.getAllByRole('group');
      expect(buttonGroups).toHaveLength(4); // checkin, booking, main, admin
      
      expect(buttonGroups[0]).toHaveAttribute('aria-labelledby', 'checkin-section');
      expect(buttonGroups[1]).toHaveAttribute('aria-labelledby', 'booking-section');
      expect(buttonGroups[2]).toHaveAttribute('aria-labelledby', 'main-section');
      expect(buttonGroups[3]).toHaveAttribute('aria-labelledby', 'admin-section');
    });

    it('has buttons properly described by their sections', () => {
      render(<Navigation {...defaultProps} isAdminMode={true} />);
      
      // Check check-in buttons
      const walkInButton = screen.getByRole('button', { name: 'Walk-in Guest' });
      const existingGuestButton = screen.getByRole('button', { name: 'Existing Guest' });
      expect(walkInButton).toHaveAttribute('aria-describedby', 'checkin-section');
      expect(existingGuestButton).toHaveAttribute('aria-describedby', 'checkin-section');
      
      // Check booking buttons
      const newBookingButton = screen.getByRole('button', { name: 'New Booking' });
      const currentBookingsButton = screen.getByRole('button', { name: 'Current Bookings' });
      expect(newBookingButton).toHaveAttribute('aria-describedby', 'booking-section');
      expect(currentBookingsButton).toHaveAttribute('aria-describedby', 'booking-section');
      
      // Check home button
      const homeButton = screen.getByRole('button', { name: 'Home' });
      expect(homeButton).toHaveAttribute('aria-describedby', 'main-section');
      
      // Check admin buttons
      const addUserButton = screen.getByRole('button', { name: 'Add User' });
      const viewUsersButton = screen.getByRole('button', { name: 'View Users' });
      expect(addUserButton).toHaveAttribute('aria-describedby', 'admin-section');
      expect(viewUsersButton).toHaveAttribute('aria-describedby', 'admin-section');
    });

    it('all buttons have correct type attribute', () => {
      render(<Navigation {...defaultProps} isAdminMode={true} />);
      
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveAttribute('type', 'button');
      });
    });
  });

  describe('Memoization and Performance', () => {
    it('renders consistently with same props', () => {
      const props = { ...defaultProps, isAdminMode: true };
      
      const { rerender } = render(<Navigation {...props} />);
      const initialButtons = screen.getAllByRole('button');
      
      // Re-render with same props
      rerender(<Navigation {...props} />);
      const rerenderedButtons = screen.getAllByRole('button');
      
      expect(initialButtons).toHaveLength(rerenderedButtons.length);
      expect(screen.getByText('Administration')).toBeInTheDocument();
    });

    it('updates when admin mode changes', () => {
      const props = { ...defaultProps, isAdminMode: false };
      
      const { rerender } = render(<Navigation {...props} />);
      expect(screen.queryByText('Administration')).not.toBeInTheDocument();
      
      // Change admin mode
      rerender(<Navigation {...props} isAdminMode={true} />);
      expect(screen.getByText('Administration')).toBeInTheDocument();
    });
  });
});