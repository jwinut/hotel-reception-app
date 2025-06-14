// BookingService for walk-in booking creation
// Milestone 2: Basic booking functionality

import { PrismaClient, IdType, RoomStatus } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateBookingData {
  roomId: string;
  guest: {
    firstName: string;
    lastName: string;
    phone: string;
    idType: IdType;
    idNumber: string;
  };
  checkOutDate: Date;
  breakfastIncluded: boolean;
  pricing?: {
    roomTotal: number;
    breakfastTotal: number;
    totalAmount: number;
    nights: number;
  };
}

export class BookingService {
  async createWalkInBooking(data: CreateBookingData) {
    // Get room
    const room = await prisma.room.findUnique({
      where: { id: data.roomId }
    });
    
    if (!room || room.status !== RoomStatus.CLEAN) {
      throw new Error('Room not available');
    }

    // Use frontend pricing if provided, otherwise calculate here
    let nights, roomTotal, breakfastTotal, totalAmount;
    
    if (data.pricing) {
      // Use pricing calculated by frontend
      nights = data.pricing.nights;
      roomTotal = data.pricing.roomTotal;
      breakfastTotal = data.pricing.breakfastTotal;
      totalAmount = data.pricing.totalAmount;
    } else {
      // Calculate price server-side (fallback)
      nights = Math.ceil(
        (data.checkOutDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      
      if (nights <= 0) {
        throw new Error('Check-out date must be in the future');
      }

      // Get correct base price from room configuration
      const basePricing: Record<string, number> = {
        'STANDARD': 1500,
        'SUPERIOR': 1800,
        'DELUXE': 2200,
        'FAMILY': 2800,
        'HOP_IN': 800,
        'ZENITH': 3500
      };
      
      const actualBasePrice = basePricing[room.roomType] || 1500;
      roomTotal = actualBasePrice * nights;
      
      // Breakfast pricing based on room type
      const breakfastPricing: Record<string, number> = {
        'STANDARD': 250,
        'SUPERIOR': 250,
        'DELUXE': 250,
        'FAMILY': 350,
        'HOP_IN': 150,
        'ZENITH': 350
      };
      
      const breakfastPerNight = breakfastPricing[room.roomType] || 250;
      breakfastTotal = data.breakfastIncluded ? breakfastPerNight * nights : 0;
      totalAmount = roomTotal + breakfastTotal;
    }

    // Create booking in transaction
    const booking = await prisma.$transaction(async (tx) => {
      // Create booking
      const newBooking = await tx.walkInBooking.create({
        data: {
          roomId: data.roomId,
          guestFirstName: data.guest.firstName,
          guestLastName: data.guest.lastName,
          guestPhone: data.guest.phone,
          guestIdType: data.guest.idType,
          guestIdNumber: data.guest.idNumber,
          checkOutDate: data.checkOutDate,
          roomPrice: room.basePrice,
          breakfastIncluded: data.breakfastIncluded,
          totalAmount,
        },
        include: { 
          room: {
            select: {
              roomNumber: true,
              roomType: true,
              floor: true,
              basePrice: true
            }
          }
        }
      });

      // Update room status to occupied
      await tx.room.update({
        where: { id: data.roomId },
        data: { status: RoomStatus.OCCUPIED }
      });

      return newBooking;
    });

    return {
      ...booking,
      nights,
      roomTotal,
      breakfastTotal,
      totalAmount: Number(booking.totalAmount)
    };
  }

  async getBookingByReference(reference: string) {
    return await prisma.walkInBooking.findUnique({
      where: { bookingReference: reference },
      include: {
        room: {
          select: {
            roomNumber: true,
            roomType: true,
            floor: true
          }
        }
      }
    });
  }

  async getAllBookings() {
    return await prisma.walkInBooking.findMany({
      include: {
        room: {
          select: {
            roomNumber: true,
            roomType: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }
}