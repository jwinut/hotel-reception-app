# Hotel Reception System Documentation

## Overview
This is a modern hotel reception management system built for Thai hotels. The system helps hotel staff manage guest check-ins, bookings, and room assignments with an intuitive, professional interface.

## Purpose
The system is designed to:
- Streamline guest check-in processes for walk-in customers
- Manage advance bookings and reservations
- Provide visual room selection with real-time availability
- Handle pricing for different room types and meal options
- Support both Thai and modern hotel management workflows

## Target Users
- Hotel reception staff
- Hotel managers
- Administrative personnel

## Current Features (Version 2.0)
1. **Complete Walk-in Booking System**
   - Room availability display with real-time status
   - Visual room selection with filtering by type and availability
   - Guest information capture and validation
   - Booking confirmation with receipt generation
   - Multi-language support (Thai/English)

2. **Backend Services**
   - PostgreSQL database with Prisma ORM
   - RESTful API endpoints for booking management
   - Automated room status updates
   - Database transactions for data consistency

3. **Professional UI/UX**
   - Responsive design optimized for tablets and desktops
   - Light mode interface with consistent styling
   - Intuitive navigation and workflow
   - Professional receipt generation

## Technical Architecture
- **Frontend**: React 18 with TypeScript, Redux Toolkit for state management
- **Backend**: Node.js with Express, TypeScript, and Prisma ORM
- **Database**: PostgreSQL 15 with automated migrations
- **Deployment**: Docker Compose with production and development configurations
- **Testing**: Jest and React Testing Library with ~72% coverage
- **Internationalization**: react-i18next for Thai/English support

## File Structure
See [Project Structure](./project-structure.md) for detailed codebase organization.

## Design Decisions
See [Design Document](./design-decisions.md) for UI/UX and technical choices.

## Planned Features
See [Feature Roadmap](./feature-roadmap.md) for upcoming developments.