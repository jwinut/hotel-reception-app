-- CreateTable
CREATE TABLE "RoomTypePricing" (
    "id" TEXT NOT NULL,
    "roomType" "RoomType" NOT NULL,
    "basePrice" DECIMAL(10,2) NOT NULL,
    "breakfastPrice" DECIMAL(10,2) NOT NULL DEFAULT 250.00,
    "seasonalMultiplier" DECIMAL(4,2) NOT NULL DEFAULT 1.00,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "effectiveFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "effectiveUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoomTypePricing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PricingHistory" (
    "id" TEXT NOT NULL,
    "roomType" "RoomType" NOT NULL,
    "oldBasePrice" DECIMAL(10,2) NOT NULL,
    "newBasePrice" DECIMAL(10,2) NOT NULL,
    "oldBreakfastPrice" DECIMAL(10,2) NOT NULL,
    "newBreakfastPrice" DECIMAL(10,2) NOT NULL,
    "reason" TEXT,
    "changedBy" TEXT NOT NULL DEFAULT 'system',
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PricingHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RoomTypePricing_roomType_isActive_idx" ON "RoomTypePricing"("roomType", "isActive");

-- CreateIndex
CREATE INDEX "RoomTypePricing_effectiveFrom_effectiveUntil_idx" ON "RoomTypePricing"("effectiveFrom", "effectiveUntil");

-- CreateIndex
CREATE INDEX "PricingHistory_roomType_changedAt_idx" ON "PricingHistory"("roomType", "changedAt");