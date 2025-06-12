// src/store/slices/configSlice.test.ts
import { configureStore } from '@reduxjs/toolkit';
import { configSlice, fetchConfiguration, fetchHotelConfiguration, fetchRoomConfigurations, fetchPricingConfigurations, updateHotelConfiguration, updateRoomConfiguration, calculateBookingPrice } from './configSlice';
import * as configurationServiceModule from '../../services/ConfigurationService';
import type {
  HotelConfiguration,
  RoomConfiguration,
  PricingConfiguration,
  BookingConfiguration,
} from '../../services/ConfigurationService';
import type { LoadingState, ErrorState } from '../../types';

// Mock the configuration service
jest.mock('../../services/ConfigurationService', () => ({
  configurationService: {
    getConfiguration: jest.fn(),
    getHotelConfiguration: jest.fn(),
    getRoomConfigurations: jest.fn(),
    getPricingConfigurations: jest.fn(),
    getBookingConfiguration: jest.fn(),
    updateHotelConfiguration: jest.fn(),
    updateRoomConfiguration: jest.fn(),
    updatePricingConfiguration: jest.fn(),
    updateBookingConfiguration: jest.fn(),
    getAvailableRoomTypes: jest.fn(),
    calculateBookingPrice: jest.fn(),
    clearCache: jest.fn(),
  },
}));

const mockConfigurationService = configurationServiceModule.configurationService as jest.Mocked<typeof configurationServiceModule.configurationService>;

// Define local interfaces for testing
interface ConfigState {
  hotel: HotelConfiguration | null;
  rooms: RoomConfiguration[];
  pricing: PricingConfiguration[];
  booking: BookingConfiguration | null;
  lastUpdated: string | null;
  version: string | null;
  loading: LoadingState;
  error: ErrorState;
  availableRoomTypes: string[];
  isDirty: boolean;
  hasUnsavedChanges: boolean;
}

// Helper function to create a test store
const createTestStore = (initialState?: Partial<ConfigState>) => {
  const store = configureStore({
    reducer: {
      config: configSlice.reducer,
    },
    preloadedState: initialState ? { config: { ...configSlice.getInitialState(), ...initialState } } : undefined,
  });
  return store;
};

// Mock data
const mockHotelConfig: HotelConfiguration = {
  hotelName: 'โรงแรมสวนสน',
  hotelAddress: '123 ซอยสวนสน ถนนพระราม 4',
  hotelPhone: '02-234-5678',
  hotelEmail: 'info@hotel.com',
  checkInTime: '14:00',
  checkOutTime: '12:00',
  currency: 'THB',
  timeZone: 'Asia/Bangkok',
  language: 'th',
  theme: 'light',
};

const mockRoomConfig: RoomConfiguration = {
  id: 'room-001',
  name: 'Standard Room',
  type: 'Standard',
  capacity: 2,
  basePrice: 1200,
  amenities: ['Wi-Fi', 'แอร์', 'ทีวี'],
  description: 'ห้องพักมาตรฐาน',
  images: [],
  isActive: true,
};

const mockPricingConfig: PricingConfiguration = {
  roomType: 'Standard',
  basePrice: 1200,
  seasonalRates: [
    {
      name: 'ช่วงเทศกาล',
      startDate: '2024-12-20',
      endDate: '2025-01-05',
      multiplier: 1.5,
    },
  ],
  weekendSurcharge: 10,
  extraGuestCharge: 300,
  taxes: [
    { name: 'VAT', rate: 7, type: 'percentage' },
    { name: 'Service Charge', rate: 10, type: 'percentage' },
  ],
};

const mockBookingConfig: BookingConfiguration = {
  allowWalkIns: true,
  requireDeposit: true,
  depositPercentage: 30,
  cancellationPolicy: {
    hours: 24,
    penalty: 50,
  },
  maxAdvanceBookingDays: 365,
  minBookingNoticeHours: 2,
  allowModifications: true,
  modificationDeadlineHours: 24,
};

const mockAppConfig = {
  hotel: mockHotelConfig,
  rooms: [mockRoomConfig],
  pricing: [mockPricingConfig],
  booking: mockBookingConfig,
  lastUpdated: '2024-12-20T10:00:00.000Z',
  version: '1.0.0',
};

describe('configSlice', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const store = createTestStore();
      const state = store.getState().config;

      expect(state.hotel).toBeNull();
      expect(state.rooms).toEqual([]);
      expect(state.pricing).toEqual([]);
      expect(state.booking).toBeNull();
      expect(state.lastUpdated).toBeNull();
      expect(state.version).toBeNull();
      expect(state.loading).toEqual({ isLoading: false });
      expect(state.error).toEqual({ hasError: false });
      expect(state.availableRoomTypes).toEqual([]);
      expect(state.isDirty).toBe(false);
      expect(state.hasUnsavedChanges).toBe(false);
    });
  });

  describe('Local State Management Actions', () => {
    describe('setHotelConfiguration', () => {
      it('should set hotel configuration and mark as dirty', () => {
        const store = createTestStore();
        
        store.dispatch(configSlice.actions.setHotelConfiguration(mockHotelConfig));
        
        const state = store.getState().config;
        expect(state.hotel).toEqual(mockHotelConfig);
        expect(state.isDirty).toBe(true);
        expect(state.hasUnsavedChanges).toBe(true);
      });
    });

    describe('setRoomConfiguration', () => {
      it('should update existing room configuration', () => {
        const initialState: Partial<ConfigState> = {
          rooms: [mockRoomConfig],
        };

        const store = createTestStore(initialState);
        const update = { name: 'Updated Room', basePrice: 1500 };
        
        store.dispatch(configSlice.actions.setRoomConfiguration({
          roomId: 'room-001',
          roomConfig: update,
        }));
        
        const state = store.getState().config;
        expect(state.rooms[0]?.name).toBe('Updated Room');
        expect(state.rooms[0]?.basePrice).toBe(1500);
        expect(state.isDirty).toBe(true);
        expect(state.hasUnsavedChanges).toBe(true);
      });

      it('should update available room types when room type changes', () => {
        const initialState: Partial<ConfigState> = {
          rooms: [mockRoomConfig],
          availableRoomTypes: ['Standard'],
        };

        const store = createTestStore(initialState);
        
        store.dispatch(configSlice.actions.setRoomConfiguration({
          roomId: 'room-001',
          roomConfig: { type: 'Deluxe', isActive: true },
        }));
        
        const state = store.getState().config;
        expect(state.availableRoomTypes).toContain('Deluxe');
      });

      it('should not fail when updating non-existent room', () => {
        const store = createTestStore();
        
        expect(() => {
          store.dispatch(configSlice.actions.setRoomConfiguration({
            roomId: 'nonexistent',
            roomConfig: { name: 'Test' },
          }));
        }).not.toThrow();
      });
    });

    describe('setPricingConfiguration', () => {
      it('should update existing pricing configuration', () => {
        const initialState: Partial<ConfigState> = {
          pricing: [mockPricingConfig],
        };

        const store = createTestStore(initialState);
        const update = { basePrice: 1500, weekendSurcharge: 15 };
        
        store.dispatch(configSlice.actions.setPricingConfiguration({
          roomType: 'Standard',
          pricingConfig: update,
        }));
        
        const state = store.getState().config;
        expect(state.pricing[0]?.basePrice).toBe(1500);
        expect(state.pricing[0]?.weekendSurcharge).toBe(15);
        expect(state.isDirty).toBe(true);
        expect(state.hasUnsavedChanges).toBe(true);
      });

      it('should not fail when updating non-existent pricing', () => {
        const store = createTestStore();
        
        expect(() => {
          store.dispatch(configSlice.actions.setPricingConfiguration({
            roomType: 'nonexistent',
            pricingConfig: { basePrice: 1500 },
          }));
        }).not.toThrow();
      });
    });

    describe('setBookingConfiguration', () => {
      it('should update booking configuration when booking exists', () => {
        const initialState: Partial<ConfigState> = {
          booking: mockBookingConfig,
        };

        const store = createTestStore(initialState);
        const update = { allowWalkIns: false, depositPercentage: 50 };
        
        store.dispatch(configSlice.actions.setBookingConfiguration(update));
        
        const state = store.getState().config;
        expect(state.booking?.allowWalkIns).toBe(false);
        expect(state.booking?.depositPercentage).toBe(50);
        expect(state.isDirty).toBe(true);
        expect(state.hasUnsavedChanges).toBe(true);
      });

      it('should not fail when booking is null', () => {
        const store = createTestStore();
        
        expect(() => {
          store.dispatch(configSlice.actions.setBookingConfiguration({
            allowWalkIns: false,
          }));
        }).not.toThrow();
      });
    });
  });

  describe('Room Management Actions', () => {
    describe('addRoom', () => {
      it('should add new room and update available types', () => {
        const store = createTestStore();
        
        store.dispatch(configSlice.actions.addRoom(mockRoomConfig));
        
        const state = store.getState().config;
        expect(state.rooms).toHaveLength(1);
        expect(state.rooms[0]).toEqual(mockRoomConfig);
        expect(state.availableRoomTypes).toContain('Standard');
        expect(state.isDirty).toBe(true);
        expect(state.hasUnsavedChanges).toBe(true);
      });

      it('should not update available types for inactive rooms', () => {
        const inactiveRoom = { ...mockRoomConfig, isActive: false, type: 'VIP' };
        const store = createTestStore();
        
        store.dispatch(configSlice.actions.addRoom(inactiveRoom));
        
        const state = store.getState().config;
        expect(state.availableRoomTypes).not.toContain('VIP');
      });
    });

    describe('removeRoom', () => {
      it('should remove room and update available types', () => {
        const initialState: Partial<ConfigState> = {
          rooms: [mockRoomConfig, { ...mockRoomConfig, id: 'room-002', type: 'Deluxe' }],
          availableRoomTypes: ['Standard', 'Deluxe'],
        };

        const store = createTestStore(initialState);
        
        store.dispatch(configSlice.actions.removeRoom('room-002'));
        
        const state = store.getState().config;
        expect(state.rooms).toHaveLength(1);
        expect(state.rooms[0]?.id).toBe('room-001');
        expect(state.availableRoomTypes).toEqual(['Standard']);
        expect(state.isDirty).toBe(true);
        expect(state.hasUnsavedChanges).toBe(true);
      });
    });

    describe('toggleRoomActive', () => {
      it('should toggle room active status and update available types', () => {
        const initialState: Partial<ConfigState> = {
          rooms: [mockRoomConfig],
          availableRoomTypes: ['Standard'],
        };

        const store = createTestStore(initialState);
        
        store.dispatch(configSlice.actions.toggleRoomActive('room-001'));
        
        const state = store.getState().config;
        expect(state.rooms[0]?.isActive).toBe(false);
        expect(state.availableRoomTypes).toEqual([]);
        expect(state.isDirty).toBe(true);
        expect(state.hasUnsavedChanges).toBe(true);
      });

      it('should not fail when room not found', () => {
        const store = createTestStore();
        
        expect(() => {
          store.dispatch(configSlice.actions.toggleRoomActive('nonexistent'));
        }).not.toThrow();
      });
    });
  });

  describe('Pricing Management Actions', () => {
    describe('addPricing', () => {
      it('should add new pricing configuration', () => {
        const store = createTestStore();
        
        store.dispatch(configSlice.actions.addPricing(mockPricingConfig));
        
        const state = store.getState().config;
        expect(state.pricing).toHaveLength(1);
        expect(state.pricing[0]).toEqual(mockPricingConfig);
        expect(state.isDirty).toBe(true);
        expect(state.hasUnsavedChanges).toBe(true);
      });

      it('should replace existing pricing for same room type', () => {
        const initialState: Partial<ConfigState> = {
          pricing: [mockPricingConfig],
        };

        const store = createTestStore(initialState);
        const newPricing = { ...mockPricingConfig, basePrice: 1500 };
        
        store.dispatch(configSlice.actions.addPricing(newPricing));
        
        const state = store.getState().config;
        expect(state.pricing).toHaveLength(1);
        expect(state.pricing[0]?.basePrice).toBe(1500);
      });
    });

    describe('removePricing', () => {
      it('should remove pricing configuration by room type', () => {
        const initialState: Partial<ConfigState> = {
          pricing: [mockPricingConfig, { ...mockPricingConfig, roomType: 'Deluxe' }],
        };

        const store = createTestStore(initialState);
        
        store.dispatch(configSlice.actions.removePricing('Standard'));
        
        const state = store.getState().config;
        expect(state.pricing).toHaveLength(1);
        expect(state.pricing[0]?.roomType).toBe('Deluxe');
        expect(state.isDirty).toBe(true);
        expect(state.hasUnsavedChanges).toBe(true);
      });
    });
  });

  describe('State Management Actions', () => {
    describe('markAsSaved', () => {
      it('should reset dirty flags and update lastUpdated', () => {
        const initialState: Partial<ConfigState> = {
          isDirty: true,
          hasUnsavedChanges: true,
        };

        const store = createTestStore(initialState);
        
        store.dispatch(configSlice.actions.markAsSaved());
        
        const state = store.getState().config;
        expect(state.isDirty).toBe(false);
        expect(state.hasUnsavedChanges).toBe(false);
        expect(new Date(state.lastUpdated!).getTime()).toBeCloseTo(Date.now(), -2);
      });
    });

    describe('resetChanges', () => {
      it('should reset dirty flags', () => {
        const initialState: Partial<ConfigState> = {
          isDirty: true,
          hasUnsavedChanges: true,
        };

        const store = createTestStore(initialState);
        
        store.dispatch(configSlice.actions.resetChanges());
        
        const state = store.getState().config;
        expect(state.isDirty).toBe(false);
        expect(state.hasUnsavedChanges).toBe(false);
      });
    });

    describe('clearCache', () => {
      it('should clear cache and reset metadata', () => {
        const initialState: Partial<ConfigState> = {
          lastUpdated: '2024-12-20T10:00:00.000Z',
          version: '1.0.0',
        };

        const store = createTestStore(initialState);
        
        store.dispatch(configSlice.actions.clearCache());
        
        const state = store.getState().config;
        expect(state.lastUpdated).toBeNull();
        expect(state.version).toBeNull();
        expect(mockConfigurationService.clearCache).toHaveBeenCalled();
      });
    });

    describe('Theme and Language', () => {
      describe('setTheme', () => {
        it('should update theme when hotel config exists', () => {
          const initialState: Partial<ConfigState> = {
            hotel: mockHotelConfig,
          };

          const store = createTestStore(initialState);
          
          store.dispatch(configSlice.actions.setTheme('dark'));
          
          const state = store.getState().config;
          expect(state.hotel?.theme).toBe('dark');
          expect(state.isDirty).toBe(true);
          expect(state.hasUnsavedChanges).toBe(true);
        });

        it('should not fail when hotel config is null', () => {
          const store = createTestStore();
          
          expect(() => {
            store.dispatch(configSlice.actions.setTheme('dark'));
          }).not.toThrow();
        });
      });

      describe('setLanguage', () => {
        it('should update language when hotel config exists', () => {
          const initialState: Partial<ConfigState> = {
            hotel: mockHotelConfig,
          };

          const store = createTestStore(initialState);
          
          store.dispatch(configSlice.actions.setLanguage('en'));
          
          const state = store.getState().config;
          expect(state.hotel?.language).toBe('en');
          expect(state.isDirty).toBe(true);
          expect(state.hasUnsavedChanges).toBe(true);
        });
      });
    });
  });

  describe('Error Handling Actions', () => {
    describe('clearError', () => {
      it('should clear error state', () => {
        const initialState: Partial<ConfigState> = {
          error: { hasError: true, message: 'Test error' },
        };

        const store = createTestStore(initialState);
        
        store.dispatch(configSlice.actions.clearError());
        
        expect(store.getState().config.error).toEqual({ hasError: false });
      });
    });

    describe('setError', () => {
      it('should set error state', () => {
        const store = createTestStore();
        
        store.dispatch(configSlice.actions.setError('Test error'));
        
        expect(store.getState().config.error).toEqual({
          hasError: true,
          message: 'Test error',
        });
      });
    });
  });

  describe('Async Thunks', () => {
    describe('fetchConfiguration', () => {
      it('should fetch configuration successfully', async () => {
        mockConfigurationService.getConfiguration.mockResolvedValueOnce({
          data: mockAppConfig,
          success: true,
        });

        const store = createTestStore();
        
        const promise = store.dispatch(fetchConfiguration());
        
        // Check loading state
        expect(store.getState().config.loading.isLoading).toBe(true);
        expect(store.getState().config.loading.message).toBe('กำลังโหลดการตั้งค่า...');
        
        const result = await promise;
        
        expect(result.type).toBe('config/fetchConfiguration/fulfilled');
        expect(mockConfigurationService.getConfiguration).toHaveBeenCalledWith(false);
        
        const state = store.getState().config;
        expect(state.loading.isLoading).toBe(false);
        expect(state.hotel).toEqual(mockHotelConfig);
        expect(state.rooms).toEqual([mockRoomConfig]);
        expect(state.pricing).toEqual([mockPricingConfig]);
        expect(state.booking).toEqual(mockBookingConfig);
        expect(state.lastUpdated).toBe('2024-12-20T10:00:00.000Z');
        expect(state.version).toBe('1.0.0');
        expect(state.isDirty).toBe(false);
        expect(state.hasUnsavedChanges).toBe(false);
        expect(state.availableRoomTypes).toEqual(['Standard']);
      });

      it('should handle force refresh parameter', async () => {
        mockConfigurationService.getConfiguration.mockResolvedValueOnce({
          data: mockAppConfig,
          success: true,
        });

        const store = createTestStore();
        
        await store.dispatch(fetchConfiguration(true));
        
        expect(mockConfigurationService.getConfiguration).toHaveBeenCalledWith(true);
      });

      it('should handle fetch configuration error', async () => {
        mockConfigurationService.getConfiguration.mockRejectedValueOnce(
          new Error('Network error')
        );

        const store = createTestStore();
        
        const result = await store.dispatch(fetchConfiguration());
        
        expect(result.type).toBe('config/fetchConfiguration/rejected');
        
        const state = store.getState().config;
        expect(state.loading.isLoading).toBe(false);
        expect(state.error.hasError).toBe(true);
        expect(state.error.message).toBe('Network error');
      });
    });

    describe('fetchHotelConfiguration', () => {
      it('should fetch hotel configuration successfully', async () => {
        mockConfigurationService.getHotelConfiguration.mockResolvedValueOnce({
          data: mockHotelConfig,
          success: true,
        });

        const store = createTestStore();
        
        const result = await store.dispatch(fetchHotelConfiguration());
        
        expect(result.type).toBe('config/fetchHotelConfiguration/fulfilled');
        expect(store.getState().config.hotel).toEqual(mockHotelConfig);
      });

      it('should handle hotel configuration error', async () => {
        mockConfigurationService.getHotelConfiguration.mockRejectedValueOnce(
          new Error('Hotel config error')
        );

        const store = createTestStore();
        
        const result = await store.dispatch(fetchHotelConfiguration());
        
        expect(result.type).toBe('config/fetchHotelConfiguration/rejected');
        expect(result.payload).toBe('Hotel config error');
      });
    });

    describe('fetchRoomConfigurations', () => {
      it('should fetch room configurations and update available types', async () => {
        const rooms = [mockRoomConfig, { ...mockRoomConfig, id: 'room-002', type: 'Deluxe' }];
        mockConfigurationService.getRoomConfigurations.mockResolvedValueOnce({
          data: rooms,
          success: true,
        });

        const store = createTestStore();
        
        const result = await store.dispatch(fetchRoomConfigurations());
        
        expect(result.type).toBe('config/fetchRoomConfigurations/fulfilled');
        
        const state = store.getState().config;
        expect(state.rooms).toEqual(rooms);
        expect(state.availableRoomTypes).toEqual(['Standard', 'Deluxe']);
      });
    });

    describe('updateHotelConfiguration', () => {
      it('should update hotel configuration successfully', async () => {
        const update = { hotelName: 'Updated Hotel' };
        const updatedConfig = { ...mockHotelConfig, ...update };
        
        mockConfigurationService.updateHotelConfiguration.mockResolvedValueOnce({
          data: updatedConfig,
          success: true,
        });

        const store = createTestStore();
        
        const promise = store.dispatch(updateHotelConfiguration(update));
        
        // Check loading state
        expect(store.getState().config.loading.isLoading).toBe(true);
        expect(store.getState().config.loading.message).toBe('กำลังบันทึกการตั้งค่าโรงแรม...');
        
        const result = await promise;
        
        expect(result.type).toBe('config/updateHotelConfiguration/fulfilled');
        expect(mockConfigurationService.updateHotelConfiguration).toHaveBeenCalledWith(update);
        
        const state = store.getState().config;
        expect(state.loading.isLoading).toBe(false);
        expect(state.hotel).toEqual(updatedConfig);
        expect(state.isDirty).toBe(false);
        expect(state.hasUnsavedChanges).toBe(false);
        expect(new Date(state.lastUpdated!).getTime()).toBeCloseTo(Date.now(), -2);
      });

      it('should handle hotel configuration update error', async () => {
        mockConfigurationService.updateHotelConfiguration.mockRejectedValueOnce(
          new Error('Update failed')
        );

        const store = createTestStore();
        
        const result = await store.dispatch(updateHotelConfiguration({}));
        
        expect(result.type).toBe('config/updateHotelConfiguration/rejected');
        
        const state = store.getState().config;
        expect(state.loading.isLoading).toBe(false);
        expect(state.error.hasError).toBe(true);
        expect(state.error.message).toBe('Update failed');
      });
    });

    describe('updateRoomConfiguration', () => {
      it('should update room configuration successfully', async () => {
        const updatedRoom = { ...mockRoomConfig, name: 'Updated Room' };
        
        mockConfigurationService.updateRoomConfiguration.mockResolvedValueOnce({
          data: updatedRoom,
          success: true,
        });

        const initialState: Partial<ConfigState> = {
          rooms: [mockRoomConfig],
        };

        const store = createTestStore(initialState);
        
        const result = await store.dispatch(updateRoomConfiguration({
          roomId: 'room-001',
          roomConfig: { name: 'Updated Room' },
        }));
        
        expect(result.type).toBe('config/updateRoomConfiguration/fulfilled');
        expect(store.getState().config.rooms[0]).toEqual(updatedRoom);
      });
    });

    describe('calculateBookingPrice', () => {
      it('should calculate booking price successfully', async () => {
        const params = {
          roomType: 'Standard',
          checkInDate: '2024-12-20',
          checkOutDate: '2024-12-22',
          guests: 2,
        };

        mockConfigurationService.calculateBookingPrice.mockResolvedValueOnce({
          data: 2400,
          success: true,
        });

        const store = createTestStore();
        
        const result = await store.dispatch(calculateBookingPrice(params));
        
        expect(result.type).toBe('config/calculateBookingPrice/fulfilled');
        expect(result.payload).toEqual({ ...params, price: 2400 });
        expect(mockConfigurationService.calculateBookingPrice).toHaveBeenCalledWith(
          'Standard',
          '2024-12-20',
          '2024-12-22',
          2
        );
      });

      it('should handle price calculation error', async () => {
        mockConfigurationService.calculateBookingPrice.mockRejectedValueOnce(
          new Error('Price calculation failed')
        );

        const store = createTestStore();
        
        const result = await store.dispatch(calculateBookingPrice({
          roomType: 'Standard',
          checkInDate: '2024-12-20',
          checkOutDate: '2024-12-22',
          guests: 2,
        }));
        
        expect(result.type).toBe('config/calculateBookingPrice/rejected');
        expect(result.payload).toBe('Price calculation failed');
      });
    });
  });

  describe('Complex Integration Scenarios', () => {
    it('should handle complete configuration lifecycle', async () => {
      // Fetch initial configuration
      mockConfigurationService.getConfiguration.mockResolvedValueOnce({
        data: mockAppConfig,
        success: true,
      });

      const store = createTestStore();
      
      await store.dispatch(fetchConfiguration());
      
      let state = store.getState().config;
      expect(state.hotel?.hotelName).toBe('โรงแรมสวนสน');
      expect(state.isDirty).toBe(false);
      
      // Make local changes
      store.dispatch(configSlice.actions.setHotelConfiguration({
        ...mockHotelConfig,
        hotelName: 'Updated Hotel',
      }));
      
      state = store.getState().config;
      expect(state.hotel?.hotelName).toBe('Updated Hotel');
      expect(state.isDirty).toBe(true);
      
      // Save changes
      mockConfigurationService.updateHotelConfiguration.mockResolvedValueOnce({
        data: { ...mockHotelConfig, hotelName: 'Updated Hotel' },
        success: true,
      });
      
      await store.dispatch(updateHotelConfiguration({ hotelName: 'Updated Hotel' }));
      
      state = store.getState().config;
      expect(state.isDirty).toBe(false);
      expect(state.hasUnsavedChanges).toBe(false);
    });

    it('should handle room management workflow', async () => {
      const store = createTestStore();
      
      // Add room
      store.dispatch(configSlice.actions.addRoom(mockRoomConfig));
      
      let state = store.getState().config;
      expect(state.rooms).toHaveLength(1);
      expect(state.availableRoomTypes).toContain('Standard');
      
      // Toggle room active status
      store.dispatch(configSlice.actions.toggleRoomActive('room-001'));
      
      state = store.getState().config;
      expect(state.rooms[0]?.isActive).toBe(false);
      expect(state.availableRoomTypes).toEqual([]);
      
      // Remove room
      store.dispatch(configSlice.actions.removeRoom('room-001'));
      
      state = store.getState().config;
      expect(state.rooms).toHaveLength(0);
    });

    it('should handle pricing management workflow', async () => {
      const store = createTestStore();
      
      // Add pricing
      store.dispatch(configSlice.actions.addPricing(mockPricingConfig));
      
      let state = store.getState().config;
      expect(state.pricing).toHaveLength(1);
      expect(state.pricing[0]?.basePrice).toBe(1200);
      
      // Update pricing
      store.dispatch(configSlice.actions.setPricingConfiguration({
        roomType: 'Standard',
        pricingConfig: { basePrice: 1500 },
      }));
      
      state = store.getState().config;
      expect(state.pricing[0]?.basePrice).toBe(1500);
      
      // Remove pricing
      store.dispatch(configSlice.actions.removePricing('Standard'));
      
      state = store.getState().config;
      expect(state.pricing).toHaveLength(0);
    });

    it('should handle concurrent configuration operations', async () => {
      // Set up mocks for multiple operations
      mockConfigurationService.getHotelConfiguration.mockResolvedValueOnce({
        data: mockHotelConfig,
        success: true,
      });
      mockConfigurationService.getRoomConfigurations.mockResolvedValueOnce({
        data: [mockRoomConfig],
        success: true,
      });
      mockConfigurationService.getPricingConfigurations.mockResolvedValueOnce({
        data: [mockPricingConfig],
        success: true,
      });

      const store = createTestStore();
      
      // Perform multiple operations concurrently
      const promises = [
        store.dispatch(fetchHotelConfiguration()),
        store.dispatch(fetchRoomConfigurations()),
        store.dispatch(fetchPricingConfigurations()),
      ];
      
      const results = await Promise.all(promises);
      
      expect(results[0]?.type).toBe('config/fetchHotelConfiguration/fulfilled');
      expect(results[1]?.type).toBe('config/fetchRoomConfigurations/fulfilled');
      expect(results[2]?.type).toBe('config/fetchPricingConfigurations/fulfilled');
      
      const state = store.getState().config;
      expect(state.hotel).toEqual(mockHotelConfig);
      expect(state.rooms).toEqual([mockRoomConfig]);
      expect(state.pricing).toEqual([mockPricingConfig]);
    });
  });
});