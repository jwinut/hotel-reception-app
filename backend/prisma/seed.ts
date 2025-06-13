import { PrismaClient, RoomType, RoomStatus } from '@prisma/client';

const prisma = new PrismaClient();

const rooms = [
  // Standard Rooms (Floor 2) - 4 rooms
  { 
    roomNumber: '201', 
    roomType: RoomType.STANDARD, 
    floor: 2, 
    basePrice: 1200, 
    maxOccupancy: 2,
    features: {
      wifi: true,
      aircon: true,
      tv: true,
      minibar: false,
      balcony: false,
      cityView: false,
      bedType: 'twin'
    }
  },
  { 
    roomNumber: '202', 
    roomType: RoomType.STANDARD, 
    floor: 2, 
    basePrice: 1200, 
    maxOccupancy: 2,
    features: {
      wifi: true,
      aircon: true,
      tv: true,
      minibar: false,
      balcony: false,
      cityView: false,
      bedType: 'double'
    }
  },
  { 
    roomNumber: '203', 
    roomType: RoomType.STANDARD, 
    floor: 2, 
    basePrice: 1200, 
    maxOccupancy: 2,
    features: {
      wifi: true,
      aircon: true,
      tv: true,
      minibar: false,
      balcony: false,
      cityView: false,
      bedType: 'twin'
    }
  },
  { 
    roomNumber: '204', 
    roomType: RoomType.STANDARD, 
    floor: 2, 
    basePrice: 1200, 
    maxOccupancy: 2,
    features: {
      wifi: true,
      aircon: true,
      tv: true,
      minibar: false,
      balcony: false,
      cityView: false,
      bedType: 'double'
    }
  },
  
  // Superior Rooms (Floor 3) - 4 rooms
  { 
    roomNumber: '301', 
    roomType: RoomType.SUPERIOR, 
    floor: 3, 
    basePrice: 1800, 
    maxOccupancy: 2,
    features: {
      wifi: true,
      aircon: true,
      tv: true,
      minibar: true,
      balcony: false,
      cityView: true,
      bedType: 'queen'
    }
  },
  { 
    roomNumber: '302', 
    roomType: RoomType.SUPERIOR, 
    floor: 3, 
    basePrice: 1800, 
    maxOccupancy: 2,
    features: {
      wifi: true,
      aircon: true,
      tv: true,
      minibar: true,
      balcony: false,
      cityView: true,
      bedType: 'queen'
    }
  },
  { 
    roomNumber: '303', 
    roomType: RoomType.SUPERIOR, 
    floor: 3, 
    basePrice: 1800, 
    maxOccupancy: 2,
    features: {
      wifi: true,
      aircon: true,
      tv: true,
      minibar: true,
      balcony: false,
      cityView: true,
      bedType: 'twin'
    }
  },
  { 
    roomNumber: '304', 
    roomType: RoomType.SUPERIOR, 
    floor: 3, 
    basePrice: 1800, 
    maxOccupancy: 2,
    features: {
      wifi: true,
      aircon: true,
      tv: true,
      minibar: true,
      balcony: false,
      cityView: true,
      bedType: 'queen'
    }
  },
  
  // Deluxe Rooms (Floor 4-5) - 4 rooms
  { 
    roomNumber: '401', 
    roomType: RoomType.DELUXE, 
    floor: 4, 
    basePrice: 2400, 
    maxOccupancy: 3,
    features: {
      wifi: true,
      aircon: true,
      tv: true,
      minibar: true,
      balcony: true,
      cityView: true,
      bedType: 'king'
    }
  },
  { 
    roomNumber: '402', 
    roomType: RoomType.DELUXE, 
    floor: 4, 
    basePrice: 2400, 
    maxOccupancy: 3,
    features: {
      wifi: true,
      aircon: true,
      tv: true,
      minibar: true,
      balcony: true,
      cityView: true,
      bedType: 'king'
    }
  },
  { 
    roomNumber: '501', 
    roomType: RoomType.DELUXE, 
    floor: 5, 
    basePrice: 2400, 
    maxOccupancy: 3,
    features: {
      wifi: true,
      aircon: true,
      tv: true,
      minibar: true,
      balcony: true,
      cityView: true,
      bedType: 'king'
    }
  },
  { 
    roomNumber: '502', 
    roomType: RoomType.DELUXE, 
    floor: 5, 
    basePrice: 2400, 
    maxOccupancy: 3,
    features: {
      wifi: true,
      aircon: true,
      tv: true,
      minibar: true,
      balcony: true,
      cityView: true,
      bedType: 'king'
    }
  },
  
  // Family Rooms (Floor 4) - 2 rooms
  { 
    roomNumber: '403', 
    roomType: RoomType.FAMILY, 
    floor: 4, 
    basePrice: 3200, 
    maxOccupancy: 4,
    features: {
      wifi: true,
      aircon: true,
      tv: true,
      minibar: true,
      balcony: true,
      cityView: true,
      bedType: 'king_twin'
    }
  },
  { 
    roomNumber: '404', 
    roomType: RoomType.FAMILY, 
    floor: 4, 
    basePrice: 3200, 
    maxOccupancy: 4,
    features: {
      wifi: true,
      aircon: true,
      tv: true,
      minibar: true,
      balcony: true,
      cityView: true,
      bedType: 'king_twin'
    }
  },
];

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
  
  // Set some rooms as occupied for realistic testing
  const occupiedRooms = ['202', '301', '401', '403'];
  await prisma.room.updateMany({
    where: { roomNumber: { in: occupiedRooms } },
    data: { status: RoomStatus.OCCUPIED }
  });
  
  console.log(`🏨 Set ${occupiedRooms.length} rooms as occupied for testing`);
  
  // Set one room under maintenance
  await prisma.room.update({
    where: { roomNumber: '502' },
    data: { status: RoomStatus.MAINTENANCE }
  });
  
  console.log('🔧 Set room 502 under maintenance');
  
  // Print summary
  const summary = await prisma.room.groupBy({
    by: ['roomType', 'status'],
    _count: true,
  });
  
  console.log('\n📊 Room Status Summary:');
  summary.forEach(({ roomType, status, _count }) => {
    console.log(`${roomType}: ${status} = ${_count}`);
  });
  
  console.log('\n🎉 Database seeding completed successfully!');
  console.log('\n🔍 You can view the data with: npx prisma studio');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });