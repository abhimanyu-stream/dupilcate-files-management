# Frontend-Backend Integration Guide

## Overview
This document describes the integration between the Next.js frontend (`duplicate-files-web-ui`) and the Spring Boot backend (`dupilcate-files-manager`).

## Architecture

### Backend (Spring Boot)
- **Location**: `backend/dupilcate-files-manager`
- **Port**: 8080
- **Base URL**: `http://localhost:8080/api`
- **Framework**: Spring Boot with Maven

### Frontend (Next.js)
- **Location**: `frontend/duplicate-files-web-ui`
- **Port**: 3000
- **Framework**: Next.js 16 with React 19
- **Styling**: Tailwind CSS

## API Endpoints

### 1. Health Check
- **Endpoint**: `GET /api/health`
- **Description**: Verify backend is running
- **Response**: `{ "status": "UP", "service": "Duplicate Files Manager" }`

### 2. Get Analysis
- **Endpoint**: `GET /api/analysis`
- **Description**: Retrieve cached duplicate analysis
- **Response**: `DuplicateAnalysis` object

### 3. Scan Directory
- **Endpoint**: `POST /api/scan`
- **Description**: Scan a directory for duplicate files
- **Request Body**: `{ "path": "/path/to/directory" }`
- **Response**: `DuplicateAnalysis` object

### 4. Delete Single File
- **Endpoint**: `DELETE /api/files`
- **Description**: Delete a single file
- **Request Body**: `{ "path": "/path/to/file" }`
- **Response**: `OperationResult` object

### 5. Delete Multiple Files
- **Endpoint**: `DELETE /api/files/bulk`
- **Description**: Delete multiple files
- **Request Body**: `{ "paths": ["/path/1", "/path/2"] }`
- **Response**: Array of `OperationResult` objects

## CORS Configuration

The backend is configured to accept requests from:
- `http://localhost:3000`
- `http://localhost:3001`
- `http://127.0.0.1:3000`
- `http://127.0.0.1:3001`

**Configuration Files**:
1. `backend/dupilcate-files-manager/src/main/java/com/filemanager/duplicates/config/CorsConfig.java`
2. `backend/dupilcate-files-manager/src/main/resources/application.properties`

## Environment Configuration

### Frontend Environment Variables
File: `frontend/duplicate-files-web-ui/.env.local`

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
```

### Backend Application Properties
File: `backend/dupilcate-files-manager/src/main/resources/application.properties`

```properties
spring.application.name=duplicate-files-manage
server.port=8080
spring.main.web-application-type=servlet
```

## Running the Application

### 1. Start Backend (Spring Boot)

```bash
cd backend/dupilcate-files-manager
./mvnw spring-boot:run
```

Or on Windows:
```bash
cd backend/dupilcate-files-manager
mvnw.cmd spring-boot:run
```

The backend will start on `http://localhost:8080`

### 2. Start Frontend (Next.js)

```bash
cd frontend/duplicate-files-web-ui
npm install
npm run dev
```

The frontend will start on `http://localhost:3000`

### 3. Verify Integration

Open your browser and navigate to:
- Frontend: `http://localhost:3000`
- Backend Health: `http://localhost:8080/api/health`

## API Client Implementation

The frontend uses a centralized API client located at:
`frontend/duplicate-files-web-ui/lib/api/duplicateFilesAPI.ts`

**Features**:
- Request timeout handling (30 seconds)
- Network error detection
- HTTP status code mapping
- Input validation
- Type-safe responses

**Usage Example**:
```typescript
import { getAnalysis, deleteFile } from '@/lib/api/duplicateFilesAPI';

// Fetch analysis
const analysis = await getAnalysis();

// Delete a file
const result = await deleteFile('/path/to/file');
```

## Error Handling

### Frontend Error Types
1. **Network Errors** (7.1): Connection refused, DNS failure
2. **Server Errors** (7.2): HTTP 500
3. **Not Found Errors** (7.3): HTTP 404
4. **Timeout Errors** (7.4): Request exceeds 30 seconds

### Backend Error Responses
All endpoints return appropriate HTTP status codes:
- `200 OK`: Success
- `400 Bad Request`: Invalid input
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

## Data Models

### DuplicateAnalysis
```typescript
{
  uniqueFiles: FileInfo[];
  duplicateGroups: Record<string, FileInfo[]>;
  totalFiles: number;
  totalUnique: number;
  totalDuplicates: number;
}
```

### FileInfo
```typescript
{
  path: string;
  size: number;
  hash: string;
  lastModified: number;
}
```

### OperationResult
```typescript
{
  success: boolean;
  sourcePath: string;
  targetPath: string | null;
  errorMessage: string | null;
}
```

## Testing the Integration

### 1. Test Backend Health
```bash
curl http://localhost:8080/api/health
```

### 2. Test Scan Endpoint
```bash
curl -X POST http://localhost:8080/api/scan \
  -H "Content-Type: application/json" \
  -d '{"path":"C:/Users/YourUser/Documents"}'
```

### 3. Test Get Analysis
```bash
curl http://localhost:8080/api/analysis
```

### 4. Test Delete File
```bash
curl -X DELETE http://localhost:8080/api/files \
  -H "Content-Type: application/json" \
  -d '{"path":"C:/path/to/file.txt"}'
```

## Troubleshooting

### CORS Issues
If you see CORS errors in the browser console:
1. Verify backend is running on port 8080
2. Check CORS configuration in `CorsConfig.java`
3. Ensure frontend is running on port 3000 or 3001

### Connection Refused
If frontend cannot connect to backend:
1. Verify backend is running: `curl http://localhost:8080/api/health`
2. Check firewall settings
3. Verify `.env.local` has correct API URL

### Empty Analysis
If `/api/analysis` returns empty data:
1. First call `/api/scan` with a directory path
2. Then call `/api/analysis` to retrieve cached results

## Development Workflow

1. **Start Backend**: Run Spring Boot application
2. **Start Frontend**: Run Next.js development server
3. **Scan Directory**: Use the scan endpoint to analyze files
4. **View Results**: Frontend displays duplicate analysis
5. **Delete Files**: Use UI to delete duplicates
6. **Refresh**: Analysis updates automatically

## Production Deployment

### Backend
1. Build JAR: `./mvnw clean package`
2. Run JAR: `java -jar target/duplicate-files-manage-0.0.1-SNAPSHOT.jar`
3. Configure production port and CORS origins

### Frontend
1. Update `.env.local` with production API URL
2. Build: `npm run build`
3. Start: `npm start`
4. Or deploy to Vercel/Netlify

## Security Considerations

1. **CORS**: Restrict allowed origins in production
2. **Path Validation**: Backend validates all file paths
3. **File Permissions**: Backend checks file existence and permissions
4. **Input Sanitization**: All inputs are validated before processing

## Next Steps

1. Add authentication/authorization
2. Implement file preview functionality
3. Add progress tracking for long operations
4. Implement WebSocket for real-time updates
5. Add batch operation limits
6. Implement rate limiting
