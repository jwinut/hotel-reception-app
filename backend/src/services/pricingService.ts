import { PrismaClient, RoomType, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export interface PricingInfo {
  roomType: RoomType;
  basePrice: number;
  breakfastPrice: number;
  totalWithBreakfast: number;
  seasonalMultiplier: number;
  effectiveFrom: Date;
  effectiveUntil?: Date;
}

export interface UpdatePricingData {
  basePrice?: number;
  breakfastPrice?: number;
  seasonalMultiplier?: number;
  reason?: string;
  changedBy?: string;
}

class PricingService {
  /**
   * Get current active pricing for a room type
   */
  async getCurrentPricing(roomType: RoomType): Promise<PricingInfo | null> {
    const pricing = await prisma.roomTypePricing.findFirst({
      where: {
        roomType,
        isActive: true,
        effectiveFrom: { lte: new Date() },
        OR: [
          { effectiveUntil: null },
          { effectiveUntil: { gte: new Date() } }
        ]
      },
      orderBy: { effectiveFrom: 'desc' }
    });

    if (!pricing) return null;

    return {
      roomType: pricing.roomType,
      basePrice: Number(pricing.basePrice),
      breakfastPrice: Number(pricing.breakfastPrice),
      totalWithBreakfast: Number(pricing.basePrice) + Number(pricing.breakfastPrice),
      seasonalMultiplier: Number(pricing.seasonalMultiplier),
      effectiveFrom: pricing.effectiveFrom,
      effectiveUntil: pricing.effectiveUntil || undefined
    };
  }

  /**
   * Get current pricing for all room types
   */
  async getAllCurrentPricing(): Promise<PricingInfo[]> {
    const roomTypes = Object.values(RoomType);
    const pricingPromises = roomTypes.map(roomType => this.getCurrentPricing(roomType));
    const pricingResults = await Promise.all(pricingPromises);
    
    return pricingResults.filter((pricing): pricing is PricingInfo => pricing !== null);
  }

  /**
   * Update pricing for a room type
   */
  async updatePricing(
    roomType: RoomType,
    updateData: UpdatePricingData
  ): Promise<PricingInfo> {
    return await prisma.$transaction(async (tx) => {
      // Get current pricing for history
      const currentPricing = await tx.roomTypePricing.findFirst({
        where: {
          roomType,
          isActive: true,
          effectiveFrom: { lte: new Date() },
          OR: [
            { effectiveUntil: null },
            { effectiveUntil: { gte: new Date() } }
          ]
        }
      });

      // Create pricing history record
      if (currentPricing && (updateData.basePrice || updateData.breakfastPrice)) {
        await tx.pricingHistory.create({
          data: {
            roomType,
            oldBasePrice: currentPricing.basePrice,
            newBasePrice: updateData.basePrice ? new Prisma.Decimal(updateData.basePrice) : currentPricing.basePrice,
            oldBreakfastPrice: currentPricing.breakfastPrice,
            newBreakfastPrice: updateData.breakfastPrice ? new Prisma.Decimal(updateData.breakfastPrice) : currentPricing.breakfastPrice,
            reason: updateData.reason,
            changedBy: updateData.changedBy || 'system'
          }
        });
      }

      // Deactivate current pricing
      if (currentPricing) {
        await tx.roomTypePricing.update({
          where: { id: currentPricing.id },
          data: { 
            isActive: false,
            effectiveUntil: new Date()
          }
        });
      }

      // Create new pricing
      const newPricing = await tx.roomTypePricing.create({
        data: {
          roomType,
          basePrice: updateData.basePrice ? new Prisma.Decimal(updateData.basePrice) : currentPricing?.basePrice || new Prisma.Decimal(0),
          breakfastPrice: updateData.breakfastPrice ? new Prisma.Decimal(updateData.breakfastPrice) : currentPricing?.breakfastPrice || new Prisma.Decimal(250),
          seasonalMultiplier: updateData.seasonalMultiplier ? new Prisma.Decimal(updateData.seasonalMultiplier) : currentPricing?.seasonalMultiplier || new Prisma.Decimal(1),
          isActive: true,
          effectiveFrom: new Date()
        }
      });

      return {
        roomType: newPricing.roomType,
        basePrice: Number(newPricing.basePrice),
        breakfastPrice: Number(newPricing.breakfastPrice),
        totalWithBreakfast: Number(newPricing.basePrice) + Number(newPricing.breakfastPrice),
        seasonalMultiplier: Number(newPricing.seasonalMultiplier),
        effectiveFrom: newPricing.effectiveFrom,
        effectiveUntil: newPricing.effectiveUntil || undefined
      };
    });
  }

  /**
   * Calculate room price with options
   */
  async calculatePrice(
    roomType: RoomType,
    includeBreakfast: boolean = false,
    nights: number = 1
  ): Promise<{ baseAmount: number; breakfastAmount: number; total: number } | null> {
    const pricing = await this.getCurrentPricing(roomType);
    if (!pricing) return null;

    const baseAmount = pricing.basePrice * pricing.seasonalMultiplier * nights;
    const breakfastAmount = includeBreakfast ? pricing.breakfastPrice * nights : 0;
    const total = baseAmount + breakfastAmount;

    return {
      baseAmount: Number(baseAmount.toFixed(2)),
      breakfastAmount: Number(breakfastAmount.toFixed(2)),
      total: Number(total.toFixed(2))
    };
  }

  /**
   * Get pricing history for a room type
   */
  async getPricingHistory(roomType: RoomType, limit: number = 10) {
    return await prisma.pricingHistory.findMany({
      where: { roomType },
      orderBy: { changedAt: 'desc' },
      take: limit
    });
  }

  /**
   * Initialize default pricing for all room types
   */
  async initializeDefaultPricing() {
    const defaultPricing = {
      [RoomType.STANDARD]: { basePrice: 1200, breakfastPrice: 250 },
      [RoomType.SUPERIOR]: { basePrice: 1800, breakfastPrice: 250 },
      [RoomType.DELUXE]: { basePrice: 2400, breakfastPrice: 250 },
      [RoomType.FAMILY]: { basePrice: 3200, breakfastPrice: 250 },
      [RoomType.HOP_IN]: { basePrice: 800, breakfastPrice: 250 },
      [RoomType.ZENITH]: { basePrice: 5000, breakfastPrice: 250 }
    };

    for (const [roomType, pricing] of Object.entries(defaultPricing)) {
      const existing = await this.getCurrentPricing(roomType as RoomType);
      if (!existing) {
        await prisma.roomTypePricing.create({
          data: {
            roomType: roomType as RoomType,
            basePrice: new Prisma.Decimal(pricing.basePrice),
            breakfastPrice: new Prisma.Decimal(pricing.breakfastPrice),
            seasonalMultiplier: new Prisma.Decimal(1.0),
            isActive: true,
            effectiveFrom: new Date()
          }
        });
      }
    }
  }
}

// Export singleton instance
export const pricingService = new PricingService();
export default pricingService;