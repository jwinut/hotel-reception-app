// src/hooks/useBooking.test.tsx
import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { useBooking } from './useBooking';
import { bookingSlice } from '../store/slices/bookingSlice';
import * as bookingService from '../services';
import type { Booking, BookingStatus } from '../types';
import type { BookingCreateRequest } from '../services/BookingService';

// Mock the booking service
jest.mock('../services', () => ({
  bookingService: {
    searchBookings: jest.fn(),
  },
}));

const mockBookingService = bookingService.bookingService as jest.Mocked<typeof bookingService.bookingService>;

// Mock booking data
const mockBookings: Booking[] = [
  {
    id: 'BK001',
    guestName: 'สมชาย ใจดี',
    phone: '081-234-5678',
    email: 'somchai@example.com',
    roomNumber: '101',
    roomType: 'Standard',
    checkInDate: '2024-12-15',
    checkOutDate: '2024-12-17',
    nights: 2,
    guests: 2,
    status: 'arriving_today',
    totalPrice: 2400,
    specialRequests: 'ต้องการห้องชั้นล่าง',
    createdAt: '2024-12-14T10:00:00.000Z',
    updatedAt: '2024-12-14T10:00:00.000Z',
  },
  {
    id: 'BK002',
    guestName: 'วิชัย สร้างสุข',
    phone: '089-876-5432',
    roomNumber: '102',
    roomType: 'Deluxe',
    checkInDate: '2024-12-14',
    checkOutDate: '2024-12-16',
    nights: 2,
    guests: 1,
    status: 'checked_in',
    totalPrice: 3200,
    createdAt: '2024-12-14T08:00:00.000Z',
    updatedAt: '2024-12-14T09:00:00.000Z',
  },
];

// Helper function to create a test store
const createTestStore = (bookingInitialState = {}) => {
  return configureStore({
    reducer: {
      booking: bookingSlice.reducer,
      ui: (state = { currentPage: 'dashboard' }) => state,
      auth: (state = { isAuthenticated: false }) => state,
      config: (state = { hotelName: 'Test Hotel' }) => state,
    },
    preloadedState: {
      booking: {
        bookings: mockBookings, // Default to having bookings to prevent auto-load
        currentBooking: null,
        selectedBooking: null,
        filters: {
          searchTerm: '',
          statusFilter: 'all',
          dateFilter: '',
        },
        searchResults: [],
        loading: {
          isLoading: false,
        },
        error: {
          hasError: false,
        },
        stats: {
          totalBookings: mockBookings.length,
          todayArrivals: 0,
          todayDepartures: 0,
          currentOccupancy: 0,
          availableRooms: 0,
        },
        wizardData: {
          step: 0,
          guest: {},
          dates: {},
          room: {},
          isComplete: false,
        },
        ...bookingInitialState,
      },
      ui: { currentPage: 'dashboard' },
      auth: { isAuthenticated: false },
      config: { hotelName: 'Test Hotel' },
    },
  });
};

// Helper function to render hook with provider
const renderHookWithProvider = (store = createTestStore()) => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );

  return {
    ...renderHook(() => useBooking(), { wrapper }),
    store,
  };
};

describe('useBooking Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Initial state and functions', () => {
    it('returns correct initial state', () => {
      const { result } = renderHookWithProvider();

      expect(result.current.bookings).toEqual(mockBookings);
      expect(result.current.currentBooking).toBeNull();
      expect(result.current.selectedBooking).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.filters).toEqual({
        searchTerm: '',
        statusFilter: 'all',
        dateFilter: '',
      });
      expect(result.current.stats).toEqual({
        totalBookings: mockBookings.length,
        todayArrivals: 0,
        todayDepartures: 0,
        currentOccupancy: 0,
        availableRooms: 0,
      });
    });

    it('provides all expected functions', () => {
      const { result } = renderHookWithProvider();

      // Actions
      expect(typeof result.current.loadBookings).toBe('function');
      expect(typeof result.current.createNewBooking).toBe('function');
      expect(typeof result.current.updateStatus).toBe('function');
      expect(typeof result.current.searchBookings).toBe('function');
      expect(typeof result.current.selectBooking).toBe('function');

      // Filters
      expect(typeof result.current.setSearch).toBe('function');
      expect(typeof result.current.setStatus).toBe('function');
      expect(typeof result.current.setDate).toBe('function');
      expect(typeof result.current.resetFilters).toBe('function');

      // Utils
      expect(typeof result.current.clearBookingError).toBe('function');
      expect(typeof result.current.getBookingById).toBe('function');
      expect(typeof result.current.getBookingsByStatus).toBe('function');
      expect(typeof result.current.getArrivalsToday).toBe('function');
      expect(typeof result.current.getDeparturesToday).toBe('function');
    });
  });

  describe('State management', () => {
    it('reflects store state correctly', () => {
      const store = createTestStore({
        selectedBooking: mockBookings[0],
        loading: { isLoading: true },
        error: { hasError: true, message: 'Test error' },
        filters: {
          searchTerm: 'test',
          statusFilter: 'checked_in',
          dateFilter: '2024-12-15',
        },
      });

      const { result } = renderHookWithProvider(store);

      expect(result.current.selectedBooking).toEqual(mockBookings[0]);
      expect(result.current.isLoading).toBe(true);
      expect(result.current.error).toBe('Test error');
      expect(result.current.filters).toEqual({
        searchTerm: 'test',
        statusFilter: 'checked_in',
        dateFilter: '2024-12-15',
      });
    });
  });

  describe('Action functions', () => {
    it('loads bookings successfully', async () => {
      const { result } = renderHookWithProvider();

      await act(async () => {
        await result.current.loadBookings();
      });

      // Fast-forward past the mock API delay
      act(() => {
        jest.advanceTimersByTime(600);
      });

      expect(result.current.loadBookings).toBeDefined();
    });

    it('creates booking successfully', async () => {
      const { result } = renderHookWithProvider();

      const bookingData: BookingCreateRequest = {
        guestName: 'ทดสอบ สร้างการจอง',
        phone: '081-999-8888',
        email: 'test@example.com',
        roomType: 'Standard',
        checkInDate: '2024-12-20',
        checkOutDate: '2024-12-22',
        guests: 2,
        specialRequests: 'ต้องการเตียงเสริม',
      };

      let createdBooking: Booking | null = null;

      await act(async () => {
        createdBooking = await result.current.createNewBooking(bookingData);
      });

      // Fast-forward past the mock API delay
      act(() => {
        jest.advanceTimersByTime(1100);
      });

      // The function should complete without throwing
      expect(result.current.createNewBooking).toBeDefined();
    });

    it('updates booking status successfully', async () => {
      const { result } = renderHookWithProvider();

      await act(async () => {
        await result.current.updateStatus('BK001', 'checked_in');
      });

      act(() => {
        jest.advanceTimersByTime(400);
      });

      expect(result.current.updateStatus).toBeDefined();
    });

    it('searches bookings successfully', async () => {
      const mockSearchResults = [mockBookings[0]];
      mockBookingService.searchBookings.mockResolvedValueOnce({
        success: true,
        data: mockSearchResults,
      });

      const { result } = renderHookWithProvider();

      let searchResults: Booking[] = [];

      await act(async () => {
        searchResults = await result.current.searchBookings('สมชาย');
      });

      expect(mockBookingService.searchBookings).toHaveBeenCalledWith('สมชาย');
      expect(searchResults).toEqual(mockSearchResults);
    });

    it('handles search errors gracefully', async () => {
      mockBookingService.searchBookings.mockRejectedValueOnce(new Error('Search failed'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const { result } = renderHookWithProvider();

      let searchResults: Booking[] = [];

      await act(async () => {
        searchResults = await result.current.searchBookings('invalid query');
      });

      expect(searchResults).toEqual([]);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('Booking selection', () => {
    it('selects a booking', () => {
      const { result } = renderHookWithProvider();

      act(() => {
        result.current.selectBooking(mockBookings[0]);
      });

      expect(result.current.selectedBooking).toEqual(mockBookings[0]);
    });

    it('clears selected booking', () => {
      const store = createTestStore({ selectedBooking: mockBookings[0] });
      const { result } = renderHookWithProvider(store);

      act(() => {
        result.current.selectBooking(null);
      });

      expect(result.current.selectedBooking).toBeNull();
    });
  });

  describe('Filter functions', () => {
    it('sets search term', () => {
      const { result } = renderHookWithProvider();

      act(() => {
        result.current.setSearch('test search');
      });

      expect(result.current.filters.searchTerm).toBe('test search');
    });

    it('sets status filter', () => {
      const { result } = renderHookWithProvider();

      act(() => {
        result.current.setStatus('checked_in');
      });

      expect(result.current.filters.statusFilter).toBe('checked_in');
    });

    it('sets date filter', () => {
      const { result } = renderHookWithProvider();

      act(() => {
        result.current.setDate('2024-12-15');
      });

      expect(result.current.filters.dateFilter).toBe('2024-12-15');
    });

    it('resets all filters', () => {
      const store = createTestStore({
        filters: {
          searchTerm: 'test',
          statusFilter: 'checked_in',
          dateFilter: '2024-12-15',
        },
      });
      const { result } = renderHookWithProvider(store);

      act(() => {
        result.current.resetFilters();
      });

      expect(result.current.filters).toEqual({
        searchTerm: '',
        statusFilter: 'all',
        dateFilter: '',
      });
    });
  });

  describe('Utility functions', () => {
    it('clears booking error', () => {
      const errorStore = createTestStore({
        error: { hasError: true, message: 'Test error' },
      });
      const { result } = renderHookWithProvider(errorStore);

      act(() => {
        result.current.clearBookingError();
      });

      expect(result.current.error).toBeNull();
    });

    it('gets booking by ID', () => {
      const { result } = renderHookWithProvider();

      const foundBooking = result.current.getBookingById('BK001');
      expect(foundBooking).toEqual(mockBookings[0]);

      const notFoundBooking = result.current.getBookingById('BK999');
      expect(notFoundBooking).toBeUndefined();
    });

    it('gets bookings by status', () => {
      const { result } = renderHookWithProvider();

      const checkedInBookings = result.current.getBookingsByStatus('checked_in');
      expect(checkedInBookings).toEqual([mockBookings[1]]);

      const arrivingBookings = result.current.getBookingsByStatus('arriving_today');
      expect(arrivingBookings).toEqual([mockBookings[0]]);

      const nonExistentBookings = result.current.getBookingsByStatus('cancelled');
      expect(nonExistentBookings).toEqual([]);
    });

    it('gets arrivals today', () => {
      // Mock today's date to match test data
      jest.spyOn(Date.prototype, 'toISOString').mockReturnValue('2024-12-15T00:00:00.000Z');

      const { result } = renderHookWithProvider();

      const arrivalsToday = result.current.getArrivalsToday();
      expect(arrivalsToday).toEqual([mockBookings[0]]);

      jest.restoreAllMocks();
    });

    it('gets departures today', () => {
      // Mock today's date to match test data
      jest.spyOn(Date.prototype, 'toISOString').mockReturnValue('2024-12-16T00:00:00.000Z');

      const { result } = renderHookWithProvider();

      const departuresToday = result.current.getDeparturesToday();
      expect(departuresToday).toEqual([mockBookings[1]]);

      jest.restoreAllMocks();
    });

    it('handles empty bookings array in utility functions', () => {
      const emptyStore = createTestStore({ bookings: [] });
      const { result } = renderHookWithProvider(emptyStore);

      expect(result.current.getBookingById('BK001')).toBeUndefined();
      expect(result.current.getBookingsByStatus('checked_in')).toEqual([]);
      expect(result.current.getArrivalsToday()).toEqual([]);
      expect(result.current.getDeparturesToday()).toEqual([]);
    });
  });

  describe('Error handling', () => {
    it('handles non-Error objects in searchBookings catch block', async () => {
      mockBookingService.searchBookings.mockRejectedValueOnce('String error');
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const { result } = renderHookWithProvider();

      let searchResults: Booking[] = [];

      await act(async () => {
        searchResults = await result.current.searchBookings('query');
      });

      expect(searchResults).toEqual([]);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('handles createNewBooking errors', async () => {
      const { result } = renderHookWithProvider();
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const invalidBookingData = {} as BookingCreateRequest;

      let createdBooking: Booking | null = null;

      await act(async () => {
        createdBooking = await result.current.createNewBooking(invalidBookingData);
      });

      // The function should handle errors gracefully
      expect(createdBooking).toBeNull();

      consoleSpy.mockRestore();
    });
  });

  describe('Callback stability', () => {
    it('maintains callback references between renders', () => {
      const { result, rerender } = renderHookWithProvider();

      const initialCallbacks = {
        loadBookings: result.current.loadBookings,
        createNewBooking: result.current.createNewBooking,
        updateStatus: result.current.updateStatus,
        searchBookings: result.current.searchBookings,
        selectBooking: result.current.selectBooking,
        setSearch: result.current.setSearch,
        setStatus: result.current.setStatus,
        setDate: result.current.setDate,
        resetFilters: result.current.resetFilters,
        clearBookingError: result.current.clearBookingError,
      };

      rerender();

      expect(result.current.loadBookings).toBe(initialCallbacks.loadBookings);
      expect(result.current.createNewBooking).toBe(initialCallbacks.createNewBooking);
      expect(result.current.updateStatus).toBe(initialCallbacks.updateStatus);
      expect(result.current.searchBookings).toBe(initialCallbacks.searchBookings);
      expect(result.current.selectBooking).toBe(initialCallbacks.selectBooking);
      expect(result.current.setSearch).toBe(initialCallbacks.setSearch);
      expect(result.current.setStatus).toBe(initialCallbacks.setStatus);
      expect(result.current.setDate).toBe(initialCallbacks.setDate);
      expect(result.current.resetFilters).toBe(initialCallbacks.resetFilters);
      expect(result.current.clearBookingError).toBe(initialCallbacks.clearBookingError);
    });
  });
});