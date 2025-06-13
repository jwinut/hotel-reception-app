import { Request, Response, NextFunction } from 'express';
import { roomService } from '../services/roomService';

export class RoomController {
  /**
   * GET /api/rooms/available-now
   * Get all currently available rooms with summary
   */
  async getAvailableRooms(_req: Request, res: Response, next: NextFunction) {
    try {
      const availability = await roomService.getAvailableRooms();
      
      res.json({
        success: true,
        data: availability,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/rooms/statistics
   * Get room occupancy statistics
   */
  async getRoomStatistics(_req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await roomService.getRoomStatistics();
      
      res.json({
        success: true,
        data: stats,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/rooms/all
   * Get all rooms with status (admin only)
   */
  async getAllRooms(_req: Request, res: Response, next: NextFunction) {
    try {
      const rooms = await roomService.getAllRooms();
      
      res.json({
        success: true,
        data: rooms.map(room => ({
          ...room,
          basePrice: Number(room.basePrice),
        })),
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
}

export const roomController = new RoomController();