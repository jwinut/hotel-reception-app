// src/hooks/useDebounce.ts
import { useState, useEffect, useRef, useCallback } from 'react';

// Basic debounce hook
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Debounced callback hook
export const useDebouncedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): [T, () => void] => {
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const debouncedCallback = useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    }) as T,
    [callback, delay]
  );

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return [debouncedCallback, cancel];
};

// Advanced debounce hook with loading state
export const useDebouncedState = <T>(
  initialValue: T,
  delay: number
): {
  value: T;
  debouncedValue: T;
  setValue: (value: T) => void;
  isDebouncing: boolean;
} => {
  const [value, setValue] = useState<T>(initialValue);
  const [debouncedValue, setDebouncedValue] = useState<T>(initialValue);
  const [isDebouncing, setIsDebouncing] = useState(false);

  useEffect(() => {
    if (value !== debouncedValue) {
      setIsDebouncing(true);
    }

    const handler = setTimeout(() => {
      setDebouncedValue(value);
      setIsDebouncing(false);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay, debouncedValue]);

  return {
    value,
    debouncedValue,
    setValue,
    isDebouncing,
  };
};

// Debounced search hook
export const useDebouncedSearch = <T>(
  searchFunction: (query: string) => Promise<T[]>,
  delay: number = 300
): {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  results: T[];
  isSearching: boolean;
  error: string | null;
  clearResults: () => void;
} => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<T[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedSearchTerm = useDebounce(searchTerm, delay);

  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedSearchTerm.trim()) {
        setResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      setError(null);

      try {
        const searchResults = await searchFunction(debouncedSearchTerm);
        setResults(searchResults);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed');
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    performSearch();
  }, [debouncedSearchTerm, searchFunction]);

  const clearResults = useCallback(() => {
    setResults([]);
    setSearchTerm('');
    setError(null);
  }, []);

  return {
    searchTerm,
    setSearchTerm,
    results,
    isSearching,
    error,
    clearResults,
  };
};

// Debounced input hook for forms
export const useDebouncedInput = (
  initialValue: string = '',
  delay: number = 300,
  onDebouncedChange?: (value: string) => void
): {
  value: string;
  debouncedValue: string;
  onChange: (value: string) => void;
  isTyping: boolean;
} => {
  const [value, setValue] = useState(initialValue);
  const debouncedValue = useDebounce(value, delay);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (value !== debouncedValue) {
      setIsTyping(true);
    } else {
      setIsTyping(false);
    }
  }, [value, debouncedValue]);

  useEffect(() => {
    if (onDebouncedChange && debouncedValue !== initialValue) {
      onDebouncedChange(debouncedValue);
    }
  }, [debouncedValue, onDebouncedChange, initialValue]);

  const onChange = useCallback((newValue: string) => {
    setValue(newValue);
  }, []);

  return {
    value,
    debouncedValue,
    onChange,
    isTyping,
  };
};

// Debounced async operation hook
export const useDebouncedAsync = <T, Args extends any[]>(
  asyncFunction: (...args: Args) => Promise<T>,
  delay: number = 300
): {
  execute: (...args: Args) => void;
  data: T | null;
  isLoading: boolean;
  error: string | null;
  cancel: () => void;
} => {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const abortControllerRef = useRef<AbortController | undefined>(undefined);

  const execute = useCallback((...args: Args) => {
    // Cancel previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Abort previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setError(null);

    timeoutRef.current = setTimeout(async () => {
      setIsLoading(true);
      abortControllerRef.current = new AbortController();

      try {
        const result = await asyncFunction(...args);
        if (!abortControllerRef.current.signal.aborted) {
          setData(result);
        }
      } catch (err) {
        if (!abortControllerRef.current.signal.aborted) {
          setError(err instanceof Error ? err.message : 'Operation failed');
        }
      } finally {
        if (!abortControllerRef.current.signal.aborted) {
          setIsLoading(false);
        }
      }
    }, delay);
  }, [asyncFunction, delay]);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  return {
    execute,
    data,
    isLoading,
    error,
    cancel,
  };
};