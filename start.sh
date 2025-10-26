#!/bin/bash

# Flight Finder Startup Script
# This script handles venv setup, Node.js version, and starts both server and client

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║    🛫 Flight Finder Startup Script    ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# ===========================
# Python/Backend Setup
# ===========================
echo -e "${GREEN}[1/5]${NC} Setting up Python backend..."

# Check if Python 3 is available
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}Error: python3 is not installed${NC}"
    exit 1
fi

PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
echo -e "   ✓ Found Python ${PYTHON_VERSION}"

# Create venv if it doesn't exist
if [ ! -d "venv" ]; then
    echo -e "   Creating virtual environment..."
    python3 -m venv venv
    echo -e "   ✓ Virtual environment created"
else
    echo -e "   ✓ Virtual environment exists"
fi

# Activate venv
echo -e "   Activating virtual environment..."
source venv/bin/activate

# Install/upgrade pip
pip install --upgrade pip -q

# Install Python dependencies
echo -e "   Installing Python dependencies..."
cd server
pip install -r requirements.txt -q
cd ..
echo -e "   ✓ Python dependencies installed"

# ===========================
# Node.js/Frontend Setup
# ===========================
echo -e "${GREEN}[2/5]${NC} Setting up Node.js frontend..."

# Check for nvm and load it if available
if [ -f "$HOME/.nvm/nvm.sh" ]; then
    source "$HOME/.nvm/nvm.sh"
    echo -e "   ✓ Loaded nvm"

    # Check if .nvmrc exists in client directory
    if [ -f "client/.nvmrc" ]; then
        cd client
        echo -e "   Using Node version from .nvmrc..."
        nvm use
        cd ..
    else
        # Use a reasonable default version if no .nvmrc
        if nvm ls 20 &> /dev/null; then
            nvm use 20 &> /dev/null || true
        fi
    fi
fi

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed${NC}"
    echo -e "Please install Node.js from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node --version)
echo -e "   ✓ Found Node.js ${NODE_VERSION}"

# Check for npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}Error: npm is not installed${NC}"
    exit 1
fi

NPM_VERSION=$(npm --version)
echo -e "   ✓ Found npm ${NPM_VERSION}"

# Install Node dependencies if needed
cd client
if [ ! -d "node_modules" ]; then
    echo -e "   Installing Node.js dependencies (this may take a moment)..."
    npm install
    echo -e "   ✓ Node.js dependencies installed"
else
    echo -e "   ✓ Node.js dependencies exist"
fi
cd ..

# ===========================
# Check for data file
# ===========================
echo -e "${GREEN}[3/5]${NC} Checking for flights.csv..."

if [ ! -f "flights.csv" ]; then
    echo -e "${YELLOW}   ⚠ Warning: flights.csv not found${NC}"
    echo -e "   You may need to run the scraper first"
else
    FLIGHT_COUNT=$(tail -n +2 flights.csv | wc -l | tr -d ' ')
    echo -e "   ✓ Found flights.csv with ${FLIGHT_COUNT} flights"
fi

# ===========================
# Start Backend Server
# ===========================
echo -e "${GREEN}[4/5]${NC} Starting backend server..."

cd server
# Kill any existing process on port 8000
lsof -ti:8000 | xargs kill -9 2>/dev/null || true
sleep 1

# Start server in background using uvicorn
uvicorn server:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!
cd ..

echo -e "   ✓ Backend server starting on http://localhost:8000 (PID: ${BACKEND_PID})"

# Wait a moment for server to start
sleep 2

# ===========================
# Start Frontend Dev Server
# ===========================
echo -e "${GREEN}[5/5]${NC} Starting frontend dev server..."

cd client
# Kill any existing process on port 5173
lsof -ti:5173 | xargs kill -9 2>/dev/null || true
sleep 1

# Start client in background
npm run dev &
FRONTEND_PID=$!
cd ..

echo -e "   ✓ Frontend server starting on http://localhost:5173 (PID: ${FRONTEND_PID})"

# ===========================
# Final Status
# ===========================
echo ""
echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║          🚀 All Systems Ready!         ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}Backend API:${NC}  http://localhost:8000"
echo -e "${GREEN}Frontend App:${NC} http://localhost:5173"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop both servers${NC}"
echo ""

# Create a cleanup function
cleanup() {
    echo ""
    echo -e "${YELLOW}Shutting down servers...${NC}"
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    # Kill any remaining processes on the ports
    lsof -ti:8000 | xargs kill -9 2>/dev/null || true
    lsof -ti:5173 | xargs kill -9 2>/dev/null || true
    echo -e "${GREEN}✓ Servers stopped${NC}"
    exit 0
}

# Register cleanup function
trap cleanup SIGINT SIGTERM

# Wait for both processes
wait

