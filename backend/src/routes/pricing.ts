import express from 'express';
import {
  getAllPricing,
  getRoomTypePricing,
  updateRoomTypePricing,
  calculateBookingPrice,
  getPricingHistory
} from '../controllers/pricingController';

const router = express.Router();

/**
 * GET /api/pricing
 * Get current pricing for all room types
 */
router.get('/', getAllPricing);

/**
 * GET /api/pricing/calculate
 * Calculate price for a booking
 * Query params: roomType, includeBreakfast, nights
 */
router.get('/calculate', calculateBookingPrice);

/**
 * GET /api/pricing/:roomType
 * Get current pricing for a specific room type
 */
router.get('/:roomType', getRoomTypePricing);

/**
 * PUT /api/pricing/:roomType
 * Update pricing for a specific room type
 * Body: { basePrice?, breakfastPrice?, seasonalMultiplier?, reason? }
 */
router.put('/:roomType', updateRoomTypePricing);

/**
 * GET /api/pricing/:roomType/history
 * Get pricing history for a room type
 * Query params: limit (default: 10)
 */
router.get('/:roomType/history', getPricingHistory);

export default router;