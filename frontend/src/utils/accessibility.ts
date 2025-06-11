// src/utils/accessibility.ts
import { useEffect, useRef, RefObject } from 'react';

// Accessibility utility functions for WCAG 2.1 AA compliance

export interface AriaLabelProps {
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
}

export interface AriaStateProps {
  'aria-expanded'?: boolean;
  'aria-selected'?: boolean;
  'aria-checked'?: boolean;
  'aria-pressed'?: boolean;
  'aria-disabled'?: boolean;
  'aria-hidden'?: boolean;
  'aria-current'?: boolean | 'page' | 'step' | 'location' | 'date' | 'time';
}

// Generate unique IDs for accessibility
let idCounter = 0;
export const generateId = (prefix: string = 'a11y'): string => {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
};

// Hook for managing focus
export const useFocus = (): [RefObject<HTMLElement | null>, () => void] => {
  const ref = useRef<HTMLElement | null>(null);
  
  const setFocus = (): void => {
    if (ref.current) {
      ref.current.focus();
    }
  };

  return [ref, setFocus];
};

// Hook for focus trap (for modals)
export const useFocusTrap = (isActive: boolean): RefObject<HTMLElement | null> => {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive || !ref.current) return;

    const element = ref.current;
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // Trigger escape event for parent to handle
        element.dispatchEvent(new CustomEvent('modal-escape'));
      }
    };

    element.addEventListener('keydown', handleTabKey);
    element.addEventListener('keydown', handleEscapeKey);
    
    // Focus first element when trap activates
    firstElement?.focus();

    return () => {
      element.removeEventListener('keydown', handleTabKey);
      element.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isActive]);

  return ref;
};

// Hook for keyboard navigation
export const useKeyboardNavigation = (
  items: HTMLElement[],
  onSelect?: (index: number) => void
) => {
  const currentIndex = useRef(0);

  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        currentIndex.current = Math.min(currentIndex.current + 1, items.length - 1);
        items[currentIndex.current]?.focus();
        break;
      case 'ArrowUp':
        e.preventDefault();
        currentIndex.current = Math.max(currentIndex.current - 1, 0);
        items[currentIndex.current]?.focus();
        break;
      case 'Home':
        e.preventDefault();
        currentIndex.current = 0;
        items[0]?.focus();
        break;
      case 'End':
        e.preventDefault();
        currentIndex.current = items.length - 1;
        items[items.length - 1]?.focus();
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        onSelect?.(currentIndex.current);
        break;
    }
  };

  return { handleKeyDown, currentIndex: currentIndex.current };
};

// Announce to screen readers
export const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite'): void => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.setAttribute('class', 'sr-only');
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

// Skip link functionality
export const createSkipLink = (targetId: string, text: string): HTMLElement => {
  const skipLink = document.createElement('a');
  skipLink.href = `#${targetId}`;
  skipLink.textContent = text;
  skipLink.className = 'skip-link';
  skipLink.setAttribute('aria-label', text);
  
  skipLink.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.focus();
      target.scrollIntoView();
    }
  });

  return skipLink;
};

// Color contrast helpers
export const getContrastRatio = (color1: string, color2: string): number => {
  // Simplified contrast calculation for development
  // In production, use a more robust color contrast library
  const getLuminance = (color: string): number => {
    // Basic RGB extraction and luminance calculation
    const rgb = color.match(/\d+/g);
    if (!rgb || rgb.length < 3) return 0;
    
    const r = Number(rgb[0]);
    const g = Number(rgb[1]);
    const b = Number(rgb[2]);
    
    const sRGB = [r, g, b].map(c => {
      const normalized = c / 255;
      return normalized <= 0.03928 ? normalized / 12.92 : Math.pow((normalized + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * sRGB[0]! + 0.7152 * sRGB[1]! + 0.0722 * sRGB[2]!;
  };

  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  
  return (lighter + 0.05) / (darker + 0.05);
};

export const hasAccessibleContrast = (color1: string, color2: string, level: 'AA' | 'AAA' = 'AA'): boolean => {
  const ratio = getContrastRatio(color1, color2);
  return level === 'AA' ? ratio >= 4.5 : ratio >= 7;
};

// Form validation helpers
export const createAriaDescription = (fieldId: string, errors: string[]): { id: string; text: string } => {
  const descriptionId = `${fieldId}-description`;
  const text = errors.length > 0 ? errors.join('. ') : '';
  
  return { id: descriptionId, text };
};

// Table accessibility helpers
export const getTableAriaProps = (headers: string[], currentRow: number, currentCol: number) => {
  return {
    role: 'grid',
    'aria-label': 'Data table',
    'aria-rowcount': -1, // Will be set dynamically
    'aria-colcount': headers.length,
  };
};

export const getCellAriaProps = (rowIndex: number, colIndex: number, headers: string[]) => {
  return {
    role: 'gridcell',
    'aria-rowindex': rowIndex + 1,
    'aria-colindex': colIndex + 1,
    'aria-describedby': headers[colIndex] ? `header-${colIndex}` : undefined,
  };
};

// Navigation helpers
export const createBreadcrumbAriaProps = (isLast: boolean = false) => {
  return {
    'aria-current': isLast ? ('page' as const) : undefined,
  };
};

// Loading state helpers
export const createLoadingAriaProps = (isLoading: boolean, loadingText: string = 'กำลังโหลด...') => {
  return {
    'aria-busy': isLoading,
    'aria-live': 'polite',
    'aria-label': isLoading ? loadingText : undefined,
  };
};

// Error handling helpers
export const createErrorAriaProps = (hasError: boolean, errorMessage?: string) => {
  return {
    'aria-invalid': hasError,
    'aria-describedby': hasError && errorMessage ? generateId('error') : undefined,
  };
};

// Modal helpers
export const createModalAriaProps = (titleId: string, descriptionId?: string) => {
  return {
    role: 'dialog',
    'aria-modal': true,
    'aria-labelledby': titleId,
    'aria-describedby': descriptionId,
  };
};

// Button helpers
export const createButtonAriaProps = (
  isPressed?: boolean,
  isExpanded?: boolean,
  controls?: string,
  describedBy?: string
) => {
  return {
    'aria-pressed': isPressed,
    'aria-expanded': isExpanded,
    'aria-controls': controls,
    'aria-describedby': describedBy,
  };
};

// Live region helpers
export const createLiveRegionProps = (priority: 'polite' | 'assertive' = 'polite') => {
  return {
    'aria-live': priority,
    'aria-atomic': true,
    className: 'sr-only',
  };
};

// Screen reader only text utility
export const createScreenReaderText = (text: string): HTMLSpanElement => {
  const span = document.createElement('span');
  span.className = 'sr-only';
  span.textContent = text;
  return span;
};

// Keyboard event helpers
export const isEnterOrSpace = (event: KeyboardEvent): boolean => {
  return event.key === 'Enter' || event.key === ' ';
};

export const isArrowKey = (event: KeyboardEvent): boolean => {
  return ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key);
};

export const isNavigationKey = (event: KeyboardEvent): boolean => {
  return ['Tab', 'Home', 'End', 'PageUp', 'PageDown'].includes(event.key) || isArrowKey(event);
};