-- CreateEnum
CREATE TYPE "IdType" AS ENUM ('PASSPORT', 'NATIONAL_ID');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('CHECKED_IN', 'CHECKED_OUT', 'CANCELLED');

-- CreateTable
CREATE TABLE "walkin_bookings" (
    "id" TEXT NOT NULL,
    "bookingReference" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "guestFirstName" TEXT NOT NULL,
    "guestLastName" TEXT NOT NULL,
    "guestPhone" TEXT NOT NULL,
    "guestIdType" "IdType" NOT NULL,
    "guestIdNumber" TEXT NOT NULL,
    "checkInDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "checkOutDate" TIMESTAMP(3) NOT NULL,
    "roomPrice" DECIMAL(10,2) NOT NULL,
    "breakfastIncluded" BOOLEAN NOT NULL DEFAULT false,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'CHECKED_IN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "walkin_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "walkin_bookings_bookingReference_key" ON "walkin_bookings"("bookingReference");

-- CreateIndex
CREATE INDEX "walkin_bookings_bookingReference_idx" ON "walkin_bookings"("bookingReference");

-- CreateIndex
CREATE INDEX "walkin_bookings_guestPhone_idx" ON "walkin_bookings"("guestPhone");

-- AddForeignKey
ALTER TABLE "walkin_bookings" ADD CONSTRAINT "walkin_bookings_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
