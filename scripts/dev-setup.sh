#!/bin/bash

# Hotel Reception System - Development Setup Script
# This script sets up the development environment

set -e

echo "🏨 Hotel Reception System - Development Setup"
echo "=============================================="

# Check prerequisites
echo "📋 Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version $NODE_VERSION is too old. Please install Node.js 16 or higher."
    exit 1
fi

echo "✅ Node.js $(node -v) is installed"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm."
    exit 1
fi

echo "✅ npm $(npm -v) is installed"

# Setup frontend
echo ""
echo "📦 Setting up frontend dependencies..."
cd frontend

if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
else
    echo "✅ Frontend dependencies already installed"
fi

# Check if development server can start
echo ""
echo "🧪 Testing development server..."
timeout 10s npm start > /dev/null 2>&1 &
SERVER_PID=$!
sleep 5

if kill -0 $SERVER_PID 2>/dev/null; then
    echo "✅ Development server can start successfully"
    kill $SERVER_PID
else
    echo "❌ Development server failed to start"
    exit 1
fi

# Create logs directory
cd ..
echo ""
echo "📁 Creating required directories..."
mkdir -p logs/nginx
mkdir -p database/backups
echo "✅ Directories created"

# Copy environment file if it doesn't exist
if [ ! -f ".env" ]; then
    echo ""
    echo "⚙️ Creating environment configuration..."
    cp .env.example .env
    echo "✅ Environment file created (.env)"
    echo "📝 Please edit .env file with your specific configuration"
else
    echo "✅ Environment file already exists"
fi

# Validate configuration files
echo ""
echo "🔍 Validating configuration files..."

CONFIG_DIR="frontend/public/config"
REQUIRED_FILES=("roomData.json" "hotelLayout.json" "priceData.json" "bookingOptions.json")

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$CONFIG_DIR/$file" ]; then
        # Check JSON syntax
        if node -e "JSON.parse(require('fs').readFileSync('$CONFIG_DIR/$file', 'utf8'))" 2>/dev/null; then
            echo "✅ $file is valid"
        else
            echo "❌ $file has invalid JSON syntax"
            exit 1
        fi
    else
        echo "❌ Required configuration file missing: $file"
        exit 1
    fi
done

# Check Docker (optional)
echo ""
echo "🐳 Checking Docker (optional for deployment)..."
if command -v docker &> /dev/null; then
    echo "✅ Docker $(docker --version | cut -d' ' -f3 | tr -d ',') is installed"
    
    if command -v docker &> /dev/null && docker compose version &> /dev/null; then
        echo "✅ Docker Compose V2 is installed with Docker"
    else
        echo "⚠️ Docker Compose is not installed (optional for deployment)"
    fi
else
    echo "⚠️ Docker is not installed (optional for deployment)"
fi

echo ""
echo "🎉 Development environment setup complete!"
echo ""
echo "Next steps:"
echo "1. cd frontend && npm start     # Start development server"
echo "2. Open http://localhost:3000   # View application"
echo "3. Edit configuration files in frontend/public/config/"
echo ""
echo "For deployment:"
echo "1. Edit .env file with your settings"
echo "2. docker compose up -d         # Start production environment"
echo ""
echo "📚 See docs/ folder for detailed documentation"