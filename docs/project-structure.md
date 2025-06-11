# Project Structure Documentation

## Directory Overview

```
hotel-reception-app/
├── docs/                           # Documentation folder
├── frontend/                       # React application
│   ├── public/                     # Static files and configuration
│   │   ├── config/                 # Hotel configuration files
│   │   │   ├── bookingOptions.json # Walk-in booking types
│   │   │   ├── hotelLayout.json    # Room layout by floor
│   │   │   ├── priceData.json      # Room pricing information
│   │   │   └── roomData.json       # Room details and types
│   │   └── [other static files]    # Icons, manifests, etc.
│   └── src/                        # React source code
│       ├── App.js                  # Main application component
│       ├── App.css                 # Global styling
│       ├── MainPage.js             # Dashboard/welcome page
│       ├── Navigation.js           # Top navigation component
│       ├── Navigation.css          # Navigation styling
│       ├── WalkInOptionsPage.js    # Walk-in guest check-in
│       ├── WalkInOptionsPage.css   # Walk-in page styling
│       ├── index.js                # App entry point
│       └── index.css               # Global CSS variables and reset
└── package.json                    # Project dependencies
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

## Component Architecture

### App.js - Main Application
- **Role**: Root component and routing
- **Responsibilities**: 
  - Admin authentication
  - Navigation state management
  - Route configuration
  - Global state (admin mode)

### Navigation.js - Navigation Bar
- **Role**: Site-wide navigation
- **Features**:
  - Section-based organization (check-in, booking, admin)
  - Active page highlighting
  - Admin feature visibility control
  - Responsive mobile design

### MainPage.js - Dashboard
- **Role**: Welcome page and price management
- **Features**:
  - Welcome section with hotel branding
  - Price management (admin feature)
  - Collapsible sections
  - Professional layout

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