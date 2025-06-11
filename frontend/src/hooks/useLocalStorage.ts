// src/hooks/useLocalStorage.ts
import { useState, useEffect, useCallback } from 'react';

type SetValue<T> = T | ((val: T) => T);

interface UseLocalStorageReturn<T> {
  value: T;
  setValue: (value: SetValue<T>) => void;
  removeValue: () => void;
  isLoading: boolean;
  error: string | null;
}

export const useLocalStorage = <T>(
  key: string,
  initialValue: T
): UseLocalStorageReturn<T> => {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Read from localStorage on mount
  useEffect(() => {
    try {
      setIsLoading(true);
      setError(null);

      const item = window.localStorage.getItem(key);
      if (item) {
        const parsedValue = JSON.parse(item);
        setStoredValue(parsedValue);
      }
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      setError(error instanceof Error ? error.message : 'Failed to read from localStorage');
    } finally {
      setIsLoading(false);
    }
  }, [key]);

  // Set value in localStorage and state
  const setValue = useCallback((value: SetValue<T>) => {
    try {
      setError(null);
      
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
      setError(error instanceof Error ? error.message : 'Failed to write to localStorage');
    }
  }, [key, storedValue]);

  // Remove value from localStorage and reset to initial value
  const removeValue = useCallback(() => {
    try {
      setError(null);
      setStoredValue(initialValue);
      
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
      setError(error instanceof Error ? error.message : 'Failed to remove from localStorage');
    }
  }, [key, initialValue]);

  return {
    value: storedValue,
    setValue,
    removeValue,
    isLoading,
    error,
  };
};

// Specialized hooks for common use cases
export const useLocalStorageString = (key: string, initialValue: string = '') => {
  return useLocalStorage<string>(key, initialValue);
};

export const useLocalStorageNumber = (key: string, initialValue: number = 0) => {
  return useLocalStorage<number>(key, initialValue);
};

export const useLocalStorageBoolean = (key: string, initialValue: boolean = false) => {
  return useLocalStorage<boolean>(key, initialValue);
};

export const useLocalStorageArray = <T>(key: string, initialValue: T[] = []) => {
  return useLocalStorage<T[]>(key, initialValue);
};

export const useLocalStorageObject = <T extends Record<string, any>>(
  key: string,
  initialValue: T
) => {
  return useLocalStorage<T>(key, initialValue);
};

// Hook for managing user preferences
export const useUserPreferences = () => {
  interface UserPreferences {
    theme: 'light' | 'dark';
    language: 'th' | 'en';
    sidebarOpen: boolean;
    defaultView: string;
    autoSave: boolean;
    notifications: boolean;
  }

  const defaultPreferences: UserPreferences = {
    theme: 'light',
    language: 'th',
    sidebarOpen: false,
    defaultView: 'dashboard',
    autoSave: true,
    notifications: true,
  };

  return useLocalStorage<UserPreferences>('userPreferences', defaultPreferences);
};

// Hook for managing form draft data
export const useFormDraft = <T extends Record<string, any>>(formName: string) => {
  const key = `formDraft_${formName}`;
  const { value, setValue, removeValue } = useLocalStorage<T | null>(key, null);

  const saveDraft = useCallback((formData: T) => {
    setValue(formData);
  }, [setValue]);

  const clearDraft = useCallback(() => {
    removeValue();
  }, [removeValue]);

  const hasDraft = value !== null;

  return {
    draft: value,
    saveDraft,
    clearDraft,
    hasDraft,
  };
};

// Hook for managing recent searches
export const useRecentSearches = (maxItems: number = 10) => {
  const { value: searches, setValue } = useLocalStorage<string[]>('recentSearches', []);

  const addSearch = useCallback((searchTerm: string) => {
    const trimmedTerm = searchTerm.trim();
    if (!trimmedTerm) return;

    setValue(prev => {
      const filtered = prev.filter(term => term !== trimmedTerm);
      const updated = [trimmedTerm, ...filtered];
      return updated.slice(0, maxItems);
    });
  }, [setValue, maxItems]);

  const removeSearch = useCallback((searchTerm: string) => {
    setValue(prev => prev.filter(term => term !== searchTerm));
  }, [setValue]);

  const clearSearches = useCallback(() => {
    setValue([]);
  }, [setValue]);

  return {
    searches,
    addSearch,
    removeSearch,
    clearSearches,
  };
};