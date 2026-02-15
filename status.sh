#!/bin/bash

echo "🍫 KitKat Promo Admin System - Status Check"
echo "==========================================="
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check Node.js
if command_exists node; then
    echo "✅ Node.js: $(node --version)"
else
    echo "❌ Node.js: Not installed"
fi

# Check npm
if command_exists npm; then
    echo "✅ npm: $(npm --version)"
else
    echo "❌ npm: Not installed"
fi

# Check Docker
if command_exists docker; then
    if docker info > /dev/null 2>&1; then
        echo "✅ Docker: Running ($(docker --version))"
    else
        echo "⚠️  Docker: Installed but not running"
    fi
else
    echo "❌ Docker: Not installed"
fi

echo ""
echo "Project Status:"
echo "---------------"

# Check backend dependencies
if [ -d "backend/node_modules" ]; then
    echo "✅ Backend dependencies installed"
else
    echo "❌ Backend dependencies not installed (run: cd backend && npm install)"
fi

# Check frontend dependencies
if [ -d "admin-panel/node_modules" ]; then
    echo "✅ Frontend dependencies installed"
else
    echo "❌ Frontend dependencies not installed (run: cd admin-panel && npm install)"
fi

# Check if containers are running
if docker ps | grep -q "promo-admin-db"; then
    echo "✅ PostgreSQL container running"
else
    echo "❌ PostgreSQL container not running (run: docker compose up -d)"
fi

if docker ps | grep -q "promo-admin-redis"; then
    echo "✅ Redis container running"
else
    echo "❌ Redis container not running (run: docker compose up -d)"
fi

# Check backend .env
if [ -f "backend/.env" ]; then
    echo "✅ Backend .env configured"
else
    echo "⚠️  Backend .env not found (copy from backend/.env.example)"
fi

# Check frontend .env
if [ -f "admin-panel/.env" ]; then
    echo "✅ Frontend .env configured"
else
    echo "⚠️  Frontend .env not found (copy from admin-panel/.env.example)"
fi

echo ""
echo "Backend API Health:"
echo "-------------------"
if curl -s http://localhost:3000/health > /dev/null 2>&1; then
    HEALTH=$(curl -s http://localhost:3000/health)
    if echo "$HEALTH" | grep -q "ok"; then
        echo "✅ Backend API is running and healthy"
    else
        echo "⚠️  Backend API returned unexpected response"
    fi
else
    echo "❌ Backend API is not running (run: cd backend && npm run dev)"
fi

echo ""
echo "Frontend Status:"
echo "----------------"
if curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo "✅ Frontend is running on http://localhost:5173"
else
    echo "❌ Frontend is not running (run: cd admin-panel && npm run dev)"
fi

echo ""
echo "==========================================="
echo ""
echo "Quick Commands:"
echo "  Start all:    ./start.sh"
echo "  Test API:     ./test-api.sh"
echo "  Backend:      cd backend && npm run dev"
echo "  Frontend:     cd admin-panel && npm run dev"
echo "  Migrations:   cd backend && npm run migrate:up"
echo ""
