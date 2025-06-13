import { Router } from 'express';
import { roomController } from '../controllers/roomController';
import { bookingController } from '../controllers/bookingController';
import pricingRoutes from './pricing';

const router = Router();

// Room routes
router.get('/rooms/available-now', roomController.getAvailableRooms.bind(roomController));
router.get('/rooms/statistics', roomController.getRoomStatistics.bind(roomController));
router.get('/rooms/all', roomController.getAllRooms.bind(roomController));

// Booking routes
router.post('/walkin/checkin', bookingController.createWalkInBooking.bind(bookingController));
router.get('/walkin/booking/:reference', bookingController.getBookingByReference.bind(bookingController));
router.get('/walkin/bookings', bookingController.getAllBookings.bind(bookingController));

// Pricing routes
router.use('/pricing', pricingRoutes);

export default router;