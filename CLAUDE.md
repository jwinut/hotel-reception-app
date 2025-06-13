# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Hotel Reception Management System - A modern React/TypeScript application for Thai hotels to manage guest check-ins, bookings, and room assignments.

## Commands

### Development
```bash
cd frontend
npm install                    # Install dependencies
npm start                      # Start dev server at localhost:3000
```

### Testing
```bash
cd frontend
npm test                       # Run tests in watch mode
npm test -- --coverage         # Run tests with coverage report
npm test -- --coverage --watchAll=false  # Single run with coverage
npm test -- BookingCard        # Run specific test file
npm test -- --testPathPattern=BookingCard  # Run tests matching pattern
```

### Building
```bash
cd frontend
npm run build                  # Production build
```

### Test Coverage
Current coverage: ~72% (target: 80%)
Coverage reports are generated in `frontend/coverage/lcov-report/index.html`

## Architecture

### Tech Stack
- **Frontend**: React 18 with TypeScript (strict mode)
- **State Management**: Redux Toolkit with 4 slices (auth, booking, ui, config)
- **Routing**: React Router v6
- **Testing**: Jest + React Testing Library
- **Styling**: CSS with design tokens (CSS custom properties)
- **i18n**: react-i18next (Thai/English)

### Key Directories
```
frontend/src/
├── components/         # Reusable UI components (100% TypeScript)
├── hooks/             # Custom hooks (useApi, useBooking, useDebounce, etc.)
├── services/          # API layer (BookingService, AuthenticationService, etc.)
├── store/slices/      # Redux state management
├── utils/             # Utilities (validation, accessibility, performance)
└── types/             # TypeScript type definitions
```

### State Management Pattern
The app uses Redux Toolkit with the following slices:
- **authSlice**: User authentication and permissions
- **bookingSlice**: Booking data and operations
- **configSlice**: Hotel configuration (rooms, pricing)
- **uiSlice**: UI state (modals, loading, errors)

### Service Layer Pattern
All API calls go through service classes:
```typescript
// Example: BookingService
bookingService.getBookings(params)
bookingService.createBooking(data)
bookingService.updateBooking(id, data)
```

### Testing Strategy
- Component tests use React Testing Library with user-centric approach
- Service tests use MSW for API mocking
- Redux tests verify actions, reducers, and async thunks
- Custom hooks tested with renderHook
- Focus on user interactions over implementation details

### TypeScript Configuration
Strict mode enabled with additional checks:
- `noUncheckedIndexedAccess`: true
- `exactOptionalPropertyTypes`: true
- All components are `.tsx`, utilities are `.ts`

### Environment Variables
Required in `.env`:
- `REACT_APP_ADMIN_CODE`: Admin authentication
- `REACT_APP_API_URL`: Backend API URL
- `REACT_APP_HOTEL_NAME`: Hotel name display

### Current Testing Focus
Phase 6 in progress - Business component testing:
- ✅ BookingCard.js (45 tests)
- ✅ CheckInProcess.js (49 tests)
- 🟡 BookingConfirmation.js (in progress)
- 🟡 BookingDetails.js (pending)

### Performance Optimizations
- Code splitting with React.lazy
- Memoization with React.memo, useMemo, useCallback
- Debounced inputs for search functionality
- Optimized test performance (see docs/planning-archive/TEST_PERFORMANCE_OPTIMIZATION.md)

### Security Measures
- Environment variable authentication
- Input validation and sanitization
- Rate limiting on authentication
- No hardcoded secrets
- ConfigurationService for secure data management