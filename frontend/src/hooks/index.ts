// src/hooks/index.ts

// Booking hooks
export { useBooking } from './useBooking';

// Local storage hooks
export {
  useLocalStorage,
  useLocalStorageString,
  useLocalStorageNumber,
  useLocalStorageBoolean,
  useLocalStorageArray,
  useLocalStorageObject,
  useUserPreferences,
  useFormDraft,
  useRecentSearches,
} from './useLocalStorage';

// Debounce hooks
export {
  useDebounce,
  useDebouncedCallback,
  useDebouncedState,
  useDebouncedSearch,
  useDebouncedInput,
  useDebouncedAsync,
} from './useDebounce';

// API hooks
export {
  useApi,
  usePaginatedApi,
  useMutation,
  useOptimisticMutation,
  useInfiniteApi,
} from './useApi';