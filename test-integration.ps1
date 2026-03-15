# Integration Test Script for Duplicate Files Manager (PowerShell)
# Tests the connection between frontend and backend

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Integration Test Script" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Backend URL
$BACKEND_URL = "http://localhost:8080/api"

# Test counter
$TESTS_PASSED = 0
$TESTS_FAILED = 0

# Function to test endpoint
function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Endpoint,
        [string]$Data = $null
    )
    
    Write-Host "Testing $Name... " -NoNewline
    
    try {
        $uri = "$BACKEND_URL$Endpoint"
        
        if ($Data) {
            $response = Invoke-WebRequest -Uri $uri -Method $Method `
                -ContentType "application/json" `
                -Body $Data `
                -UseBasicParsing
        } else {
            $response = Invoke-WebRequest -Uri $uri -Method $Method -UseBasicParsing
        }
        
        $statusCode = $response.StatusCode
        
        if ($statusCode -ge 200 -and $statusCode -lt 300) {
            Write-Host "✓ PASSED" -ForegroundColor Green -NoNewline
            Write-Host " (HTTP $statusCode)"
            $script:TESTS_PASSED++
            
            $body = $response.Content
            if ($body -and $body.Length -gt 0) {
                $preview = $body.Substring(0, [Math]::Min(100, $body.Length))
                Write-Host "  Response: $preview..." -ForegroundColor Gray
            }
        }
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.Value__
        Write-Host "✗ FAILED" -ForegroundColor Red -NoNewline
        Write-Host " (HTTP $statusCode)"
        $script:TESTS_FAILED++
        
        if ($_.ErrorDetails.Message) {
            Write-Host "  Error: $($_.ErrorDetails.Message)" -ForegroundColor Red
        }
    }
    
    Write-Host ""
}

# Check if backend is running
Write-Host "Step 1: Checking if backend is running..." -ForegroundColor Yellow

try {
    $healthCheck = Invoke-WebRequest -Uri "$BACKEND_URL/health" -UseBasicParsing -TimeoutSec 5
    Write-Host "✓ Backend is running" -ForegroundColor Green
    Write-Host ""
}
catch {
    Write-Host "✗ Backend is not running!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please start the backend first:" -ForegroundColor Yellow
    Write-Host "  cd backend\dupilcate-files-manager"
    Write-Host "  .\mvnw.cmd spring-boot:run"
    Write-Host ""
    exit 1
}

# Run tests
Write-Host "Step 2: Running API endpoint tests..." -ForegroundColor Yellow
Write-Host ""

# Test 1: Health Check
Test-Endpoint -Name "Health Check" -Method "GET" -Endpoint "/health"

# Test 2: Get Analysis (empty)
Test-Endpoint -Name "Get Analysis (empty)" -Method "GET" -Endpoint "/analysis"

# Test 3: Scan Directory (you may need to change this path)
# Uncomment and modify the path below to test scanning
# Test-Endpoint -Name "Scan Directory" -Method "POST" -Endpoint "/scan" -Data '{"path":"C:/Users/Public"}'

# Test 4: Get Analysis (after scan)
# Uncomment if you ran the scan test above
# Test-Endpoint -Name "Get Analysis (after scan)" -Method "GET" -Endpoint "/analysis"

# Summary
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Test Summary" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Passed: " -NoNewline
Write-Host $TESTS_PASSED -ForegroundColor Green
Write-Host "Failed: " -NoNewline
Write-Host $TESTS_FAILED -ForegroundColor Red
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

if ($TESTS_FAILED -eq 0) {
    Write-Host "✓ All tests passed!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Start the frontend: cd frontend\duplicate-files-web-ui; npm run dev"
    Write-Host "2. Open browser: http://localhost:3000"
    Write-Host "3. The frontend should connect to the backend automatically"
    exit 0
}
else {
    Write-Host "✗ Some tests failed" -ForegroundColor Red
    exit 1
}
