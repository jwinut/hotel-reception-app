-- CreateEnum
CREATE TYPE "RoomType" AS ENUM ('STANDARD', 'SUPERIOR', 'DELUXE', 'FAMILY');

-- CreateEnum
CREATE TYPE "RoomStatus" AS ENUM ('CLEAN', 'OCCUPIED', 'DIRTY', 'MAINTENANCE');

-- CreateTable
CREATE TABLE "rooms" (
    "id" TEXT NOT NULL,
    "roomNumber" TEXT NOT NULL,
    "roomType" "RoomType" NOT NULL,
    "floor" INTEGER NOT NULL,
    "basePrice" DECIMAL(10,2) NOT NULL,
    "status" "RoomStatus" NOT NULL DEFAULT 'CLEAN',
    "maxOccupancy" INTEGER NOT NULL DEFAULT 2,
    "features" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rooms_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "rooms_roomNumber_key" ON "rooms"("roomNumber");

-- CreateIndex
CREATE INDEX "rooms_roomType_status_idx" ON "rooms"("roomType", "status");

-- CreateIndex
CREATE INDEX "rooms_status_idx" ON "rooms"("status");
