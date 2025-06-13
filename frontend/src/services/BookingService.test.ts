// src/services/BookingService.test.ts
import { bookingService } from './BookingService';
import type { 
  BookingCreateRequest, 
  BookingUpdateRequest, 
  BookingSearchParams, 
  BookingStats 
} from './BookingService';
import type { Booking, BookingStatus } from '../types';
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

// Mock console.error to avoid noise in tests
const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

// Helper function to simulate jest.runAllTimersAsync() for older Jest versions
const runAllTimersAsync = async () => {
  // Run all currently scheduled timers
  jest.runAllTimers();
  // Allow microtasks to process
  await Promise.resolve();
  // Run any newly scheduled timers from the microtasks
  jest.runAllTimers();
};

describe('BookingService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    consoleErrorSpy.mockClear();
    
    // Reset NODE_ENV to development for mock behavior
    process.env.NODE_ENV = 'development';
  });

  afterEach(() => {
    jest.useRealTimers();
    consoleErrorSpy.mockRestore();
  });

  describe('getBookings', () => {
    it('returns mock bookings in development mode', async () => {
      const promise = bookingService.getBookings();
      
      // Fast-forward through all timers
await runAllTimersAsync();
      
      const result = await promise;
      
      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data[0]).toHaveProperty('id');
      expect(result.data[0]).toHaveProperty('guestName');
      expect(result.data[0]).toHaveProperty('phone');
      expect(result.data[0]).toHaveProperty('roomNumber');
    });

    it('calls apiClient in production mode', async () => {
      process.env.NODE_ENV = 'production';
      const mockResponse = { 
        data: [{ id: 'BK001', guestName: 'Test Guest' }], 
        success: true 
      };
      mockApiClient.get.mockResolvedValueOnce(mockResponse);

      const result = await bookingService.getBookings();

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/bookings', {});
      expect(result).toEqual(mockResponse);
    });

    it('applies search filters correctly', async () => {
      const params: BookingSearchParams = {
        status: 'confirmed',
        searchTerm: 'นิรันดร์',
        dateFrom: '2024-12-01',
        dateTo: '2024-12-31',
        roomType: 'Suite',
        limit: 10,
        offset: 0,
      };

      const promise = bookingService.getBookings(params);
await runAllTimersAsync();
      const result = await promise;

      expect(result.success).toBe(true);
      // Should filter by status = 'confirmed'
      expect(result.data.every(booking => booking.status === 'confirmed')).toBe(true);
      // Should filter by searchTerm
      expect(result.data.some(booking => 
        booking.guestName.includes('นิรันดร์')
      )).toBe(true);
    });

    it('handles undefined and null filter values', async () => {
      const params: BookingSearchParams = {
        status: undefined,
        searchTerm: undefined,
        dateFrom: null as any,
        dateTo: null as any,
      };

      const promise = bookingService.getBookings(params);
await runAllTimersAsync();
      const result = await promise;

      expect(result.success).toBe(true);
      expect(result.data.length).toBeGreaterThan(0);
    });

    it('handles errors gracefully', async () => {
      process.env.NODE_ENV = 'production';
      mockApiClient.get.mockRejectedValueOnce(new Error('Network error'));

      await expect(bookingService.getBookings()).rejects.toThrow(
        'เกิดข้อผิดพลาดในการดึงข้อมูลการจอง: Network error'
      );
    });

    it('handles non-Error exceptions', async () => {
      process.env.NODE_ENV = 'production';
      mockApiClient.get.mockRejectedValueOnce('String error');

      await expect(bookingService.getBookings()).rejects.toThrow(
        'เกิดข้อผิดพลาดในการดึงข้อมูลการจอง: Unknown error'
      );
    });
  });

  describe('getBooking', () => {
    it('returns specific booking by ID in development mode', async () => {
      const promise = bookingService.getBooking('BK001');
await runAllTimersAsync();
      const result = await promise;

      expect(result.success).toBe(true);
      expect(result.data.id).toBe('BK001');
      expect(result.data.guestName).toBe('สมชาย ใจดี');
    });

    it('throws error for non-existent booking in development mode', async () => {
      const promise = bookingService.getBooking('NONEXISTENT');
await runAllTimersAsync();

      await expect(promise).rejects.toThrow('ไม่พบการจองที่ระบุ');
    });

    it('calls apiClient in production mode', async () => {
      process.env.NODE_ENV = 'production';
      const mockResponse = { 
        data: { id: 'BK001', guestName: 'Test Guest' }, 
        success: true 
      };
      mockApiClient.get.mockResolvedValueOnce(mockResponse);

      const result = await bookingService.getBooking('BK001');

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/bookings/BK001');
      expect(result).toEqual(mockResponse);
    });

    it('handles production errors', async () => {
      process.env.NODE_ENV = 'production';
      mockApiClient.get.mockRejectedValueOnce(new Error('Not found'));

      await expect(bookingService.getBooking('BK999')).rejects.toThrow(
        'เกิดข้อผิดพลาดในการดึงข้อมูลการจอง: Not found'
      );
    });
  });

  describe('createBooking', () => {
    const mockBookingData: BookingCreateRequest = {
      guestName: 'ทดสอบ การจอง',
      phone: '081-999-8888',
      email: 'test@example.com',
      roomType: 'Standard',
      checkInDate: '2024-12-20',
      checkOutDate: '2024-12-22',
      guests: 2,
      specialRequests: 'ต้องการเตียงเสริม',
    };

    it('creates booking successfully in development mode', async () => {
      const promise = bookingService.createBooking(mockBookingData);
await runAllTimersAsync();
      const result = await promise;

      expect(result.success).toBe(true);
      expect(result.data.guestName).toBe(mockBookingData.guestName);
      expect(result.data.phone).toBe(mockBookingData.phone);
      expect(result.data.email).toBe(mockBookingData.email);
      expect(result.data.roomType).toBe(mockBookingData.roomType);
      expect(result.data.checkInDate).toBe(mockBookingData.checkInDate);
      expect(result.data.checkOutDate).toBe(mockBookingData.checkOutDate);
      expect(result.data.guests).toBe(mockBookingData.guests);
      expect(result.data.specialRequests).toBe(mockBookingData.specialRequests);
      expect(result.data.id).toMatch(/^BK\d+$/);
      expect(result.data.status).toBe('confirmed');
      expect(result.data.nights).toBe(2);
      expect(result.data.totalPrice).toBe(2400); // 2 nights * 1200 (Standard rate)
      expect(result.data.roomNumber).toMatch(/^10[1-5]$/); // Standard room numbers
      expect(result.data.createdAt).toBeDefined();
      expect(result.data.updatedAt).toBeDefined();
    });

    it('calculates price correctly for different room types', async () => {
      const suiteBooking = {
        ...mockBookingData,
        roomType: 'Suite',
        checkInDate: '2024-12-20',
        checkOutDate: '2024-12-21', // 1 night
      };

      const promise = bookingService.createBooking(suiteBooking);
await runAllTimersAsync();
      const result = await promise;

      expect(result.data.nights).toBe(1);
      expect(result.data.totalPrice).toBe(4000); // 1 night * 4000 (Suite rate)
    });

    it('assigns correct room numbers by type', async () => {
      const deluxeBooking = { ...mockBookingData, roomType: 'Deluxe' };

      const promise = bookingService.createBooking(deluxeBooking);
await runAllTimersAsync();
      const result = await promise;

      expect(result.data.roomNumber).toMatch(/^20[1-5]$/); // Deluxe room numbers
    });

    it('calls apiClient in production mode', async () => {
      process.env.NODE_ENV = 'production';
      const mockResponse = { 
        data: { ...mockBookingData, id: 'BK001' }, 
        success: true 
      };
      mockApiClient.post.mockResolvedValueOnce(mockResponse);

      const result = await bookingService.createBooking(mockBookingData);

      expect(mockApiClient.post).toHaveBeenCalledWith('/api/bookings', mockBookingData);
      expect(result).toEqual(mockResponse);
    });

    it('handles creation errors', async () => {
      process.env.NODE_ENV = 'production';
      mockApiClient.post.mockRejectedValueOnce(new Error('Validation failed'));

      await expect(bookingService.createBooking(mockBookingData)).rejects.toThrow(
        'เกิดข้อผิดพลาดในการสร้างการจอง: Validation failed'
      );
    });
  });

  describe('updateBooking', () => {
    const updateData: BookingUpdateRequest = {
      guestName: 'Updated Name',
      specialRequests: 'Updated requests',
      guests: 3,
    };

    it('updates booking successfully in development mode', async () => {
      const promise = bookingService.updateBooking('BK001', updateData);
      
      // Fast-forward through all timers
await runAllTimersAsync();
      
      const result = await promise;

      expect(result.success).toBe(true);
      expect(result.data.guestName).toBe(updateData.guestName);
      expect(result.data.specialRequests).toBe(updateData.specialRequests);
      expect(result.data.guests).toBe(updateData.guests);
      expect(result.data.updatedAt).toBeDefined();
    });

    it('recalculates price when dates and room type change', async () => {
      const updateWithDates: BookingUpdateRequest = {
        checkInDate: '2024-12-20',
        checkOutDate: '2024-12-23', // 3 nights
        roomType: 'Deluxe',
      };

      const promise = bookingService.updateBooking('BK001', updateWithDates);
      
      // Fast-forward through all timers
await runAllTimersAsync();
      const result = await promise;

      expect(result.data.nights).toBe(3);
      expect(result.data.totalPrice).toBe(4800); // 3 nights * 1600 (Deluxe rate)
    });

    it('preserves original price when only partial updates', async () => {
      const partialUpdate: BookingUpdateRequest = {
        guestName: 'New Name Only',
      };

      const promise = bookingService.updateBooking('BK001', partialUpdate);
      
      // Fast-forward through all timers
await runAllTimersAsync();
      const result = await promise;

      expect(result.data.guestName).toBe(partialUpdate.guestName);
      expect(result.data.totalPrice).toBe(2400); // Original price preserved
    });

    it('throws error for non-existent booking', async () => {
      const promise = bookingService.updateBooking('NONEXISTENT', updateData);
      
      // Fast-forward through all timers
await runAllTimersAsync();

      await expect(promise).rejects.toThrow('ไม่พบการจองที่ระบุ');
    });

    it('calls apiClient in production mode', async () => {
      process.env.NODE_ENV = 'production';
      const mockResponse = { 
        data: { id: 'BK001', ...updateData }, 
        success: true 
      };
      mockApiClient.put.mockResolvedValueOnce(mockResponse);

      const result = await bookingService.updateBooking('BK001', updateData);

      expect(mockApiClient.put).toHaveBeenCalledWith('/api/bookings/BK001', updateData);
      expect(result).toEqual(mockResponse);
    });

    it('handles update errors', async () => {
      process.env.NODE_ENV = 'production';
      mockApiClient.put.mockRejectedValueOnce(new Error('Update failed'));

      await expect(bookingService.updateBooking('BK001', updateData)).rejects.toThrow(
        'เกิดข้อผิดพลาดในการอัปเดตการจอง: Update failed'
      );
    });
  });

  describe('updateBookingStatus', () => {
    it('updates status successfully in development mode', async () => {
      const promise = bookingService.updateBookingStatus('BK001', 'checked_in');
      
await runAllTimersAsync();
      const result = await promise;

      expect(result.success).toBe(true);
      expect(result.data.status).toBe('checked_in');
      expect(result.data.id).toBe('BK001');
      expect(result.data.updatedAt).toBeDefined();
    });

    it('throws error for non-existent booking', async () => {
      const promise = bookingService.updateBookingStatus('NONEXISTENT', 'checked_in');
      
await runAllTimersAsync();

      await expect(promise).rejects.toThrow('ไม่พบการจองที่ระบุ');
    });

    it('calls apiClient in production mode', async () => {
      process.env.NODE_ENV = 'production';
      const mockResponse = { 
        data: { id: 'BK001', status: 'checked_in' }, 
        success: true 
      };
      mockApiClient.patch.mockResolvedValueOnce(mockResponse);

      const result = await bookingService.updateBookingStatus('BK001', 'checked_in');

      expect(mockApiClient.patch).toHaveBeenCalledWith('/api/bookings/BK001/status', { 
        status: 'checked_in' 
      });
      expect(result).toEqual(mockResponse);
    });

    it('handles status update errors', async () => {
      process.env.NODE_ENV = 'production';
      mockApiClient.patch.mockRejectedValueOnce(new Error('Status update failed'));

      await expect(bookingService.updateBookingStatus('BK001', 'checked_in')).rejects.toThrow(
        'เกิดข้อผิดพลาดในการอัปเดตสถานะการจอง: Status update failed'
      );
    });
  });

  describe('cancelBooking', () => {
    it('cancels booking with reason in development mode', async () => {
      const reason = 'เปลี่ยนแปลงแผนการเดินทาง';
      const promise = bookingService.cancelBooking('BK001', reason);
      
await runAllTimersAsync();
      const result = await promise;

      expect(result.success).toBe(true);
      expect(result.data.status).toBe('cancelled');
      expect(result.data.specialRequests).toContain(`ยกเลิกการจอง: ${reason}`);
      expect(result.data.updatedAt).toBeDefined();
    });

    it('cancels booking without reason', async () => {
      const promise = bookingService.cancelBooking('BK001');
      
await runAllTimersAsync();
      const result = await promise;

      expect(result.success).toBe(true);
      expect(result.data.status).toBe('cancelled');
      expect(result.data.specialRequests).toContain('ยกเลิกการจอง: ไม่ระบุเหตุผล');
    });

    it('appends cancellation reason to existing special requests', async () => {
      const reason = 'ฉุกเฉิน';
      // BK001 already has special requests
      const promise = bookingService.cancelBooking('BK001', reason);
      
await runAllTimersAsync();
      const result = await promise;

      expect(result.data.specialRequests).toContain('ต้องการห้องชั้นล่าง'); // Original
      expect(result.data.specialRequests).toContain(`ยกเลิกการจอง: ${reason}`); // Added
    });

    it('handles booking without existing special requests', async () => {
      // BK002 doesn't have special requests
      const reason = 'ยกเลิกทันที';
      const promise = bookingService.cancelBooking('BK002', reason);
      
await runAllTimersAsync();
      const result = await promise;

      expect(result.data.specialRequests).toBe(`ยกเลิกการจอง: ${reason}`);
    });

    it('throws error for non-existent booking', async () => {
      const promise = bookingService.cancelBooking('NONEXISTENT', 'test reason');
      
await runAllTimersAsync();

      await expect(promise).rejects.toThrow('ไม่พบการจองที่ระบุ');
    });

    it('calls apiClient in production mode', async () => {
      process.env.NODE_ENV = 'production';
      const reason = 'Cancel reason';
      const mockResponse = { 
        data: { id: 'BK001', status: 'cancelled' }, 
        success: true 
      };
      mockApiClient.patch.mockResolvedValueOnce(mockResponse);

      const result = await bookingService.cancelBooking('BK001', reason);

      expect(mockApiClient.patch).toHaveBeenCalledWith('/api/bookings/BK001/cancel', { 
        reason 
      });
      expect(result).toEqual(mockResponse);
    });

    it('handles cancellation errors', async () => {
      process.env.NODE_ENV = 'production';
      mockApiClient.patch.mockRejectedValueOnce(new Error('Cancellation failed'));

      await expect(bookingService.cancelBooking('BK001', 'reason')).rejects.toThrow(
        'เกิดข้อผิดพลาดในการยกเลิกการจอง: Cancellation failed'
      );
    });
  });

  describe('deleteBooking', () => {
    it('deletes booking successfully in development mode', async () => {
      const promise = bookingService.deleteBooking('BK001');
await runAllTimersAsync();
      const result = await promise;

      expect(result.success).toBe(true);
      expect(result.data).toBeUndefined();
    });

    it('calls apiClient in production mode', async () => {
      process.env.NODE_ENV = 'production';
      const mockResponse = { data: undefined, success: true };
      mockApiClient.delete.mockResolvedValueOnce(mockResponse);

      const result = await bookingService.deleteBooking('BK001');

      expect(mockApiClient.delete).toHaveBeenCalledWith('/api/bookings/BK001');
      expect(result).toEqual(mockResponse);
    });

    it('handles deletion errors', async () => {
      process.env.NODE_ENV = 'production';
      mockApiClient.delete.mockRejectedValueOnce(new Error('Deletion failed'));

      await expect(bookingService.deleteBooking('BK001')).rejects.toThrow(
        'เกิดข้อผิดพลาดในการลบการจอง: Deletion failed'
      );
    });
  });

  describe('getBookingStats', () => {
    it('returns mock statistics in development mode', async () => {
      const promise = bookingService.getBookingStats();
await runAllTimersAsync();
      const result = await promise;

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('totalBookings');
      expect(result.data).toHaveProperty('todayArrivals');
      expect(result.data).toHaveProperty('todayDepartures');
      expect(result.data).toHaveProperty('currentOccupancy');
      expect(result.data).toHaveProperty('availableRooms');
      expect(result.data).toHaveProperty('revenue');
      expect(result.data.revenue).toHaveProperty('today');
      expect(result.data.revenue).toHaveProperty('thisWeek');
      expect(result.data.revenue).toHaveProperty('thisMonth');
      expect(typeof result.data.totalBookings).toBe('number');
      expect(typeof result.data.revenue.today).toBe('number');
    });

    it('calls apiClient in production mode', async () => {
      process.env.NODE_ENV = 'production';
      const mockStats: BookingStats = {
        totalBookings: 20,
        todayArrivals: 5,
        todayDepartures: 3,
        currentOccupancy: 12,
        availableRooms: 8,
        revenue: {
          today: 6000,
          thisWeek: 35000,
          thisMonth: 150000,
        },
      };
      const mockResponse = { data: mockStats, success: true };
      mockApiClient.get.mockResolvedValueOnce(mockResponse);

      const result = await bookingService.getBookingStats();

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/bookings/stats');
      expect(result).toEqual(mockResponse);
    });

    it('handles statistics errors', async () => {
      process.env.NODE_ENV = 'production';
      mockApiClient.get.mockRejectedValueOnce(new Error('Stats failed'));

      await expect(bookingService.getBookingStats()).rejects.toThrow(
        'เกิดข้อผิดพลาดในการดึงสถิติการจอง: Stats failed'
      );
    });
  });

  describe('searchBookings', () => {
    it('searches bookings by guest name in development mode', async () => {
      const promise = bookingService.searchBookings('สมชาย');
await runAllTimersAsync();
      const result = await promise;

      expect(result.success).toBe(true);
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data[0].guestName).toContain('สมชาย');
    });

    it('searches bookings by phone number', async () => {
      const promise = bookingService.searchBookings('081-234-5678');
await runAllTimersAsync();
      const result = await promise;

      expect(result.success).toBe(true);
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data[0].phone).toBe('081-234-5678');
    });

    it('searches bookings by email', async () => {
      const promise = bookingService.searchBookings('niran@example.com');
await runAllTimersAsync();
      const result = await promise;

      expect(result.success).toBe(true);
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data[0].email).toBe('niran@example.com');
    });

    it('searches bookings by booking ID', async () => {
      const promise = bookingService.searchBookings('BK003');
await runAllTimersAsync();
      const result = await promise;

      expect(result.success).toBe(true);
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data[0].id).toBe('BK003');
    });

    it('returns empty array for no matches', async () => {
      const promise = bookingService.searchBookings('nonexistent');
await runAllTimersAsync();
      const result = await promise;

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });

    it('performs case-insensitive search', async () => {
      const promise = bookingService.searchBookings('วิชัย');
      
await runAllTimersAsync();
      
      const result = await promise;

      expect(result.success).toBe(true);
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data[0].guestName.toLowerCase()).toContain('วิชัย');
    });

    it('calls apiClient in production mode', async () => {
      process.env.NODE_ENV = 'production';
      const mockResponse = { 
        data: [{ id: 'BK001', guestName: 'Test Guest' }], 
        success: true 
      };
      mockApiClient.get.mockResolvedValueOnce(mockResponse);

      const result = await bookingService.searchBookings('test query');

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/bookings/search', { 
        q: 'test query' 
      });
      expect(result).toEqual(mockResponse);
    });

    it('handles search errors', async () => {
      process.env.NODE_ENV = 'production';
      mockApiClient.get.mockRejectedValueOnce(new Error('Search failed'));

      await expect(bookingService.searchBookings('query')).rejects.toThrow(
        'เกิดข้อผิดพลาดในการค้นหาการจอง: Search failed'
      );
    });
  });

  describe('Private helper methods', () => {
    describe('calculateNights', () => {
      it('calculates nights correctly for same dates', () => {
        // Access private method through any
        const service = bookingService as any;
        
        const nights = service.calculateNights('2024-12-20', '2024-12-20');
        expect(nights).toBe(0);
      });

      it('calculates nights correctly for consecutive dates', () => {
        const service = bookingService as any;
        
        const nights = service.calculateNights('2024-12-20', '2024-12-21');
        expect(nights).toBe(1);
      });

      it('calculates nights correctly for multiple days', () => {
        const service = bookingService as any;
        
        const nights = service.calculateNights('2024-12-20', '2024-12-25');
        expect(nights).toBe(5);
      });
    });

    describe('calculatePrice', () => {
      it('calculates price for Standard room', () => {
        const service = bookingService as any;
        
        const price = service.calculatePrice('Standard', '2024-12-20', '2024-12-22');
        expect(price).toBe(2400); // 2 nights * 1200
      });

      it('calculates price for Deluxe room', () => {
        const service = bookingService as any;
        
        const price = service.calculatePrice('Deluxe', '2024-12-20', '2024-12-23');
        expect(price).toBe(4800); // 3 nights * 1600
      });

      it('calculates price for Suite room', () => {
        const service = bookingService as any;
        
        const price = service.calculatePrice('Suite', '2024-12-20', '2024-12-21');
        expect(price).toBe(4000); // 1 night * 4000
      });

      it('defaults to Standard price for unknown room type', () => {
        const service = bookingService as any;
        
        const price = service.calculatePrice('Unknown', '2024-12-20', '2024-12-22');
        expect(price).toBe(2400); // 2 nights * 1200 (Standard rate)
      });
    });

    describe('generateRoomNumber', () => {
      it('generates valid room number for Standard rooms', () => {
        const service = bookingService as any;
        
        const roomNumber = service.generateRoomNumber('Standard');
        expect(roomNumber).toMatch(/^10[1-5]$/);
      });

      it('generates valid room number for Deluxe rooms', () => {
        const service = bookingService as any;
        
        const roomNumber = service.generateRoomNumber('Deluxe');
        expect(roomNumber).toMatch(/^20[1-5]$/);
      });

      it('generates valid room number for Suite rooms', () => {
        const service = bookingService as any;
        
        const roomNumber = service.generateRoomNumber('Suite');
        expect(roomNumber).toMatch(/^30[1-3]$/);
      });

      it('defaults to Standard room numbers for unknown type', () => {
        const service = bookingService as any;
        
        const roomNumber = service.generateRoomNumber('Unknown');
        expect(roomNumber).toMatch(/^10[1-5]$/);
      });
    });
  });

  describe('Integration scenarios', () => {
    it.skip('handles full booking lifecycle', async () => {
      // Create booking
      const createData: BookingCreateRequest = {
        guestName: 'Integration Test',
        phone: '081-999-9999',
        roomType: 'Standard',
        checkInDate: '2024-12-20',
        checkOutDate: '2024-12-22',
        guests: 2,
      };

      const createPromise = bookingService.createBooking(createData);
      const updatePromise = createPromise.then(result => {
        const bookingId = result.data.id;
        return bookingService.updateBooking(bookingId, { guestName: 'Updated Name' });
      });
      const statusPromise = updatePromise.then(result => {
        return bookingService.updateBookingStatus(result.data.id, 'checked_in');
      });
      const cancelPromise = statusPromise.then(result => {
        return bookingService.cancelBooking(result.data.id, 'Test cancellation');
      });

      // Fast-forward through all timers
await runAllTimersAsync();
      
      const createResult = await createPromise;
      const updateResult = await updatePromise;
      const statusResult = await statusPromise;
      const cancelResult = await cancelPromise;

      // Verify create result
      expect(createResult.success).toBe(true);
      const bookingId = createResult.data.id;

      // Verify update result
      expect(updateResult.success).toBe(true);
      expect(updateResult.data.guestName).toBe('Updated Name');

      // Verify status result
      expect(statusResult.success).toBe(true);
      expect(statusResult.data.status).toBe('checked_in');

      // Verify cancel result

      expect(cancelResult.success).toBe(true);
      expect(cancelResult.data.status).toBe('cancelled');
    });

    it('handles concurrent requests', async () => {
      const promises = [
        bookingService.getBookingStats(),
        bookingService.searchBookings('test'),
        bookingService.getBookings({ limit: 5 }),
      ];

await runAllTimersAsync();
      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      expect(results.every(result => result.success)).toBe(true);
    });
  });
});