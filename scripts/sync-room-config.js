#!/usr/bin/env node

/**
 * Room Configuration Sync Script
 * 
 * This script maintains a single source of truth for hotel room configuration
 * and syncs it to both frontend and backend components.
 */

const fs = require('fs');
const path = require('path');

// Paths
const MASTER_CONFIG = path.join(__dirname, '../config/master/hotel-rooms.json');
const FRONTEND_ROOM_DATA = path.join(__dirname, '../frontend/public/config/roomData.json');
const FRONTEND_HOTEL_LAYOUT = path.join(__dirname, '../frontend/public/config/hotelLayout.json');
const FRONTEND_PRICE_DATA = path.join(__dirname, '../frontend/public/config/priceData.json');
const FRONTEND_BOOKING_OPTIONS = path.join(__dirname, '../frontend/public/config/bookingOptions.json');
const BACKEND_ROOM_CONFIG = path.join(__dirname, '../backend/src/config/rooms.json');

function loadMasterConfig() {
  try {
    const content = fs.readFileSync(MASTER_CONFIG, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error('❌ Error loading master config:', error.message);
    process.exit(1);
  }
}

function ensureDirectoryExists(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Created directory: ${dir}`);
  }
}

function syncFrontendRoomData(masterConfig) {
  // Convert master config to frontend roomData.json format
  const frontendRoomData = {
    rooms: masterConfig.rooms.map(room => ({
      roomNumber: room.roomNumber,
      roomType: masterConfig.roomTypes[room.roomType].name
    }))
  };

  ensureDirectoryExists(FRONTEND_ROOM_DATA);
  fs.writeFileSync(FRONTEND_ROOM_DATA, JSON.stringify(frontendRoomData, null, 2));
  console.log(`✅ Synced frontend room data: ${FRONTEND_ROOM_DATA}`);
}

function syncFrontendLayout(masterConfig) {
  // Master config already has the layout in correct format
  const frontendLayout = {
    layout: masterConfig.layout.map(floor => ({
      floor: floor.floor.toString(),
      rows: floor.rows
    }))
  };

  ensureDirectoryExists(FRONTEND_HOTEL_LAYOUT);
  fs.writeFileSync(FRONTEND_HOTEL_LAYOUT, JSON.stringify(frontendLayout, null, 2));
  console.log(`✅ Synced frontend layout: ${FRONTEND_HOTEL_LAYOUT}`);
}

function syncFrontendPricing(masterConfig) {
  // Generate pricing data with breakfast surcharge
  const breakfastSurcharge = masterConfig.pricing.breakfastSurcharge;
  const frontendPricing = {
    prices: Object.entries(masterConfig.roomTypes).map(([typeKey, typeConfig]) => ({
      roomType: typeConfig.name,
      noBreakfast: typeConfig.basePrice,
      withBreakfast: typeConfig.basePrice + breakfastSurcharge
    }))
  };

  ensureDirectoryExists(FRONTEND_PRICE_DATA);
  fs.writeFileSync(FRONTEND_PRICE_DATA, JSON.stringify(frontendPricing, null, 2));
  console.log(`✅ Synced frontend pricing: ${FRONTEND_PRICE_DATA}`);
}

function syncFrontendBookingOptions(masterConfig) {
  // Copy booking options directly
  const frontendBookingOptions = masterConfig.bookingOptions;

  ensureDirectoryExists(FRONTEND_BOOKING_OPTIONS);
  fs.writeFileSync(FRONTEND_BOOKING_OPTIONS, JSON.stringify(frontendBookingOptions, null, 2));
  console.log(`✅ Synced frontend booking options: ${FRONTEND_BOOKING_OPTIONS}`);
}

function syncBackendConfig(masterConfig) {
  // Backend needs the full configuration for seeding and room management
  const backendConfig = {
    hotel: masterConfig.hotel,
    roomTypes: masterConfig.roomTypes,
    rooms: masterConfig.rooms,
    layout: masterConfig.layout
  };

  ensureDirectoryExists(BACKEND_ROOM_CONFIG);
  fs.writeFileSync(BACKEND_ROOM_CONFIG, JSON.stringify(backendConfig, null, 2));
  console.log(`✅ Synced backend config: ${BACKEND_ROOM_CONFIG}`);
}

function validateRoomNumbers(masterConfig) {
  const layoutRooms = new Set();
  const configRooms = new Set();

  // Extract room numbers from layout
  masterConfig.layout.forEach(floor => {
    floor.rows.forEach(row => {
      row.forEach(cell => {
        if (cell && cell !== null) {
          layoutRooms.add(cell);
        }
      });
    });
  });

  // Extract room numbers from rooms config
  masterConfig.rooms.forEach(room => {
    configRooms.add(room.roomNumber);
  });

  // Check for inconsistencies
  const layoutOnly = [...layoutRooms].filter(room => !configRooms.has(room));
  const configOnly = [...configRooms].filter(room => !layoutRooms.has(room));

  if (layoutOnly.length > 0) {
    console.warn(`⚠️  Rooms in layout but not in config: ${layoutOnly.join(', ')}`);
  }

  if (configOnly.length > 0) {
    console.warn(`⚠️  Rooms in config but not in layout: ${configOnly.join(', ')}`);
  }

  if (layoutOnly.length === 0 && configOnly.length === 0) {
    console.log(`✅ Room configuration validation passed (${configRooms.size} rooms)`);
  }

  return { layoutRooms, configRooms, isValid: layoutOnly.length === 0 && configOnly.length === 0 };
}

function generateSummary(masterConfig) {
  const summary = {};
  masterConfig.rooms.forEach(room => {
    const roomType = room.roomType;
    if (!summary[roomType]) {
      summary[roomType] = 0;
    }
    summary[roomType]++;
  });

  console.log('\n📊 Room Type Summary:');
  Object.entries(summary).forEach(([type, count]) => {
    const typeName = masterConfig.roomTypes[type].name;
    const basePrice = masterConfig.roomTypes[type].basePrice;
    console.log(`   ${typeName}: ${count} rooms (${basePrice} THB/night)`);
  });

  const totalRooms = Object.values(summary).reduce((sum, count) => sum + count, 0);
  console.log(`   Total: ${totalRooms} rooms`);
}

function main() {
  console.log('🏨 Hotel Room Configuration Sync');
  console.log('================================\n');

  // Load master configuration
  console.log('📖 Loading master configuration...');
  const masterConfig = loadMasterConfig();

  // Validate room numbers consistency
  console.log('\n🔍 Validating room configuration...');
  const validation = validateRoomNumbers(masterConfig);

  if (!validation.isValid) {
    console.error('❌ Validation failed. Please fix room configuration inconsistencies.');
    process.exit(1);
  }

  // Sync to all targets
  console.log('\n🔄 Syncing configuration...');
  syncFrontendRoomData(masterConfig);
  syncFrontendLayout(masterConfig);
  syncFrontendPricing(masterConfig);
  syncFrontendBookingOptions(masterConfig);
  syncBackendConfig(masterConfig);

  // Generate summary
  generateSummary(masterConfig);

  console.log('\n🎉 Room configuration sync completed successfully!');
  console.log('\n💡 Next steps:');
  console.log('   1. Update backend seed script to use new config');
  console.log('   2. Restart services to pick up new configuration');
  console.log('   3. Run database migrations if room structure changed');
}

if (require.main === module) {
  main();
}

module.exports = {
  loadMasterConfig,
  syncFrontendRoomData,
  syncFrontendLayout,
  syncFrontendPricing,
  syncFrontendBookingOptions,
  syncBackendConfig,
  validateRoomNumbers
};