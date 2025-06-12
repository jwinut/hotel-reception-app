// src/components/ErrorBoundary.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorBoundary from './ErrorBoundary';

// Component that throws an error for testing
const ThrowError: React.FC<{ shouldThrow?: boolean; errorMessage?: string }> = ({ 
  shouldThrow = false, 
  errorMessage = 'Test error' 
}) => {
  if (shouldThrow) {
    throw new Error(errorMessage);
  }
  return <div>No error</div>;
};

// Mock window methods
const mockReload = jest.fn();
Object.defineProperty(window, 'location', {
  value: {
    reload: mockReload,
    href: '/'
  },
  writable: true
});

describe('ErrorBoundary Component', () => {
  let consoleError: jest.SpyInstance;

  beforeEach(() => {
    // Mock console.error to avoid noise in test output
    consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.clearAllMocks();
  });

  afterEach(() => {
    consoleError.mockRestore();
  });

  describe('Normal Rendering (No Error)', () => {
    it('renders children when there is no error', () => {
      render(
        <ErrorBoundary>
          <div>Normal content</div>
        </ErrorBoundary>
      );

      expect(screen.getByText('Normal content')).toBeInTheDocument();
      expect(screen.queryByText('เกิดข้อผิดพลาดในระบบ')).not.toBeInTheDocument();
    });

    it('renders multiple children when there is no error', () => {
      render(
        <ErrorBoundary>
          <div>First child</div>
          <div>Second child</div>
        </ErrorBoundary>
      );

      expect(screen.getByText('First child')).toBeInTheDocument();
      expect(screen.getByText('Second child')).toBeInTheDocument();
    });

    it('renders complex children when there is no error', () => {
      render(
        <ErrorBoundary>
          <div>
            <h1>Title</h1>
            <p>Description</p>
            <button>Action</button>
          </div>
        </ErrorBoundary>
      );

      expect(screen.getByRole('heading')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('catches and displays error when child component throws', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('เกิดข้อผิดพลาดในระบบ')).toBeInTheDocument();
      expect(screen.getByText('ขออภัยในความไม่สะดวก ระบบเกิดข้อผิดพลาดที่ไม่คาดคิด')).toBeInTheDocument();
      expect(screen.queryByText('No error')).not.toBeInTheDocument();
    });

    it('displays error UI with correct structure', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Check main container
      const errorBoundary = screen.getByText('เกิดข้อผิดพลาดในระบบ').closest('.error-boundary');
      expect(errorBoundary).toBeInTheDocument();

      // Check content container
      const errorContent = errorBoundary?.querySelector('.error-boundary-content');
      expect(errorContent).toBeInTheDocument();

      // Check error icon
      const errorIcon = screen.getByRole('img', { name: 'Warning' });
      expect(errorIcon).toBeInTheDocument();
      expect(errorIcon).toHaveClass('error-icon');
      expect(errorIcon.textContent).toBe('⚠️');
    });

    it('logs error to console when error occurs', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} errorMessage="Custom error message" />
        </ErrorBoundary>
      );

      expect(consoleError).toHaveBeenCalledWith(
        'ErrorBoundary caught an error:',
        expect.any(Error),
        expect.objectContaining({
          componentStack: expect.any(String)
        })
      );
    });

    it('handles different error messages', () => {
      const customError = 'Custom error for testing';
      
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} errorMessage={customError} />
        </ErrorBoundary>
      );

      expect(screen.getByText('เกิดข้อผิดพลาดในระบบ')).toBeInTheDocument();
      expect(consoleError).toHaveBeenCalledWith(
        'ErrorBoundary caught an error:',
        expect.objectContaining({ message: customError }),
        expect.any(Object)
      );
    });
  });

  describe('Action Buttons', () => {
    it('renders both action buttons when error occurs', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const reloadButton = screen.getByRole('button', { name: 'โหลดหน้าใหม่' });
      const homeButton = screen.getByRole('button', { name: 'กลับหน้าหลัก' });

      expect(reloadButton).toBeInTheDocument();
      expect(homeButton).toBeInTheDocument();

      // Check button classes
      expect(reloadButton).toHaveClass('error-button', 'primary');
      expect(homeButton).toHaveClass('error-button', 'secondary');

      // Check button types
      expect(reloadButton).toHaveAttribute('type', 'button');
      expect(homeButton).toHaveAttribute('type', 'button');
    });

    it('calls window.location.reload when reload button is clicked', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const reloadButton = screen.getByRole('button', { name: 'โหลดหน้าใหม่' });
      fireEvent.click(reloadButton);

      expect(mockReload).toHaveBeenCalledTimes(1);
    });

    it('navigates to home when home button is clicked', () => {
      // Store original href to restore later
      const originalHref = window.location.href;
      
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const homeButton = screen.getByRole('button', { name: 'กลับหน้าหลัก' });
      fireEvent.click(homeButton);

      expect(window.location.href).toBe('/');
      
      // Restore original href
      window.location.href = originalHref;
    });
  });

  describe('Development Environment Features', () => {
    beforeEach(() => {
      // Set to development mode
      process.env.NODE_ENV = 'development';
    });

    afterEach(() => {
      // Clean up environment variable
      delete process.env.NODE_ENV;
    });

    it('shows error details in development mode', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} errorMessage="Development error" />
        </ErrorBoundary>
      );

      // Check for details element
      const detailsElement = screen.getByText('รายละเอียดข้อผิดพลาด (สำหรับนักพัฒนา)');
      expect(detailsElement).toBeInTheDocument();
      expect(detailsElement.tagName).toBe('SUMMARY');

      // Check for error details container
      const errorDetails = detailsElement.closest('details');
      expect(errorDetails).toHaveClass('error-details');

      // Check for error stack
      const errorStack = errorDetails?.querySelector('.error-stack');
      expect(errorStack).toBeInTheDocument();
      expect(errorStack?.tagName).toBe('PRE');
    });

    it('displays error message and component stack in development mode', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} errorMessage="Test error details" />
        </ErrorBoundary>
      );

      const errorStack = screen.getByText('รายละเอียดข้อผิดพลาด (สำหรับนักพัฒนา)')
        .closest('details')?.querySelector('.error-stack');
      
      expect(errorStack?.textContent).toContain('Test error details');
    });
  });

  describe('Production Environment Features', () => {
    beforeEach(() => {
      // Set to production mode
      process.env.NODE_ENV = 'production';
    });

    afterEach(() => {
      // Clean up environment variable
      delete process.env.NODE_ENV;
    });

    it('does not show error details in production mode', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.queryByText('รายละเอียดข้อผิดพลาด (สำหรับนักพัฒนา)')).not.toBeInTheDocument();
      expect(document.querySelector('.error-details')).not.toBeInTheDocument();
    });

    it('logs production error when in production mode', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} errorMessage="Production error" />
        </ErrorBoundary>
      );

      expect(consoleError).toHaveBeenCalledWith(
        'Production error:',
        expect.objectContaining({
          error: expect.any(Error),
          errorInfo: expect.any(Object)
        })
      );
    });
  });

  describe('Error Recovery', () => {
    it('can recover from error state when reload button is clicked', () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Error UI should be displayed
      expect(screen.getByText('เกิดข้อผิดพลาดในระบบ')).toBeInTheDocument();

      // Mock the reload functionality since we can't actually reload in tests
      const reloadButton = screen.getByRole('button', { name: 'โหลดหน้าใหม่' });
      fireEvent.click(reloadButton);

      // Verify reload was called
      expect(mockReload).toHaveBeenCalled();
    });

    it('maintains error state until explicit recovery', () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Error UI should be displayed
      expect(screen.getByText('เกิดข้อผิดพลาดในระบบ')).toBeInTheDocument();

      // Re-render with no error - should still show error UI
      rerender(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      // Error UI should still be displayed
      expect(screen.getByText('เกิดข้อผิดพลาดในระบบ')).toBeInTheDocument();
      expect(screen.queryByText('No error')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const errorIcon = screen.getByRole('img', { name: 'Warning' });
      expect(errorIcon).toHaveAttribute('aria-label', 'Warning');
    });

    it('has proper heading structure', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveTextContent('เกิดข้อผิดพลาดในระบบ');
    });

    it('has focusable action buttons', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const reloadButton = screen.getByRole('button', { name: 'โหลดหน้าใหม่' });
      const homeButton = screen.getByRole('button', { name: 'กลับหน้าหลัก' });

      expect(reloadButton).not.toHaveAttribute('disabled');
      expect(homeButton).not.toHaveAttribute('disabled');
    });
  });

  describe('Edge Cases', () => {
    it('handles null children gracefully', () => {
      render(
        <ErrorBoundary>
          {null}
        </ErrorBoundary>
      );

      // Should not crash and should not show error UI
      expect(screen.queryByText('เกิดข้อผิดพลาดในระบบ')).not.toBeInTheDocument();
    });

    it('handles multiple error occurrences', () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} errorMessage="First error" />
        </ErrorBoundary>
      );

      expect(screen.getByText('เกิดข้อผิดพลาดในระบบ')).toBeInTheDocument();

      // Trigger another error
      rerender(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} errorMessage="Second error" />
        </ErrorBoundary>
      );

      // Should still show error UI
      expect(screen.getByText('เกิดข้อผิดพลาดในระบบ')).toBeInTheDocument();
    });

    it('handles errors without error info', () => {
      // Create a component that throws in a way that might not provide errorInfo
      const ProblematicComponent = () => {
        throw new Error('Error without info');
      };

      render(
        <ErrorBoundary>
          <ProblematicComponent />
        </ErrorBoundary>
      );

      expect(screen.getByText('เกิดข้อผิดพลาดในระบบ')).toBeInTheDocument();
      expect(consoleError).toHaveBeenCalled();
    });
  });

  describe('State Management', () => {
    it('initializes with correct default state', () => {
      render(
        <ErrorBoundary>
          <div>Normal content</div>
        </ErrorBoundary>
      );

      expect(screen.getByText('Normal content')).toBeInTheDocument();
      expect(screen.queryByText('เกิดข้อผิดพลาดในระบบ')).not.toBeInTheDocument();
    });

    it('updates state correctly when error occurs', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('เกิดข้อผิดพลาดในระบบ')).toBeInTheDocument();
    });
  });
});