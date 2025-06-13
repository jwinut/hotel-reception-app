# Project Structure Documentation

## Directory Overview

```
hotel-reception-app/
├── backend/                        # Node.js API server
│   ├── src/
│   │   ├── controllers/            # Request handlers
│   │   ├── services/               # Business logic (BookingService, etc.)
│   │   ├── routes/                 # API route definitions
│   │   ├── middleware/             # Express middleware
│   │   └── server.ts               # Application entry point
│   ├── prisma/                     # Database schema and migrations
│   │   ├── schema.prisma           # Database schema definition
│   │   ├── migrations/             # Database migration files
│   │   └── seed.ts                 # Sample data seeding
│   ├── Dockerfile                  # Backend container configuration
│   └── package.json                # Backend dependencies
├── frontend/                       # React TypeScript application
│   ├── public/
│   │   ├── config/                 # Runtime configuration files
│   │   │   ├── bookingOptions.json # Walk-in booking types
│   │   │   ├── hotelLayout.json    # Room layout by floor
│   │   │   ├── priceData.json      # Room pricing information
│   │   │   └── roomData.json       # Room details and types
│   │   └── [other static files]    # Icons, manifests, etc.
│   └── src/                        # React TypeScript source
│       ├── components/             # Reusable UI components
│       │   ├── walkin/             # Walk-in booking components
│       │   │   ├── RoomAvailabilityDashboard.tsx
│       │   │   ├── RoomSelection.tsx
│       │   │   ├── QuickGuestForm.tsx
│       │   │   └── BookingSuccess.tsx
│       │   └── [other components]   # Shared UI components
│       ├── pages/                  # Page-level components
│       ├── services/               # API clients and external services
│       ├── hooks/                  # Custom React hooks
│       ├── store/                  # Redux state management
│       ├── utils/                  # Utility functions
│       ├── types/                  # TypeScript type definitions
│       ├── i18n/                   # Internationalization (Thai/English)
│       └── App.tsx                 # Main application component
│   ├── Dockerfile                  # Frontend container configuration
│   └── package.json                # Frontend dependencies
├── docs/                           # Project documentation
├── docker-compose.yml              # Production stack deployment
├── docker-compose.development.yml  # Development with hot-reload
└── README.md                       # Project overview and setup
```

## Configuration Files Explained

### 1. Room Data (`roomData.json`)
Contains all hotel rooms with their numbers and types:
- **Purpose**: Defines what rooms exist in the hotel
- **Structure**: Array of room objects with `roomNumber` and `roomType`
- **Room Types**: Standard, Superior, Deluxe, Family, Hop in, Zenith

### 2. Hotel Layout (`hotelLayout.json`)
Defines the visual layout of rooms on each floor:
- **Purpose**: Creates the visual floor plan for room selection
- **Structure**: Array of floors with row-based room arrangements
- **Usage**: Powers the visual room grid interface

### 3. Pricing Data (`priceData.json`)
Sets pricing for each room type:
- **Purpose**: Manages room rates with/without breakfast
- **Structure**: Array of room types with pricing options
- **Fields**: `roomType`, `noBreakfast`, `withBreakfast`

### 4. Booking Options (`bookingOptions.json`)
Defines walk-in booking types:
- **Purpose**: Different pricing/service options for walk-in guests
- **Options**: Normal rates, special rates, press rates
- **Usage**: Displayed as buttons in walk-in check-in flow
- **Integration**: Works with backend pricing calculations

## Architecture Overview

### Backend Services
- **BookingService**: Handles walk-in booking creation with database transactions
- **API Endpoints**: RESTful endpoints for room availability and booking management
- **Database**: PostgreSQL with Prisma ORM for type-safe queries
- **Health Checks**: Automated service monitoring

### Frontend Architecture
- **App.tsx**: Main application with React Router and Redux integration
- **Redux Store**: State management with slices for auth, booking, ui, and config
- **Component Structure**: Organized by feature (walkin/, shared components)
- **TypeScript**: Strict typing throughout the application
- **Internationalization**: react-i18next for Thai/English support

### Walk-in Booking Flow
1. **RoomAvailabilityDashboard**: Real-time room status display
2. **RoomSelection**: Visual room picker with filtering
3. **QuickGuestForm**: Guest information capture and validation
4. **BookingSuccess**: Confirmation and receipt generation

### Database Schema
- **WalkInBooking**: Complete booking records with guest information
- **Room**: Room definitions with availability status
- **Pricing**: Dynamic pricing with breakfast options
- **Migrations**: Automated database schema updates

### WalkInOptionsPage.js - Walk-in Check-in
- **Role**: Guest check-in for non-reservation customers
- **Features**:
  - Booking type selection
  - Room type filtering
  - Visual room selection grid
  - Real-time date/time display
  - Multi-step workflow

## Styling Architecture

### CSS Custom Properties (`index.css`)
- **Modern Color System**: Professional blue/green/purple palette
- **Design Tokens**: Consistent spacing, shadows, and border radius
- **Responsive Variables**: Mobile-first design approach

### Component-Specific Styling
- Each major component has its own CSS file
- Uses CSS custom properties for consistency
- Modern effects: gradients, shadows, animations
- Responsive design with mobile breakpoints

## Configuration Management

### Why JSON Configuration?
1. **Easy Updates**: Non-developers can modify hotel data
2. **No Code Changes**: Room additions don't require programming
3. **Quick Deployment**: Configuration changes deploy instantly
4. **Data Separation**: Business logic separate from application code

### Future Database Integration
The JSON structure is designed to map directly to PostgreSQL tables:
- `roomData.json` → `rooms` table
- `priceData.json` → `room_pricing` table
- Booking data → `bookings` and `guests` tables

This allows for seamless transition from file-based to database-driven configuration.