import { PrismaClient, RoomType, RoomStatus } from '@prisma/client';

const prisma = new PrismaClient();

// Room data from the existing frontend configuration
const existingRoomsData = [
  { "roomNumber": "301", "roomType": "Deluxe" },
  { "roomNumber": "302", "roomType": "Standard" },
  { "roomNumber": "303", "roomType": "Standard" },
  { "roomNumber": "304", "roomType": "Standard" },
  { "roomNumber": "305", "roomType": "Standard" },
  { "roomNumber": "306", "roomType": "Standard" },
  { "roomNumber": "307", "roomType": "Family" },
  { "roomNumber": "308", "roomType": "Superior" },
  { "roomNumber": "309", "roomType": "Standard" },
  { "roomNumber": "310", "roomType": "Standard" },
  { "roomNumber": "311", "roomType": "Standard" },
  { "roomNumber": "312", "roomType": "Standard" },
  { "roomNumber": "313", "roomType": "Standard" },
  { "roomNumber": "401", "roomType": "Deluxe" },
  { "roomNumber": "402", "roomType": "Standard" },
  { "roomNumber": "403", "roomType": "Standard" },
  { "roomNumber": "404", "roomType": "Standard" },
  { "roomNumber": "405", "roomType": "Standard" },
  { "roomNumber": "406", "roomType": "Standard" },
  { "roomNumber": "407", "roomType": "Superior" },
  { "roomNumber": "408", "roomType": "Standard" },
  { "roomNumber": "409", "roomType": "Family" },
  { "roomNumber": "410", "roomType": "Family" },
  { "roomNumber": "411", "roomType": "Superior" },
  { "roomNumber": "412", "roomType": "Standard" },
  { "roomNumber": "413", "roomType": "Standard" },
  { "roomNumber": "414", "roomType": "Standard" },
  { "roomNumber": "415", "roomType": "Standard" },
  { "roomNumber": "416", "roomType": "Standard" },
  { "roomNumber": "417", "roomType": "Standard" },
  { "roomNumber": "418", "roomType": "Deluxe" },
  { "roomNumber": "501", "roomType": "Deluxe" },
  { "roomNumber": "502", "roomType": "Standard" },
  { "roomNumber": "503", "roomType": "Standard" },
  { "roomNumber": "504", "roomType": "Standard" },
  { "roomNumber": "505", "roomType": "Standard" },
  { "roomNumber": "506", "roomType": "Standard" },
  { "roomNumber": "507", "roomType": "Superior" },
  { "roomNumber": "508", "roomType": "Standard" },
  { "roomNumber": "509", "roomType": "Family" },
  { "roomNumber": "510", "roomType": "Family" },
  { "roomNumber": "511", "roomType": "Family" },
  { "roomNumber": "512", "roomType": "Standard" },
  { "roomNumber": "513", "roomType": "Standard" },
  { "roomNumber": "514", "roomType": "Standard" },
  { "roomNumber": "515", "roomType": "Standard" },
  { "roomNumber": "516", "roomType": "Standard" },
  { "roomNumber": "517", "roomType": "Standard" },
  { "roomNumber": "518", "roomType": "Deluxe" },
  { "roomNumber": "A 2-1", "roomType": "Hop in" },
  { "roomNumber": "A 2-3", "roomType": "Hop in" },
  { "roomNumber": "A 3-1", "roomType": "Hop in" },
  { "roomNumber": "A 3-2", "roomType": "Hop in" },
  { "roomNumber": "A 3-3", "roomType": "Hop in" },
  { "roomNumber": "A 4-1", "roomType": "Hop in" },
  { "roomNumber": "A 4-2", "roomType": "Hop in" },
  { "roomNumber": "A 4-3", "roomType": "Hop in" },
  { "roomNumber": "201", "roomType": "Zenith" }
];

// Price data from the existing frontend configuration
const priceData = {
  "Standard": { "noBreakfast": 1200, "withBreakfast": 1450 },
  "Superior": { "noBreakfast": 1500, "withBreakfast": 1750 },
  "Deluxe": { "noBreakfast": 2000, "withBreakfast": 2250 },
  "Family": { "noBreakfast": 2500, "withBreakfast": 2850 },
  "Hop in": { "noBreakfast": 800, "withBreakfast": 950 },
  "Zenith": { "noBreakfast": 3000, "withBreakfast": 3350 }
};

// Convert room type names to enum values
const roomTypeMapping: Record<string, RoomType> = {
  "Standard": RoomType.STANDARD,
  "Superior": RoomType.SUPERIOR,
  "Deluxe": RoomType.DELUXE,
  "Family": RoomType.FAMILY,
  "Hop in": RoomType.HOP_IN,
  "Zenith": RoomType.ZENITH
};

function getFloorFromRoomNumber(roomNumber: string): number {
  if (roomNumber.startsWith('A')) {
    // Extract floor from A X-Y format (A 2-1 = floor 2)
    const match = roomNumber.match(/A (\d+)-/);
    return match ? parseInt(match[1]) : 2;
  }
  // Extract first digit(s) for regular room numbers
  const match = roomNumber.match(/^(\d+)/);
  return match ? Math.floor(parseInt(match[1]) / 100) : 3;
}

function getMaxOccupancy(roomType: string): number {
  const occupancy: Record<string, number> = {
    "Standard": 2,
    "Superior": 2,
    "Deluxe": 3,
    "Family": 4,
    "Hop in": 1,
    "Zenith": 2
  };
  return occupancy[roomType] || 2;
}

function getRoomFeatures(roomType: string, floor: number) {
  const baseFeatures = {
    wifi: true,
    aircon: true,
    tv: true
  };

  switch (roomType) {
    case "Standard":
      return {
        ...baseFeatures,
        minibar: false,
        balcony: floor >= 4,
        cityView: floor >= 3,
        bedType: "double"
      };
    case "Superior":
      return {
        ...baseFeatures,
        minibar: true,
        balcony: floor >= 4,
        cityView: true,
        bedType: "queen"
      };
    case "Deluxe":
      return {
        ...baseFeatures,
        minibar: true,
        balcony: true,
        cityView: true,
        bedType: "king",
        bathroom: "premium"
      };
    case "Family":
      return {
        ...baseFeatures,
        minibar: true,
        balcony: true,
        cityView: true,
        bedType: "king_twin",
        kitchenette: true
      };
    case "Hop in":
      return {
        ...baseFeatures,
        minibar: false,
        balcony: false,
        cityView: false,
        bedType: "single",
        compact: true
      };
    case "Zenith":
      return {
        ...baseFeatures,
        minibar: true,
        balcony: true,
        cityView: true,
        bedType: "king",
        jacuzzi: true,
        suite: true,
        premium: true
      };
    default:
      return baseFeatures;
  }
}

async function main() {
  console.log('🌱 Seeding hotel with REAL room data from configuration...');
  
  // Clear existing data
  await prisma.room.deleteMany();
  console.log('🗑️  Cleared existing rooms');
  
  // Create rooms from existing configuration
  let createdCount = 0;
  for (const roomData of existingRoomsData) {
    const roomType = roomTypeMapping[roomData.roomType];
    if (!roomType) {
      console.warn(`⚠️  Unknown room type: ${roomData.roomType}, skipping room ${roomData.roomNumber}`);
      continue;
    }

    const floor = getFloorFromRoomNumber(roomData.roomNumber);
    const maxOccupancy = getMaxOccupancy(roomData.roomType);
    const features = getRoomFeatures(roomData.roomType, floor);
    const basePrice = priceData[roomData.roomType as keyof typeof priceData]?.noBreakfast || 1200;

    await prisma.room.create({
      data: {
        roomNumber: roomData.roomNumber,
        roomType: roomType,
        floor: floor,
        basePrice: basePrice,
        maxOccupancy: maxOccupancy,
        features: features,
        status: RoomStatus.CLEAN, // All rooms start as clean/available
      },
    });
    createdCount++;
  }
  
  console.log(`✅ Created ${createdCount} rooms from existing configuration`);
  
  // Set some rooms as occupied for realistic testing (about 30% occupancy)
  const occupiedRooms = [
    '302', '305', '308', '401', '407', '409', '412', '501', '507', '509', 
    'A 2-1', 'A 3-2', 'A 4-1', '511', '418', '201'
  ];
  
  const updatedCount = await prisma.room.updateMany({
    where: { roomNumber: { in: occupiedRooms } },
    data: { status: RoomStatus.OCCUPIED }
  });
  
  console.log(`🏨 Set ${updatedCount.count} rooms as occupied for realistic testing (~30% occupancy)`);
  
  // Set some rooms under maintenance
  const maintenanceRooms = ['518', 'A 4-3'];
  const maintenanceCount = await prisma.room.updateMany({
    where: { roomNumber: { in: maintenanceRooms } },
    data: { status: RoomStatus.MAINTENANCE }
  });
  
  console.log(`🔧 Set ${maintenanceCount.count} rooms under maintenance`);
  
  // Print summary by room type
  console.log('\n📊 Hotel Room Summary by Type:');
  const summary = await prisma.room.groupBy({
    by: ['roomType'],
    _count: true,
  });
  
  for (const item of summary) {
    const available = await prisma.room.count({
      where: { 
        roomType: item.roomType,
        status: RoomStatus.CLEAN 
      }
    });
    const price = priceData[item.roomType.replace('_', ' ').toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') as keyof typeof priceData];
    
    console.log(`${item.roomType}: ${available}/${item._count} available (฿${price?.noBreakfast || 'N/A'}/night)`);
  }
  
  // Print status summary
  console.log('\n📈 Room Status Summary:');
  const statusSummary = await prisma.room.groupBy({
    by: ['status'],
    _count: true,
  });
  
  statusSummary.forEach(({ status, _count }) => {
    console.log(`${status}: ${_count} rooms`);
  });
  
  console.log('\n🎉 Database seeding completed successfully with REAL hotel data!');
  console.log('🔍 You can view the data with: npx prisma studio');
  console.log('🚀 Total rooms created:', createdCount);
  
  // Show breakdown
  const totalAvailable = await prisma.room.count({ where: { status: RoomStatus.CLEAN } });
  console.log(`✨ ${totalAvailable} rooms available for walk-in guests right now!`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });