# Duplicate Files Management System

A full-stack application for detecting and managing duplicate files with a modern web interface.

## 🚀 Quick Start

```bash
# Terminal 1: Start Backend
cd backend/dupilcate-files-manager
./mvnw spring-boot:run

# Terminal 2: Start Frontend
cd frontend/duplicate-files-web-ui
npm install && npm run dev

# Open browser: http://localhost:3000
```

See [QUICK_START.md](./QUICK_START.md) for detailed instructions.

## 📋 Overview

This project consists of two integrated applications:

### Backend (Spring Boot)
- **Technology**: Java 17, Spring Boot, Maven
- **Port**: 8080
- **Features**:
  - File system scanning
  - SHA-256 hash calculation
  - Duplicate detection algorithm
  - REST API for file operations
  - CORS-enabled for web access

### Frontend (Next.js)
- **Technology**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Port**: 3000
- **Features**:
  - Modern, responsive UI
  - Real-time duplicate visualization
  - Bulk file operations
  - Error handling with retry
  - Dark mode support

## 🏗️ Architecture

```
Frontend (Next.js)  ←→  Backend (Spring Boot)  ←→  File System
    Port 3000              Port 8080
```

The frontend communicates with the backend via REST API:
- `GET /api/analysis` - Retrieve duplicate analysis
- `POST /api/scan` - Scan directory for duplicates
- `DELETE /api/files` - Delete single file
- `DELETE /api/files/bulk` - Delete multiple files

## 📁 Project Structure

```
dupilcate-files-management/
├── backend/
│   └── dupilcate-files-manager/          # Spring Boot application
│       ├── src/main/java/                # Java source code
│       │   └── com/filemanager/duplicates/
│       │       ├── controller/           # REST controllers
│       │       ├── service/              # Business logic
│       │       ├── scanner/              # File scanning
│       │       ├── hash/                 # Hash calculation
│       │       ├── analyzer/             # Duplicate detection
│       │       ├── model/                # Data models
│       │       └── config/               # Configuration (CORS)
│       ├── src/main/resources/           # Application properties
│       └── pom.xml                       # Maven dependencies
│
├── frontend/
│   └── duplicate-files-web-ui/           # Next.js application
│       ├── app/                          # Next.js app directory
│       │   ├── page.tsx                  # Main page component
│       │   └── layout.tsx                # Root layout
│       ├── components/                   # React components
│       │   ├── TwoColumnLayout.tsx       # Main layout
│       │   ├── LeftSidebar.tsx           # Navigation
│       │   ├── NotificationContainer.tsx # Notifications
│       │   └── ErrorBoundary.tsx         # Error handling
│       ├── lib/
│       │   └── api/
│       │       └── duplicateFilesAPI.ts  # API client
│       ├── types/                        # TypeScript types
│       ├── .env.local                    # Environment config
│       └── package.json                  # Dependencies
│
├── INTEGRATION_GUIDE.md                  # Detailed integration docs
├── QUICK_START.md                        # Quick start guide
├── test-integration.ps1                  # Windows test script
└── test-integration.sh                   # Linux/Mac test script
```

## 🔧 Prerequisites

- **Java**: 17 or higher
- **Node.js**: 18 or higher
- **Maven**: Included via wrapper (mvnw)
- **npm**: Comes with Node.js

## 📖 Documentation

- **[QUICK_START.md](./QUICK_START.md)** - Get started in 5 minutes
- **[INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)** - Detailed integration documentation
- **Backend README**: `backend/dupilcate-files-manager/README.md`
- **Frontend Package**: `frontend/duplicate-files-web-ui/package.json`

## 🧪 Testing

### Test Backend Connection
```bash
# Windows
.\test-integration.ps1

# Linux/Mac
./test-integration.sh
```

### Manual API Testing
```bash
# Health check
curl http://localhost:8080/api/health

# Scan directory
curl -X POST http://localhost:8080/api/scan \
  -H "Content-Type: application/json" \
  -d '{"path":"C:/Users/YourUser/Documents"}'

# Get analysis
curl http://localhost:8080/api/analysis
```

## 🎯 Features

### Duplicate Detection
- SHA-256 hash-based comparison
- Fast batch processing
- Handles large file sets
- Groups duplicates by hash

### File Operations
- Single file deletion
- Bulk deletion with progress
- Optimistic UI updates
- Automatic rollback on failure

### User Interface
- Clean, professional design
- Dark mode support
- Real-time notifications
- Keyboard navigation
- Accessibility compliant

### Error Handling
- Network error detection
- Timeout handling (30s)
- User-friendly error messages
- Retry functionality
- Graceful degradation

## 🔐 Security

- Path validation on backend
- File permission checks
- CORS configuration
- Input sanitization
- No arbitrary code execution

## 🚀 Deployment

### Development
```bash
# Backend
cd backend/dupilcate-files-manager
./mvnw spring-boot:run

# Frontend
cd frontend/duplicate-files-web-ui
npm run dev
```

### Production

#### Backend
```bash
cd backend/dupilcate-files-manager
./mvnw clean package
java -jar target/duplicate-files-manage-0.0.1-SNAPSHOT.jar
```

#### Frontend
```bash
cd frontend/duplicate-files-web-ui
npm run build
npm start
```

Or deploy to Vercel/Netlify (update API URL in `.env.local`)

## 🛠️ Configuration

### Backend Configuration
File: `backend/dupilcate-files-manager/src/main/resources/application.properties`

```properties
server.port=8080
spring.application.name=duplicate-files-manage
```

### Frontend Configuration
File: `frontend/duplicate-files-web-ui/.env.local`

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
```

### CORS Configuration
File: `backend/dupilcate-files-manager/src/main/java/com/filemanager/duplicates/config/CorsConfig.java`

Allowed origins:
- `http://localhost:3000`
- `http://localhost:3001`
- `http://127.0.0.1:3000`
- `http://127.0.0.1:3001`

## 🐛 Troubleshooting

### Backend Issues

**Port 8080 already in use**
```bash
# Find process using port 8080
netstat -ano | findstr :8080  # Windows
lsof -i :8080                 # Linux/Mac

# Kill the process or change port in application.properties
```

**Java version mismatch**
```bash
java -version  # Should be 17 or higher
```

### Frontend Issues

**Port 3000 already in use**
- Next.js will automatically use port 3001

**Module not found**
```bash
cd frontend/duplicate-files-web-ui
rm -rf node_modules package-lock.json
npm install
```

### Integration Issues

**CORS errors**
1. Verify backend is running: `curl http://localhost:8080/api/health`
2. Check frontend port (must be 3000 or 3001)
3. Clear browser cache

**Connection refused**
1. Ensure backend is running
2. Check firewall settings
3. Verify `.env.local` has correct URL

## 📊 API Endpoints

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| GET | `/api/health` | Health check | - |
| GET | `/api/analysis` | Get cached analysis | - |
| POST | `/api/scan` | Scan directory | `{"path": "..."}` |
| DELETE | `/api/files` | Delete file | `{"path": "..."}` |
| DELETE | `/api/files/bulk` | Delete files | `{"paths": [...]}` |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is for educational and personal use.

## 🙏 Acknowledgments

- Spring Boot for the robust backend framework
- Next.js for the modern frontend framework
- Tailwind CSS for the styling system

## 📞 Support

For issues or questions:
1. Check the documentation
2. Review console logs
3. Run the integration tests
4. Verify all services are running

---

**Status**: ✅ Fully Integrated and Operational

**Last Updated**: 2026-03-15
