import * as fs from 'fs';
import * as path from 'path';

export interface RoomTypeConfig {
  name: string;
  basePrice: number;
  maxOccupancy: number;
  features: {
    wifi: boolean;
    aircon: boolean;
    tv: boolean;
    minibar: boolean;
    balcony: boolean;
    cityView: boolean;
  };
}

export interface RoomConfig {
  roomNumber: string;
  roomType: string;
  floor: number;
  bedType: string;
}

export interface HotelConfig {
  hotel: {
    name: string;
    floors: number[];
    totalRooms: number;
  };
  roomTypes: Record<string, RoomTypeConfig>;
  rooms: RoomConfig[];
  layout: Array<{
    floor: number;
    rows: (string | null)[][];
  }>;
}

class ConfigService {
  private config: HotelConfig | null = null;
  private configPath: string;

  constructor() {
    this.configPath = path.join(__dirname, '../config/rooms.json');
  }

  /**
   * Load hotel configuration from the master config file
   */
  loadConfig(): HotelConfig {
    if (this.config) {
      return this.config;
    }

    try {
      const content = fs.readFileSync(this.configPath, 'utf8');
      this.config = JSON.parse(content);
      return this.config!;
    } catch (error) {
      console.error('❌ Error loading room configuration:', error);
      console.log('💡 Run: npm run sync-rooms to generate config files');
      throw new Error('Room configuration not found. Please run room sync script.');
    }
  }

  /**
   * Get room type configuration
   */
  getRoomTypeConfig(roomType: string): RoomTypeConfig {
    const config = this.loadConfig();
    const roomTypeConfig = config.roomTypes[roomType];
    
    if (!roomTypeConfig) {
      throw new Error(`Room type ${roomType} not found in configuration`);
    }
    
    return roomTypeConfig;
  }

  /**
   * Get all room configurations
   */
  getAllRooms(): RoomConfig[] {
    const config = this.loadConfig();
    return config.rooms;
  }

  /**
   * Get hotel layout
   */
  getHotelLayout() {
    const config = this.loadConfig();
    return config.layout;
  }

  /**
   * Get hotel information
   */
  getHotelInfo() {
    const config = this.loadConfig();
    return config.hotel;
  }

  /**
   * Validate that a room number exists in the configuration
   */
  isValidRoomNumber(roomNumber: string): boolean {
    const config = this.loadConfig();
    return config.rooms.some(room => room.roomNumber === roomNumber);
  }

  /**
   * Get pricing for a specific room type
   */
  getRoomPrice(roomType: string): number {
    const roomTypeConfig = this.getRoomTypeConfig(roomType);
    return roomTypeConfig.basePrice;
  }

  /**
   * Get room configuration by room number
   */
  getRoomByNumber(roomNumber: string): RoomConfig | null {
    const config = this.loadConfig();
    return config.rooms.find(room => room.roomNumber === roomNumber) || null;
  }
}

// Export singleton instance
export const configService = new ConfigService();
export default configService;