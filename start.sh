#!/bin/bash

echo "🍫 KitKat Promo Admin System - Quick Start"
echo "=========================================="
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

echo "✓ Docker is running"
echo ""

# Start database and Redis
echo "📦 Starting PostgreSQL and Redis..."
docker compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 5

# Check if backend dependencies are installed
if [ ! -d "backend/node_modules" ]; then
    echo "📥 Installing backend dependencies..."
    cd backend && npm install && cd ..
fi

# Check if frontend dependencies are installed  
if [ ! -d "admin-panel/node_modules" ]; then
    echo "📥 Installing frontend dependencies..."
    cd admin-panel && npm install && cd ..
fi

# Run migrations
echo "🗄️  Running database migrations..."
cd backend
npm run migrate:up > /dev/null 2>&1
cd ..

echo ""
echo "=========================================="
echo "✅ Setup complete!"
echo ""
echo "🚀 Starting servers..."
echo ""
echo "Backend will run on:  http://localhost:3000"
echo "Frontend will run on: http://localhost:5173"
echo ""
echo "Default login credentials:"
echo "  Username: superadmin"
echo "  Password: Admin@123"
echo ""
echo "=========================================="
echo ""
echo "Opening two terminal windows..."
echo ""

# Start backend in new terminal (platform-specific)
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    osascript -e 'tell app "Terminal" to do script "cd '$(pwd)'/backend && npm run dev"'
    osascript -e 'tell app "Terminal" to do script "cd '$(pwd)'/admin-panel && npm run dev"'
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    if command -v gnome-terminal &> /dev/null; then
        gnome-terminal -- bash -c "cd $(pwd)/backend && npm run dev; exec bash"
        sleep 2
        gnome-terminal -- bash -c "cd $(pwd)/admin-panel && npm run dev; exec bash"
    elif command -v xterm &> /dev/null; then
        xterm -e "cd $(pwd)/backend && npm run dev" &
        sleep 2
        xterm -e "cd $(pwd)/admin-panel && npm run dev" &
    else
        echo "⚠️  Could not detect terminal. Starting manually:"
        echo ""
        echo "Terminal 1: cd backend && npm run dev"
        echo "Terminal 2: cd admin-panel && npm run dev"
    fi
else
    echo "⚠️  Platform not supported for auto-start. Run manually:"
    echo ""
    echo "Terminal 1: cd backend && npm run dev"
    echo "Terminal 2: cd admin-panel && npm run dev"
fi

echo ""
echo "Press Ctrl+C in each terminal to stop the servers"
