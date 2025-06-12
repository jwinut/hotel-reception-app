// src/hooks/useLocalStorage.test.ts
import { renderHook, act, waitFor } from '@testing-library/react';
import {
  useLocalStorage,
  useLocalStorageString,
  useLocalStorageNumber,
  useLocalStorageBoolean,
  useLocalStorageArray,
  useLocalStorageObject,
  useUserPreferences,
  useFormDraft,
  useRecentSearches
} from './useLocalStorage';

// Mock localStorage with a simpler approach
class LocalStorageMock {
  private store: Record<string, string> = {};

  getItem = jest.fn((key: string): string | null => {
    return this.store[key] || null;
  });

  setItem = jest.fn((key: string, value: string): void => {
    this.store[key] = value;
  });

  removeItem = jest.fn((key: string): void => {
    delete this.store[key];
  });

  clear = jest.fn((): void => {
    this.store = {};
  });

  get length(): number {
    return Object.keys(this.store).length;
  }

  key = jest.fn((index: number): string | null => {
    return Object.keys(this.store)[index] || null;
  });
}

const localStorageMock = new LocalStorageMock();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock console.error to avoid noise in tests
const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

describe('useLocalStorage Hooks', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
    consoleErrorSpy.mockClear();
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('useLocalStorage', () => {
    it('initializes with initial value when localStorage is empty', async () => {
      // Ensure localStorage is empty for this test
      localStorageMock.removeItem('test-key');
      
      const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

      // Wait for loading to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.value).toBe('initial');
      expect(result.current.error).toBeNull();
    });

    it('loads existing value from localStorage', async () => {
      const existingValue = { name: 'John', age: 30 };
      
      // Set up the mock BEFORE clearing to ensure it works
      (localStorageMock.getItem as jest.Mock).mockReturnValueOnce(JSON.stringify(existingValue));

      const { result } = renderHook(() => useLocalStorage('test-key', { name: '', age: 0 }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.value).toEqual(existingValue);
      expect(localStorageMock.getItem).toHaveBeenCalledWith('test-key');
    });

    it('sets value in localStorage and state', async () => {
      const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const newValue = 'updated';

      act(() => {
        result.current.setValue(newValue);
      });

      expect(result.current.value).toBe(newValue);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('test-key', JSON.stringify(newValue));
    });

    it('handles function-based setValue', async () => {
      const { result } = renderHook(() => useLocalStorage('test-key', 10));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.setValue(prev => prev + 5);
      });

      expect(result.current.value).toBe(15);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('test-key', JSON.stringify(15));
    });

    it('removes value from localStorage and resets to initial', async () => {
      // Mock localStorage to return stored value initially
      (localStorageMock.getItem as jest.Mock).mockReturnValueOnce(JSON.stringify('stored'));
      
      const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.value).toBe('stored');

      act(() => {
        result.current.removeValue();
      });

      expect(result.current.value).toBe('initial');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('test-key');
    });

    it('handles JSON parse errors gracefully', async () => {
      // Mock localStorage to return invalid JSON
      (localStorageMock.getItem as jest.Mock).mockReturnValueOnce('invalid-json');

      const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.value).toBe('initial');
      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
        expect(result.current.error).toContain('Unexpected token');
      });
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error reading localStorage key "test-key":'),
        expect.any(Error)
      );
    });

    it('handles localStorage setItem errors', async () => {
      localStorageMock.clear();
      
      const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const setItemError = new Error('LocalStorage quota exceeded');
      localStorageMock.setItem.mockImplementationOnce(() => {
        throw setItemError;
      });

      act(() => {
        result.current.setValue('new value');
      });

      await waitFor(() => {
        expect(result.current.error).toBe(setItemError.message);
      });
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error setting localStorage key "test-key":'),
        setItemError
      );
    });

    it('handles localStorage removeItem errors', async () => {
      localStorageMock.clear();
      
      const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const removeError = new Error('Cannot remove item');
      localStorageMock.removeItem.mockImplementationOnce(() => {
        throw removeError;
      });

      act(() => {
        result.current.removeValue();
      });

      await waitFor(() => {
        expect(result.current.error).toBe(removeError.message);
      });
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error removing localStorage key "test-key":'),
        removeError
      );
    });

    it('works with different data types', async () => {
      const testCases = [
        { key: 'string', value: 'test string' },
        { key: 'number', value: 42 },
        { key: 'boolean', value: true },
        { key: 'array', value: [1, 2, 3] },
        { key: 'object', value: { name: 'test', id: 1 } },
        { key: 'null', value: null },
      ];

      for (const testCase of testCases) {
        const { result } = renderHook(() => useLocalStorage(testCase.key, 'initial'));

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
        });

        act(() => {
          result.current.setValue(testCase.value);
        });

        expect(result.current.value).toEqual(testCase.value);
      }
    });

    it('handles SSR environment (no window)', async () => {
      const originalWindow = global.window;
      const originalProcess = global.process;
      
      // Mock SSR environment
      Object.defineProperty(global, 'window', {
        value: undefined,
        writable: true,
      });

      const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.setValue('new value');
      });

      // Should not throw error
      expect(result.current.value).toBe('new value');

      // Restore original window
      Object.defineProperty(global, 'window', {
        value: originalWindow,
        writable: true,
      });
    });
  });

  describe('Specialized localStorage hooks', () => {
    it('useLocalStorageString works correctly', async () => {
      const { result } = renderHook(() => useLocalStorageString('string-key', 'default'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.value).toBe('default');

      act(() => {
        result.current.setValue('updated string');
      });

      expect(result.current.value).toBe('updated string');
    });

    it('useLocalStorageNumber works correctly', async () => {
      const { result } = renderHook(() => useLocalStorageNumber('number-key', 0));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.value).toBe(0);

      act(() => {
        result.current.setValue(42);
      });

      expect(result.current.value).toBe(42);
    });

    it('useLocalStorageBoolean works correctly', async () => {
      const { result } = renderHook(() => useLocalStorageBoolean('boolean-key', false));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.value).toBe(false);

      act(() => {
        result.current.setValue(true);
      });

      expect(result.current.value).toBe(true);
    });

    it('useLocalStorageArray works correctly', async () => {
      const { result } = renderHook(() => useLocalStorageArray<number>('array-key', []));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.value).toEqual([]);

      act(() => {
        result.current.setValue([1, 2, 3]);
      });

      expect(result.current.value).toEqual([1, 2, 3]);
    });

    it('useLocalStorageObject works correctly', async () => {
      const initialObj = { name: '', count: 0 };
      const { result } = renderHook(() => useLocalStorageObject('object-key', initialObj));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.value).toEqual(initialObj);

      const newObj = { name: 'test', count: 5 };
      act(() => {
        result.current.setValue(newObj);
      });

      expect(result.current.value).toEqual(newObj);
    });
  });

  describe('useUserPreferences', () => {
    it('initializes with default preferences', async () => {
      const { result } = renderHook(() => useUserPreferences());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.value).toEqual({
        theme: 'light',
        language: 'th',
        sidebarOpen: false,
        defaultView: 'dashboard',
        autoSave: true,
        notifications: true,
      });
    });

    it('updates individual preferences', async () => {
      const { result } = renderHook(() => useUserPreferences());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.setValue(prev => ({
          ...prev,
          theme: 'dark',
          language: 'en',
        }));
      });

      expect(result.current.value.theme).toBe('dark');
      expect(result.current.value.language).toBe('en');
      expect(result.current.value.sidebarOpen).toBe(false); // Other values unchanged
    });
  });

  describe('useFormDraft', () => {
    it('initializes with no draft', () => {
      const { result } = renderHook(() => useFormDraft<{ name: string; email: string }>('test-form'));

      expect(result.current.draft).toBeNull();
      expect(result.current.hasDraft).toBe(false);
    });

    it('saves and retrieves draft data', async () => {
      const { result } = renderHook(() => useFormDraft<{ name: string; email: string }>('test-form'));

      const draftData = { name: 'John', email: 'john@example.com' };

      act(() => {
        result.current.saveDraft(draftData);
      });

      expect(result.current.draft).toEqual(draftData);
      expect(result.current.hasDraft).toBe(true);
    });

    it('clears draft data', async () => {
      const { result } = renderHook(() => useFormDraft<{ name: string; email: string }>('test-form'));

      const draftData = { name: 'John', email: 'john@example.com' };

      act(() => {
        result.current.saveDraft(draftData);
      });

      expect(result.current.hasDraft).toBe(true);

      act(() => {
        result.current.clearDraft();
      });

      expect(result.current.draft).toBeNull();
      expect(result.current.hasDraft).toBe(false);
    });

    it('uses unique keys for different forms', () => {
      const { result: form1 } = renderHook(() => useFormDraft<{ name: string }>('form1'));
      const { result: form2 } = renderHook(() => useFormDraft<{ name: string }>('form2'));

      act(() => {
        form1.current.saveDraft({ name: 'Form 1' });
        form2.current.saveDraft({ name: 'Form 2' });
      });

      expect(form1.current.draft).toEqual({ name: 'Form 1' });
      expect(form2.current.draft).toEqual({ name: 'Form 2' });
    });
  });

  describe('useRecentSearches', () => {
    it('initializes with empty searches', () => {
      const { result } = renderHook(() => useRecentSearches());

      expect(result.current.searches).toEqual([]);
    });

    it('adds search terms to the beginning of the list', () => {
      const { result } = renderHook(() => useRecentSearches());

      act(() => {
        result.current.addSearch('first search');
        result.current.addSearch('second search');
      });

      expect(result.current.searches).toEqual(['second search', 'first search']);
    });

    it('prevents duplicate search terms', () => {
      const { result } = renderHook(() => useRecentSearches());

      act(() => {
        result.current.addSearch('duplicate');
        result.current.addSearch('other');
        result.current.addSearch('duplicate'); // Should move to front
      });

      expect(result.current.searches).toEqual(['duplicate', 'other']);
    });

    it('respects max items limit', () => {
      const { result } = renderHook(() => useRecentSearches(3));

      act(() => {
        result.current.addSearch('first');
        result.current.addSearch('second');
        result.current.addSearch('third');
        result.current.addSearch('fourth'); // Should remove 'first'
      });

      expect(result.current.searches).toEqual(['fourth', 'third', 'second']);
      expect(result.current.searches).toHaveLength(3);
    });

    it('removes specific search terms', () => {
      const { result } = renderHook(() => useRecentSearches());

      act(() => {
        result.current.addSearch('keep this');
        result.current.addSearch('remove this');
        result.current.addSearch('keep this too');
      });

      act(() => {
        result.current.removeSearch('remove this');
      });

      expect(result.current.searches).toEqual(['keep this too', 'keep this']);
    });

    it('clears all searches', () => {
      const { result } = renderHook(() => useRecentSearches());

      act(() => {
        result.current.addSearch('search 1');
        result.current.addSearch('search 2');
      });

      expect(result.current.searches).toHaveLength(2);

      act(() => {
        result.current.clearSearches();
      });

      expect(result.current.searches).toEqual([]);
    });

    it('ignores empty or whitespace-only search terms', () => {
      const { result } = renderHook(() => useRecentSearches());

      act(() => {
        result.current.addSearch('');
        result.current.addSearch('   ');
        result.current.addSearch('valid search');
      });

      expect(result.current.searches).toEqual(['valid search']);
    });

    it('trims search terms before adding', () => {
      const { result } = renderHook(() => useRecentSearches());

      act(() => {
        result.current.addSearch('  trimmed search  ');
      });

      expect(result.current.searches).toEqual(['trimmed search']);
    });
  });

  describe('Error handling edge cases', () => {
    it('handles non-Error objects in catch blocks', async () => {
      localStorageMock.getItem.mockImplementationOnce(() => {
        throw 'String error';
      });

      const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('Failed to read from localStorage');
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('clears error when successful operation occurs after error', async () => {
      // First, cause an error
      localStorageMock.setItem.mockImplementationOnce(() => {
        throw new Error('Storage error');
      });

      const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.setValue('error value');
      });

      expect(result.current.error).toBeTruthy();

      // Reset mock and try again
      localStorageMock.setItem.mockRestore();

      act(() => {
        result.current.setValue('success value');
      });

      expect(result.current.error).toBeNull();
      expect(result.current.value).toBe('success value');
    });

    it('handles key changes correctly', async () => {
      const { result, rerender } = renderHook(
        ({ key }) => useLocalStorage(key, 'default'),
        { initialProps: { key: 'key1' } }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.setValue('value1');
      });

      // Change key
      rerender({ key: 'key2' });

      await waitFor(() => {
        expect(result.current.value).toBe('default'); // Reset to default for new key
      });
    });
  });
});