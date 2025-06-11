# Hotel Reception Management System

A modern, professional hotel reception system built for Thai hotels. This system streamlines guest check-ins, booking management, and room assignments with an intuitive interface designed for hotel staff.

## 🏨 Features

### Current (Version 1.1)
- **Walk-in Guest Check-in**: Visual room selection with real-time availability
- **🆕 Complete Booking System**: Multi-step wizard for advance reservations
- **🆕 Guest Management**: Comprehensive guest information with validation
- **🆕 Room Availability**: Visual room selection with pricing integration
- **🆕 Booking Confirmation**: Professional receipts with payment options
- **Price Management**: Dynamic pricing for different room types and meal options  
- **Modern Navigation**: Professional interface with admin controls
- **Responsive Design**: Optimized for tablets and desktop use
- **Thai Language Support**: Full Thai language interface

### Coming Soon
- **Booking Management Dashboard**: View and edit existing reservations
- **Guest Profile System**: Track guest history and preferences
- **Room Status Management**: Real-time room availability tracking
- **Reporting & Analytics**: Occupancy and revenue insights

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn package manager

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd hotel-reception-app

# Install dependencies
cd frontend
npm install

# Start development server
npm start
```

The application will open at `http://localhost:3000`

### Docker Deployment (Recommended)
```bash
# Build and run with Docker Compose
docker-compose up -d
```

## 📁 Project Structure

```
hotel-reception-app/
├── docs/                    # Comprehensive documentation
├── frontend/                # React application
│   ├── public/config/       # Hotel configuration files
│   └── src/                 # Source code
├── docker-compose.yml       # Docker deployment configuration
└── README.md               # This file
```

## ⚙️ Configuration

Hotel-specific settings are stored in JSON files in `frontend/public/config/`:

- **`roomData.json`**: Hotel rooms and types
- **`hotelLayout.json`**: Visual room layout by floor  
- **`priceData.json`**: Room pricing with/without breakfast
- **`bookingOptions.json`**: Walk-in booking types

See [`docs/configuration-guide.md`](./docs/configuration-guide.md) for detailed configuration instructions.

## 📖 Documentation

- **[Project Structure](./docs/project-structure.md)**: Detailed codebase organization
- **[Design Decisions](./docs/design-decisions.md)**: UI/UX and technical choices
- **[Feature Roadmap](./docs/feature-roadmap.md)**: Planned development timeline
- **[Configuration Guide](./docs/configuration-guide.md)**: How to customize hotel settings

## 🔧 Development

### Available Scripts
```bash
npm start          # Start development server
npm test           # Run test suite
npm run build      # Build production version
npm run eject      # Eject from Create React App (not recommended)
```

### Code Organization
- **Components**: Reusable React components in `src/`
- **Styling**: CSS modules with custom properties for design consistency
- **Configuration**: JSON-based configuration for easy hotel customization

## 🏗️ Technical Architecture

### Frontend
- **React 18**: Modern React with functional components and hooks
- **CSS Custom Properties**: Consistent design system
- **Responsive Design**: Mobile-first approach with tablet optimization

### Future Backend
- **PostgreSQL**: Relational database for analytics and reporting
- **RESTful API**: Clean API design for frontend integration
- **Docker**: Containerized deployment for easy scaling

## 🎨 Design Philosophy

- **Reception-Focused**: Designed specifically for hotel staff workflows
- **Touch-Friendly**: Large buttons and clear visual hierarchy
- **Professional Aesthetic**: Modern design that builds guest confidence
- **Minimal Clicks**: Streamlined processes for common tasks

## 🔐 Admin Features

- **Price Management**: Update room rates and breakfast pricing
- **User Management**: Add and manage staff accounts (planned)
- **Configuration**: Modify hotel settings through admin interface (planned)

## 📊 Future Analytics Features

- Daily/monthly occupancy reports
- Revenue tracking by room type
- Guest booking patterns analysis
- Staff performance metrics

## 🤝 Contributing

This project follows engineering best practices:

1. **Documentation First**: All features documented before implementation
2. **Configuration-Driven**: Hotel settings separate from code
3. **Git Workflow**: Feature branches with descriptive commit messages
4. **Testing**: Comprehensive testing for reliable operation

## 📞 Support

For questions about configuration, features, or technical issues:
- Check the documentation in the `docs/` folder
- Review configuration examples in `frontend/public/config/`
- Contact the development team with specific error messages

## 🔄 Version History

### Version 1.1 (Current)
- **Major Feature**: Complete booking creation system
- Multi-step booking wizard with guest information, dates, and room selection
- Booking confirmation with payment options and receipt printing
- Professional UI with responsive design for all devices
- Integration with existing navigation and configuration systems

### Version 1.0
- Modern UI with professional hotel aesthetic
- Walk-in guest check-in with visual room selection
- Price management system
- Admin panel foundation
- Comprehensive documentation

### Planned Version 2.0
- Booking management dashboard
- Guest profile tracking
- Room status management
- Basic reporting features

## 📜 License

This project is proprietary software developed for hotel management use.