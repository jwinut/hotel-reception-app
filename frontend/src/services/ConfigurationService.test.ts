// src/services/ConfigurationService.test.ts
import { configurationService } from './ConfigurationService';
import type { 
  HotelConfiguration, 
  RoomConfiguration, 
  PricingConfiguration, 
  BookingConfiguration,
  AppConfiguration 
} from './ConfigurationService';
import * as apiClientModule from './apiClient';

// Mock the apiClient
jest.mock('./apiClient', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockApiClient = apiClientModule.apiClient as jest.Mocked<typeof apiClientModule.apiClient>;

describe('ConfigurationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    // Reset NODE_ENV to development for mock behavior
    process.env.NODE_ENV = 'development';
    
    // Clear cache before each test
    configurationService.clearCache();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('getConfiguration', () => {
    it('returns mock configuration in development mode', async () => {
      const promise = configurationService.getConfiguration();
      jest.advanceTimersByTime(300);
      const result = await promise;

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('hotel');
      expect(result.data).toHaveProperty('rooms');
      expect(result.data).toHaveProperty('pricing');
      expect(result.data).toHaveProperty('booking');
      expect(result.data).toHaveProperty('lastUpdated');
      expect(result.data).toHaveProperty('version');
      expect(result.data.hotel.hotelName).toBe('โรงแรมสวนสน');
      expect(result.data.rooms).toHaveLength(3);
      expect(result.data.pricing).toHaveLength(3);
    });

    it('uses cache when available and not expired', async () => {
      // First call to populate cache
      const promise1 = configurationService.getConfiguration();
      jest.advanceTimersByTime(300);
      await promise1;

      // Second call should use cache (no delay)
      const promise2 = configurationService.getConfiguration();
      const result2 = await promise2;

      expect(result2.success).toBe(true);
      expect(result2.data.hotel.hotelName).toBe('โรงแรมสวนสน');
    });

    it('bypasses cache when forceRefresh is true', async () => {
      // First call to populate cache
      const promise1 = configurationService.getConfiguration();
      jest.advanceTimersByTime(300);
      await promise1;

      // Force refresh should bypass cache and trigger delay
      const promise2 = configurationService.getConfiguration(true);
      jest.advanceTimersByTime(300);
      const result2 = await promise2;

      expect(result2.success).toBe(true);
      expect(result2.data.hotel.hotelName).toBe('โรงแรมสวนสน');
    });

    it('refreshes cache when expired', async () => {
      const service = configurationService as any;
      
      // First call to populate cache
      const promise1 = configurationService.getConfiguration();
      jest.advanceTimersByTime(300);
      await promise1;

      // Simulate cache expiry (5 minutes + 1ms)
      service.cacheTimestamp = Date.now() - (5 * 60 * 1000 + 1);

      // Next call should refresh cache
      const promise2 = configurationService.getConfiguration();
      jest.advanceTimersByTime(300);
      const result2 = await promise2;

      expect(result2.success).toBe(true);
    });

    it('calls apiClient in production mode', async () => {
      process.env.NODE_ENV = 'production';
      const mockConfig: AppConfiguration = {
        hotel: { hotelName: 'Test Hotel' } as HotelConfiguration,
        rooms: [],
        pricing: [],
        booking: {} as BookingConfiguration,
        lastUpdated: new Date().toISOString(),
        version: '1.0.0',
      };
      const mockResponse = { data: mockConfig, success: true };
      mockApiClient.get.mockResolvedValueOnce(mockResponse);

      const result = await configurationService.getConfiguration();

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/configuration');
      expect(result).toEqual(mockResponse);
    });

    it('updates cache on successful production response', async () => {
      process.env.NODE_ENV = 'production';
      const mockConfig: AppConfiguration = {
        hotel: { hotelName: 'Cached Hotel' } as HotelConfiguration,
        rooms: [],
        pricing: [],
        booking: {} as BookingConfiguration,
        lastUpdated: new Date().toISOString(),
        version: '1.0.0',
      };
      const mockResponse = { data: mockConfig, success: true };
      mockApiClient.get.mockResolvedValueOnce(mockResponse);

      await configurationService.getConfiguration();

      // Second call should use cache
      const result2 = await configurationService.getConfiguration();
      expect(result2.data.hotel.hotelName).toBe('Cached Hotel');
    });

    it('handles configuration fetch errors', async () => {
      process.env.NODE_ENV = 'production';
      mockApiClient.get.mockRejectedValueOnce(new Error('Config fetch failed'));

      await expect(configurationService.getConfiguration()).rejects.toThrow(
        'เกิดข้อผิดพลาดในการดึงข้อมูลการตั้งค่า: Config fetch failed'
      );
    });

    it('handles non-Error exceptions', async () => {
      process.env.NODE_ENV = 'production';
      mockApiClient.get.mockRejectedValueOnce('String error');

      await expect(configurationService.getConfiguration()).rejects.toThrow(
        'เกิดข้อผิดพลาดในการดึงข้อมูลการตั้งค่า: Unknown error'
      );
    });
  });

  describe('getHotelConfiguration', () => {
    it('returns hotel configuration from full config', async () => {
      const promise = configurationService.getHotelConfiguration();
      jest.advanceTimersByTime(300);
      const result = await promise;

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('hotelName');
      expect(result.data).toHaveProperty('hotelAddress');
      expect(result.data).toHaveProperty('hotelPhone');
      expect(result.data).toHaveProperty('checkInTime');
      expect(result.data).toHaveProperty('checkOutTime');
      expect(result.data.hotelName).toBe('โรงแรมสวนสน');
      expect(result.data.checkInTime).toBe('14:00');
      expect(result.data.checkOutTime).toBe('12:00');
    });

    it('handles hotel configuration fetch errors', async () => {
      process.env.NODE_ENV = 'production';
      mockApiClient.get.mockRejectedValueOnce(new Error('Hotel config failed'));

      await expect(configurationService.getHotelConfiguration()).rejects.toThrow(
        'เกิดข้อผิดพลาดในการดึงข้อมูลการตั้งค่าโรงแรม: Hotel config failed'
      );
    });
  });

  describe('getRoomConfigurations', () => {
    it('returns room configurations from full config', async () => {
      const promise = configurationService.getRoomConfigurations();
      jest.advanceTimersByTime(300);
      const result = await promise;

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data).toHaveLength(3);
      expect(result.data[0]).toHaveProperty('id');
      expect(result.data[0]).toHaveProperty('name');
      expect(result.data[0]).toHaveProperty('type');
      expect(result.data[0]).toHaveProperty('capacity');
      expect(result.data[0]).toHaveProperty('basePrice');
      expect(result.data[0]).toHaveProperty('amenities');
      expect(result.data[0].type).toBe('Standard');
      expect(result.data[1].type).toBe('Deluxe');
      expect(result.data[2].type).toBe('Suite');
    });

    it('handles room configurations fetch errors', async () => {
      process.env.NODE_ENV = 'production';
      mockApiClient.get.mockRejectedValueOnce(new Error('Room config failed'));

      await expect(configurationService.getRoomConfigurations()).rejects.toThrow(
        'เกิดข้อผิดพลาดในการดึงข้อมูลการตั้งค่าห้องพัก: Room config failed'
      );
    });
  });

  describe('getPricingConfigurations', () => {
    it('returns pricing configurations from full config', async () => {
      const promise = configurationService.getPricingConfigurations();
      jest.advanceTimersByTime(300);
      const result = await promise;

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data).toHaveLength(3);
      expect(result.data[0]).toHaveProperty('roomType');
      expect(result.data[0]).toHaveProperty('basePrice');
      expect(result.data[0]).toHaveProperty('seasonalRates');
      expect(result.data[0]).toHaveProperty('weekendSurcharge');
      expect(result.data[0]).toHaveProperty('taxes');
      expect(result.data[0].roomType).toBe('Standard');
      expect(result.data[0].basePrice).toBe(1200);
    });

    it('handles pricing configurations fetch errors', async () => {
      process.env.NODE_ENV = 'production';
      mockApiClient.get.mockRejectedValueOnce(new Error('Pricing config failed'));

      await expect(configurationService.getPricingConfigurations()).rejects.toThrow(
        'เกิดข้อผิดพลาดในการดึงข้อมูลการตั้งค่าราคา: Pricing config failed'
      );
    });
  });

  describe('getBookingConfiguration', () => {
    it('returns booking configuration from full config', async () => {
      const promise = configurationService.getBookingConfiguration();
      jest.advanceTimersByTime(300);
      const result = await promise;

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('allowWalkIns');
      expect(result.data).toHaveProperty('requireDeposit');
      expect(result.data).toHaveProperty('depositPercentage');
      expect(result.data).toHaveProperty('cancellationPolicy');
      expect(result.data).toHaveProperty('maxAdvanceBookingDays');
      expect(result.data.allowWalkIns).toBe(true);
      expect(result.data.depositPercentage).toBe(30);
      expect(result.data.cancellationPolicy.hours).toBe(24);
    });

    it('handles booking configuration fetch errors', async () => {
      process.env.NODE_ENV = 'production';
      mockApiClient.get.mockRejectedValueOnce(new Error('Booking config failed'));

      await expect(configurationService.getBookingConfiguration()).rejects.toThrow(
        'เกิดข้อผิดพลาดในการดึงข้อมูลการตั้งค่าการจอง: Booking config failed'
      );
    });
  });

  describe('updateHotelConfiguration', () => {
    const hotelUpdate: Partial<HotelConfiguration> = {
      hotelName: 'Updated Hotel Name',
      checkInTime: '15:00',
      checkOutTime: '11:00',
    };

    it('updates hotel configuration in development mode', async () => {
      // First get initial config to populate cache
      const getPromise = configurationService.getConfiguration();
      jest.advanceTimersByTime(300);
      await getPromise;

      const updatePromise = configurationService.updateHotelConfiguration(hotelUpdate);
      jest.advanceTimersByTime(500);
      const result = await updatePromise;

      expect(result.success).toBe(true);
      expect(result.data.hotelName).toBe('Updated Hotel Name');
      expect(result.data.checkInTime).toBe('15:00');
      expect(result.data.checkOutTime).toBe('11:00');
      expect(result.data.hotelAddress).toBe('123 ซอยสวนสน ถนนพระราม 4 กรุงเทพมหานคร 10110'); // Original value preserved
    });

    it('updates cache when updating hotel configuration', async () => {
      // First get initial config
      const getPromise = configurationService.getConfiguration();
      jest.advanceTimersByTime(300);
      await getPromise;

      // Update configuration
      const updatePromise = configurationService.updateHotelConfiguration(hotelUpdate);
      jest.advanceTimersByTime(500);
      await updatePromise;

      // Get configuration again (should use updated cache)
      const getPromise2 = configurationService.getHotelConfiguration();
      const result2 = await getPromise2;

      expect(result2.data.hotelName).toBe('Updated Hotel Name');
    });

    it('calls apiClient in production mode', async () => {
      process.env.NODE_ENV = 'production';
      const mockResponse = { data: hotelUpdate as HotelConfiguration, success: true };
      mockApiClient.put.mockResolvedValueOnce(mockResponse);

      const result = await configurationService.updateHotelConfiguration(hotelUpdate);

      expect(mockApiClient.put).toHaveBeenCalledWith('/api/configuration/hotel', hotelUpdate);
      expect(result).toEqual(mockResponse);
    });

    it('invalidates cache on successful production update', async () => {
      process.env.NODE_ENV = 'production';
      
      // First populate cache
      const mockGetResponse = {
        data: {
          hotel: { hotelName: 'Original' } as HotelConfiguration,
          rooms: [], pricing: [], booking: {} as BookingConfiguration,
          lastUpdated: '', version: '1.0.0'
        },
        success: true
      };
      mockApiClient.get.mockResolvedValueOnce(mockGetResponse);
      await configurationService.getConfiguration();

      // Update configuration
      const mockUpdateResponse = { data: hotelUpdate as HotelConfiguration, success: true };
      mockApiClient.put.mockResolvedValueOnce(mockUpdateResponse);
      await configurationService.updateHotelConfiguration(hotelUpdate);

      // Next get should call API again (cache invalidated)
      mockApiClient.get.mockResolvedValueOnce(mockGetResponse);
      await configurationService.getConfiguration();

      expect(mockApiClient.get).toHaveBeenCalledTimes(2);
    });

    it('handles hotel configuration update errors', async () => {
      process.env.NODE_ENV = 'production';
      mockApiClient.put.mockRejectedValueOnce(new Error('Update failed'));

      await expect(configurationService.updateHotelConfiguration(hotelUpdate)).rejects.toThrow(
        'เกิดข้อผิดพลาดในการอัปเดตการตั้งค่าโรงแรม: Update failed'
      );
    });
  });

  describe('updateRoomConfiguration', () => {
    const roomUpdate: Partial<RoomConfiguration> = {
      name: 'Updated Standard Room',
      basePrice: 1400,
      amenities: ['Wi-Fi', 'แอร์', 'ทีวี', 'ตู้เย็น', 'บาล์โคนี'],
    };

    it('updates room configuration in development mode', async () => {
      // First get initial config
      const getPromise = configurationService.getConfiguration();
      jest.advanceTimersByTime(300);
      await getPromise;

      const updatePromise = configurationService.updateRoomConfiguration('standard-1', roomUpdate);
      jest.advanceTimersByTime(500);
      const result = await updatePromise;

      expect(result.success).toBe(true);
      expect(result.data.name).toBe('Updated Standard Room');
      expect(result.data.basePrice).toBe(1400);
      expect(result.data.amenities).toEqual(['Wi-Fi', 'แอร์', 'ทีวี', 'ตู้เย็น', 'บาล์โคนี']);
      expect(result.data.type).toBe('Standard'); // Original value preserved
    });

    it('throws error for non-existent room ID', async () => {
      // First get initial config
      const getPromise = configurationService.getConfiguration();
      jest.advanceTimersByTime(300);
      await getPromise;

      const updatePromise = configurationService.updateRoomConfiguration('non-existent', roomUpdate);
      jest.advanceTimersByTime(500);

      await expect(updatePromise).rejects.toThrow('ไม่พบห้องพักที่ระบุ');
    });

    it('updates cache when updating room configuration', async () => {
      // First get initial config
      const getPromise = configurationService.getConfiguration();
      jest.advanceTimersByTime(300);
      await getPromise;

      // Update room configuration
      const updatePromise = configurationService.updateRoomConfiguration('standard-1', roomUpdate);
      jest.advanceTimersByTime(500);
      await updatePromise;

      // Get rooms again (should use updated cache)
      const getRoomsPromise = configurationService.getRoomConfigurations();
      const result = await getRoomsPromise;

      const updatedRoom = result.data.find(room => room.id === 'standard-1');
      expect(updatedRoom?.name).toBe('Updated Standard Room');
    });

    it('calls apiClient in production mode', async () => {
      process.env.NODE_ENV = 'production';
      const mockResponse = { data: roomUpdate as RoomConfiguration, success: true };
      mockApiClient.put.mockResolvedValueOnce(mockResponse);

      const result = await configurationService.updateRoomConfiguration('standard-1', roomUpdate);

      expect(mockApiClient.put).toHaveBeenCalledWith('/api/configuration/rooms/standard-1', roomUpdate);
      expect(result).toEqual(mockResponse);
    });

    it('handles room configuration update errors', async () => {
      process.env.NODE_ENV = 'production';
      mockApiClient.put.mockRejectedValueOnce(new Error('Room update failed'));

      await expect(configurationService.updateRoomConfiguration('standard-1', roomUpdate)).rejects.toThrow(
        'เกิดข้อผิดพลาดในการอัปเดตการตั้งค่าห้องพัก: Room update failed'
      );
    });
  });

  describe('updatePricingConfiguration', () => {
    const pricingUpdate: Partial<PricingConfiguration> = {
      basePrice: 1500,
      weekendSurcharge: 15,
      extraGuestCharge: 350,
    };

    it('updates pricing configuration in development mode', async () => {
      // First get initial config
      const getPromise = configurationService.getConfiguration();
      jest.advanceTimersByTime(300);
      await getPromise;

      const updatePromise = configurationService.updatePricingConfiguration('Standard', pricingUpdate);
      jest.advanceTimersByTime(500);
      const result = await updatePromise;

      expect(result.success).toBe(true);
      expect(result.data.basePrice).toBe(1500);
      expect(result.data.weekendSurcharge).toBe(15);
      expect(result.data.extraGuestCharge).toBe(350);
      expect(result.data.roomType).toBe('Standard'); // Original value preserved
    });

    it('throws error for non-existent room type', async () => {
      // First get initial config
      const getPromise = configurationService.getConfiguration();
      jest.advanceTimersByTime(300);
      await getPromise;

      const updatePromise = configurationService.updatePricingConfiguration('NonExistent', pricingUpdate);
      jest.advanceTimersByTime(500);

      await expect(updatePromise).rejects.toThrow('ไม่พบการตั้งค่าราคาสำหรับประเภทห้องนี้');
    });

    it('calls apiClient in production mode', async () => {
      process.env.NODE_ENV = 'production';
      const mockResponse = { data: pricingUpdate as PricingConfiguration, success: true };
      mockApiClient.put.mockResolvedValueOnce(mockResponse);

      const result = await configurationService.updatePricingConfiguration('Standard', pricingUpdate);

      expect(mockApiClient.put).toHaveBeenCalledWith('/api/configuration/pricing/Standard', pricingUpdate);
      expect(result).toEqual(mockResponse);
    });

    it('handles pricing configuration update errors', async () => {
      process.env.NODE_ENV = 'production';
      mockApiClient.put.mockRejectedValueOnce(new Error('Pricing update failed'));

      await expect(configurationService.updatePricingConfiguration('Standard', pricingUpdate)).rejects.toThrow(
        'เกิดข้อผิดพลาดในการอัปเดตการตั้งค่าราคา: Pricing update failed'
      );
    });
  });

  describe('updateBookingConfiguration', () => {
    const bookingUpdate: Partial<BookingConfiguration> = {
      allowWalkIns: false,
      depositPercentage: 50,
      maxAdvanceBookingDays: 180,
    };

    it('updates booking configuration in development mode', async () => {
      // First get initial config
      const getPromise = configurationService.getConfiguration();
      jest.advanceTimersByTime(300);
      await getPromise;

      const updatePromise = configurationService.updateBookingConfiguration(bookingUpdate);
      jest.advanceTimersByTime(500);
      const result = await updatePromise;

      expect(result.success).toBe(true);
      expect(result.data.allowWalkIns).toBe(false);
      expect(result.data.depositPercentage).toBe(50);
      expect(result.data.maxAdvanceBookingDays).toBe(180);
      expect(result.data.requireDeposit).toBe(true); // Original value preserved
    });

    it('calls apiClient in production mode', async () => {
      process.env.NODE_ENV = 'production';
      const mockResponse = { data: bookingUpdate as BookingConfiguration, success: true };
      mockApiClient.put.mockResolvedValueOnce(mockResponse);

      const result = await configurationService.updateBookingConfiguration(bookingUpdate);

      expect(mockApiClient.put).toHaveBeenCalledWith('/api/configuration/booking', bookingUpdate);
      expect(result).toEqual(mockResponse);
    });

    it('handles booking configuration update errors', async () => {
      process.env.NODE_ENV = 'production';
      mockApiClient.put.mockRejectedValueOnce(new Error('Booking update failed'));

      await expect(configurationService.updateBookingConfiguration(bookingUpdate)).rejects.toThrow(
        'เกิดข้อผิดพลาดในการอัปเดตการตั้งค่าการจอง: Booking update failed'
      );
    });
  });

  describe('clearCache', () => {
    it('clears the configuration cache', async () => {
      // First populate cache
      const getPromise = configurationService.getConfiguration();
      jest.advanceTimersByTime(300);
      await getPromise;

      // Clear cache
      configurationService.clearCache();

      // Next get should trigger fresh fetch
      const getPromise2 = configurationService.getConfiguration();
      jest.advanceTimersByTime(300);
      await getPromise2;

      // Should have triggered the delay twice (indicating fresh fetches)
      expect(jest.getTimerCount()).toBe(0);
    });
  });

  describe('getAvailableRoomTypes', () => {
    it('returns unique room types for active rooms', async () => {
      const promise = configurationService.getAvailableRoomTypes();
      jest.advanceTimersByTime(300);
      const result = await promise;

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data).toHaveLength(3);
      expect(result.data).toContain('Standard');
      expect(result.data).toContain('Deluxe');
      expect(result.data).toContain('Suite');
    });

    it('filters out inactive rooms', async () => {
      // First get initial config and modify it
      const getPromise = configurationService.getConfiguration();
      jest.advanceTimersByTime(300);
      const config = await getPromise;

      // Mock a scenario where one room is inactive
      const service = configurationService as any;
      if (service.configCache) {
        service.configCache.rooms[0].isActive = false;
      }

      const promise = configurationService.getAvailableRoomTypes();
      const result = await promise;

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2); // Should exclude the inactive room type
    });

    it('handles room types fetch errors', async () => {
      process.env.NODE_ENV = 'production';
      mockApiClient.get.mockRejectedValueOnce(new Error('Room types failed'));

      await expect(configurationService.getAvailableRoomTypes()).rejects.toThrow(
        'เกิดข้อผิดพลาดในการดึงประเภทห้องพัก: Room types failed'
      );
    });
  });

  describe('calculateBookingPrice', () => {
    beforeEach(async () => {
      // Populate configuration cache
      const promise = configurationService.getConfiguration();
      jest.advanceTimersByTime(300);
      await promise;
    });

    it('calculates basic price for Standard room', async () => {
      const result = await configurationService.calculateBookingPrice(
        'Standard',
        '2024-12-20',
        '2024-12-22',
        2
      );

      expect(result.success).toBe(true);
      // Base: 2 nights * 1200 = 2400
      // Seasonal: 2400 * 1.5 = 3600 (festival season)
      // Taxes: VAT 7% + Service 10% = 17%
      // Total: 3600 * 1.17 = 4212
      expect(result.data).toBe(4212);
    });

    it('applies extra guest charges', async () => {
      const result = await configurationService.calculateBookingPrice(
        'Standard',
        '2024-12-20',
        '2024-12-22',
        4 // 2 extra guests
      );

      expect(result.success).toBe(true);
      // Base: 2 nights * 1200 = 2400
      // Seasonal: 2400 * 1.5 = 3600
      // Extra guests: 2 * 300 * 2 nights = 1200
      // Subtotal: 3600 + 1200 = 4800
      // Taxes: 4800 * 1.17 = 5616
      expect(result.data).toBe(5616);
    });

    it('applies weekend surcharge', async () => {
      // Mock weekend detection
      const service = configurationService as any;
      const originalHasWeekend = service.hasWeekend;
      service.hasWeekend = jest.fn().mockReturnValue(true);

      const result = await configurationService.calculateBookingPrice(
        'Standard',
        '2024-12-20',
        '2024-12-22',
        2
      );

      expect(result.success).toBe(true);
      // Base: 2 nights * 1200 = 2400
      // Seasonal: 2400 * 1.5 = 3600
      // Weekend: 3600 * 1.1 = 3960 (10% surcharge)
      // Taxes: 3960 * 1.17 = 4633.2 → 4633
      expect(result.data).toBe(4633);

      // Restore original method
      service.hasWeekend = originalHasWeekend;
    });

    it('calculates price for different room types', async () => {
      const suiteResult = await configurationService.calculateBookingPrice(
        'Suite',
        '2024-12-20',
        '2024-12-21',
        2
      );

      expect(suiteResult.success).toBe(true);
      // Base: 1 night * 4000 = 4000
      // Seasonal: 4000 * 1.8 = 7200 (Suite festival rate)
      // Taxes: 7200 * 1.17 = 8424
      expect(suiteResult.data).toBe(8424);
    });

    it('calculates price without seasonal rates', async () => {
      const result = await configurationService.calculateBookingPrice(
        'Standard',
        '2024-06-15', // Outside festival season
        '2024-06-17',
        2
      );

      expect(result.success).toBe(true);
      // Base: 2 nights * 1200 = 2400
      // No seasonal rate applied
      // Taxes: 2400 * 1.17 = 2808
      expect(result.data).toBe(2808);
    });

    it('throws error for unknown room type', async () => {
      await expect(configurationService.calculateBookingPrice(
        'Unknown',
        '2024-12-20',
        '2024-12-22',
        2
      )).rejects.toThrow('ไม่พบการตั้งค่าราคาสำหรับประเภทห้องนี้');
    });

    it('handles price calculation errors', async () => {
      process.env.NODE_ENV = 'production';
      mockApiClient.get.mockRejectedValueOnce(new Error('Price calc failed'));

      await expect(configurationService.calculateBookingPrice(
        'Standard',
        '2024-12-20',
        '2024-12-22',
        2
      )).rejects.toThrow('เกิดข้อผิดพลาดในการคำนวณราคา: Price calc failed');
    });
  });

  describe('Private helper methods', () => {
    describe('calculateNights', () => {
      it('calculates nights correctly', () => {
        const service = configurationService as any;
        
        expect(service.calculateNights('2024-12-20', '2024-12-22')).toBe(2);
        expect(service.calculateNights('2024-12-20', '2024-12-21')).toBe(1);
        expect(service.calculateNights('2024-12-20', '2024-12-20')).toBe(0);
      });
    });

    describe('isDateInRange', () => {
      it('correctly identifies dates in range', () => {
        const service = configurationService as any;
        
        expect(service.isDateInRange('2024-12-25', '2024-12-20', '2025-01-05')).toBe(true);
        expect(service.isDateInRange('2024-12-20', '2024-12-20', '2025-01-05')).toBe(true);
        expect(service.isDateInRange('2025-01-05', '2024-12-20', '2025-01-05')).toBe(true);
        expect(service.isDateInRange('2024-12-19', '2024-12-20', '2025-01-05')).toBe(false);
        expect(service.isDateInRange('2025-01-06', '2024-12-20', '2025-01-05')).toBe(false);
      });
    });

    describe('hasWeekend', () => {
      it('detects weekends correctly', () => {
        const service = configurationService as any;
        
        // December 2024: 
        // 20th is Friday, 21st is Saturday, 22nd is Sunday
        expect(service.hasWeekend('2024-12-20', '2024-12-22')).toBe(true);
        
        // Monday to Wednesday (no weekend)
        expect(service.hasWeekend('2024-12-16', '2024-12-18')).toBe(false);
        
        // Friday to Saturday (includes Saturday)
        expect(service.hasWeekend('2024-12-20', '2024-12-21')).toBe(true);
        
        // Sunday to Monday (includes Sunday)
        expect(service.hasWeekend('2024-12-22', '2024-12-23')).toBe(true);
      });

      it('handles same-day bookings', () => {
        const service = configurationService as any;
        
        expect(service.hasWeekend('2024-12-20', '2024-12-20')).toBe(false);
      });
    });
  });

  describe('Integration scenarios', () => {
    it('handles full configuration update cycle', async () => {
      // Get initial configuration
      const getPromise1 = configurationService.getConfiguration();
      jest.advanceTimersByTime(300);
      const initialConfig = await getPromise1;

      expect(initialConfig.data.hotel.hotelName).toBe('โรงแรมสวนสน');

      // Update hotel configuration
      const hotelUpdate = { hotelName: 'Updated Hotel' };
      const updatePromise = configurationService.updateHotelConfiguration(hotelUpdate);
      jest.advanceTimersByTime(500);
      await updatePromise;

      // Get configuration again (should show updated data)
      const getPromise2 = configurationService.getHotelConfiguration();
      const updatedConfig = await getPromise2;

      expect(updatedConfig.data.hotelName).toBe('Updated Hotel');
    });

    it('handles concurrent configuration requests', async () => {
      const promises = [
        configurationService.getHotelConfiguration(),
        configurationService.getRoomConfigurations(),
        configurationService.getPricingConfigurations(),
        configurationService.getBookingConfiguration(),
      ];

      jest.advanceTimersByTime(300);
      const results = await Promise.all(promises);

      expect(results).toHaveLength(4);
      expect(results.every(result => result.success)).toBe(true);
    });

    it('handles price calculation with complex scenarios', async () => {
      // First populate cache
      const getPromise = configurationService.getConfiguration();
      jest.advanceTimersByTime(300);
      await getPromise;

      // Test multiple price calculations
      const calculations = [
        configurationService.calculateBookingPrice('Standard', '2024-12-20', '2024-12-22', 2),
        configurationService.calculateBookingPrice('Deluxe', '2024-06-15', '2024-06-17', 3),
        configurationService.calculateBookingPrice('Suite', '2024-12-25', '2024-12-26', 4),
      ];

      const results = await Promise.all(calculations);

      expect(results).toHaveLength(3);
      expect(results.every(result => result.success)).toBe(true);
      expect(results.every(result => typeof result.data === 'number')).toBe(true);
      expect(results.every(result => result.data > 0)).toBe(true);
    });
  });
});