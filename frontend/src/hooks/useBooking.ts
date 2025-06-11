// src/hooks/useBooking.ts
import { useSelector, useDispatch } from 'react-redux';
import { useCallback, useEffect } from 'react';
import type { RootState, AppDispatch } from '../store';
import {
  fetchBookings,
  createBooking,
  updateBookingStatus,
  setSearchTerm,
  setStatusFilter,
  setDateFilter,
  clearFilters,
  setSelectedBooking,
  clearError,
} from '../store/slices/bookingSlice';
import { bookingService } from '../services';
import type { Booking, BookingStatus } from '../types';
import type { BookingCreateRequest, BookingSearchParams } from '../services/BookingService';

interface UseBookingReturn {
  // State
  bookings: Booking[];
  currentBooking: Booking | null;
  selectedBooking: Booking | null;
  isLoading: boolean;
  error: string | null;
  filters: {
    searchTerm: string;
    statusFilter: BookingStatus | 'all';
    dateFilter: string;
  };
  stats: {
    totalBookings: number;
    todayArrivals: number;
    todayDepartures: number;
    currentOccupancy: number;
    availableRooms: number;
  };

  // Actions
  loadBookings: (params?: { status?: BookingStatus; date?: string }) => Promise<void>;
  createNewBooking: (bookingData: BookingCreateRequest) => Promise<Booking | null>;
  updateStatus: (id: string, status: BookingStatus) => Promise<void>;
  searchBookings: (query: string) => Promise<Booking[]>;
  selectBooking: (booking: Booking | null) => void;
  
  // Filters
  setSearch: (term: string) => void;
  setStatus: (status: BookingStatus | 'all') => void;
  setDate: (date: string) => void;
  resetFilters: () => void;
  
  // Utils
  clearBookingError: () => void;
  getBookingById: (id: string) => Booking | undefined;
  getBookingsByStatus: (status: BookingStatus) => Booking[];
  getArrivalsToday: () => Booking[];
  getDeparturesToday: () => Booking[];
}

export const useBooking = (): UseBookingReturn => {
  const dispatch = useDispatch<AppDispatch>();
  
  const {
    bookings,
    currentBooking,
    selectedBooking,
    loading,
    error,
    filters,
    stats,
  } = useSelector((state: RootState) => state.booking);

  // Load bookings
  const loadBookings = useCallback(async (params?: { status?: BookingStatus; date?: string }) => {
    await dispatch(fetchBookings(params)).unwrap();
  }, [dispatch]);

  // Create new booking
  const createNewBooking = useCallback(async (bookingData: BookingCreateRequest): Promise<Booking | null> => {
    try {
      const result = await dispatch(createBooking(bookingData)).unwrap();
      return result;
    } catch (error) {
      console.error('Failed to create booking:', error);
      return null;
    }
  }, [dispatch]);

  // Update booking status
  const updateStatus = useCallback(async (id: string, status: BookingStatus) => {
    await dispatch(updateBookingStatus({ id, status })).unwrap();
  }, [dispatch]);

  // Search bookings
  const searchBookings = useCallback(async (query: string): Promise<Booking[]> => {
    try {
      const response = await bookingService.searchBookings(query);
      return response.data;
    } catch (error) {
      console.error('Failed to search bookings:', error);
      return [];
    }
  }, []);

  // Select booking
  const selectBooking = useCallback((booking: Booking | null) => {
    dispatch(setSelectedBooking(booking));
  }, [dispatch]);

  // Filter actions
  const setSearch = useCallback((term: string) => {
    dispatch(setSearchTerm(term));
  }, [dispatch]);

  const setStatus = useCallback((status: BookingStatus | 'all') => {
    dispatch(setStatusFilter(status));
  }, [dispatch]);

  const setDate = useCallback((date: string) => {
    dispatch(setDateFilter(date));
  }, [dispatch]);

  const resetFilters = useCallback(() => {
    dispatch(clearFilters());
  }, [dispatch]);

  // Utility functions
  const clearBookingError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const getBookingById = useCallback((id: string): Booking | undefined => {
    return bookings.find(booking => booking.id === id);
  }, [bookings]);

  const getBookingsByStatus = useCallback((status: BookingStatus): Booking[] => {
    return bookings.filter(booking => booking.status === status);
  }, [bookings]);

  const getArrivalsToday = useCallback((): Booking[] => {
    const today = new Date().toISOString().split('T')[0];
    return bookings.filter(booking => booking.checkInDate === today);
  }, [bookings]);

  const getDeparturesToday = useCallback((): Booking[] => {
    const today = new Date().toISOString().split('T')[0];
    return bookings.filter(booking => booking.checkOutDate === today);
  }, [bookings]);

  // Auto-load bookings on mount
  useEffect(() => {
    if (bookings.length === 0) {
      loadBookings();
    }
  }, [loadBookings, bookings.length]);

  return {
    // State
    bookings,
    currentBooking,
    selectedBooking,
    isLoading: loading.isLoading,
    error: error.hasError ? error.message ?? null : null,
    filters,
    stats,

    // Actions
    loadBookings,
    createNewBooking,
    updateStatus,
    searchBookings,
    selectBooking,

    // Filters
    setSearch,
    setStatus,
    setDate,
    resetFilters,

    // Utils
    clearBookingError,
    getBookingById,
    getBookingsByStatus,
    getArrivalsToday,
    getDeparturesToday,
  };
};