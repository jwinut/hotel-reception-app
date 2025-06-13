import { Request, Response } from 'express';
import { pricingService } from '../services/pricingService';
import { RoomType } from '@prisma/client';

/**
 * Get current pricing for all room types
 */
export const getAllPricing = async (_req: Request, res: Response) => {
  try {
    const pricing = await pricingService.getAllCurrentPricing();
    
    // Format for frontend compatibility
    const formattedPricing = pricing.map(p => ({
      roomType: p.roomType,
      roomTypeName: p.roomType.charAt(0) + p.roomType.slice(1).toLowerCase().replace('_', ' '),
      basePrice: p.basePrice,
      breakfastPrice: p.breakfastPrice,
      noBreakfast: p.basePrice,
      withBreakfast: p.totalWithBreakfast,
      seasonalMultiplier: p.seasonalMultiplier,
      effectiveFrom: p.effectiveFrom,
      effectiveUntil: p.effectiveUntil
    }));

    return res.json({
      success: true,
      data: {
        prices: formattedPricing,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error fetching pricing:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch pricing'
    });
  }
};

/**
 * Get pricing for a specific room type
 */
export const getRoomTypePricing = async (req: Request, res: Response) => {
  try {
    const { roomType } = req.params;
    
    if (!Object.values(RoomType).includes(roomType as RoomType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid room type'
      });
    }

    const pricing = await pricingService.getCurrentPricing(roomType as RoomType);
    
    if (!pricing) {
      return res.status(404).json({
        success: false,
        error: 'Pricing not found for room type'
      });
    }

    return res.json({
      success: true,
      data: pricing
    });
  } catch (error) {
    console.error('Error fetching room type pricing:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch room type pricing'
    });
  }
};

/**
 * Update pricing for a room type
 */
export const updateRoomTypePricing = async (req: Request, res: Response) => {
  try {
    const { roomType } = req.params;
    const { basePrice, breakfastPrice, seasonalMultiplier, reason } = req.body;
    
    if (!Object.values(RoomType).includes(roomType as RoomType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid room type'
      });
    }

    // Validate pricing data
    if (basePrice && (basePrice < 0 || basePrice > 100000)) {
      return res.status(400).json({
        success: false,
        error: 'Base price must be between 0 and 100,000'
      });
    }

    if (breakfastPrice && (breakfastPrice < 0 || breakfastPrice > 5000)) {
      return res.status(400).json({
        success: false,
        error: 'Breakfast price must be between 0 and 5,000'
      });
    }

    const updatedPricing = await pricingService.updatePricing(roomType as RoomType, {
      basePrice,
      breakfastPrice,
      seasonalMultiplier,
      reason,
      changedBy: 'admin' // TODO: Get from authentication
    });

    return res.json({
      success: true,
      data: updatedPricing,
      message: 'Pricing updated successfully'
    });
  } catch (error) {
    console.error('Error updating pricing:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update pricing'
    });
  }
};

/**
 * Calculate price for booking
 */
export const calculateBookingPrice = async (req: Request, res: Response) => {
  try {
    const { roomType, includeBreakfast, nights } = req.query;
    
    if (!roomType || !Object.values(RoomType).includes(roomType as RoomType)) {
      return res.status(400).json({
        success: false,
        error: 'Valid room type is required'
      });
    }

    const nightsCount = parseInt(nights as string) || 1;
    const withBreakfast = includeBreakfast === 'true';

    const calculation = await pricingService.calculatePrice(
      roomType as RoomType,
      withBreakfast,
      nightsCount
    );

    if (!calculation) {
      return res.status(404).json({
        success: false,
        error: 'Pricing not available for room type'
      });
    }

    return res.json({
      success: true,
      data: {
        roomType,
        nights: nightsCount,
        includeBreakfast: withBreakfast,
        calculation
      }
    });
  } catch (error) {
    console.error('Error calculating price:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to calculate price'
    });
  }
};

/**
 * Get pricing history for a room type
 */
export const getPricingHistory = async (req: Request, res: Response) => {
  try {
    const { roomType } = req.params;
    const limit = parseInt(req.query.limit as string) || 10;
    
    if (!Object.values(RoomType).includes(roomType as RoomType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid room type'
      });
    }

    const history = await pricingService.getPricingHistory(roomType as RoomType, limit);

    return res.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('Error fetching pricing history:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch pricing history'
    });
  }
};