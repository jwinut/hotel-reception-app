// src/services/BookingService.ts
import { apiClient, ApiResponse } from './apiClient';
import type { Booking, BookingStatus, BookingFilters, Guest, Room } from '../types';

export interface BookingCreateRequest {
  guestName: string;
  phone: string;
  email?: string;
  roomType: string;
  checkInDate: string;
  checkOutDate: string;
  guests: number;
  specialRequests?: string;
}

export interface BookingUpdateRequest {
  guestName?: string;
  phone?: string;
  email?: string;
  roomNumber?: string;
  roomType?: string;
  checkInDate?: string;
  checkOutDate?: string;
  guests?: number;
  specialRequests?: string;
  status?: BookingStatus;
}

export interface BookingSearchParams {
  searchTerm?: string;
  status?: BookingStatus | 'all';
  dateFrom?: string;
  dateTo?: string;
  roomType?: string;
  limit?: number;
  offset?: number;
}

export interface BookingStats {
  totalBookings: number;
  todayArrivals: number;
  todayDepartures: number;
  currentOccupancy: number;
  availableRooms: number;
  revenue: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
}

class BookingService {
  private readonly endpoint = '/api/bookings';

  // Fetch all bookings with optional filters
  async getBookings(params?: BookingSearchParams): Promise<ApiResponse<Booking[]>> {
    try {
      // In development, return mock data
      if (process.env.NODE_ENV === 'development') {
        return this.getMockBookings(params);
      }

      const queryParams: Record<string, string> = {};
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams[key] = value.toString();
          }
        });
      }

      return await apiClient.get<Booking[]>(this.endpoint, queryParams);
    } catch (error) {
      throw new Error(`เกิดข้อผิดพลาดในการดึงข้อมูลการจอง: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get a single booking by ID
  async getBooking(id: string): Promise<ApiResponse<Booking>> {
    try {
      if (process.env.NODE_ENV === 'development') {
        const mockData = await this.getMockBookings();
        const booking = mockData.data.find(b => b.id === id);
        if (!booking) {
          throw new Error('ไม่พบการจองที่ระบุ');
        }
        return { data: booking, success: true };
      }

      return await apiClient.get<Booking>(`${this.endpoint}/${id}`);
    } catch (error) {
      throw new Error(`เกิดข้อผิดพลาดในการดึงข้อมูลการจอง: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Create a new booking
  async createBooking(bookingData: BookingCreateRequest): Promise<ApiResponse<Booking>> {
    try {
      if (process.env.NODE_ENV === 'development') {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const newBooking: Booking = {
          id: `BK${Date.now()}`,
          ...bookingData,
          roomNumber: this.generateRoomNumber(bookingData.roomType),
          nights: this.calculateNights(bookingData.checkInDate, bookingData.checkOutDate),
          status: 'confirmed',
          totalPrice: this.calculatePrice(bookingData.roomType, bookingData.checkInDate, bookingData.checkOutDate),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        return { data: newBooking, success: true };
      }

      return await apiClient.post<Booking>(this.endpoint, bookingData);
    } catch (error) {
      throw new Error(`เกิดข้อผิดพลาดในการสร้างการจอง: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Update an existing booking
  async updateBooking(id: string, updates: BookingUpdateRequest): Promise<ApiResponse<Booking>> {
    try {
      if (process.env.NODE_ENV === 'development') {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const mockData = await this.getMockBookings();
        const booking = mockData.data.find(b => b.id === id);
        if (!booking) {
          throw new Error('ไม่พบการจองที่ระบุ');
        }

        const updatedBooking: Booking = {
          ...booking,
          ...updates,
          nights: updates.checkInDate && updates.checkOutDate 
            ? this.calculateNights(updates.checkInDate, updates.checkOutDate)
            : booking.nights,
          totalPrice: updates.checkInDate && updates.checkOutDate && updates.roomType
            ? this.calculatePrice(updates.roomType, updates.checkInDate, updates.checkOutDate)
            : booking.totalPrice,
          updatedAt: new Date().toISOString(),
        };

        return { data: updatedBooking, success: true };
      }

      return await apiClient.put<Booking>(`${this.endpoint}/${id}`, updates);
    } catch (error) {
      throw new Error(`เกิดข้อผิดพลาดในการอัปเดตการจอง: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Update booking status only
  async updateBookingStatus(id: string, status: BookingStatus): Promise<ApiResponse<Booking>> {
    try {
      if (process.env.NODE_ENV === 'development') {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const mockData = await this.getMockBookings();
        const booking = mockData.data.find(b => b.id === id);
        if (!booking) {
          throw new Error('ไม่พบการจองที่ระบุ');
        }

        const updatedBooking: Booking = {
          ...booking,
          status,
          updatedAt: new Date().toISOString(),
        };

        return { data: updatedBooking, success: true };
      }

      return await apiClient.patch<Booking>(`${this.endpoint}/${id}/status`, { status });
    } catch (error) {
      throw new Error(`เกิดข้อผิดพลาดในการอัปเดตสถานะการจอง: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Cancel a booking
  async cancelBooking(id: string, reason?: string): Promise<ApiResponse<Booking>> {
    try {
      if (process.env.NODE_ENV === 'development') {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const mockData = await this.getMockBookings();
        const booking = mockData.data.find(b => b.id === id);
        if (!booking) {
          throw new Error('ไม่พบการจองที่ระบุ');
        }

        const cancelledBooking: Booking = {
          ...booking,
          status: 'cancelled',
          specialRequests: booking.specialRequests 
            ? `${booking.specialRequests}\n\nยกเลิกการจอง: ${reason || 'ไม่ระบุเหตุผล'}`
            : `ยกเลิกการจอง: ${reason || 'ไม่ระบุเหตุผล'}`,
          updatedAt: new Date().toISOString(),
        };

        return { data: cancelledBooking, success: true };
      }

      return await apiClient.patch<Booking>(`${this.endpoint}/${id}/cancel`, { reason });
    } catch (error) {
      throw new Error(`เกิดข้อผิดพลาดในการยกเลิกการจอง: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Delete a booking (admin only)
  async deleteBooking(id: string): Promise<ApiResponse<void>> {
    try {
      if (process.env.NODE_ENV === 'development') {
        await new Promise(resolve => setTimeout(resolve, 300));
        return { data: undefined, success: true };
      }

      return await apiClient.delete<void>(`${this.endpoint}/${id}`);
    } catch (error) {
      throw new Error(`เกิดข้อผิดพลาดในการลบการจอง: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get booking statistics
  async getBookingStats(): Promise<ApiResponse<BookingStats>> {
    try {
      if (process.env.NODE_ENV === 'development') {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const stats: BookingStats = {
          totalBookings: 15,
          todayArrivals: 3,
          todayDepartures: 2,
          currentOccupancy: 8,
          availableRooms: 12,
          revenue: {
            today: 4800,
            thisWeek: 28500,
            thisMonth: 125000,
          },
        };

        return { data: stats, success: true };
      }

      return await apiClient.get<BookingStats>(`${this.endpoint}/stats`);
    } catch (error) {
      throw new Error(`เกิดข้อผิดพลาดในการดึงสถิติการจอง: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Search bookings by guest name or phone
  async searchBookings(query: string): Promise<ApiResponse<Booking[]>> {
    try {
      if (process.env.NODE_ENV === 'development') {
        const mockData = await this.getMockBookings();
        const filteredBookings = mockData.data.filter(booking => 
          booking.guestName.toLowerCase().includes(query.toLowerCase()) ||
          booking.phone.includes(query) ||
          booking.email?.toLowerCase().includes(query.toLowerCase()) ||
          booking.id.toLowerCase().includes(query.toLowerCase())
        );

        return { data: filteredBookings, success: true };
      }

      return await apiClient.get<Booking[]>(`${this.endpoint}/search`, { q: query });
    } catch (error) {
      throw new Error(`เกิดข้อผิดพลาดในการค้นหาการจอง: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Private helper methods
  private async getMockBookings(params?: BookingSearchParams): Promise<ApiResponse<Booking[]>> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

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
      {
        id: 'BK003',
        guestName: 'นิรันดร์ บริสุทธิ์',
        phone: '092-345-6789',
        email: 'niran@example.com',
        roomNumber: '201',
        roomType: 'Suite',
        checkInDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0] as string,
        checkOutDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] as string,
        nights: 2,
        guests: 4,
        status: 'confirmed',
        totalPrice: 8000,
        specialRequests: 'ต้องการเตียงเสริม 1 เตียง',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    // Apply filters if provided
    let filteredBookings = mockBookings;
    
    if (params?.status && params.status !== 'all') {
      filteredBookings = filteredBookings.filter(booking => booking.status === params.status);
    }

    if (params?.searchTerm) {
      const term = params.searchTerm.toLowerCase();
      filteredBookings = filteredBookings.filter(booking => 
        booking.guestName.toLowerCase().includes(term) ||
        booking.phone.includes(term) ||
        booking.email?.toLowerCase().includes(term) ||
        booking.id.toLowerCase().includes(term)
      );
    }

    return { data: filteredBookings, success: true };
  }

  private generateRoomNumber(roomType: string): string {
    const roomNumbers = {
      'Standard': ['101', '102', '103', '104', '105'],
      'Deluxe': ['201', '202', '203', '204', '205'],
      'Suite': ['301', '302', '303'],
    };

    const availableRooms = roomNumbers[roomType as keyof typeof roomNumbers] || roomNumbers['Standard'];
    return availableRooms[Math.floor(Math.random() * availableRooms.length)] as string;
  }

  private calculateNights(checkInDate: string, checkOutDate: string): number {
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const diffTime = checkOut.getTime() - checkIn.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  private calculatePrice(roomType: string, checkInDate: string, checkOutDate: string): number {
    const nights = this.calculateNights(checkInDate, checkOutDate);
    const pricePerNight = {
      'Standard': 1200,
      'Deluxe': 1600,
      'Suite': 4000,
    };

    return nights * (pricePerNight[roomType as keyof typeof pricePerNight] || pricePerNight['Standard']);
  }
}

// Export singleton instance
export const bookingService = new BookingService();
export default BookingService;