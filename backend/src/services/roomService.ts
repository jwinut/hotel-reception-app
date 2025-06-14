import { prisma } from '../lib/prisma';
import { RoomStatus, RoomType } from '@prisma/client';

export interface RoomAvailability {
  id: string;
  roomNumber: string;
  roomType: RoomType;
  floor: number;
  basePrice: number;
  maxOccupancy: number;
  features: any;
  status: RoomStatus;
}

export interface RoomSummary {
  roomType: RoomType;
  available: number;
  total: number;
  basePrice: number;
}

export class RoomService {
  /**
   * Get all rooms with their current status and summary by type
   */
  async getAvailableRooms(): Promise<{
    rooms: RoomAvailability[];
    summary: RoomSummary[];
  }> {
    // Get all rooms with their current status
    const allRooms = await prisma.room.findMany({
      orderBy: [
        { roomType: 'asc' },
        { roomNumber: 'asc' },
      ],
    });

    // Get all rooms grouped by type for totals
    const allRoomsByType = await prisma.room.groupBy({
      by: ['roomType'],
      _count: true,
    });

    // Get available rooms grouped by type
    const availableByType = await prisma.room.groupBy({
      by: ['roomType'],
      where: {
        status: RoomStatus.CLEAN,
      },
      _count: true,
    });

    // Get base prices by room type
    const pricesByType = await prisma.room.groupBy({
      by: ['roomType'],
      _min: {
        basePrice: true,
      },
    });

    // Build summary for each room type
    const summary: RoomSummary[] = Object.values(RoomType).map(type => {
      const total = allRoomsByType.find(r => r.roomType === type)?._count || 0;
      const available = availableByType.find(r => r.roomType === type)?._count || 0;
      const basePrice = pricesByType.find(r => r.roomType === type)?._min.basePrice || 0;

      return {
        roomType: type,
        available,
        total,
        basePrice: Number(basePrice),
      };
    });

    return {
      rooms: allRooms.map(room => ({
        ...room,
        basePrice: Number(room.basePrice),
      })),
      summary,
    };
  }

  /**
   * Get room by ID
   */
  async getRoomById(roomId: string) {
    return prisma.room.findUnique({
      where: { id: roomId },
    });
  }

  /**
   * Update room status
   */
  async updateRoomStatus(roomId: string, status: RoomStatus) {
    return prisma.room.update({
      where: { id: roomId },
      data: { 
        status,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Check if a room is available for booking
   */
  async checkRoomAvailability(roomId: string): Promise<boolean> {
    const room = await prisma.room.findUnique({
      where: { id: roomId },
    });
    
    return room?.status === RoomStatus.CLEAN;
  }

  /**
   * Get all rooms with their status (for admin/management)
   */
  async getAllRooms() {
    return prisma.room.findMany({
      orderBy: [
        { floor: 'asc' },
        { roomNumber: 'asc' },
      ],
    });
  }

  /**
   * Get room statistics
   */
  async getRoomStatistics() {
    const stats = await prisma.room.groupBy({
      by: ['status'],
      _count: true,
    });

    const total = await prisma.room.count();

    return {
      total,
      byStatus: stats.reduce((acc, stat) => {
        acc[stat.status] = stat._count;
        return acc;
      }, {} as Record<string, number>),
    };
  }
}

export const roomService = new RoomService();