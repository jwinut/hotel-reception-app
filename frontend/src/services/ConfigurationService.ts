// src/services/ConfigurationService.ts
import { apiClient, ApiResponse } from './apiClient';

export interface HotelConfiguration {
  hotelName: string;
  hotelAddress: string;
  hotelPhone: string;
  hotelEmail: string;
  checkInTime: string;
  checkOutTime: string;
  currency: string;
  timeZone: string;
  language: 'th' | 'en';
  theme: 'light' | 'dark';
}

export interface RoomConfiguration {
  id: string;
  name: string;
  type: string;
  capacity: number;
  basePrice: number;
  amenities: string[];
  description: string;
  images: string[];
  isActive: boolean;
}

export interface PricingConfiguration {
  roomType: string;
  basePrice: number;
  seasonalRates: {
    name: string;
    startDate: string;
    endDate: string;
    multiplier: number;
  }[];
  weekendSurcharge: number;
  extraGuestCharge: number;
  taxes: {
    name: string;
    rate: number;
    type: 'percentage' | 'fixed';
  }[];
}

export interface BookingConfiguration {
  allowWalkIns: boolean;
  requireDeposit: boolean;
  depositPercentage: number;
  cancellationPolicy: {
    hours: number;
    penalty: number;
  };
  maxAdvanceBookingDays: number;
  minBookingNoticeHours: number;
  allowModifications: boolean;
  modificationDeadlineHours: number;
}

export interface AppConfiguration {
  hotel: HotelConfiguration;
  rooms: RoomConfiguration[];
  pricing: PricingConfiguration[];
  booking: BookingConfiguration;
  lastUpdated: string;
  version: string;
}

class ConfigurationService {
  private readonly endpoint = '/api/configuration';
  private configCache: AppConfiguration | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // Get complete application configuration
  async getConfiguration(forceRefresh: boolean = false): Promise<ApiResponse<AppConfiguration>> {
    try {
      // Check cache first
      if (!forceRefresh && this.configCache && (Date.now() - this.cacheTimestamp) < this.CACHE_DURATION) {
        return { data: this.configCache, success: true };
      }

      if (process.env.NODE_ENV === 'development') {
        const config = await this.getMockConfiguration();
        this.configCache = config.data;
        this.cacheTimestamp = Date.now();
        return config;
      }

      const response = await apiClient.get<AppConfiguration>(this.endpoint);
      
      // Update cache
      if (response.success) {
        this.configCache = response.data;
        this.cacheTimestamp = Date.now();
      }

      return response;
    } catch (error) {
      throw new Error(`เกิดข้อผิดพลาดในการดึงข้อมูลการตั้งค่า: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get hotel configuration only
  async getHotelConfiguration(): Promise<ApiResponse<HotelConfiguration>> {
    try {
      const config = await this.getConfiguration();
      return { data: config.data.hotel, success: true };
    } catch (error) {
      throw new Error(`เกิดข้อผิดพลาดในการดึงข้อมูลการตั้งค่าโรงแรม: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get room configurations
  async getRoomConfigurations(): Promise<ApiResponse<RoomConfiguration[]>> {
    try {
      const config = await this.getConfiguration();
      return { data: config.data.rooms, success: true };
    } catch (error) {
      throw new Error(`เกิดข้อผิดพลาดในการดึงข้อมูลการตั้งค่าห้องพัก: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get pricing configurations
  async getPricingConfigurations(): Promise<ApiResponse<PricingConfiguration[]>> {
    try {
      const config = await this.getConfiguration();
      return { data: config.data.pricing, success: true };
    } catch (error) {
      throw new Error(`เกิดข้อผิดพลาดในการดึงข้อมูลการตั้งค่าราคา: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get booking configuration
  async getBookingConfiguration(): Promise<ApiResponse<BookingConfiguration>> {
    try {
      const config = await this.getConfiguration();
      return { data: config.data.booking, success: true };
    } catch (error) {
      throw new Error(`เกิดข้อผิดพลาดในการดึงข้อมูลการตั้งค่าการจอง: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Update hotel configuration
  async updateHotelConfiguration(hotelConfig: Partial<HotelConfiguration>): Promise<ApiResponse<HotelConfiguration>> {
    try {
      if (process.env.NODE_ENV === 'development') {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const currentConfig = await this.getConfiguration();
        const updatedConfig = { ...currentConfig.data.hotel, ...hotelConfig };
        
        // Update cache
        if (this.configCache) {
          this.configCache.hotel = updatedConfig;
          this.configCache.lastUpdated = new Date().toISOString();
        }

        return { data: updatedConfig, success: true };
      }

      const response = await apiClient.put<HotelConfiguration>(`${this.endpoint}/hotel`, hotelConfig);
      
      // Invalidate cache on successful update
      if (response.success) {
        this.configCache = null;
      }

      return response;
    } catch (error) {
      throw new Error(`เกิดข้อผิดพลาดในการอัปเดตการตั้งค่าโรงแรม: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Update room configuration
  async updateRoomConfiguration(roomId: string, roomConfig: Partial<RoomConfiguration>): Promise<ApiResponse<RoomConfiguration>> {
    try {
      if (process.env.NODE_ENV === 'development') {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const currentConfig = await this.getConfiguration();
        const roomIndex = currentConfig.data.rooms.findIndex(room => room.id === roomId);
        
        if (roomIndex === -1) {
          throw new Error('ไม่พบห้องพักที่ระบุ');
        }

        const updatedRoom = { ...currentConfig.data.rooms[roomIndex], ...roomConfig };
        
        // Update cache
        if (this.configCache) {
          this.configCache.rooms[roomIndex] = updatedRoom as RoomConfiguration;
          this.configCache.lastUpdated = new Date().toISOString();
        }

        return { data: updatedRoom as RoomConfiguration, success: true };
      }

      const response = await apiClient.put<RoomConfiguration>(`${this.endpoint}/rooms/${roomId}`, roomConfig);
      
      // Invalidate cache on successful update
      if (response.success) {
        this.configCache = null;
      }

      return response;
    } catch (error) {
      throw new Error(`เกิดข้อผิดพลาดในการอัปเดตการตั้งค่าห้องพัก: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Update pricing configuration
  async updatePricingConfiguration(roomType: string, pricingConfig: Partial<PricingConfiguration>): Promise<ApiResponse<PricingConfiguration>> {
    try {
      if (process.env.NODE_ENV === 'development') {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const currentConfig = await this.getConfiguration();
        const pricingIndex = currentConfig.data.pricing.findIndex(pricing => pricing.roomType === roomType);
        
        if (pricingIndex === -1) {
          throw new Error('ไม่พบการตั้งค่าราคาสำหรับประเภทห้องนี้');
        }

        const updatedPricing = { ...currentConfig.data.pricing[pricingIndex], ...pricingConfig };
        
        // Update cache
        if (this.configCache) {
          this.configCache.pricing[pricingIndex] = updatedPricing as PricingConfiguration;
          this.configCache.lastUpdated = new Date().toISOString();
        }

        return { data: updatedPricing as PricingConfiguration, success: true };
      }

      const response = await apiClient.put<PricingConfiguration>(`${this.endpoint}/pricing/${roomType}`, pricingConfig);
      
      // Invalidate cache on successful update
      if (response.success) {
        this.configCache = null;
      }

      return response;
    } catch (error) {
      throw new Error(`เกิดข้อผิดพลาดในการอัปเดตการตั้งค่าราคา: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Update booking configuration
  async updateBookingConfiguration(bookingConfig: Partial<BookingConfiguration>): Promise<ApiResponse<BookingConfiguration>> {
    try {
      if (process.env.NODE_ENV === 'development') {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const currentConfig = await this.getConfiguration();
        const updatedConfig = { ...currentConfig.data.booking, ...bookingConfig };
        
        // Update cache
        if (this.configCache) {
          this.configCache.booking = updatedConfig;
          this.configCache.lastUpdated = new Date().toISOString();
        }

        return { data: updatedConfig, success: true };
      }

      const response = await apiClient.put<BookingConfiguration>(`${this.endpoint}/booking`, bookingConfig);
      
      // Invalidate cache on successful update
      if (response.success) {
        this.configCache = null;
      }

      return response;
    } catch (error) {
      throw new Error(`เกิดข้อผิดพลาดในการอัปเดตการตั้งค่าการจอง: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Clear configuration cache
  clearCache(): void {
    this.configCache = null;
    this.cacheTimestamp = 0;
  }

  // Get available room types
  async getAvailableRoomTypes(): Promise<ApiResponse<string[]>> {
    try {
      const roomsConfig = await this.getRoomConfigurations();
      const roomTypes = Array.from(new Set(roomsConfig.data.filter(room => room.isActive).map(room => room.type)));
      return { data: roomTypes, success: true };
    } catch (error) {
      throw new Error(`เกิดข้อผิดพลาดในการดึงประเภทห้องพัก: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Calculate price for booking
  async calculateBookingPrice(roomType: string, checkInDate: string, checkOutDate: string, guests: number): Promise<ApiResponse<number>> {
    try {
      const pricingConfig = await this.getPricingConfigurations();
      const roomPricing = pricingConfig.data.find(p => p.roomType === roomType);
      
      if (!roomPricing) {
        throw new Error('ไม่พบการตั้งค่าราคาสำหรับประเภทห้องนี้');
      }

      const nights = this.calculateNights(checkInDate, checkOutDate);
      let totalPrice = nights * roomPricing.basePrice;

      // Apply seasonal rates
      for (const rate of roomPricing.seasonalRates) {
        if (this.isDateInRange(checkInDate, rate.startDate, rate.endDate)) {
          totalPrice *= rate.multiplier;
          break;
        }
      }

      // Apply weekend surcharge
      if (this.hasWeekend(checkInDate, checkOutDate)) {
        totalPrice += (totalPrice * roomPricing.weekendSurcharge / 100);
      }

      // Apply extra guest charges (assuming base capacity is 2)
      if (guests > 2) {
        totalPrice += (guests - 2) * roomPricing.extraGuestCharge * nights;
      }

      // Apply taxes
      for (const tax of roomPricing.taxes) {
        if (tax.type === 'percentage') {
          totalPrice += (totalPrice * tax.rate / 100);
        } else {
          totalPrice += tax.rate;
        }
      }

      return { data: Math.round(totalPrice), success: true };
    } catch (error) {
      throw new Error(`เกิดข้อผิดพลาดในการคำนวณราคา: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Private helper methods
  private async getMockConfiguration(): Promise<ApiResponse<AppConfiguration>> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const mockConfig: AppConfiguration = {
      hotel: {
        hotelName: 'โรงแรมสวนสน',
        hotelAddress: '123 ซอยสวนสน ถนนพระราม 4 กรุงเทพมหานคร 10110',
        hotelPhone: '02-234-5678',
        hotelEmail: 'info@suansonhotel.com',
        checkInTime: '14:00',
        checkOutTime: '12:00',
        currency: 'THB',
        timeZone: 'Asia/Bangkok',
        language: 'th',
        theme: 'light',
      },
      rooms: [
        {
          id: 'standard-1',
          name: 'Standard Room',
          type: 'Standard',
          capacity: 2,
          basePrice: 1200,
          amenities: ['Wi-Fi', 'แอร์', 'ทีวี', 'ตู้เย็น'],
          description: 'ห้องพักมาตรฐานสำหรับ 2 ท่าน พร้อมสิ่งอำนวยความสะดวกครบครัน',
          images: [],
          isActive: true,
        },
        {
          id: 'deluxe-1',
          name: 'Deluxe Room',
          type: 'Deluxe',
          capacity: 3,
          basePrice: 1600,
          amenities: ['Wi-Fi', 'แอร์', 'ทีวี', 'ตู้เย็น', 'ระเบียง', 'ห้องน้ำใหญ่'],
          description: 'ห้องพักดีลักซ์ขนาดใหญ่ พร้อมระเบียงและวิวสวยงาม',
          images: [],
          isActive: true,
        },
        {
          id: 'suite-1',
          name: 'Suite Room',
          type: 'Suite',
          capacity: 4,
          basePrice: 4000,
          amenities: ['Wi-Fi', 'แอร์', 'ทีวี', 'ตู้เย็น', 'ระเบียง', 'ห้องนั่งเล่น', 'ครัวเล็ก'],
          description: 'ห้องสวีทหรูหรา พร้อมห้องนั่งเล่นและครัวเล็ก',
          images: [],
          isActive: true,
        },
      ],
      pricing: [
        {
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
            {
              name: 'VAT',
              rate: 7,
              type: 'percentage',
            },
            {
              name: 'Service Charge',
              rate: 10,
              type: 'percentage',
            },
          ],
        },
        {
          roomType: 'Deluxe',
          basePrice: 1600,
          seasonalRates: [
            {
              name: 'ช่วงเทศกาล',
              startDate: '2024-12-20',
              endDate: '2025-01-05',
              multiplier: 1.5,
            },
          ],
          weekendSurcharge: 15,
          extraGuestCharge: 400,
          taxes: [
            {
              name: 'VAT',
              rate: 7,
              type: 'percentage',
            },
            {
              name: 'Service Charge',
              rate: 10,
              type: 'percentage',
            },
          ],
        },
        {
          roomType: 'Suite',
          basePrice: 4000,
          seasonalRates: [
            {
              name: 'ช่วงเทศกาล',
              startDate: '2024-12-20',
              endDate: '2025-01-05',
              multiplier: 1.8,
            },
          ],
          weekendSurcharge: 20,
          extraGuestCharge: 500,
          taxes: [
            {
              name: 'VAT',
              rate: 7,
              type: 'percentage',
            },
            {
              name: 'Service Charge',
              rate: 10,
              type: 'percentage',
            },
          ],
        },
      ],
      booking: {
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
      },
      lastUpdated: new Date().toISOString(),
      version: '1.0.0',
    };

    return { data: mockConfig, success: true };
  }

  private calculateNights(checkInDate: string, checkOutDate: string): number {
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const diffTime = checkOut.getTime() - checkIn.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  private isDateInRange(date: string, startDate: string, endDate: string): boolean {
    const checkDate = new Date(date);
    const start = new Date(startDate);
    const end = new Date(endDate);
    return checkDate >= start && checkDate <= end;
  }

  private hasWeekend(checkInDate: string, checkOutDate: string): boolean {
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    
    for (let d = new Date(checkIn); d < checkOut; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) { // Sunday or Saturday
        return true;
      }
    }
    return false;
  }
}

// Export singleton instance
export const configurationService = new ConfigurationService();
export default ConfigurationService;