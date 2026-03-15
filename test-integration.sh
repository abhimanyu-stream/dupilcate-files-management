#!/bin/bash

# Integration Test Script for Duplicate Files Manager
# Tests the connection between frontend and backend

echo "=================================="
echo "Integration Test Script"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Backend URL
BACKEND_URL="http://localhost:8080/api"

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to test endpoint
test_endpoint() {
    local name=$1
    local method=$2
    local endpoint=$3
    local data=$4
    
    echo -n "Testing $name... "
    
    if [ -z "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X $method "$BACKEND_URL$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" -X $method "$BACKEND_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        echo -e "${GREEN}✓ PASSED${NC} (HTTP $http_code)"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        if [ ! -z "$body" ]; then
            echo "  Response: ${body:0:100}..."
        fi
    else
        echo -e "${RED}✗ FAILED${NC} (HTTP $http_code)"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        if [ ! -z "$body" ]; then
            echo "  Error: $body"
        fi
    fi
    echo ""
}

# Check if backend is running
echo "Step 1: Checking if backend is running..."
if ! curl -s "$BACKEND_URL/health" > /dev/null 2>&1; then
    echo -e "${RED}✗ Backend is not running!${NC}"
    echo ""
    echo "Please start the backend first:"
    echo "  cd backend/dupilcate-files-manager"
    echo "  ./mvnw spring-boot:run"
    echo ""
    exit 1
fi
echo -e "${GREEN}✓ Backend is running${NC}"
echo ""

# Run tests
echo "Step 2: Running API endpoint tests..."
echo ""

# Test 1: Health Check
test_endpoint "Health Check" "GET" "/health"

# Test 2: Get Analysis (empty)
test_endpoint "Get Analysis (empty)" "GET" "/analysis"

# Test 3: Scan Directory (you may need to change this path)
# Uncomment and modify the path below to test scanning
# test_endpoint "Scan Directory" "POST" "/scan" '{"path":"C:/Users/Public"}'

# Test 4: Get Analysis (after scan)
# Uncomment if you ran the scan test above
# test_endpoint "Get Analysis (after scan)" "GET" "/analysis"

# Summary
echo "=================================="
echo "Test Summary"
echo "=================================="
echo -e "Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Failed: ${RED}$TESTS_FAILED${NC}"
echo "=================================="
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Start the frontend: cd frontend/duplicate-files-web-ui && npm run dev"
    echo "2. Open browser: http://localhost:3000"
    echo "3. The frontend should connect to the backend automatically"
    exit 0
else
    echo -e "${RED}✗ Some tests failed${NC}"
    exit 1
fi
