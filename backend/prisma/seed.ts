import { PrismaClient, RoomType, RoomStatus } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { pricingService } from '../src/services/pricingService';

const prisma = new PrismaClient();

// Load room configuration from master config
function loadRoomConfig() {
  const configPath = path.join(__dirname, '../src/config/rooms.json');
  try {
    const content = fs.readFileSync(configPath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error('❌ Error loading room config:', error.message);
    console.log('💡 Run: node scripts/sync-room-config.js to generate config files');
    process.exit(1);
  }
}

const roomConfig = loadRoomConfig();

// Convert master config to seed data
const rooms = roomConfig.rooms.map(room => {
  const roomTypeConfig = roomConfig.roomTypes[room.roomType];
  return {
    roomNumber: room.roomNumber,
    roomType: RoomType[room.roomType],
    floor: room.floor,
    basePrice: 0, // Pricing now managed separately in RoomTypePricing table
    maxOccupancy: roomTypeConfig.maxOccupancy,
    features: {
      ...roomTypeConfig.features,
      bedType: room.bedType
    }
  };
});

async function main() {
  console.log('🌱 Seeding hotel room database...');
  
  // Clear existing data
  await prisma.room.deleteMany();
  console.log('🗑️  Cleared existing rooms');
  
  // Create rooms
  for (const room of rooms) {
    await prisma.room.create({
      data: {
        ...room,
        status: RoomStatus.CLEAN, // All rooms start as clean/available
      },
    });
  }
  
  console.log(`✅ Created ${rooms.length} rooms`);
  
  // Set some rooms as occupied for realistic testing (sampling from different types)
  const occupiedRooms = ['302', '308', '401', '409', 'A 3-1', '502'];
  const availableRooms = rooms.map(r => r.roomNumber);
  const validOccupiedRooms = occupiedRooms.filter(room => availableRooms.includes(room));
  
  if (validOccupiedRooms.length > 0) {
    await prisma.room.updateMany({
      where: { roomNumber: { in: validOccupiedRooms } },
      data: { status: RoomStatus.OCCUPIED }
    });
    console.log(`🏨 Set ${validOccupiedRooms.length} rooms as occupied for testing`);
  }
  
  // Set one room under maintenance (if it exists)
  const maintenanceRoom = '518';
  if (availableRooms.includes(maintenanceRoom)) {
    await prisma.room.update({
      where: { roomNumber: maintenanceRoom },
      data: { status: RoomStatus.MAINTENANCE }
    });
    console.log(`🔧 Set room ${maintenanceRoom} under maintenance`);
  }
  
  
  // Print summary
  const summary = await prisma.room.groupBy({
    by: ['roomType', 'status'],
    _count: true,
  });
  
  console.log('\n📊 Room Status Summary:');
  summary.forEach(({ roomType, status, _count }) => {
    console.log(`${roomType}: ${status} = ${_count}`);
  });
  
  // Initialize pricing for all room types
  console.log('\n💰 Initializing room type pricing...');
  await pricingService.initializeDefaultPricing();
  console.log('✅ Room type pricing initialized');
  
  console.log('\n🎉 Database seeding completed successfully!');
  console.log('\n🔍 You can view the data with: npx prisma studio');
  console.log('💰 Pricing API available at: /api/pricing');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });