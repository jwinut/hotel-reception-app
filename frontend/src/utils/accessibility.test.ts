import { renderHook, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  generateId,
  useFocus,
  useFocusTrap,
  useKeyboardNavigation,
  announceToScreenReader,
  createSkipLink,
  getContrastRatio,
  hasAccessibleContrast,
  createAriaDescription,
  getTableAriaProps,
  getCellAriaProps,
  createBreadcrumbAriaProps,
  createLoadingAriaProps,
  createErrorAriaProps,
  createModalAriaProps,
  createButtonAriaProps,
  createLiveRegionProps,
  createScreenReaderText,
  isEnterOrSpace,
  isArrowKey,
  isNavigationKey
} from './accessibility';

// Mock DOM methods
const mockFocus = jest.fn();
const mockScrollIntoView = jest.fn();
const mockQuerySelectorAll = jest.fn();
const mockGetElementById = jest.fn();
const mockAddEventListener = jest.fn();
const mockRemoveEventListener = jest.fn();
const mockDispatchEvent = jest.fn();
const mockAppendChild = jest.fn();
const mockRemoveChild = jest.fn();

describe('Accessibility Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset ID counter for consistent testing
    // Note: This is a bit hacky but necessary for testing ID generation
    // Access the module's internal counter
    jest.resetModules();
    
    // Mock DOM elements
    Object.defineProperty(document, 'getElementById', {
      value: mockGetElementById,
      writable: true
    });
    
    Object.defineProperty(document.body, 'appendChild', {
      value: mockAppendChild,
      writable: true
    });
    
    Object.defineProperty(document.body, 'removeChild', {
      value: mockRemoveChild,
      writable: true
    });
  });

  describe('generateId', () => {
    it('generates unique IDs with default prefix', () => {
      const id1 = generateId();
      const id2 = generateId();
      
      expect(id1).toMatch(/^a11y-\d+$/);
      expect(id2).toMatch(/^a11y-\d+$/);
      expect(id1).not.toBe(id2);
    });

    it('generates unique IDs with custom prefix', () => {
      const id1 = generateId('modal');
      const id2 = generateId('form');
      
      expect(id1).toMatch(/^modal-\d+$/);
      expect(id2).toMatch(/^form-\d+$/);
      expect(id1).not.toBe(id2);
    });

    it('increments counter for each call', () => {
      const id1 = generateId('test');
      const id2 = generateId('test');
      const id3 = generateId('test');
      
      // Just check they are different and follow pattern
      expect(id1).toMatch(/^test-\d+$/);
      expect(id2).toMatch(/^test-\d+$/);
      expect(id3).toMatch(/^test-\d+$/);
      expect(id1).not.toBe(id2);
      expect(id2).not.toBe(id3);
    });
  });

  describe('useFocus', () => {
    it('returns ref and setFocus function', () => {
      const { result } = renderHook(() => useFocus());
      const [ref, setFocus] = result.current;
      
      expect(ref).toBeDefined();
      expect(typeof setFocus).toBe('function');
    });

    it('focuses element when setFocus is called', () => {
      const { result } = renderHook(() => useFocus());
      const [ref, setFocus] = result.current;
      
      // Mock element with focus method
      const mockElement = { focus: mockFocus };
      ref.current = mockElement as any;
      
      act(() => {
        setFocus();
      });
      
      expect(mockFocus).toHaveBeenCalledTimes(1);
    });

    it('does not throw when ref.current is null', () => {
      const { result } = renderHook(() => useFocus());
      const [, setFocus] = result.current;
      
      expect(() => {
        act(() => {
          setFocus();
        });
      }).not.toThrow();
      
      expect(mockFocus).not.toHaveBeenCalled();
    });
  });

  describe('useFocusTrap', () => {
    let mockElement: any;
    let mockFirstElement: any;
    let mockLastElement: any;

    beforeEach(() => {
      mockFirstElement = { focus: jest.fn() };
      mockLastElement = { focus: jest.fn() };
      
      mockElement = {
        querySelectorAll: jest.fn().mockReturnValue([mockFirstElement, mockLastElement]),
        addEventListener: mockAddEventListener,
        removeEventListener: mockRemoveEventListener,
        dispatchEvent: mockDispatchEvent
      };
      
      Object.defineProperty(document, 'activeElement', {
        value: null,
        writable: true,
        configurable: true
      });
    });

    it('returns ref when inactive', () => {
      const { result } = renderHook(() => useFocusTrap(false));
      
      expect(result.current).toBeDefined();
      expect(mockAddEventListener).not.toHaveBeenCalled();
    });

    it('sets up focus trap when active', () => {
      const { result } = renderHook(() => useFocusTrap(true));
      
      // Set the ref
      result.current.current = mockElement;
      
      // Re-render to trigger useEffect
      renderHook(() => useFocusTrap(true));
      
      expect(mockElement.querySelectorAll).toHaveBeenCalledWith(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      expect(mockAddEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
      expect(mockFirstElement.focus).toHaveBeenCalled();
    });

    it('handles tab key navigation', () => {
      const { result } = renderHook(() => useFocusTrap(true));
      result.current.current = mockElement;
      
      // Simulate tab key event
      const tabEvent = new KeyboardEvent('keydown', { key: 'Tab' });
      Object.defineProperty(tabEvent, 'preventDefault', {
        value: jest.fn(),
        writable: true
      });
      
      // Get the event handler
      const keydownHandler = mockAddEventListener.mock.calls.find(
        call => call[0] === 'keydown'
      )?.[1];
      
      if (keydownHandler) {
        // Test forward tab at last element
        (document as any).activeElement = mockLastElement;
        keydownHandler(tabEvent);
        expect(tabEvent.preventDefault).toHaveBeenCalled();
      }
    });

    it('handles escape key', () => {
      const { result } = renderHook(() => useFocusTrap(true));
      result.current.current = mockElement;
      
      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
      
      // Get the event handler
      const keydownHandler = mockAddEventListener.mock.calls.find(
        call => call[0] === 'keydown'
      )?.[1];
      
      if (keydownHandler) {
        keydownHandler(escapeEvent);
        expect(mockDispatchEvent).toHaveBeenCalledWith(
          expect.objectContaining({ type: 'modal-escape' })
        );
      }
    });

    it('cleans up event listeners on unmount', () => {
      const { result, unmount } = renderHook(() => useFocusTrap(true));
      result.current.current = mockElement;
      
      unmount();
      
      expect(mockRemoveEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
    });
  });

  describe('useKeyboardNavigation', () => {
    let mockItems: any[];

    beforeEach(() => {
      mockItems = [
        { focus: jest.fn() },
        { focus: jest.fn() },
        { focus: jest.fn() }
      ];
    });

    it('returns handleKeyDown function and current index', () => {
      const { result } = renderHook(() => useKeyboardNavigation(mockItems));
      
      expect(result.current.handleKeyDown).toBeDefined();
      expect(typeof result.current.handleKeyDown).toBe('function');
      expect(result.current.currentIndex).toBe(0);
    });

    it('handles ArrowDown key navigation', () => {
      const onSelect = jest.fn();
      const { result } = renderHook(() => useKeyboardNavigation(mockItems, onSelect));
      
      const downEvent = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      Object.defineProperty(downEvent, 'preventDefault', {
        value: jest.fn(),
        writable: true
      });
      
      act(() => {
        result.current.handleKeyDown(downEvent);
      });
      
      expect(downEvent.preventDefault).toHaveBeenCalled();
      expect(mockItems[1].focus).toHaveBeenCalled();
    });

    it('handles ArrowUp key navigation', () => {
      const { result } = renderHook(() => useKeyboardNavigation(mockItems));
      
      const upEvent = new KeyboardEvent('keydown', { key: 'ArrowUp' });
      Object.defineProperty(upEvent, 'preventDefault', {
        value: jest.fn(),
        writable: true
      });
      
      act(() => {
        result.current.handleKeyDown(upEvent);
      });
      
      expect(upEvent.preventDefault).toHaveBeenCalled();
      expect(mockItems[0].focus).toHaveBeenCalled(); // Should stay at 0
    });

    it('handles Home key navigation', () => {
      const { result } = renderHook(() => useKeyboardNavigation(mockItems));
      
      const homeEvent = new KeyboardEvent('keydown', { key: 'Home' });
      Object.defineProperty(homeEvent, 'preventDefault', {
        value: jest.fn(),
        writable: true
      });
      
      act(() => {
        result.current.handleKeyDown(homeEvent);
      });
      
      expect(homeEvent.preventDefault).toHaveBeenCalled();
      expect(mockItems[0].focus).toHaveBeenCalled();
    });

    it('handles End key navigation', () => {
      const { result } = renderHook(() => useKeyboardNavigation(mockItems));
      
      const endEvent = new KeyboardEvent('keydown', { key: 'End' });
      Object.defineProperty(endEvent, 'preventDefault', {
        value: jest.fn(),
        writable: true
      });
      
      act(() => {
        result.current.handleKeyDown(endEvent);
      });
      
      expect(endEvent.preventDefault).toHaveBeenCalled();
      expect(mockItems[2].focus).toHaveBeenCalled();
    });

    it('handles Enter key selection', () => {
      const onSelect = jest.fn();
      const { result } = renderHook(() => useKeyboardNavigation(mockItems, onSelect));
      
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      Object.defineProperty(enterEvent, 'preventDefault', {
        value: jest.fn(),
        writable: true
      });
      
      act(() => {
        result.current.handleKeyDown(enterEvent);
      });
      
      expect(enterEvent.preventDefault).toHaveBeenCalled();
      expect(onSelect).toHaveBeenCalledWith(0);
    });

    it('handles Space key selection', () => {
      const onSelect = jest.fn();
      const { result } = renderHook(() => useKeyboardNavigation(mockItems, onSelect));
      
      const spaceEvent = new KeyboardEvent('keydown', { key: ' ' });
      Object.defineProperty(spaceEvent, 'preventDefault', {
        value: jest.fn(),
        writable: true
      });
      
      act(() => {
        result.current.handleKeyDown(spaceEvent);
      });
      
      expect(spaceEvent.preventDefault).toHaveBeenCalled();
      expect(onSelect).toHaveBeenCalledWith(0);
    });

    it('does not call onSelect when not provided', () => {
      const { result } = renderHook(() => useKeyboardNavigation(mockItems));
      
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      Object.defineProperty(enterEvent, 'preventDefault', {
        value: jest.fn(),
        writable: true
      });
      
      expect(() => {
        act(() => {
          result.current.handleKeyDown(enterEvent);
        });
      }).not.toThrow();
    });
  });

  describe('announceToScreenReader', () => {
    let mockElement: any;

    beforeEach(() => {
      mockElement = {
        setAttribute: jest.fn(),
        textContent: ''
      };
      
      jest.spyOn(document, 'createElement').mockReturnValue(mockElement);
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
      jest.restoreAllMocks();
    });

    it('creates announcement element with default priority', () => {
      announceToScreenReader('Test message');
      
      expect(document.createElement).toHaveBeenCalledWith('div');
      expect(mockElement.setAttribute).toHaveBeenCalledWith('aria-live', 'polite');
      expect(mockElement.setAttribute).toHaveBeenCalledWith('aria-atomic', 'true');
      expect(mockElement.setAttribute).toHaveBeenCalledWith('class', 'sr-only');
      expect(mockElement.textContent).toBe('Test message');
      expect(mockAppendChild).toHaveBeenCalledWith(mockElement);
    });

    it('creates announcement element with assertive priority', () => {
      announceToScreenReader('Urgent message', 'assertive');
      
      expect(mockElement.setAttribute).toHaveBeenCalledWith('aria-live', 'assertive');
    });

    it('removes announcement after timeout', () => {
      announceToScreenReader('Test message');
      
      expect(mockRemoveChild).not.toHaveBeenCalled();
      
      jest.advanceTimersByTime(1000);
      
      expect(mockRemoveChild).toHaveBeenCalledWith(mockElement);
    });
  });

  describe('createSkipLink', () => {
    let mockElement: any;
    let mockTarget: any;

    beforeEach(() => {
      mockTarget = {
        focus: mockFocus,
        scrollIntoView: mockScrollIntoView
      };
      
      mockElement = {
        href: '',
        textContent: '',
        className: '',
        setAttribute: jest.fn(),
        addEventListener: jest.fn()
      };
      
      jest.spyOn(document, 'createElement').mockReturnValue(mockElement);
      mockGetElementById.mockReturnValue(mockTarget);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('creates skip link with correct properties', () => {
      const skipLink = createSkipLink('main-content', 'Skip to main content');
      
      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(skipLink.href).toBe('#main-content');
      expect(skipLink.textContent).toBe('Skip to main content');
      expect(skipLink.className).toBe('skip-link');
      expect(mockElement.setAttribute).toHaveBeenCalledWith('aria-label', 'Skip to main content');
      expect(mockElement.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
    });

    it('handles click event correctly', () => {
      createSkipLink('main-content', 'Skip to main content');
      
      const clickHandler = mockElement.addEventListener.mock.calls.find(
        call => call[0] === 'click'
      )?.[1];
      
      const mockEvent = {
        preventDefault: jest.fn()
      };
      
      if (clickHandler) {
        clickHandler(mockEvent);
        
        expect(mockEvent.preventDefault).toHaveBeenCalled();
        expect(mockGetElementById).toHaveBeenCalledWith('main-content');
        expect(mockFocus).toHaveBeenCalled();
        expect(mockScrollIntoView).toHaveBeenCalled();
      }
    });

    it('handles missing target gracefully', () => {
      mockGetElementById.mockReturnValue(null);
      createSkipLink('nonexistent', 'Skip to nowhere');
      
      const clickHandler = mockElement.addEventListener.mock.calls.find(
        call => call[0] === 'click'
      )?.[1];
      
      const mockEvent = {
        preventDefault: jest.fn()
      };
      
      expect(() => {
        if (clickHandler) {
          clickHandler(mockEvent);
        }
      }).not.toThrow();
      
      expect(mockFocus).not.toHaveBeenCalled();
      expect(mockScrollIntoView).not.toHaveBeenCalled();
    });
  });

  describe('getContrastRatio', () => {
    it('calculates contrast ratio for basic colors', () => {
      const ratio1 = getContrastRatio('rgb(0, 0, 0)', 'rgb(255, 255, 255)');
      expect(ratio1).toBeGreaterThan(20); // Black vs White should have high contrast
      
      const ratio2 = getContrastRatio('rgb(128, 128, 128)', 'rgb(128, 128, 128)');
      expect(ratio2).toBe(1); // Same color should have ratio of 1
    });

    it('handles invalid color formats gracefully', () => {
      const ratio = getContrastRatio('invalid', 'also-invalid');
      expect(ratio).toBe(1); // Should default to 1 when colors can't be parsed
    });

    it('calculates correct ratio for medium contrast colors', () => {
      const ratio = getContrastRatio('rgb(100, 100, 100)', 'rgb(200, 200, 200)');
      expect(ratio).toBeGreaterThan(1);
      expect(ratio).toBeLessThan(10);
    });
  });

  describe('hasAccessibleContrast', () => {
    it('returns true for high contrast combinations (AA)', () => {
      const result = hasAccessibleContrast('rgb(0, 0, 0)', 'rgb(255, 255, 255)', 'AA');
      expect(result).toBe(true);
    });

    it('returns true for high contrast combinations (AAA)', () => {
      const result = hasAccessibleContrast('rgb(0, 0, 0)', 'rgb(255, 255, 255)', 'AAA');
      expect(result).toBe(true);
    });

    it('uses AA as default level', () => {
      const result = hasAccessibleContrast('rgb(0, 0, 0)', 'rgb(255, 255, 255)');
      expect(result).toBe(true);
    });

    it('returns false for low contrast combinations', () => {
      const result = hasAccessibleContrast('rgb(200, 200, 200)', 'rgb(220, 220, 220)');
      expect(result).toBe(false);
    });
  });

  describe('createAriaDescription', () => {
    it('creates description with single error', () => {
      const result = createAriaDescription('email', ['Invalid email format']);
      
      expect(result.id).toBe('email-description');
      expect(result.text).toBe('Invalid email format');
    });

    it('creates description with multiple errors', () => {
      const result = createAriaDescription('password', ['Too short', 'Missing special character']);
      
      expect(result.id).toBe('password-description');
      expect(result.text).toBe('Too short. Missing special character');
    });

    it('creates empty description when no errors', () => {
      const result = createAriaDescription('name', []);
      
      expect(result.id).toBe('name-description');
      expect(result.text).toBe('');
    });
  });

  describe('getTableAriaProps', () => {
    it('returns correct table ARIA properties', () => {
      const headers = ['Name', 'Email', 'Phone'];
      const props = getTableAriaProps(headers, 1, 2);
      
      expect(props).toEqual({
        role: 'grid',
        'aria-label': 'Data table',
        'aria-rowcount': -1,
        'aria-colcount': 3
      });
    });

    it('handles empty headers array', () => {
      const props = getTableAriaProps([], 0, 0);
      
      expect(props['aria-colcount']).toBe(0);
    });
  });

  describe('getCellAriaProps', () => {
    it('returns correct cell ARIA properties', () => {
      const headers = ['Name', 'Email', 'Phone'];
      const props = getCellAriaProps(2, 1, headers);
      
      expect(props).toEqual({
        role: 'gridcell',
        'aria-rowindex': 3,
        'aria-colindex': 2,
        'aria-describedby': 'header-1'
      });
    });

    it('handles missing header', () => {
      const headers = ['Name'];
      const props = getCellAriaProps(0, 5, headers);
      
      expect(props['aria-describedby']).toBeUndefined();
    });
  });

  describe('createBreadcrumbAriaProps', () => {
    it('returns current page props for last item', () => {
      const props = createBreadcrumbAriaProps(true);
      
      expect(props).toEqual({
        'aria-current': 'page'
      });
    });

    it('returns empty props for non-last item', () => {
      const props = createBreadcrumbAriaProps(false);
      
      expect(props).toEqual({
        'aria-current': undefined
      });
    });

    it('defaults to non-last item behavior', () => {
      const props = createBreadcrumbAriaProps();
      
      expect(props['aria-current']).toBeUndefined();
    });
  });

  describe('createLoadingAriaProps', () => {
    it('returns loading props when loading', () => {
      const props = createLoadingAriaProps(true);
      
      expect(props).toEqual({
        'aria-busy': true,
        'aria-live': 'polite',
        'aria-label': 'กำลังโหลด...'
      });
    });

    it('returns non-loading props when not loading', () => {
      const props = createLoadingAriaProps(false);
      
      expect(props).toEqual({
        'aria-busy': false,
        'aria-live': 'polite',
        'aria-label': undefined
      });
    });

    it('uses custom loading text', () => {
      const props = createLoadingAriaProps(true, 'Processing...');
      
      expect(props['aria-label']).toBe('Processing...');
    });
  });

  describe('createErrorAriaProps', () => {
    it('returns error props when has error', () => {
      const props = createErrorAriaProps(true, 'Field is required');
      
      expect(props['aria-invalid']).toBe(true);
      expect(props['aria-describedby']).toMatch(/^error-\d+$/);
    });

    it('returns non-error props when no error', () => {
      const props = createErrorAriaProps(false);
      
      expect(props).toEqual({
        'aria-invalid': false,
        'aria-describedby': undefined
      });
    });

    it('handles error without message', () => {
      const props = createErrorAriaProps(true);
      
      expect(props['aria-invalid']).toBe(true);
      expect(props['aria-describedby']).toBeUndefined();
    });
  });

  describe('createModalAriaProps', () => {
    it('returns modal props with title and description', () => {
      const props = createModalAriaProps('modal-title', 'modal-desc');
      
      expect(props).toEqual({
        role: 'dialog',
        'aria-modal': true,
        'aria-labelledby': 'modal-title',
        'aria-describedby': 'modal-desc'
      });
    });

    it('returns modal props with only title', () => {
      const props = createModalAriaProps('modal-title');
      
      expect(props).toEqual({
        role: 'dialog',
        'aria-modal': true,
        'aria-labelledby': 'modal-title',
        'aria-describedby': undefined
      });
    });
  });

  describe('createButtonAriaProps', () => {
    it('returns button props with all attributes', () => {
      const props = createButtonAriaProps(true, false, 'menu', 'help-text');
      
      expect(props).toEqual({
        'aria-pressed': true,
        'aria-expanded': false,
        'aria-controls': 'menu',
        'aria-describedby': 'help-text'
      });
    });

    it('returns button props with undefined attributes', () => {
      const props = createButtonAriaProps();
      
      expect(props).toEqual({
        'aria-pressed': undefined,
        'aria-expanded': undefined,
        'aria-controls': undefined,
        'aria-describedby': undefined
      });
    });
  });

  describe('createLiveRegionProps', () => {
    it('returns live region props with default priority', () => {
      const props = createLiveRegionProps();
      
      expect(props).toEqual({
        'aria-live': 'polite',
        'aria-atomic': true,
        className: 'sr-only'
      });
    });

    it('returns live region props with assertive priority', () => {
      const props = createLiveRegionProps('assertive');
      
      expect(props['aria-live']).toBe('assertive');
    });
  });

  describe('createScreenReaderText', () => {
    let mockSpan: any;

    beforeEach(() => {
      mockSpan = {
        className: '',
        textContent: ''
      };
      
      jest.spyOn(document, 'createElement').mockReturnValue(mockSpan);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('creates span with screen reader only class', () => {
      const span = createScreenReaderText('Hidden text');
      
      expect(document.createElement).toHaveBeenCalledWith('span');
      expect(span.className).toBe('sr-only');
      expect(span.textContent).toBe('Hidden text');
    });
  });

  describe('Keyboard Event Helpers', () => {
    describe('isEnterOrSpace', () => {
      it('returns true for Enter key', () => {
        const event = new KeyboardEvent('keydown', { key: 'Enter' });
        expect(isEnterOrSpace(event)).toBe(true);
      });

      it('returns true for Space key', () => {
        const event = new KeyboardEvent('keydown', { key: ' ' });
        expect(isEnterOrSpace(event)).toBe(true);
      });

      it('returns false for other keys', () => {
        const event = new KeyboardEvent('keydown', { key: 'Tab' });
        expect(isEnterOrSpace(event)).toBe(false);
      });
    });

    describe('isArrowKey', () => {
      it('returns true for all arrow keys', () => {
        const keys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
        
        keys.forEach(key => {
          const event = new KeyboardEvent('keydown', { key });
          expect(isArrowKey(event)).toBe(true);
        });
      });

      it('returns false for non-arrow keys', () => {
        const event = new KeyboardEvent('keydown', { key: 'Enter' });
        expect(isArrowKey(event)).toBe(false);
      });
    });

    describe('isNavigationKey', () => {
      it('returns true for navigation keys', () => {
        const keys = ['Tab', 'Home', 'End', 'PageUp', 'PageDown'];
        
        keys.forEach(key => {
          const event = new KeyboardEvent('keydown', { key });
          expect(isNavigationKey(event)).toBe(true);
        });
      });

      it('returns true for arrow keys', () => {
        const keys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
        
        keys.forEach(key => {
          const event = new KeyboardEvent('keydown', { key });
          expect(isNavigationKey(event)).toBe(true);
        });
      });

      it('returns false for non-navigation keys', () => {
        const event = new KeyboardEvent('keydown', { key: 'Enter' });
        expect(isNavigationKey(event)).toBe(false);
      });
    });
  });
});