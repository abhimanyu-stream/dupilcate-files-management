#!/bin/bash

# Start All Services - Bash Script
# Starts both backend and frontend in separate terminals

echo "=================================="
echo "Duplicate Files Manager Startup"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
GRAY='\033[0;37m'
NC='\033[0m' # No Color

# Get the current directory
ROOT_DIR=$(pwd)

# Backend directory
BACKEND_DIR="$ROOT_DIR/backend/dupilcate-files-manager"

# Frontend directory
FRONTEND_DIR="$ROOT_DIR/frontend/duplicate-files-web-ui"

# Check if directories exist
if [ ! -d "$BACKEND_DIR" ]; then
    echo -e "${RED}Error: Backend directory not found at $BACKEND_DIR${NC}"
    exit 1
fi

if [ ! -d "$FRONTEND_DIR" ]; then
    echo -e "${RED}Error: Frontend directory not found at $FRONTEND_DIR${NC}"
    exit 1
fi

# Detect terminal emulator
if command -v gnome-terminal &> /dev/null; then
    TERMINAL="gnome-terminal --"
elif command -v xterm &> /dev/null; then
    TERMINAL="xterm -e"
elif command -v konsole &> /dev/null; then
    TERMINAL="konsole -e"
else
    echo -e "${RED}Error: No supported terminal emulator found${NC}"
    echo "Please install gnome-terminal, xterm, or konsole"
    exit 1
fi

# Start Backend
echo -e "${YELLOW}Starting Backend (Spring Boot)...${NC}"
echo -e "${GRAY}Location: $BACKEND_DIR${NC}"
echo ""

$TERMINAL bash -c "cd '$BACKEND_DIR' && echo 'Starting Spring Boot Backend...' && ./mvnw spring-boot:run; exec bash" &

echo -e "${GREEN}✓ Backend starting in new terminal${NC}"
echo -e "${GRAY}  URL: http://localhost:8080${NC}"
echo ""

# Wait a moment before starting frontend
sleep 2

# Start Frontend
echo -e "${YELLOW}Starting Frontend (Next.js)...${NC}"
echo -e "${GRAY}Location: $FRONTEND_DIR${NC}"
echo ""

$TERMINAL bash -c "cd '$FRONTEND_DIR' && echo 'Starting Next.js Frontend...' && npm run dev; exec bash" &

echo -e "${GREEN}✓ Frontend starting in new terminal${NC}"
echo -e "${GRAY}  URL: http://localhost:3000${NC}"
echo ""

# Instructions
echo "=================================="
echo "Services Starting"
echo "=================================="
echo ""
echo "Two new terminals have been opened:"
echo "  1. Backend (Spring Boot) - Port 8080"
echo "  2. Frontend (Next.js) - Port 3000"
echo ""
echo -e "${YELLOW}Wait for both services to start, then:${NC}"
echo "  • Open browser: http://localhost:3000"
echo "  • Check backend: http://localhost:8080/api/health"
echo ""
echo -e "${YELLOW}To stop services:${NC}"
echo "  • Close the terminal windows"
echo "  • Or press Ctrl+C in each terminal"
echo ""
echo "=================================="
echo ""
