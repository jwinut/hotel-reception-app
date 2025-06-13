// API client for walk-in check-in system

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

export interface RoomAvailability {
  id: string;
  roomNumber: string;
  roomType: 'STANDARD' | 'SUPERIOR' | 'DELUXE' | 'FAMILY' | 'HOP_IN' | 'ZENITH';
  floor: number;
  basePrice: number;
  maxOccupancy: number;
  features: {
    wifi?: boolean;
    aircon?: boolean;
    tv?: boolean;
    minibar?: boolean;
    balcony?: boolean;
    cityView?: boolean;
    bedType?: string;
    compact?: boolean;
    jacuzzi?: boolean;
    suite?: boolean;
    premium?: boolean;
    kitchenette?: boolean;
  };
  status: string;
}

export interface RoomSummary {
  roomType: 'STANDARD' | 'SUPERIOR' | 'DELUXE' | 'FAMILY' | 'HOP_IN' | 'ZENITH';
  available: number;
  total: number;
  basePrice: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

export class WalkInApiError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = 'WalkInApiError';
  }
}

export interface CreateBookingRequest {
  roomId: string;
  guest: {
    firstName: string;
    lastName: string;
    phone: string;
    idType: 'PASSPORT' | 'NATIONAL_ID';
    idNumber: string;
  };
  checkOutDate: string;
  breakfastIncluded: boolean;
}

export interface BookingResponse {
  success: boolean;
  booking: {
    id: string;
    reference: string;
    guest: string;
    room: {
      number: string;
      type: string;
      floor: number;
    };
    checkIn: string;
    checkOut: string;
    nights: number;
    pricing: {
      roomTotal: number;
      breakfastTotal: number;
      totalAmount: number;
    };
    breakfastIncluded: boolean;
    status: string;
  };
}

export const walkinApi = {
  /**
   * Get all currently available rooms with summary by type
   */
  async getAvailableRooms(): Promise<{
    rooms: RoomAvailability[];
    summary: RoomSummary[];
  }> {
    try {
      const response = await fetch(`${API_URL}/rooms/available-now`);
      
      if (!response.ok) {
        throw new WalkInApiError(
          response.status,
          `Failed to fetch rooms: ${response.statusText}`
        );
      }
      
      const result: ApiResponse<{
        rooms: RoomAvailability[];
        summary: RoomSummary[];
      }> = await response.json();
      
      if (!result.success) {
        throw new WalkInApiError(500, 'API returned unsuccessful response');
      }
      
      return result.data;
    } catch (error) {
      if (error instanceof WalkInApiError) {
        throw error;
      }
      throw new WalkInApiError(0, `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Get room occupancy statistics
   */
  async getRoomStatistics(): Promise<{
    total: number;
    byStatus: Record<string, number>;
  }> {
    try {
      const response = await fetch(`${API_URL}/rooms/statistics`);
      
      if (!response.ok) {
        throw new WalkInApiError(
          response.status,
          `Failed to fetch statistics: ${response.statusText}`
        );
      }
      
      const result: ApiResponse<{
        total: number;
        byStatus: Record<string, number>;
      }> = await response.json();
      
      if (!result.success) {
        throw new WalkInApiError(500, 'API returned unsuccessful response');
      }
      
      return result.data;
    } catch (error) {
      if (error instanceof WalkInApiError) {
        throw error;
      }
      throw new WalkInApiError(0, `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Create a new walk-in booking
   */
  async createWalkInBooking(bookingData: CreateBookingRequest): Promise<BookingResponse> {
    try {
      const response = await fetch(`${API_URL}/walkin/checkin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new WalkInApiError(
          response.status,
          errorData.error || `Failed to create booking: ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof WalkInApiError) {
        throw error;
      }
      throw new WalkInApiError(0, `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Get booking by reference number
   */
  async getBookingByReference(reference: string): Promise<any> {
    try {
      const response = await fetch(`${API_URL}/walkin/booking/${reference}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new WalkInApiError(
          response.status,
          errorData.error || `Failed to fetch booking: ${response.statusText}`
        );
      }
      
      return await response.json();
    } catch (error) {
      if (error instanceof WalkInApiError) {
        throw error;
      }
      throw new WalkInApiError(0, `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Test API connectivity
   */
  async healthCheck(): Promise<{
    status: string;
    service: string;
    timestamp: string;
    environment: string;
  }> {
    try {
      const response = await fetch(`${API_URL.replace('/api', '')}/health`);
      
      if (!response.ok) {
        throw new WalkInApiError(
          response.status,
          `Health check failed: ${response.statusText}`
        );
      }
      
      return await response.json();
    } catch (error) {
      if (error instanceof WalkInApiError) {
        throw error;
      }
      throw new WalkInApiError(0, `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
};