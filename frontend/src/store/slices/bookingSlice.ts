// src/store/slices/bookingSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { 
  Booking, 
  BookingStatus, 
  BookingFilters, 
  Guest, 
  DateRange, 
  Room,
  LoadingState,
  ErrorState 
} from '../../types';

interface BookingState {
  // Data
  bookings: Booking[];
  currentBooking: Booking | null;
  selectedBooking: Booking | null;
  
  // Filters and search
  filters: BookingFilters;
  searchResults: Booking[];
  
  // UI State
  loading: LoadingState;
  error: ErrorState;
  
  // Statistics
  stats: {
    totalBookings: number;
    todayArrivals: number;
    todayDepartures: number;
    currentOccupancy: number;
    availableRooms: number;
  };
  
  // Form state for booking wizard
  wizardData: {
    step: number;
    guest: Partial<Guest>;
    dates: Partial<DateRange>;
    room: Partial<Room>;
    isComplete: boolean;
  };
}

const initialState: BookingState = {
  bookings: [],
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
    totalBookings: 0,
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
};

// Async thunks for API operations
export const fetchBookings = createAsyncThunk(
  'booking/fetchBookings',
  async (params: { status?: BookingStatus; date?: string } | undefined, { rejectWithValue }) => {
    try {
      // In a real app, this would be an API call
      // For now, we'll return mock data
      const mockBookings: Booking[] = [
        {
          id: 'BK001',
          guestName: 'สมชาย ใจดี',
          phone: '081-234-5678',
          email: 'somchai@example.com',
          roomNumber: '101',
          roomType: 'Standard',
          checkInDate: new Date().toISOString().split('T')[0] as string,
          checkOutDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] as string,
          nights: 2,
          guests: 2,
          status: 'arriving_today',
          totalPrice: 2400,
          specialRequests: 'ต้องการห้องชั้นล่าง',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'BK002',
          guestName: 'วิชัย สร้างสุข',
          phone: '089-876-5432',
          roomNumber: '102',
          roomType: 'Deluxe',
          checkInDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0] as string,
          checkOutDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0] as string,
          nights: 2,
          guests: 1,
          status: 'checked_in',
          totalPrice: 3200,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return mockBookings;
    } catch (error) {
      return rejectWithValue('Failed to fetch bookings');
    }
  }
);

export const createBooking = createAsyncThunk(
  'booking/createBooking',
  async (bookingData: { guestName: string; phone: string; email?: string; roomType: string; checkInDate: string; checkOutDate: string; guests: number; specialRequests?: string }, { rejectWithValue }) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Calculate derived fields
      const checkIn = new Date(bookingData.checkInDate);
      const checkOut = new Date(bookingData.checkOutDate);
      const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
      
      const newBooking: Booking = {
        ...bookingData,
        id: `BK${Date.now()}`,
        roomNumber: `${Math.floor(Math.random() * 300) + 100}`, // Mock room assignment
        nights,
        status: 'confirmed',
        totalPrice: nights * 1200, // Mock price calculation
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      return newBooking;
    } catch (error) {
      return rejectWithValue('Failed to create booking');
    }
  }
);

export const updateBookingStatus = createAsyncThunk(
  'booking/updateBookingStatus',
  async ({ id, status }: { id: string; status: BookingStatus }, { rejectWithValue }) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return { id, status, updatedAt: new Date().toISOString() };
    } catch (error) {
      return rejectWithValue('Failed to update booking status');
    }
  }
);

export const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    // Filter and search actions
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.filters.searchTerm = action.payload;
    },
    
    setStatusFilter: (state, action: PayloadAction<BookingStatus | 'all'>) => {
      state.filters.statusFilter = action.payload;
    },
    
    setDateFilter: (state, action: PayloadAction<string>) => {
      state.filters.dateFilter = action.payload;
    },
    
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    
    // Booking selection
    setSelectedBooking: (state, action: PayloadAction<Booking | null>) => {
      state.selectedBooking = action.payload;
    },
    
    setCurrentBooking: (state, action: PayloadAction<Booking | null>) => {
      state.currentBooking = action.payload;
    },
    
    // Wizard state management
    setWizardStep: (state, action: PayloadAction<number>) => {
      state.wizardData.step = action.payload;
    },
    
    setWizardGuestData: (state, action: PayloadAction<Partial<Guest>>) => {
      state.wizardData.guest = { ...state.wizardData.guest, ...action.payload };
    },
    
    setWizardDateData: (state, action: PayloadAction<Partial<DateRange>>) => {
      state.wizardData.dates = { ...state.wizardData.dates, ...action.payload };
    },
    
    setWizardRoomData: (state, action: PayloadAction<Partial<Room>>) => {
      state.wizardData.room = { ...state.wizardData.room, ...action.payload };
    },
    
    resetWizard: (state) => {
      state.wizardData = initialState.wizardData;
    },
    
    // Error handling
    clearError: (state) => {
      state.error = { hasError: false };
    },
    
    setError: (state, action: PayloadAction<string>) => {
      state.error = { hasError: true, message: action.payload };
    },
    
    // Local booking operations (for optimistic updates)
    addBookingLocally: (state, action: PayloadAction<Booking>) => {
      state.bookings.unshift(action.payload);
      state.stats.totalBookings += 1;
    },
    
    updateBookingLocally: (state, action: PayloadAction<Partial<Booking> & { id: string }>) => {
      const index = state.bookings.findIndex(booking => booking.id === action.payload.id);
      if (index !== -1 && state.bookings[index]) {
        Object.assign(state.bookings[index]!, action.payload);
      }
    },
    
    removeBookingLocally: (state, action: PayloadAction<string>) => {
      state.bookings = state.bookings.filter(booking => booking.id !== action.payload);
      state.stats.totalBookings -= 1;
    },
  },
  
  extraReducers: (builder) => {
    // Fetch bookings
    builder
      .addCase(fetchBookings.pending, (state) => {
        state.loading = { isLoading: true, message: 'กำลังโหลดข้อมูลการจอง...' };
        state.error = { hasError: false };
      })
      .addCase(fetchBookings.fulfilled, (state, action) => {
        state.loading = { isLoading: false };
        state.bookings = action.payload;
        state.stats.totalBookings = action.payload.length;
        
        // Calculate statistics
        const today = new Date().toISOString().split('T')[0];
        state.stats.todayArrivals = action.payload.filter(
          booking => booking.checkInDate === today
        ).length;
        state.stats.todayDepartures = action.payload.filter(
          booking => booking.checkOutDate === today
        ).length;
        state.stats.currentOccupancy = action.payload.filter(
          booking => booking.status === 'checked_in'
        ).length;
      })
      .addCase(fetchBookings.rejected, (state, action) => {
        state.loading = { isLoading: false };
        state.error = { 
          hasError: true, 
          message: action.payload as string || 'เกิดข้อผิดพลาดในการโหลดข้อมูล' 
        };
      });
    
    // Create booking
    builder
      .addCase(createBooking.pending, (state) => {
        state.loading = { isLoading: true, message: 'กำลังสร้างการจอง...' };
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.loading = { isLoading: false };
        state.bookings.unshift(action.payload);
        state.stats.totalBookings += 1;
        state.wizardData = initialState.wizardData; // Reset wizard
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.loading = { isLoading: false };
        state.error = { 
          hasError: true, 
          message: action.payload as string || 'เกิดข้อผิดพลาดในการสร้างการจอง' 
        };
      });
    
    // Update booking status
    builder
      .addCase(updateBookingStatus.fulfilled, (state, action) => {
        const { id, status, updatedAt } = action.payload;
        const booking = state.bookings.find(b => b.id === id);
        if (booking) {
          booking.status = status;
          booking.updatedAt = updatedAt;
        }
      });
  },
});

export const {
  setSearchTerm,
  setStatusFilter,
  setDateFilter,
  clearFilters,
  setSelectedBooking,
  setCurrentBooking,
  setWizardStep,
  setWizardGuestData,
  setWizardDateData,
  setWizardRoomData,
  resetWizard,
  clearError,
  setError,
  addBookingLocally,
  updateBookingLocally,
  removeBookingLocally,
} = bookingSlice.actions;