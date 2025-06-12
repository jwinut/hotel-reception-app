// src/hooks/useDebounce.test.ts
import { renderHook, act, waitFor } from '@testing-library/react';
import {
  useDebounce,
  useDebouncedCallback,
  useDebouncedState,
  useDebouncedSearch,
  useDebouncedInput,
  useDebouncedAsync
} from './useDebounce';

// Helper to advance timers
const advanceTimers = (ms: number) => {
  act(() => {
    jest.advanceTimersByTime(ms);
  });
};

describe('useDebounce Hooks', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  describe('useDebounce', () => {
    it('returns initial value immediately', () => {
      const { result } = renderHook(() => useDebounce('initial', 500));
      
      expect(result.current).toBe('initial');
    });

    it('debounces value updates', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: 'initial', delay: 500 } }
      );

      expect(result.current).toBe('initial');

      // Change value
      rerender({ value: 'updated', delay: 500 });
      
      // Should still show old value
      expect(result.current).toBe('initial');

      // Advance time but not enough
      advanceTimers(300);
      expect(result.current).toBe('initial');

      // Advance enough time
      advanceTimers(200);
      expect(result.current).toBe('updated');
    });

    it('resets timeout when value changes again before delay', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: 'initial', delay: 500 } }
      );

      // Change value
      rerender({ value: 'first', delay: 500 });
      advanceTimers(300);

      // Change again before timeout
      rerender({ value: 'second', delay: 500 });
      advanceTimers(300);
      
      // Should still be initial
      expect(result.current).toBe('initial');

      // Complete the new timeout
      advanceTimers(200);
      expect(result.current).toBe('second');
    });

    it('handles different delay values', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: 'initial', delay: 100 } }
      );

      rerender({ value: 'updated', delay: 100 });
      
      advanceTimers(100);
      expect(result.current).toBe('updated');

      // Change delay
      rerender({ value: 'final', delay: 1000 });
      advanceTimers(500);
      expect(result.current).toBe('updated'); // Still old value

      advanceTimers(500);
      expect(result.current).toBe('final'); // Now updated
    });
  });

  describe('useDebouncedCallback', () => {
    it('returns debounced callback and cancel function', () => {
      const mockCallback = jest.fn();
      const { result } = renderHook(() => useDebouncedCallback(mockCallback, 500));

      expect(typeof result.current[0]).toBe('function');
      expect(typeof result.current[1]).toBe('function');
    });

    it('debounces callback execution', () => {
      const mockCallback = jest.fn();
      const { result } = renderHook(() => useDebouncedCallback(mockCallback, 500));

      const [debouncedCallback] = result.current;

      // Call multiple times
      act(() => {
        debouncedCallback('arg1');
        debouncedCallback('arg2');
        debouncedCallback('arg3');
      });

      // Should not have called yet
      expect(mockCallback).not.toHaveBeenCalled();

      // Advance time
      advanceTimers(500);

      // Should have called only once with last arguments
      expect(mockCallback).toHaveBeenCalledTimes(1);
      expect(mockCallback).toHaveBeenCalledWith('arg3');
    });

    it('cancels debounced callback', () => {
      const mockCallback = jest.fn();
      const { result } = renderHook(() => useDebouncedCallback(mockCallback, 500));

      const [debouncedCallback, cancel] = result.current;

      act(() => {
        debouncedCallback('test');
      });

      // Cancel before timeout
      act(() => {
        cancel();
      });

      advanceTimers(500);

      expect(mockCallback).not.toHaveBeenCalled();
    });

    it('cleans up timeout on unmount', () => {
      const mockCallback = jest.fn();
      const { result, unmount } = renderHook(() => useDebouncedCallback(mockCallback, 500));

      const [debouncedCallback] = result.current;

      act(() => {
        debouncedCallback('test');
      });

      unmount();
      advanceTimers(500);

      expect(mockCallback).not.toHaveBeenCalled();
    });
  });

  describe('useDebouncedState', () => {
    it('initializes with correct values', () => {
      const { result } = renderHook(() => useDebouncedState('initial', 500));

      expect(result.current.value).toBe('initial');
      expect(result.current.debouncedValue).toBe('initial');
      expect(result.current.isDebouncing).toBe(false);
      expect(typeof result.current.setValue).toBe('function');
    });

    it('updates value immediately and debounced value after delay', () => {
      const { result } = renderHook(() => useDebouncedState('initial', 500));

      act(() => {
        result.current.setValue('updated');
      });

      expect(result.current.value).toBe('updated');
      expect(result.current.debouncedValue).toBe('initial');
      expect(result.current.isDebouncing).toBe(true);

      advanceTimers(500);

      expect(result.current.debouncedValue).toBe('updated');
      expect(result.current.isDebouncing).toBe(false);
    });

    it('tracks debouncing state correctly', () => {
      const { result } = renderHook(() => useDebouncedState('initial', 500));

      expect(result.current.isDebouncing).toBe(false);

      act(() => {
        result.current.setValue('updated');
      });

      expect(result.current.isDebouncing).toBe(true);

      advanceTimers(500);

      expect(result.current.isDebouncing).toBe(false);
    });
  });

  describe('useDebouncedSearch', () => {
    it('initializes with correct default state', () => {
      const mockSearchFunction = jest.fn();
      const { result } = renderHook(() => useDebouncedSearch(mockSearchFunction, 300));

      expect(result.current.searchTerm).toBe('');
      expect(result.current.results).toEqual([]);
      expect(result.current.isSearching).toBe(false);
      expect(result.current.error).toBeNull();
      expect(typeof result.current.setSearchTerm).toBe('function');
      expect(typeof result.current.clearResults).toBe('function');
    });

    it('performs search after debounce delay', async () => {
      const mockResults = [{ id: 1, name: 'Result 1' }];
      const mockSearchFunction = jest.fn().mockResolvedValue(mockResults);
      
      const { result } = renderHook(() => useDebouncedSearch(mockSearchFunction, 300));

      act(() => {
        result.current.setSearchTerm('test query');
      });

      expect(result.current.searchTerm).toBe('test query');
      expect(mockSearchFunction).not.toHaveBeenCalled();

      // Advance debounce delay
      advanceTimers(300);

      await waitFor(() => {
        expect(mockSearchFunction).toHaveBeenCalledWith('test query');
      });

      await waitFor(() => {
        expect(result.current.results).toEqual(mockResults);
        expect(result.current.isSearching).toBe(false);
      });
    });

    it('does not search for empty term', () => {
      const mockSearchFunction = jest.fn();
      const { result } = renderHook(() => useDebouncedSearch(mockSearchFunction, 300));

      act(() => {
        result.current.setSearchTerm('   '); // Whitespace only
      });

      advanceTimers(300);

      expect(mockSearchFunction).not.toHaveBeenCalled();
      expect(result.current.results).toEqual([]);
      expect(result.current.isSearching).toBe(false);
    });

    it('handles search errors', async () => {
      const errorMessage = 'Search failed';
      const mockSearchFunction = jest.fn().mockRejectedValue(new Error(errorMessage));
      
      const { result } = renderHook(() => useDebouncedSearch(mockSearchFunction, 300));

      act(() => {
        result.current.setSearchTerm('test');
      });

      advanceTimers(300);

      await waitFor(() => {
        expect(result.current.error).toBe(errorMessage);
        expect(result.current.results).toEqual([]);
        expect(result.current.isSearching).toBe(false);
      });
    });

    it('clears results and search term', () => {
      const mockSearchFunction = jest.fn();
      const { result } = renderHook(() => useDebouncedSearch(mockSearchFunction, 300));

      act(() => {
        result.current.setSearchTerm('test');
      });

      act(() => {
        result.current.clearResults();
      });

      expect(result.current.searchTerm).toBe('');
      expect(result.current.results).toEqual([]);
      expect(result.current.error).toBeNull();
    });

    it('shows loading state during search', async () => {
      const mockSearchFunction = jest.fn(() => 
        new Promise(resolve => setTimeout(() => resolve([]), 100))
      );
      
      const { result } = renderHook(() => useDebouncedSearch(mockSearchFunction, 300));

      act(() => {
        result.current.setSearchTerm('test');
      });

      advanceTimers(300);

      await waitFor(() => {
        expect(result.current.isSearching).toBe(true);
      });

      advanceTimers(100);

      await waitFor(() => {
        expect(result.current.isSearching).toBe(false);
      });
    });
  });

  describe('useDebouncedInput', () => {
    it('initializes with default values', () => {
      const { result } = renderHook(() => useDebouncedInput());

      expect(result.current.value).toBe('');
      expect(result.current.debouncedValue).toBe('');
      expect(result.current.isTyping).toBe(false);
      expect(typeof result.current.onChange).toBe('function');
    });

    it('initializes with provided initial value', () => {
      const { result } = renderHook(() => useDebouncedInput('initial'));

      expect(result.current.value).toBe('initial');
      expect(result.current.debouncedValue).toBe('initial');
    });

    it('tracks typing state correctly', () => {
      const { result } = renderHook(() => useDebouncedInput('', 300));

      expect(result.current.isTyping).toBe(false);

      act(() => {
        result.current.onChange('typing');
      });

      expect(result.current.value).toBe('typing');
      expect(result.current.isTyping).toBe(true);

      advanceTimers(300);

      expect(result.current.debouncedValue).toBe('typing');
      expect(result.current.isTyping).toBe(false);
    });

    it('calls onDebouncedChange callback', () => {
      const onDebouncedChange = jest.fn();
      const { result } = renderHook(() => 
        useDebouncedInput('initial', 300, onDebouncedChange)
      );

      act(() => {
        result.current.onChange('changed');
      });

      advanceTimers(300);

      expect(onDebouncedChange).toHaveBeenCalledWith('changed');
    });

    it('does not call onDebouncedChange for initial value', () => {
      const onDebouncedChange = jest.fn();
      renderHook(() => useDebouncedInput('initial', 300, onDebouncedChange));

      expect(onDebouncedChange).not.toHaveBeenCalled();
    });
  });

  describe('useDebouncedAsync', () => {
    it('initializes with correct default state', () => {
      const mockAsyncFunction = jest.fn();
      const { result } = renderHook(() => useDebouncedAsync(mockAsyncFunction, 300));

      expect(result.current.data).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(typeof result.current.execute).toBe('function');
      expect(typeof result.current.cancel).toBe('function');
    });

    it('executes async function after debounce delay', async () => {
      const mockData = { result: 'success' };
      const mockAsyncFunction = jest.fn().mockResolvedValue(mockData);
      
      const { result } = renderHook(() => useDebouncedAsync(mockAsyncFunction, 300));

      act(() => {
        result.current.execute('arg1', 'arg2');
      });

      expect(mockAsyncFunction).not.toHaveBeenCalled();
      expect(result.current.isLoading).toBe(false);

      advanceTimers(300);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(true);
      });

      await waitFor(() => {
        expect(mockAsyncFunction).toHaveBeenCalledWith('arg1', 'arg2');
        expect(result.current.data).toEqual(mockData);
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('cancels previous execution when called again', async () => {
      const mockAsyncFunction = jest.fn()
        .mockResolvedValueOnce('first')
        .mockResolvedValueOnce('second');
      
      const { result } = renderHook(() => useDebouncedAsync(mockAsyncFunction, 300));

      // First execution
      act(() => {
        result.current.execute('first');
      });

      advanceTimers(200); // Not enough to trigger

      // Second execution (should cancel first)
      act(() => {
        result.current.execute('second');
      });

      advanceTimers(300);

      await waitFor(() => {
        expect(mockAsyncFunction).toHaveBeenCalledTimes(1);
        expect(mockAsyncFunction).toHaveBeenCalledWith('second');
      });
    });

    it('handles async function errors', async () => {
      const errorMessage = 'Async operation failed';
      const mockAsyncFunction = jest.fn().mockRejectedValue(new Error(errorMessage));
      
      const { result } = renderHook(() => useDebouncedAsync(mockAsyncFunction, 300));

      act(() => {
        result.current.execute();
      });

      advanceTimers(300);

      await waitFor(() => {
        expect(result.current.error).toBe(errorMessage);
        expect(result.current.data).toBeNull();
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('cancels execution manually', async () => {
      const mockAsyncFunction = jest.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve('result'), 100))
      );
      
      const { result } = renderHook(() => useDebouncedAsync(mockAsyncFunction, 300));

      act(() => {
        result.current.execute();
      });

      advanceTimers(300);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(true);
      });

      act(() => {
        result.current.cancel();
      });

      expect(result.current.isLoading).toBe(false);

      advanceTimers(100);

      // Should not update data after cancellation
      await waitFor(() => {
        expect(result.current.data).toBeNull();
      });
    });

    it('cleans up on unmount', () => {
      const mockAsyncFunction = jest.fn();
      const { result, unmount } = renderHook(() => useDebouncedAsync(mockAsyncFunction, 300));

      act(() => {
        result.current.execute();
      });

      unmount();

      advanceTimers(300);

      expect(mockAsyncFunction).not.toHaveBeenCalled();
    });

    it('handles non-Error objects in catch block', async () => {
      const mockAsyncFunction = jest.fn().mockRejectedValue('String error');
      
      const { result } = renderHook(() => useDebouncedAsync(mockAsyncFunction, 300));

      act(() => {
        result.current.execute();
      });

      advanceTimers(300);

      await waitFor(() => {
        expect(result.current.error).toBe('Operation failed');
      });
    });
  });

  describe('Edge cases and cleanup', () => {
    it('handles rapid value changes in useDebounce', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, 100),
        { initialProps: { value: 'initial' } }
      );

      // Rapidly change values
      for (let i = 0; i < 10; i++) {
        rerender({ value: `value-${i}` });
        advanceTimers(50); // Less than delay
      }

      // Should still be initial
      expect(result.current).toBe('initial');

      // Complete the timeout
      advanceTimers(100);
      expect(result.current).toBe('value-9');
    });

    it('preserves callback identity in useDebouncedCallback', () => {
      const mockCallback = jest.fn();
      const { result, rerender } = renderHook(() => 
        useDebouncedCallback(mockCallback, 300)
      );

      const firstCallback = result.current[0];
      const firstCancel = result.current[1];

      rerender();

      expect(result.current[0]).toBe(firstCallback);
      expect(result.current[1]).toBe(firstCancel);
    });

    it('handles zero delay in useDebounce', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, 0),
        { initialProps: { value: 'initial' } }
      );

      rerender({ value: 'updated' });
      advanceTimers(0);

      expect(result.current).toBe('updated');
    });
  });
});