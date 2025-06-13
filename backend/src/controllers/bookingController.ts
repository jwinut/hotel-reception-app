// BookingController for walk-in booking endpoints
// Milestone 2: Basic booking creation

import { Request, Response } from 'express';
import { BookingService, CreateBookingData } from '../services/bookingService';
import { IdType } from '@prisma/client';

class BookingController {
  private bookingService: BookingService;

  constructor() {
    this.bookingService = new BookingService();
  }

  async createWalkInBooking(req: Request, res: Response): Promise<void> {
    try {
      const { roomId, guest, checkOutDate, breakfastIncluded } = req.body;

      // Validate required fields
      if (!roomId || !guest || !checkOutDate) {
        res.status(400).json({
          error: 'Missing required fields: roomId, guest, checkOutDate'
        });
        return;
      }

      if (!guest.firstName || !guest.lastName || !guest.phone || !guest.idType || !guest.idNumber) {
        res.status(400).json({
          error: 'Missing required guest fields'
        });
        return;
      }

      // Validate ID type
      if (!Object.values(IdType).includes(guest.idType)) {
        res.status(400).json({
          error: 'Invalid ID type. Must be PASSPORT or NATIONAL_ID'
        });
        return;
      }

      // Parse and validate checkout date
      const parsedCheckOutDate = new Date(checkOutDate);
      if (isNaN(parsedCheckOutDate.getTime())) {
        res.status(400).json({
          error: 'Invalid checkout date format'
        });
        return;
      }

      const bookingData: CreateBookingData = {
        roomId,
        guest: {
          firstName: guest.firstName.trim(),
          lastName: guest.lastName.trim(),
          phone: guest.phone.trim(),
          idType: guest.idType,
          idNumber: guest.idNumber.trim()
        },
        checkOutDate: parsedCheckOutDate,
        breakfastIncluded: Boolean(breakfastIncluded)
      };

      const booking = await this.bookingService.createWalkInBooking(bookingData);

      res.status(201).json({
        success: true,
        booking: {
          id: booking.id,
          reference: booking.bookingReference,
          guest: `${booking.guestFirstName} ${booking.guestLastName}`,
          room: {
            number: booking.room.roomNumber,
            type: booking.room.roomType,
            floor: booking.room.floor
          },
          checkIn: booking.checkInDate,
          checkOut: booking.checkOutDate,
          nights: booking.nights,
          pricing: {
            roomTotal: booking.roomTotal,
            breakfastTotal: booking.breakfastTotal,
            totalAmount: booking.totalAmount
          },
          breakfastIncluded: booking.breakfastIncluded,
          status: booking.status
        }
      });

    } catch (error) {
      console.error('Create booking error:', error);
      
      if (error instanceof Error) {
        res.status(400).json({
          error: error.message
        });
        return;
      }

      res.status(500).json({
        error: 'Failed to create booking'
      });
    }
  }

  async getBookingByReference(req: Request, res: Response): Promise<void> {
    try {
      const { reference } = req.params;

      if (!reference) {
        res.status(400).json({
          error: 'Booking reference is required'
        });
        return;
      }

      const booking = await this.bookingService.getBookingByReference(reference);

      if (!booking) {
        res.status(404).json({
          error: 'Booking not found'
        });
        return;
      }

      res.json({
        success: true,
        booking: {
          id: booking.id,
          reference: booking.bookingReference,
          guest: {
            name: `${booking.guestFirstName} ${booking.guestLastName}`,
            phone: booking.guestPhone,
            idType: booking.guestIdType,
            idNumber: booking.guestIdNumber
          },
          room: {
            number: booking.room.roomNumber,
            type: booking.room.roomType,
            floor: booking.room.floor
          },
          checkIn: booking.checkInDate,
          checkOut: booking.checkOutDate,
          totalAmount: Number(booking.totalAmount),
          breakfastIncluded: booking.breakfastIncluded,
          status: booking.status,
          createdAt: booking.createdAt
        }
      });

    } catch (error) {
      console.error('Get booking error:', error);
      res.status(500).json({
        error: 'Failed to retrieve booking'
      });
    }
  }

  async getAllBookings(_req: Request, res: Response): Promise<void> {
    try {
      const bookings = await this.bookingService.getAllBookings();

      res.json({
        success: true,
        bookings: bookings.map(booking => ({
          id: booking.id,
          reference: booking.bookingReference,
          guest: `${booking.guestFirstName} ${booking.guestLastName}`,
          room: `${booking.room.roomNumber} (${booking.room.roomType})`,
          checkIn: booking.checkInDate,
          checkOut: booking.checkOutDate,
          totalAmount: Number(booking.totalAmount),
          status: booking.status,
          createdAt: booking.createdAt
        }))
      });

    } catch (error) {
      console.error('Get all bookings error:', error);
      res.status(500).json({
        error: 'Failed to retrieve bookings'
      });
    }
  }
}

export const bookingController = new BookingController();