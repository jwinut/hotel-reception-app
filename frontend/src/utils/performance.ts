// src/utils/performance.ts
import React, { ComponentType, memo, LazyExoticComponent, lazy } from 'react';

// Utility function to create lazy-loaded components with retry logic
export const createLazyComponent = <T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  componentName?: string
): LazyExoticComponent<T> => {
  return lazy(() =>
    importFunc().catch((error) => {
      console.error(`Failed to load component ${componentName || 'Unknown'}:`, error);
      // Retry logic - attempt to reload after a short delay
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(importFunc());
        }, 1000);
      });
    })
  );
};

// HOC for performance monitoring
export const withPerformanceMonitoring = <P extends object>(
  WrappedComponent: ComponentType<P>,
  componentName: string
): ComponentType<P> => {
  const MonitoredComponent: ComponentType<P> = (props: P) => {
    if (process.env.NODE_ENV === 'development') {
      const startTime = performance.now();
      
      // Use useEffect equivalent for monitoring
      const endTime = performance.now();
      if (endTime - startTime > 16) { // More than one frame (16ms)
        console.warn(`Slow render detected for ${componentName}: ${endTime - startTime}ms`);
      }
    }
    
    return React.createElement(WrappedComponent, props);
  };
  
  MonitoredComponent.displayName = `withPerformanceMonitoring(${componentName})`;
  
  return memo(MonitoredComponent);
};

// Utility for deep comparison in memo
export const deepEqual = (prevProps: any, nextProps: any): boolean => {
  const keys1 = Object.keys(prevProps);
  const keys2 = Object.keys(nextProps);
  
  if (keys1.length !== keys2.length) {
    return false;
  }
  
  for (const key of keys1) {
    if (prevProps[key] !== nextProps[key]) {
      // For objects and arrays, we might want to do deep comparison
      if (typeof prevProps[key] === 'object' && typeof nextProps[key] === 'object') {
        if (JSON.stringify(prevProps[key]) !== JSON.stringify(nextProps[key])) {
          return false;
        }
      } else {
        return false;
      }
    }
  }
  
  return true;
};

// HOC for memoization with custom comparison
export const withMemoization = <P extends object>(
  WrappedComponent: ComponentType<P>,
  areEqual?: (prevProps: P, nextProps: P) => boolean
) => {
  return memo(WrappedComponent, areEqual);
};

// Utility for bundle size analysis in development
export const logBundleSize = (componentName: string, component: any) => {
  if (process.env.NODE_ENV === 'development') {
    const size = JSON.stringify(component).length;
    console.log(`Component ${componentName} bundle size estimate: ${size} bytes`);
  }
};

// Debounced scroll handler for performance
export const createDebouncedScrollHandler = (
  callback: (event: Event) => void,
  delay: number = 100
) => {
  let timeoutId: NodeJS.Timeout;
  
  return (event: Event) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => callback(event), delay);
  };
};

// Throttled handler for frequent events
export const createThrottledHandler = (
  callback: (...args: any[]) => void,
  delay: number = 100
) => {
  let lastCall = 0;
  
  return (...args: any[]) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      callback(...args);
    }
  };
};

// Image lazy loading utility
export const createImageLazyLoader = () => {
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const src = img.dataset.src;
          if (src) {
            img.src = src;
            img.removeAttribute('data-src');
            observer.unobserve(img);
          }
        }
      });
    });
    
    return observer;
  }
  
  return null;
};

// Virtual scrolling utilities
export const calculateVisibleItems = (
  containerHeight: number,
  itemHeight: number,
  scrollTop: number,
  buffer: number = 5
) => {
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - buffer);
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const endIndex = Math.min(startIndex + visibleCount + buffer * 2);
  
  return { startIndex, endIndex, visibleCount };
};

// Memory usage monitoring (development only)
export const monitorMemoryUsage = (componentName: string) => {
  if (process.env.NODE_ENV === 'development' && 'memory' in performance) {
    const memInfo = (performance as any).memory;
    console.log(`Memory usage for ${componentName}:`, {
      used: `${Math.round(memInfo.usedJSHeapSize / 1048576)} MB`,
      allocated: `${Math.round(memInfo.totalJSHeapSize / 1048576)} MB`,
      limit: `${Math.round(memInfo.jsHeapSizeLimit / 1048576)} MB`,
    });
  }
};

// Web Vitals monitoring
export const measureWebVitals = () => {
  if (process.env.NODE_ENV === 'development') {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(console.log);
      getFID(console.log);
      getFCP(console.log);
      getLCP(console.log);
      getTTFB(console.log);
    });
  }
};

// Service Worker registration for caching
export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }
};

// Preload critical resources
export const preloadCriticalResources = (resources: string[]) => {
  resources.forEach((resource) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource;
    
    if (resource.endsWith('.css')) {
      link.as = 'style';
    } else if (resource.endsWith('.js')) {
      link.as = 'script';
    } else if (resource.match(/\.(jpg|jpeg|png|webp|svg)$/)) {
      link.as = 'image';
    }
    
    document.head.appendChild(link);
  });
};