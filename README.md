# Hotel Reception Management System

A modern, full-stack hotel reception system built with React, Node.js, TypeScript, and PostgreSQL. This system enables hotel staff to manage walk-in check-ins, room availability, bookings, and guest services efficiently.

## 🚀 Quick Start

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/)
- [Node.js 18+](https://nodejs.org/) (for local development)
- [Git](https://git-scm.com/downloads)

### 🐳 Docker Deployment (Recommended)

#### Production-Like Environment

Run the complete stack with a single command:

```bash
# Clone the repository
git clone <repository-url>
cd hotel-reception-app

# Start all services (Frontend + Backend + Database)
docker-compose -f docker-compose.full.yml up -d

# View logs
docker-compose -f docker-compose.full.yml logs -f

# Stop all services
docker-compose -f docker-compose.full.yml down
```

**Services will be available at:**
- 🌐 **Frontend**: http://localhost:3000
- 🔧 **Backend API**: http://localhost:4000
- 🗄️ **Database**: localhost:5432 (internal)

#### Development Environment (with hot-reload)

For development with automatic code reloading:

```bash
# Start development environment
docker-compose -f docker-compose.development.yml up -d

# View logs
docker-compose -f docker-compose.development.yml logs -f

# Stop development environment
docker-compose -f docker-compose.development.yml down
```

**Development features:**
- ✅ Hot-reload for frontend and backend changes
- ✅ Source code mounted as volumes
- ✅ Development-optimized builds
- ✅ Debug-friendly logging

### 💻 Local Development Setup

#### Option 1: Mixed (Docker DB + Local Development)

1. **Start only the database:**
```bash
docker-compose -f docker-compose.dev.yml up -d
```

2. **Run backend locally:**
```bash
cd backend
npm install
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

3. **Run frontend locally:**
```bash
cd frontend
npm install
npm start
```

#### Option 2: Fully Local Development

1. **Setup PostgreSQL locally** (install PostgreSQL 15+)

2. **Configure environment:**
```bash
# Create backend/.env
cd backend
echo "DATABASE_URL=postgresql://hoteluser:hotelpass@localhost:5432/hoteldb" > .env
echo "CORS_ORIGIN=http://localhost:3000" >> .env
echo "PORT=4000" >> .env
```

3. **Setup database:**
```bash
cd backend
npm install
npm run prisma:migrate
npm run prisma:seed
```

4. **Start backend:**
```bash
npm run dev
```

5. **Start frontend:**
```bash
cd frontend
npm install
npm start
```

## 📁 Project Structure

```
hotel-reception-app/
├── frontend/                 # React TypeScript frontend
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API clients and external services
│   │   ├── hooks/           # Custom React hooks
│   │   ├── store/           # Redux state management
│   │   ├── utils/           # Utility functions
│   │   └── types/           # TypeScript type definitions
│   ├── public/config/       # Runtime configuration
│   └── Dockerfile           # Frontend container config
├── backend/                 # Node.js TypeScript API
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── services/        # Business logic
│   │   ├── routes/          # API route definitions
│   │   ├── middleware/      # Express middleware
│   │   └── lib/             # Shared libraries
│   ├── prisma/              # Database schema and migrations
│   └── Dockerfile           # Backend container config
├── docs/                    # Documentation
├── docker-compose.full.yml      # Production-like deployment
├── docker-compose.development.yml # Development with hot-reload
├── docker-compose.dev.yml        # Database only
└── README.md                # This file
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```bash
DATABASE_URL=postgresql://hoteluser:hotelpass@hotel-database:5432/hoteldb
CORS_ORIGIN=http://localhost:3000
PORT=4000
NODE_ENV=production
```

#### Frontend
```bash
REACT_APP_API_URL=http://localhost:4000/api
REACT_APP_HOTEL_NAME=Grand Hotel Reception
REACT_APP_ADMIN_CODE=admin123
```

### Database Configuration

The system uses PostgreSQL with Prisma ORM. Database migrations are handled automatically.

**Default credentials:**
- Username: `hoteluser`
- Password: `hotelpass`
- Database: `hoteldb`

## 🎯 Features

### ✅ Implemented (Milestone 1 & 2)
- **Room Availability Display**: Real-time room status and pricing
- **Walk-in Booking System**: Complete booking flow from room selection to confirmation
- **Guest Management**: Capture and validate guest information
- **Responsive UI**: Professional interface with Thai/English support
- **Receipt Generation**: Printable booking confirmations

### 🚧 In Development (Milestone 3+)
- **Payment Processing**: Cash and card payment handling
- **Key Card Management**: Digital key card generation
- **Analytics Dashboard**: Booking conversion metrics
- **Advanced Reporting**: Revenue and occupancy reports

## 🧪 Testing

### Frontend Testing
```bash
cd frontend
npm test                    # Run tests
npm test -- --coverage     # Run with coverage
npm test -- --watchAll=false # Single run
```

### Backend Testing
```bash
cd backend
npm test                    # Run tests
npm run test:watch         # Watch mode
```

### Integration Testing
```bash
# Start test environment
docker-compose -f docker-compose.development.yml up -d

# Run end-to-end tests
npm run test:e2e
```

## 📊 Database Management

### Using Prisma Studio (Database GUI)
```bash
cd backend
npm run prisma:studio
# Opens GUI at http://localhost:5555
```

### Common Database Commands
```bash
# Generate Prisma client
npm run prisma:generate

# Create new migration
npm run prisma:migrate

# Deploy migrations (production)
npm run prisma:deploy

# Seed database with sample data
npm run prisma:seed

# Reset database
npx prisma migrate reset
```

## 🐛 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Check what's using port 3000/4000/5432
lsof -i :3000
lsof -i :4000
lsof -i :5432

# Kill process
kill -9 <PID>
```

#### Docker Issues
```bash
# Clean up Docker
docker-compose down --volumes --remove-orphans
docker system prune -a

# Rebuild containers
docker-compose -f docker-compose.full.yml up --build
```

#### Database Connection Issues
```bash
# Check database status
docker-compose -f docker-compose.dev.yml ps

# View database logs
docker-compose -f docker-compose.dev.yml logs hotel-database
```

#### Permission Issues (Linux/Mac)
```bash
# Fix file permissions
sudo chown -R $USER:$USER .
chmod -R 755 .
```

### Debug Mode

Enable debug logging:

```bash
# Backend
DEBUG=hotel:* npm run dev

# Frontend
REACT_APP_DEBUG=true npm start
```

## 📈 Monitoring

### Health Checks

All services include health check endpoints:

- **Frontend**: http://localhost:3000/health
- **Backend**: http://localhost:4000/health
- **Database**: Automatic health checks via Docker

### Logs

```bash
# View all logs
docker-compose -f docker-compose.full.yml logs -f

# View specific service logs
docker-compose -f docker-compose.full.yml logs -f hotel-backend
docker-compose -f docker-compose.full.yml logs -f hotel-frontend
docker-compose -f docker-compose.full.yml logs -f hotel-database
```

## 🚀 Deployment

### Production Deployment

1. **Set environment variables:**
```bash
export DB_PASSWORD=secure_password
export REACT_APP_API_URL=https://your-domain.com/api
```

2. **Deploy with Docker:**
```bash
docker-compose -f docker-compose.full.yml up -d
```

3. **Run database migrations:**
```bash
docker-compose -f docker-compose.full.yml exec hotel-backend npm run prisma:deploy
```

4. **Seed initial data:**
```bash
docker-compose -f docker-compose.full.yml exec hotel-backend npm run prisma:seed
```

### Scaling

To scale services:
```bash
# Scale backend
docker-compose -f docker-compose.full.yml up -d --scale hotel-backend=3

# Scale frontend
docker-compose -f docker-compose.full.yml up -d --scale hotel-frontend=2
```

## 📚 Additional Resources

- [API Documentation](./docs/api-documentation.md)
- [User Guide (English)](./docs/user-guide-en/README.md)
- [User Guide (Thai)](./docs/user-guide-th/README.md)
- [Development Guide](./docs/development-guide.md)
- [Architecture Overview](./docs/architecture.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- 📧 Email: support@hotelreception.com
- 💬 Issues: [GitHub Issues](https://github.com/your-repo/hotel-reception-app/issues)
- 📖 Documentation: [Project Wiki](https://github.com/your-repo/hotel-reception-app/wiki)

---

**Built with ❤️ for modern hotel management**