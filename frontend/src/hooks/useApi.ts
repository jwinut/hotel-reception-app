// src/hooks/useApi.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import type { ApiResponse } from '../services';

interface UseApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  isSuccess: boolean;
  isError: boolean;
}

interface UseApiOptions {
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
  retry?: number;
  retryDelay?: number;
}

interface UseApiReturn<T> extends UseApiState<T> {
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
  cancel: () => void;
}

// Generic API hook
export const useApi = <T>(
  apiFunction: (...args: any[]) => Promise<ApiResponse<T>>,
  options: UseApiOptions = {}
): UseApiReturn<T> => {
  const {
    immediate = false,
    onSuccess,
    onError,
    retry = 0,
    retryDelay = 1000,
  } = options;

  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    isLoading: false,
    error: null,
    isSuccess: false,
    isError: false,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const retryCountRef = useRef(0);

  const execute = useCallback(async (...args: any[]): Promise<T | null> => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      isSuccess: false,
      isError: false,
    }));

    const attemptRequest = async (attempt: number): Promise<T | null> => {
      try {
        const response = await apiFunction(...args);
        
        if (!abortControllerRef.current?.signal.aborted) {
          setState({
            data: response.data,
            isLoading: false,
            error: null,
            isSuccess: true,
            isError: false,
          });

          if (onSuccess) {
            onSuccess(response.data);
          }

          retryCountRef.current = 0;
          return response.data;
        }
      } catch (error) {
        if (!abortControllerRef.current?.signal.aborted) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          
          // Retry logic
          if (attempt < retry) {
            await new Promise(resolve => setTimeout(resolve, retryDelay));
            if (!abortControllerRef.current?.signal.aborted) {
              return attemptRequest(attempt + 1);
            }
          }

          setState({
            data: null,
            isLoading: false,
            error: errorMessage,
            isSuccess: false,
            isError: true,
          });

          if (onError) {
            onError(errorMessage);
          }

          retryCountRef.current = 0;
        }
      }

      return null;
    };

    return attemptRequest(0);
  }, [apiFunction, onSuccess, onError, retry, retryDelay]);

  const reset = useCallback(() => {
    setState({
      data: null,
      isLoading: false,
      error: null,
      isSuccess: false,
      isError: false,
    });
    retryCountRef.current = 0;
  }, []);

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setState(prev => ({
      ...prev,
      isLoading: false,
    }));
  }, []);

  // Execute immediately if requested
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    ...state,
    execute,
    reset,
    cancel,
  };
};

// Specialized hook for paginated API calls
export const usePaginatedApi = <T>(
  apiFunction: (page: number, limit: number, ...args: any[]) => Promise<ApiResponse<{ items: T[]; total: number; page: number; limit: number }>>,
  initialLimit: number = 20,
  options: UseApiOptions = {}
) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(initialLimit);
  const [total, setTotal] = useState(0);
  const [allData, setAllData] = useState<T[]>([]);

  const apiHook = useApi(
    (currentPage: number, currentLimit: number, ...args: any[]) => 
      apiFunction(currentPage, currentLimit, ...args),
    {
      ...options,
      onSuccess: (data) => {
        setTotal(data.total);
        if (page === 1) {
          setAllData(data.items);
        } else {
          setAllData(prev => [...prev, ...data.items]);
        }
        options.onSuccess?.(data);
      },
    }
  );

  const loadMore = useCallback((...args: any[]) => {
    const nextPage = page + 1;
    setPage(nextPage);
    return apiHook.execute(nextPage, limit, ...args);
  }, [page, limit, apiHook]);

  const refresh = useCallback((...args: any[]) => {
    setPage(1);
    setAllData([]);
    return apiHook.execute(1, limit, ...args);
  }, [limit, apiHook]);

  const changeLimit = useCallback((newLimit: number, ...args: any[]) => {
    setLimit(newLimit);
    setPage(1);
    setAllData([]);
    return apiHook.execute(1, newLimit, ...args);
  }, [apiHook]);

  const hasMore = allData.length < total;

  return {
    ...apiHook,
    data: allData,
    page,
    limit,
    total,
    hasMore,
    loadMore,
    refresh,
    changeLimit,
  };
};

// Hook for mutations (POST, PUT, DELETE)
export const useMutation = <T, Args extends any[]>(
  mutationFunction: (...args: Args) => Promise<ApiResponse<T>>,
  options: UseApiOptions = {}
) => {
  const apiHook = useApi(mutationFunction, { ...options, immediate: false });

  const mutate = useCallback(async (...args: Args): Promise<T | null> => {
    return apiHook.execute(...args);
  }, [apiHook]);

  return {
    ...apiHook,
    mutate,
  };
};

// Hook for optimistic updates
export const useOptimisticMutation = <T, Args extends any[]>(
  mutationFunction: (...args: Args) => Promise<ApiResponse<T>>,
  optimisticUpdateFunction: (currentData: T | null, ...args: Args) => T,
  options: UseApiOptions = {}
) => {
  const [optimisticData, setOptimisticData] = useState<T | null>(null);
  const [isOptimistic, setIsOptimistic] = useState(false);

  const apiHook = useMutation(mutationFunction, {
    ...options,
    onSuccess: (data) => {
      setOptimisticData(null);
      setIsOptimistic(false);
      options.onSuccess?.(data);
    },
    onError: (error) => {
      setOptimisticData(null);
      setIsOptimistic(false);
      options.onError?.(error);
    },
  });

  const mutateOptimistic = useCallback(async (...args: Args): Promise<T | null> => {
    // Apply optimistic update
    const optimisticResult = optimisticUpdateFunction(apiHook.data, ...args);
    setOptimisticData(optimisticResult);
    setIsOptimistic(true);

    try {
      const result = await apiHook.mutate(...args);
      return result;
    } catch (error) {
      // Revert optimistic update on error
      setOptimisticData(null);
      setIsOptimistic(false);
      throw error;
    }
  }, [apiHook, optimisticUpdateFunction]);

  return {
    ...apiHook,
    data: isOptimistic ? optimisticData : apiHook.data,
    isOptimistic,
    mutate: mutateOptimistic,
  };
};

// Hook for infinite loading/scrolling
export const useInfiniteApi = <T>(
  apiFunction: (cursor: string | null, limit: number, ...args: any[]) => Promise<ApiResponse<{ items: T[]; nextCursor: string | null }>>,
  limit: number = 20,
  options: UseApiOptions = {}
) => {
  const [allData, setAllData] = useState<T[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const apiHook = useApi(
    (cursor: string | null, currentLimit: number, ...args: any[]) => 
      apiFunction(cursor, currentLimit, ...args),
    {
      ...options,
      onSuccess: (data) => {
        if (data.nextCursor === null) {
          setAllData(prev => [...prev, ...data.items]);
        } else {
          setAllData(prev => [...prev, ...data.items]);
        }
        setNextCursor(data.nextCursor);
        setHasMore(data.nextCursor !== null);
        options.onSuccess?.(data);
      },
    }
  );

  const loadMore = useCallback((...args: any[]) => {
    if (hasMore && !apiHook.isLoading) {
      return apiHook.execute(nextCursor, limit, ...args);
    }
    return Promise.resolve(null);
  }, [hasMore, apiHook, nextCursor, limit]);

  const refresh = useCallback((...args: any[]) => {
    setAllData([]);
    setNextCursor(null);
    setHasMore(true);
    return apiHook.execute(null, limit, ...args);
  }, [limit, apiHook]);

  return {
    ...apiHook,
    data: allData,
    hasMore,
    loadMore,
    refresh,
  };
};