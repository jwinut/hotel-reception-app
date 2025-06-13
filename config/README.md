# Hotel Room Configuration Master System

This directory contains the master configuration for all hotel room data. This ensures consistency between frontend and backend deployments.

## 📁 Directory Structure

```
config/
├── master/
│   └── hotel-rooms.json    # Master configuration (single source of truth)
└── README.md               # This file
```

## 🏨 Master Configuration (`hotel-rooms.json`)

Contains complete hotel room information:

- **Hotel metadata**: Name, floors, total rooms
- **Room types**: Definitions with pricing, capacity, and features
- **Room inventory**: All 58 rooms with numbers, types, floors, and bed types
- **Layout**: Visual floor plan arrangement for frontend display

### Room Types

| Type | Count | Price (THB/night) | Occupancy | Features |
|------|-------|-------------------|-----------|----------|
| Standard | 34 | 1,200 | 2 | Basic amenities |
| Superior | 4 | 1,800 | 2 | Minibar, city view |
| Deluxe | 5 | 2,400 | 3 | Balcony, premium view |
| Family | 6 | 3,200 | 4 | Multiple beds |
| Hop in | 8 | 800 | 1 | Budget single rooms |
| Zenith | 1 | 5,000 | 2 | Premium suite |

### Room Distribution by Floor

- **Floor 3**: 15 rooms (301-313, A2-1, A2-3, 201-Zenith)
- **Floor 4**: 21 rooms (401-418, A3-1, A3-2, A3-3, A4-1, A4-2, A4-3)
- **Floor 5**: 18 rooms (501-518)

## 🔄 Synchronization System

### Automatic Sync Script

```bash
# Sync master config to all components
npm run sync-rooms

# Or run directly
node scripts/sync-room-config.js
```

This script:
1. ✅ Validates room configuration consistency
2. 🔄 Syncs to frontend public config files
3. 🔄 Syncs to backend config directory
4. 📊 Generates room summary report

### Sync Targets

1. **Frontend Configuration** (for UI display):
   - `frontend/public/config/roomData.json` - Room types for filters
   - `frontend/public/config/hotelLayout.json` - Floor plan layout

2. **Backend Configuration** (for database seeding):
   - `backend/src/config/rooms.json` - Complete room definitions

## 🛠️ Usage

### Making Changes

1. **Edit master config**: Modify `config/master/hotel-rooms.json`
2. **Run sync**: Execute `npm run sync-rooms`
3. **Restart services**: Run `docker compose restart` to apply changes
4. **Reseed database**: Run `npm run seed` for database updates

### Adding New Rooms

1. Add room definition to `rooms` array in master config
2. Add room number to appropriate floor in `layout` array
3. Run sync script to update all components
4. Restart and reseed services

### Changing Room Types

1. Modify `roomTypes` section in master config
2. Update affected rooms in `rooms` array if needed
3. Run sync script
4. Restart services and reseed database

## 🔍 Validation

The sync script automatically validates:

- ✅ Room numbers match between layout and room definitions
- ✅ All room types are properly defined
- ✅ Floor assignments are consistent
- ✅ No duplicate room numbers

## 🚀 Development Workflow

### Local Development

```bash
# 1. Make room configuration changes
vim config/master/hotel-rooms.json

# 2. Sync configuration
npm run sync-rooms

# 3. Restart development environment
npm run restart

# 4. Reseed database with new data
npm run seed
```

### Production Deployment

```bash
# Before deployment
npm run sync-rooms

# Deploy with updated configuration
docker compose up -d

# Apply database changes
npm run migrate
npm run seed
```

## 📋 Configuration Schema

### Room Type Definition

```json
{
  "ROOM_TYPE": {
    "name": "Display Name",
    "basePrice": 1200,
    "maxOccupancy": 2,
    "features": {
      "wifi": true,
      "aircon": true,
      "tv": true,
      "minibar": false,
      "balcony": false,
      "cityView": false
    }
  }
}
```

### Room Definition

```json
{
  "roomNumber": "301",
  "roomType": "DELUXE",
  "floor": 3,
  "bedType": "king"
}
```

### Layout Definition

```json
{
  "floor": 3,
  "rows": [
    ["301", "302", null, "304"],
    ["306", "305", null, null]
  ]
}
```

## 🔐 Data Consistency

### Key Principles

1. **Single Source of Truth**: All room data comes from master config
2. **Automatic Validation**: Sync script prevents inconsistencies
3. **Version Control**: All changes tracked in git
4. **Deployment Safety**: Config validated before deployment

### Consistency Checks

- Room numbers must exist in both layout and room definitions
- Room types must be defined in roomTypes section
- Floor assignments must match layout structure
- No duplicate room numbers allowed

## 📞 Troubleshooting

### Common Issues

**Config File Not Found**
```bash
# Generate missing config files
npm run sync-rooms
```

**Room Number Mismatch**
```bash
# Check validation output
npm run sync-rooms
# Fix inconsistencies in master config
```

**Database Out of Sync**
```bash
# Reseed database with current config
npm run seed
```

**Frontend Not Updating**
```bash
# Clear browser cache and restart
npm run restart
```

---

**⚠️ Important**: Always run `npm run sync-rooms` after making changes to the master configuration to ensure all components stay synchronized.