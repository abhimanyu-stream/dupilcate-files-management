# Quick Start Guide

Get the Duplicate Files Manager up and running in 5 minutes.

## Prerequisites

- Java 17 or higher
- Node.js 18 or higher
- Maven (included via wrapper)

## Step 1: Start the Backend

Open a terminal and run:

### Windows (PowerShell or CMD)
```bash
cd backend\dupilcate-files-manager
.\mvnw.cmd spring-boot:run
```

### Linux/Mac
```bash
cd backend/dupilcate-files-manager
./mvnw spring-boot:run
```

Wait for the message: `Started DuplicateOrganizerApplication`

The backend will be available at: `http://localhost:8080`

## Step 2: Start the Frontend

Open a **new terminal** and run:

```bash
cd frontend\duplicate-files-web-ui
npm install
npm run dev
```

The frontend will be available at: `http://localhost:3000`

## Step 3: Verify Integration

### Option A: Use the Test Script

#### Windows (PowerShell)
```powershell
.\test-integration.ps1
```

#### Linux/Mac
```bash
chmod +x test-integration.sh
./test-integration.sh
```

### Option B: Manual Verification

1. Open your browser to `http://localhost:3000`
2. You should see the Duplicate Files Manager interface
3. The status indicator should show "Online"

## Step 4: Test the Application

### Using the API Directly

Test the health endpoint:
```bash
curl http://localhost:8080/api/health
```

Expected response:
```json
{
  "status": "UP",
  "service": "Duplicate Files Manager"
}
```

### Using the Web Interface

1. Open `http://localhost:3000` in your browser
2. The application will automatically fetch analysis data
3. If no scan has been performed, you'll see empty results

## Common Issues

### Backend won't start
- **Issue**: Port 8080 is already in use
- **Solution**: Stop any other application using port 8080, or change the port in `application.properties`

### Frontend won't start
- **Issue**: Port 3000 is already in use
- **Solution**: Next.js will automatically try port 3001

### CORS Errors
- **Issue**: Browser shows CORS policy errors
- **Solution**: 
  1. Verify backend is running on port 8080
  2. Verify frontend is running on port 3000 or 3001
  3. Check `CorsConfig.java` includes your frontend URL

### Connection Refused
- **Issue**: Frontend cannot connect to backend
- **Solution**:
  1. Verify backend is running: `curl http://localhost:8080/api/health`
  2. Check `.env.local` has correct API URL
  3. Check firewall settings

## Next Steps

1. **Scan a directory**: Use the scan endpoint to analyze files
   ```bash
   curl -X POST http://localhost:8080/api/scan \
     -H "Content-Type: application/json" \
     -d '{"path":"C:/Users/YourUser/Documents"}'
   ```

2. **View results**: Refresh the web interface to see duplicate files

3. **Delete duplicates**: Use the UI to select and delete duplicate files

## Development Mode

Both applications support hot reload:
- **Backend**: Changes to Java files require restart
- **Frontend**: Changes to React/TypeScript files reload automatically

## Production Build

### Backend
```bash
cd backend/dupilcate-files-manager
./mvnw clean package
java -jar target/duplicate-files-manage-0.0.1-SNAPSHOT.jar
```

### Frontend
```bash
cd frontend/duplicate-files-web-ui
npm run build
npm start
```

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         Browser                              │
│                    http://localhost:3000                     │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTP Requests
                         │ (GET, POST, DELETE)
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Frontend                          │
│                                                              │
│  • React Components                                          │
│  • API Client (duplicateFilesAPI.ts)                        │
│  • Type Definitions                                          │
│  • Tailwind CSS Styling                                      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ REST API Calls
                         │ http://localhost:8080/api
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  Spring Boot Backend                         │
│                                                              │
│  • REST Controllers                                          │
│  • Service Layer                                             │
│  • File Scanner                                              │
│  • Hash Processor                                            │
│  • Duplicate Analyzer                                        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ File System Operations
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    File System                               │
│                                                              │
│  • Read files                                                │
│  • Calculate hashes                                          │
│  • Delete files                                              │
└─────────────────────────────────────────────────────────────┘
```

## API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/analysis` | Get cached analysis |
| POST | `/api/scan` | Scan directory |
| DELETE | `/api/files` | Delete single file |
| DELETE | `/api/files/bulk` | Delete multiple files |

## Environment Variables

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
```

### Backend (application.properties)
```properties
server.port=8080
spring.application.name=duplicate-files-manage
```

## Support

For detailed integration information, see [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)

For issues or questions:
1. Check the console logs (both frontend and backend)
2. Verify all prerequisites are installed
3. Ensure both services are running
4. Check firewall and network settings
