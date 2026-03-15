# System Architecture

## Overview

The Duplicate Files Management System is a full-stack web application with a clear separation between frontend and backend.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                           User Browser                           │
│                      http://localhost:3000                       │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ HTTP/HTTPS
                            │ REST API Calls
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                      Frontend Layer                              │
│                    (Next.js + React)                             │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │              User Interface Components                  │    │
│  │  • Page Layout (page.tsx)                              │    │
│  │  • Two Column Layout                                    │    │
│  │  • Left Sidebar Navigation                              │    │
│  │  • Notification System                                  │    │
│  │  • Error Boundary                                       │    │
│  └────────────────────────────────────────────────────────┘    │
│                            │                                     │
│  ┌────────────────────────▼────────────────────────────────┐   │
│  │              API Client Layer                            │   │
│  │  • duplicateFilesAPI.ts                                 │   │
│  │  • Request/Response handling                            │   │
│  │  • Error handling & retry logic                         │   │
│  │  • Type safety (TypeScript)                             │   │
│  └────────────────────────────────────────────────────────┘    │
│                            │                                     │
└────────────────────────────┼─────────────────────────────────────┘
                             │
                             │ REST API
                             │ JSON over HTTP
                             │
┌────────────────────────────▼─────────────────────────────────────┐
│                      Backend Layer                               │
│                   (Spring Boot + Java)                           │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │              REST Controller Layer                      │    │
│  │  • DuplicateFilesController                            │    │
│  │  • Endpoint routing                                     │    │
│  │  • Request validation                                   │    │
│  │  • Response formatting                                  │    │
│  │  • CORS configuration                                   │    │
│  └────────────────────────┬───────────────────────────────┘    │
│                            │                                     │
│  ┌────────────────────────▼───────────────────────────────┐    │
│  │              Service Layer                              │    │
│  │  • DuplicateFileService                                │    │
│  │  • Business logic                                       │    │
│  │  • Cache management                                     │    │
│  │  • Operation coordination                               │    │
│  └────────────────────────┬───────────────────────────────┘    │
│                            │                                     │
│  ┌────────────────────────▼───────────────────────────────┐    │
│  │              Core Components                            │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │    │
│  │  │ FileScanner  │  │HashProcessor │  │  Analyzer   │ │    │
│  │  │              │  │              │  │             │ │    │
│  │  │ • Scan dirs  │  │ • SHA-256    │  │ • Group by  │ │    │
│  │  │ • List files │  │ • Batch      │  │   hash      │ │    │
│  │  │ • Filter     │  │   processing │  │ • Stats     │ │    │
│  │  └──────────────┘  └──────────────┘  └─────────────┘ │    │
│  └────────────────────────┬───────────────────────────────┘    │
│                            │                                     │
└────────────────────────────┼─────────────────────────────────────┘
                             │
                             │ File I/O
                             │
┌────────────────────────────▼─────────────────────────────────────┐
│                      File System Layer                           │
│                                                                  │
│  • Read file metadata                                            │
│  • Calculate file hashes                                         │
│  • Delete files                                                  │
│  • Directory traversal                                           │
└──────────────────────────────────────────────────────────────────┘
```

## Component Details

### Frontend Components

#### 1. User Interface Layer
- **page.tsx**: Main application page
  - Manages application state
  - Handles user interactions
  - Coordinates API calls
  - Displays notifications

- **TwoColumnLayout.tsx**: Layout component
  - Displays unique files (left column)
  - Displays duplicate groups (right column)
  - Handles file selection
  - Manages bulk operations

- **LeftSidebar.tsx**: Navigation component
  - View switching (Dashboard, Duplicates, Analytics, Settings)
  - Visual indicators for active view

- **NotificationContainer.tsx**: Notification system
  - Success messages
  - Error messages with retry
  - Auto-dismiss functionality

- **ErrorBoundary.tsx**: Error handling
  - Catches React errors
  - Displays fallback UI
  - Prevents app crashes

#### 2. API Client Layer
- **duplicateFilesAPI.ts**: Centralized API client
  - Type-safe API calls
  - Request timeout handling (30s)
  - Network error detection
  - HTTP status code mapping
  - Input validation
  - Retry logic support

### Backend Components

#### 1. Controller Layer
- **DuplicateFilesController**: REST API endpoints
  - `GET /api/health`: Health check
  - `GET /api/analysis`: Get cached analysis
  - `POST /api/scan`: Scan directory
  - `DELETE /api/files`: Delete single file
  - `DELETE /api/files/bulk`: Delete multiple files

- **CorsConfig**: CORS configuration
  - Allows frontend origins
  - Configures allowed methods
  - Sets headers and credentials

#### 2. Service Layer
- **DuplicateFileService**: Business logic
  - Coordinates scanning operations
  - Manages analysis cache
  - Handles file deletions
  - Updates cached data

#### 3. Core Components
- **FileScanner**: Directory scanning
  - Recursive directory traversal
  - File filtering
  - Metadata collection

- **HashProcessor**: Hash calculation
  - SHA-256 hashing
  - Batch processing
  - Progress tracking

- **DuplicateAnalyzer**: Duplicate detection
  - Groups files by hash
  - Calculates statistics
  - Identifies unique files

## Data Flow

### 1. Scan Directory Flow

```
User Input (Directory Path)
    │
    ▼
Frontend: scanDirectory() API call
    │
    ▼
Backend: POST /api/scan
    │
    ▼
Service: scanAndAnalyze()
    │
    ├─▶ FileScanner.scan()
    │       └─▶ List all files
    │
    ├─▶ HashProcessor.computeHashesBatch()
    │       └─▶ Calculate SHA-256 hashes
    │
    └─▶ DuplicateAnalyzer.analyze()
            └─▶ Group by hash, calculate stats
    │
    ▼
Cache analysis result
    │
    ▼
Return DuplicateAnalysis to frontend
    │
    ▼
Frontend: Update UI with results
```

### 2. Delete File Flow

```
User Action (Click Delete)
    │
    ▼
Frontend: Optimistic UI update
    │
    ▼
Frontend: deleteFile() API call
    │
    ▼
Backend: DELETE /api/files
    │
    ▼
Service: deleteFile()
    │
    ├─▶ Validate file path
    ├─▶ Check file exists
    ├─▶ Delete file from disk
    └─▶ Update cached analysis
    │
    ▼
Return OperationResult
    │
    ▼
Frontend: Show notification
    │
    └─▶ Success: Keep UI updated
    └─▶ Failure: Rollback UI, show error
```

### 3. Bulk Delete Flow

```
User Action (Delete Selected)
    │
    ▼
Frontend: Optimistic UI update (all files)
    │
    ▼
Frontend: deleteFiles() API call
    │
    ▼
Backend: DELETE /api/files/bulk
    │
    ▼
Service: deleteFiles()
    │
    └─▶ For each file:
        ├─▶ Validate path
        ├─▶ Delete file
        └─▶ Update cache
    │
    ▼
Return List<OperationResult>
    │
    ▼
Frontend: Process results
    │
    ├─▶ Successful deletions: Keep removed from UI
    └─▶ Failed deletions: Restore to UI, show errors
```

## Communication Protocol

### Request Format
```json
{
  "path": "/path/to/directory",
  "paths": ["/path/1", "/path/2"]
}
```

### Response Format

#### Success Response
```json
{
  "success": true,
  "sourcePath": "/path/to/file",
  "targetPath": null,
  "errorMessage": null
}
```

#### Error Response
```json
{
  "success": false,
  "sourcePath": "/path/to/file",
  "targetPath": null,
  "errorMessage": "File not found"
}
```

#### Analysis Response
```json
{
  "uniqueFiles": [...],
  "duplicateGroups": {
    "hash1": [...],
    "hash2": [...]
  },
  "totalFiles": 100,
  "totalUnique": 80,
  "totalDuplicates": 20
}
```

## Security Architecture

### Input Validation
- **Frontend**: Type checking, path validation
- **Backend**: Path validation, file existence checks

### CORS Protection
- Whitelist specific origins
- Restrict HTTP methods
- Control headers

### File System Access
- Validate all paths
- Check file permissions
- No arbitrary code execution
- Sandboxed operations

## Performance Considerations

### Frontend
- Optimistic UI updates
- Debounced API calls
- Lazy loading components
- Efficient re-renders

### Backend
- Batch hash processing
- Cached analysis results
- Streaming for large datasets
- Parallel file operations

## Scalability

### Current Limitations
- Single-threaded file scanning
- In-memory cache
- No database persistence
- Local file system only

### Future Enhancements
- Multi-threaded scanning
- Database integration
- Distributed file systems
- Cloud storage support
- WebSocket for real-time updates
- Background job processing

## Deployment Architecture

### Development
```
Developer Machine
├── Backend: localhost:8080
└── Frontend: localhost:3000
```

### Production
```
Production Server
├── Backend: api.example.com
│   └── Reverse Proxy (Nginx)
│       └── Spring Boot (Port 8080)
│
└── Frontend: example.com
    └── Static Hosting (Vercel/Netlify)
        └── Next.js Build
```

## Technology Stack

### Frontend
- **Framework**: Next.js 16
- **UI Library**: React 19
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **HTTP Client**: Fetch API
- **Build Tool**: Next.js built-in

### Backend
- **Framework**: Spring Boot 3.x
- **Language**: Java 17
- **Build Tool**: Maven
- **Web Server**: Embedded Tomcat
- **Hashing**: Java Security API (SHA-256)

### Development Tools
- **Version Control**: Git
- **Package Managers**: Maven (backend), npm (frontend)
- **Testing**: JUnit (backend), Jest (frontend)

## Monitoring & Logging

### Frontend
- Browser console logs
- Network tab inspection
- Error boundary catches
- User notifications

### Backend
- Spring Boot logging
- Console output
- Exception handling
- HTTP status codes

## Configuration Management

### Environment Variables
- **Frontend**: `.env.local`
  - `NEXT_PUBLIC_API_BASE_URL`

- **Backend**: `application.properties`
  - `server.port`
  - `spring.application.name`
  - CORS settings

### Build Configuration
- **Frontend**: `package.json`, `next.config.js`
- **Backend**: `pom.xml`, `application.properties`

---

This architecture provides a solid foundation for a scalable, maintainable duplicate file management system with clear separation of concerns and well-defined interfaces between components.
