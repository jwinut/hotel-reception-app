// src/hooks/useApi.test.ts
import { renderHook, act, waitFor } from '@testing-library/react';
import { useApi, usePaginatedApi, useMutation, useOptimisticMutation, useInfiniteApi } from './useApi';
import type { ApiResponse } from '../services';

// Mock API responses
const createMockApiResponse = <T>(data: T): ApiResponse<T> => ({
  data,
  success: true,
  message: 'Success',
});

const createMockApiError = (message: string): Promise<never> => {
  return Promise.reject(new Error(message));
};

// Helper to advance timers for retry tests
const advanceTimersAndFlush = async (ms: number) => {
  act(() => {
    jest.advanceTimersByTime(ms);
  });
  await waitFor(() => {});
};

describe('useApi Hook', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  describe('Basic useApi functionality', () => {
    it('initializes with correct default state', () => {
      const mockApiFunction = jest.fn();
      
      const { result } = renderHook(() => useApi(mockApiFunction));

      expect(result.current.data).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.isSuccess).toBe(false);
      expect(result.current.isError).toBe(false);
      expect(typeof result.current.execute).toBe('function');
      expect(typeof result.current.reset).toBe('function');
      expect(typeof result.current.cancel).toBe('function');
    });

    it('executes API call successfully', async () => {
      const mockData = { id: 1, name: 'Test' };
      const mockApiFunction = jest.fn().mockResolvedValue(createMockApiResponse(mockData));
      
      const { result } = renderHook(() => useApi(mockApiFunction));

      act(() => {
        result.current.execute();
      });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockData);
      expect(result.current.isSuccess).toBe(true);
      expect(result.current.isError).toBe(false);
      expect(result.current.error).toBeNull();
      expect(mockApiFunction).toHaveBeenCalledTimes(1);
    });

    it('handles API errors correctly', async () => {
      const errorMessage = 'API Error';
      const mockApiFunction = jest.fn().mockRejectedValue(new Error(errorMessage));
      
      const { result } = renderHook(() => useApi(mockApiFunction));

      act(() => {
        result.current.execute();
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toBeNull();
      expect(result.current.isSuccess).toBe(false);
      expect(result.current.isError).toBe(true);
      expect(result.current.error).toBe(errorMessage);
    });

    it('executes immediately when immediate option is true', async () => {
      const mockData = { id: 1, name: 'Test' };
      const mockApiFunction = jest.fn().mockResolvedValue(createMockApiResponse(mockData));
      
      renderHook(() => useApi(mockApiFunction, { immediate: true }));

      await waitFor(() => {
        expect(mockApiFunction).toHaveBeenCalledTimes(1);
      });
    });

    it('calls onSuccess callback when API succeeds', async () => {
      const mockData = { id: 1, name: 'Test' };
      const mockApiFunction = jest.fn().mockResolvedValue(createMockApiResponse(mockData));
      const onSuccess = jest.fn();
      
      const { result } = renderHook(() => useApi(mockApiFunction, { onSuccess }));

      act(() => {
        result.current.execute();
      });

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledWith(mockData);
      });
    });

    it('calls onError callback when API fails', async () => {
      const errorMessage = 'API Error';
      const mockApiFunction = jest.fn().mockRejectedValue(new Error(errorMessage));
      const onError = jest.fn();
      
      const { result } = renderHook(() => useApi(mockApiFunction, { onError }));

      act(() => {
        result.current.execute();
      });

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith(errorMessage);
      });
    });

    it('resets state correctly', async () => {
      const mockData = { id: 1, name: 'Test' };
      const mockApiFunction = jest.fn().mockResolvedValue(createMockApiResponse(mockData));
      
      const { result } = renderHook(() => useApi(mockApiFunction));

      // Execute and wait for success
      act(() => {
        result.current.execute();
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Reset
      act(() => {
        result.current.reset();
      });

      expect(result.current.data).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.isSuccess).toBe(false);
      expect(result.current.isError).toBe(false);
    });

    it('cancels ongoing request', async () => {
      const mockApiFunction = jest.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve(createMockApiResponse({})), 1000))
      );
      
      const { result } = renderHook(() => useApi(mockApiFunction));

      act(() => {
        result.current.execute();
      });

      expect(result.current.isLoading).toBe(true);

      act(() => {
        result.current.cancel();
      });

      expect(result.current.isLoading).toBe(false);
    });

    it('handles retry mechanism on failure', async () => {
      const mockApiFunction = jest.fn()
        .mockRejectedValueOnce(new Error('First fail'))
        .mockRejectedValueOnce(new Error('Second fail'))
        .mockResolvedValueOnce(createMockApiResponse({ success: true }));
      
      const { result } = renderHook(() => 
        useApi(mockApiFunction, { retry: 2, retryDelay: 500 })
      );

      act(() => {
        result.current.execute();
      });

      // First attempt fails
      await waitFor(() => {
        expect(mockApiFunction).toHaveBeenCalledTimes(1);
      });

      // Wait for retry delay and first retry
      await advanceTimersAndFlush(500);
      await waitFor(() => {
        expect(mockApiFunction).toHaveBeenCalledTimes(2);
      });

      // Wait for second retry delay and second retry (which succeeds)
      await advanceTimersAndFlush(500);
      await waitFor(() => {
        expect(mockApiFunction).toHaveBeenCalledTimes(3);
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('passes arguments to API function', async () => {
      const mockApiFunction = jest.fn().mockResolvedValue(createMockApiResponse({}));
      
      const { result } = renderHook(() => useApi(mockApiFunction));

      const arg1 = 'test';
      const arg2 = { id: 1 };
      
      act(() => {
        result.current.execute(arg1, arg2);
      });

      await waitFor(() => {
        expect(mockApiFunction).toHaveBeenCalledWith(arg1, arg2);
      });
    });
  });

  describe('usePaginatedApi', () => {
    it('initializes with correct pagination state', () => {
      const mockApiFunction = jest.fn();
      
      const { result } = renderHook(() => usePaginatedApi(mockApiFunction, 10));

      expect(result.current.data).toEqual([]);
      expect(result.current.page).toBe(1);
      expect(result.current.limit).toBe(10);
      expect(result.current.total).toBe(0);
      expect(result.current.hasMore).toBe(false);
    });

    it('loads paginated data correctly', async () => {
      const mockData = {
        items: [{ id: 1 }, { id: 2 }],
        total: 10,
        page: 1,
        limit: 2
      };
      const mockApiFunction = jest.fn().mockResolvedValue(createMockApiResponse(mockData));
      
      const { result } = renderHook(() => usePaginatedApi(mockApiFunction, 2));

      act(() => {
        result.current.execute(1, 2);
      });

      await waitFor(() => {
        expect(result.current.data).toEqual(mockData.items);
        expect(result.current.total).toBe(10);
        expect(result.current.hasMore).toBe(true);
      });
    });

    it('loads more data and appends to existing', async () => {
      const page1Data = {
        items: [{ id: 1 }, { id: 2 }],
        total: 4,
        page: 1,
        limit: 2
      };
      const page2Data = {
        items: [{ id: 3 }, { id: 4 }],
        total: 4,
        page: 2,
        limit: 2
      };

      const mockApiFunction = jest.fn()
        .mockResolvedValueOnce(createMockApiResponse(page1Data))
        .mockResolvedValueOnce(createMockApiResponse(page2Data));
      
      const { result } = renderHook(() => usePaginatedApi(mockApiFunction, 2));

      // Load first page
      act(() => {
        result.current.execute(1, 2);
      });

      await waitFor(() => {
        expect(result.current.data).toEqual([{ id: 1 }, { id: 2 }]);
      });

      // Load more
      act(() => {
        result.current.loadMore();
      });

      await waitFor(() => {
        expect(result.current.data).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]);
        expect(result.current.hasMore).toBe(false);
      });
    });

    it('refreshes data correctly', async () => {
      const freshData = {
        items: [{ id: 5 }, { id: 6 }],
        total: 2,
        page: 1,
        limit: 2
      };
      const mockApiFunction = jest.fn().mockResolvedValue(createMockApiResponse(freshData));
      
      const { result } = renderHook(() => usePaginatedApi(mockApiFunction, 2));

      act(() => {
        result.current.refresh();
      });

      await waitFor(() => {
        expect(result.current.data).toEqual(freshData.items);
        expect(result.current.page).toBe(1);
      });
    });
  });

  describe('useMutation', () => {
    it('does not execute immediately', () => {
      const mockMutationFunction = jest.fn();
      
      renderHook(() => useMutation(mockMutationFunction));

      expect(mockMutationFunction).not.toHaveBeenCalled();
    });

    it('executes mutation when mutate is called', async () => {
      const mockData = { id: 1, updated: true };
      const mockMutationFunction = jest.fn().mockResolvedValue(createMockApiResponse(mockData));
      
      const { result } = renderHook(() => useMutation(mockMutationFunction));

      const mutationArgs = { name: 'Updated Name' };

      act(() => {
        result.current.mutate(mutationArgs);
      });

      await waitFor(() => {
        expect(mockMutationFunction).toHaveBeenCalledWith(mutationArgs);
        expect(result.current.data).toEqual(mockData);
        expect(result.current.isSuccess).toBe(true);
      });
    });
  });

  describe('useOptimisticMutation', () => {
    it('applies optimistic update immediately', async () => {
      const mockMutationFunction = jest.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve(createMockApiResponse({ id: 1, optimistic: false })), 100))
      );
      
      const optimisticUpdateFunction = jest.fn((currentData, newData) => ({ 
        ...currentData, 
        ...newData, 
        optimistic: true 
      }));
      
      const { result } = renderHook(() => 
        useOptimisticMutation(mockMutationFunction, optimisticUpdateFunction)
      );

      const updateData = { name: 'New Name' };

      act(() => {
        result.current.mutate(updateData);
      });

      // Should immediately show optimistic data
      expect(result.current.isOptimistic).toBe(true);
      expect(optimisticUpdateFunction).toHaveBeenCalledWith(null, updateData);

      // After mutation completes
      await advanceTimersAndFlush(100);
      await waitFor(() => {
        expect(result.current.isOptimistic).toBe(false);
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('reverts optimistic update on error', async () => {
      const mockMutationFunction = jest.fn().mockRejectedValue(new Error('Mutation failed'));
      
      const optimisticUpdateFunction = jest.fn((currentData, newData) => ({ 
        ...currentData, 
        ...newData, 
        optimistic: true 
      }));
      
      const { result } = renderHook(() => 
        useOptimisticMutation(mockMutationFunction, optimisticUpdateFunction)
      );

      await act(async () => {
        try {
          await result.current.mutate({ name: 'New Name' });
        } catch (error) {
          // Expected to throw
        }
      });

      expect(result.current.isOptimistic).toBe(false);
      expect(result.current.data).toBeNull();
      expect(result.current.isError).toBe(true);
    });
  });

  describe('useInfiniteApi', () => {
    it('initializes correctly for infinite loading', () => {
      const mockApiFunction = jest.fn();
      
      const { result } = renderHook(() => useInfiniteApi(mockApiFunction, 10));

      expect(result.current.data).toEqual([]);
      expect(result.current.hasMore).toBe(true);
    });

    it('loads infinite data with cursor', async () => {
      const mockData = {
        items: [{ id: 1 }, { id: 2 }],
        nextCursor: 'cursor123'
      };
      const mockApiFunction = jest.fn().mockResolvedValue(createMockApiResponse(mockData));
      
      const { result } = renderHook(() => useInfiniteApi(mockApiFunction, 2));

      act(() => {
        result.current.execute(null, 2);
      });

      await waitFor(() => {
        expect(result.current.data).toEqual(mockData.items);
        expect(result.current.hasMore).toBe(true);
      });

      expect(mockApiFunction).toHaveBeenCalledWith(null, 2);
    });

    it('loads more data with next cursor', async () => {
      const firstData = {
        items: [{ id: 1 }, { id: 2 }],
        nextCursor: 'cursor123'
      };
      const secondData = {
        items: [{ id: 3 }, { id: 4 }],
        nextCursor: null
      };

      const mockApiFunction = jest.fn()
        .mockResolvedValueOnce(createMockApiResponse(firstData))
        .mockResolvedValueOnce(createMockApiResponse(secondData));
      
      const { result } = renderHook(() => useInfiniteApi(mockApiFunction, 2));

      // Load initial data
      act(() => {
        result.current.execute(null, 2);
      });

      await waitFor(() => {
        expect(result.current.data).toEqual([{ id: 1 }, { id: 2 }]);
      });

      // Load more
      act(() => {
        result.current.loadMore();
      });

      await waitFor(() => {
        expect(result.current.data).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]);
        expect(result.current.hasMore).toBe(false);
      });

      expect(mockApiFunction).toHaveBeenNthCalledWith(2, 'cursor123', 2);
    });

    it('refreshes infinite data correctly', async () => {
      const mockData = {
        items: [{ id: 5 }, { id: 6 }],
        nextCursor: null
      };
      const mockApiFunction = jest.fn().mockResolvedValue(createMockApiResponse(mockData));
      
      const { result } = renderHook(() => useInfiniteApi(mockApiFunction, 2));

      act(() => {
        result.current.refresh();
      });

      await waitFor(() => {
        expect(result.current.data).toEqual(mockData.items);
        expect(result.current.hasMore).toBe(false);
      });

      expect(mockApiFunction).toHaveBeenCalledWith(null, 2);
    });

    it('does not load more when already loading', async () => {
      const mockApiFunction = jest.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve(createMockApiResponse({
          items: [{ id: 1 }],
          nextCursor: 'cursor'
        })), 100))
      );
      
      const { result } = renderHook(() => useInfiniteApi(mockApiFunction, 1));

      // Start loading
      act(() => {
        result.current.execute(null, 1);
      });

      // Try to load more while still loading
      act(() => {
        result.current.loadMore();
      });

      // Should only have called API once
      expect(mockApiFunction).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error handling and edge cases', () => {
    it('handles non-Error objects in catch blocks', async () => {
      const mockApiFunction = jest.fn().mockRejectedValue('String error');
      
      const { result } = renderHook(() => useApi(mockApiFunction));

      act(() => {
        result.current.execute();
      });

      await waitFor(() => {
        expect(result.current.error).toBe('Unknown error');
        expect(result.current.isError).toBe(true);
      });
    });

    it('cleans up abort controller on unmount', async () => {
      const mockApiFunction = jest.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve(createMockApiResponse({ test: true })), 100))
      );
      const abortSpy = jest.spyOn(AbortController.prototype, 'abort');
      
      const { result, unmount } = renderHook(() => useApi(mockApiFunction));

      // Start an API call to create an abort controller
      act(() => {
        result.current.execute();
      });

      // Unmount while request is in progress
      unmount();

      // The abort controller should have been called during cleanup
      expect(abortSpy).toHaveBeenCalled();
      
      abortSpy.mockRestore();
    });

    it('handles aborted requests gracefully', async () => {
      const mockApiFunction = jest.fn().mockImplementation(() => {
        const error = new Error('Request aborted');
        return Promise.reject(error);
      });
      
      const { result } = renderHook(() => useApi(mockApiFunction));

      act(() => {
        result.current.execute();
      });

      // Cancel immediately
      act(() => {
        result.current.cancel();
      });

      // Should not update state after cancellation
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });
});