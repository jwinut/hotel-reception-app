// src/store/slices/configSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { configurationService } from '../../services';
import type {
  AppConfiguration,
  HotelConfiguration,
  RoomConfiguration,
  PricingConfiguration,
  BookingConfiguration,
} from '../../services/ConfigurationService';
import type { LoadingState, ErrorState } from '../../types';

interface ConfigState {
  // Configuration data
  hotel: HotelConfiguration | null;
  rooms: RoomConfiguration[];
  pricing: PricingConfiguration[];
  booking: BookingConfiguration | null;
  
  // Cache metadata
  lastUpdated: string | null;
  version: string | null;
  
  // UI state
  loading: LoadingState;
  error: ErrorState;
  
  // Availability and calculated data
  availableRoomTypes: string[];
  
  // Settings
  isDirty: boolean;
  hasUnsavedChanges: boolean;
}

const initialState: ConfigState = {
  hotel: null,
  rooms: [],
  pricing: [],
  booking: null,
  
  lastUpdated: null,
  version: null,
  
  loading: {
    isLoading: false,
  },
  error: {
    hasError: false,
  },
  
  availableRoomTypes: [],
  
  isDirty: false,
  hasUnsavedChanges: false,
};

// Async thunks for configuration operations
export const fetchConfiguration = createAsyncThunk(
  'config/fetchConfiguration',
  async (forceRefresh: boolean = false, { rejectWithValue }) => {
    try {
      const response = await configurationService.getConfiguration(forceRefresh);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch configuration');
    }
  }
);

export const fetchHotelConfiguration = createAsyncThunk(
  'config/fetchHotelConfiguration',
  async (_, { rejectWithValue }) => {
    try {
      const response = await configurationService.getHotelConfiguration();
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch hotel configuration');
    }
  }
);

export const fetchRoomConfigurations = createAsyncThunk(
  'config/fetchRoomConfigurations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await configurationService.getRoomConfigurations();
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch room configurations');
    }
  }
);

export const fetchPricingConfigurations = createAsyncThunk(
  'config/fetchPricingConfigurations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await configurationService.getPricingConfigurations();
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch pricing configurations');
    }
  }
);

export const fetchBookingConfiguration = createAsyncThunk(
  'config/fetchBookingConfiguration',
  async (_, { rejectWithValue }) => {
    try {
      const response = await configurationService.getBookingConfiguration();
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch booking configuration');
    }
  }
);

export const updateHotelConfiguration = createAsyncThunk(
  'config/updateHotelConfiguration',
  async (hotelConfig: Partial<HotelConfiguration>, { rejectWithValue }) => {
    try {
      const response = await configurationService.updateHotelConfiguration(hotelConfig);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update hotel configuration');
    }
  }
);

export const updateRoomConfiguration = createAsyncThunk(
  'config/updateRoomConfiguration',
  async ({ roomId, roomConfig }: { roomId: string; roomConfig: Partial<RoomConfiguration> }, { rejectWithValue }) => {
    try {
      const response = await configurationService.updateRoomConfiguration(roomId, roomConfig);
      return { roomId, updatedRoom: response.data };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update room configuration');
    }
  }
);

export const updatePricingConfiguration = createAsyncThunk(
  'config/updatePricingConfiguration',
  async ({ roomType, pricingConfig }: { roomType: string; pricingConfig: Partial<PricingConfiguration> }, { rejectWithValue }) => {
    try {
      const response = await configurationService.updatePricingConfiguration(roomType, pricingConfig);
      return { roomType, updatedPricing: response.data };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update pricing configuration');
    }
  }
);

export const updateBookingConfiguration = createAsyncThunk(
  'config/updateBookingConfiguration',
  async (bookingConfig: Partial<BookingConfiguration>, { rejectWithValue }) => {
    try {
      const response = await configurationService.updateBookingConfiguration(bookingConfig);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update booking configuration');
    }
  }
);

export const fetchAvailableRoomTypes = createAsyncThunk(
  'config/fetchAvailableRoomTypes',
  async (_, { rejectWithValue }) => {
    try {
      const response = await configurationService.getAvailableRoomTypes();
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch available room types');
    }
  }
);

export const calculateBookingPrice = createAsyncThunk(
  'config/calculateBookingPrice',
  async (
    params: { roomType: string; checkInDate: string; checkOutDate: string; guests: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await configurationService.calculateBookingPrice(
        params.roomType,
        params.checkInDate,
        params.checkOutDate,
        params.guests
      );
      return { ...params, price: response.data };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to calculate booking price');
    }
  }
);

export const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {
    // Local state management
    setHotelConfiguration: (state, action: PayloadAction<HotelConfiguration>) => {
      state.hotel = action.payload;
      state.isDirty = true;
      state.hasUnsavedChanges = true;
    },

    setRoomConfiguration: (state, action: PayloadAction<{ roomId: string; roomConfig: Partial<RoomConfiguration> }>) => {
      const { roomId, roomConfig } = action.payload;
      const roomIndex = state.rooms.findIndex(room => room.id === roomId);
      
      if (roomIndex !== -1 && state.rooms[roomIndex]) {
        Object.assign(state.rooms[roomIndex], roomConfig);
        state.isDirty = true;
        state.hasUnsavedChanges = true;
        
        // Update available room types if room type changed
        if (roomConfig.type && roomConfig.isActive) {
          const roomTypes = Array.from(new Set(state.rooms.filter(room => room.isActive).map(room => room.type)));
          state.availableRoomTypes = roomTypes;
        }
      }
    },

    setPricingConfiguration: (state, action: PayloadAction<{ roomType: string; pricingConfig: Partial<PricingConfiguration> }>) => {
      const { roomType, pricingConfig } = action.payload;
      const pricingIndex = state.pricing.findIndex(pricing => pricing.roomType === roomType);
      
      if (pricingIndex !== -1 && state.pricing[pricingIndex]) {
        Object.assign(state.pricing[pricingIndex], pricingConfig);
        state.isDirty = true;
        state.hasUnsavedChanges = true;
      }
    },

    setBookingConfiguration: (state, action: PayloadAction<Partial<BookingConfiguration>>) => {
      if (state.booking) {
        Object.assign(state.booking, action.payload);
        state.isDirty = true;
        state.hasUnsavedChanges = true;
      }
    },

    // Room management
    addRoom: (state, action: PayloadAction<RoomConfiguration>) => {
      state.rooms.push(action.payload);
      state.isDirty = true;
      state.hasUnsavedChanges = true;
      
      // Update available room types
      if (action.payload.isActive) {
        const roomTypes = Array.from(new Set(state.rooms.filter(room => room.isActive).map(room => room.type)));
        state.availableRoomTypes = roomTypes;
      }
    },

    removeRoom: (state, action: PayloadAction<string>) => {
      const roomId = action.payload;
      state.rooms = state.rooms.filter(room => room.id !== roomId);
      state.isDirty = true;
      state.hasUnsavedChanges = true;
      
      // Update available room types
      const roomTypes = Array.from(new Set(state.rooms.filter(room => room.isActive).map(room => room.type)));
      state.availableRoomTypes = roomTypes;
    },

    toggleRoomActive: (state, action: PayloadAction<string>) => {
      const roomId = action.payload;
      const room = state.rooms.find(room => room.id === roomId);
      
      if (room) {
        room.isActive = !room.isActive;
        state.isDirty = true;
        state.hasUnsavedChanges = true;
        
        // Update available room types
        const roomTypes = Array.from(new Set(state.rooms.filter(room => room.isActive).map(room => room.type)));
        state.availableRoomTypes = roomTypes;
      }
    },

    // Pricing management
    addPricing: (state, action: PayloadAction<PricingConfiguration>) => {
      const existingIndex = state.pricing.findIndex(p => p.roomType === action.payload.roomType);
      
      if (existingIndex !== -1) {
        state.pricing[existingIndex] = action.payload;
      } else {
        state.pricing.push(action.payload);
      }
      
      state.isDirty = true;
      state.hasUnsavedChanges = true;
    },

    removePricing: (state, action: PayloadAction<string>) => {
      const roomType = action.payload;
      state.pricing = state.pricing.filter(pricing => pricing.roomType !== roomType);
      state.isDirty = true;
      state.hasUnsavedChanges = true;
    },

    // Cache management
    clearCache: (state) => {
      configurationService.clearCache();
      state.lastUpdated = null;
      state.version = null;
    },

    // Error handling
    clearError: (state) => {
      state.error = { hasError: false };
    },

    setError: (state, action: PayloadAction<string>) => {
      state.error = { hasError: true, message: action.payload };
    },

    // State management
    markAsSaved: (state) => {
      state.isDirty = false;
      state.hasUnsavedChanges = false;
      state.lastUpdated = new Date().toISOString();
    },

    resetChanges: (state) => {
      state.isDirty = false;
      state.hasUnsavedChanges = false;
      // Note: This doesn't restore previous values, just resets flags
      // To restore values, re-fetch from server
    },

    // Theme and language preferences
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      if (state.hotel) {
        state.hotel.theme = action.payload;
        state.isDirty = true;
        state.hasUnsavedChanges = true;
      }
    },

    setLanguage: (state, action: PayloadAction<'th' | 'en'>) => {
      if (state.hotel) {
        state.hotel.language = action.payload;
        state.isDirty = true;
        state.hasUnsavedChanges = true;
      }
    },
  },

  extraReducers: (builder) => {
    // Fetch complete configuration
    builder
      .addCase(fetchConfiguration.pending, (state) => {
        state.loading = { isLoading: true, message: 'กำลังโหลดการตั้งค่า...' };
        state.error = { hasError: false };
      })
      .addCase(fetchConfiguration.fulfilled, (state, action) => {
        const config = action.payload;
        state.loading = { isLoading: false };
        state.hotel = config.hotel;
        state.rooms = config.rooms;
        state.pricing = config.pricing;
        state.booking = config.booking;
        state.lastUpdated = config.lastUpdated;
        state.version = config.version;
        state.isDirty = false;
        state.hasUnsavedChanges = false;
        
        // Update available room types
        const roomTypes = Array.from(new Set(config.rooms.filter(room => room.isActive).map(room => room.type)));
        state.availableRoomTypes = roomTypes;
      })
      .addCase(fetchConfiguration.rejected, (state, action) => {
        state.loading = { isLoading: false };
        state.error = {
          hasError: true,
          message: action.payload as string || 'เกิดข้อผิดพลาดในการโหลดการตั้งค่า'
        };
      });

    // Fetch hotel configuration
    builder
      .addCase(fetchHotelConfiguration.fulfilled, (state, action) => {
        state.hotel = action.payload;
      });

    // Fetch room configurations
    builder
      .addCase(fetchRoomConfigurations.fulfilled, (state, action) => {
        state.rooms = action.payload;
        
        // Update available room types
        const roomTypes = Array.from(new Set(action.payload.filter(room => room.isActive).map(room => room.type)));
        state.availableRoomTypes = roomTypes;
      });

    // Fetch pricing configurations
    builder
      .addCase(fetchPricingConfigurations.fulfilled, (state, action) => {
        state.pricing = action.payload;
      });

    // Fetch booking configuration
    builder
      .addCase(fetchBookingConfiguration.fulfilled, (state, action) => {
        state.booking = action.payload;
      });

    // Update hotel configuration
    builder
      .addCase(updateHotelConfiguration.pending, (state) => {
        state.loading = { isLoading: true, message: 'กำลังบันทึกการตั้งค่าโรงแรม...' };
      })
      .addCase(updateHotelConfiguration.fulfilled, (state, action) => {
        state.loading = { isLoading: false };
        state.hotel = action.payload;
        state.isDirty = false;
        state.hasUnsavedChanges = false;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(updateHotelConfiguration.rejected, (state, action) => {
        state.loading = { isLoading: false };
        state.error = {
          hasError: true,
          message: action.payload as string || 'เกิดข้อผิดพลาดในการบันทึกการตั้งค่าโรงแรม'
        };
      });

    // Update room configuration
    builder
      .addCase(updateRoomConfiguration.fulfilled, (state, action) => {
        const { roomId, updatedRoom } = action.payload;
        const roomIndex = state.rooms.findIndex(room => room.id === roomId);
        
        if (roomIndex !== -1) {
          state.rooms[roomIndex] = updatedRoom;
          
          // Update available room types
          const roomTypes = Array.from(new Set(state.rooms.filter(room => room.isActive).map(room => room.type)));
          state.availableRoomTypes = roomTypes;
        }
      });

    // Update pricing configuration
    builder
      .addCase(updatePricingConfiguration.fulfilled, (state, action) => {
        const { roomType, updatedPricing } = action.payload;
        const pricingIndex = state.pricing.findIndex(pricing => pricing.roomType === roomType);
        
        if (pricingIndex !== -1) {
          state.pricing[pricingIndex] = updatedPricing;
        }
      });

    // Update booking configuration
    builder
      .addCase(updateBookingConfiguration.fulfilled, (state, action) => {
        state.booking = action.payload;
        state.isDirty = false;
        state.hasUnsavedChanges = false;
        state.lastUpdated = new Date().toISOString();
      });

    // Fetch available room types
    builder
      .addCase(fetchAvailableRoomTypes.fulfilled, (state, action) => {
        state.availableRoomTypes = action.payload;
      });
  },
});

export const {
  setHotelConfiguration,
  setRoomConfiguration,
  setPricingConfiguration,
  setBookingConfiguration,
  addRoom,
  removeRoom,
  toggleRoomActive,
  addPricing,
  removePricing,
  clearCache,
  clearError,
  setError,
  markAsSaved,
  resetChanges,
  setTheme,
  setLanguage,
} = configSlice.actions;