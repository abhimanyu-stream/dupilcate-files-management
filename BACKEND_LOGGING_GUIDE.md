# Backend Logging Guide

## Logger Added

Added SLF4J Logger to `DuplicateFilesController.java` with comprehensive logging for all endpoints.

## Log Levels

- **INFO**: Important operations (requests, completions, results)
- **DEBUG**: Detailed information (paths, content types, health checks)
- **WARN**: Warnings (invalid requests, file not found)
- **ERROR**: Errors with stack traces

## What Gets Logged

### 1. GET /api/health
```
DEBUG - GET /api/health - Health check requested
```

### 2. GET /api/analysis
```
INFO - GET /api/analysis - Fetching cached analysis
INFO - Analysis retrieved successfully: 71 total files, 1 duplicates
```

### 3. POST /api/scan
```
INFO - POST /api/scan - Received scan request for path: D:\Additional-C\Baby Girl song
INFO - Starting directory scan: D:\Additional-C\Baby Girl song
INFO - Scan completed: 71 total files, 1 duplicates found
```

**On Error:**
```
WARN - Scan request rejected: empty or null path
ERROR - Error scanning directory
```

### 4. GET /api/file/preview
```
INFO - GET /api/file/preview - Request for path: D:\Additional-C\Baby Girl song\cook-veg\image.jpg
DEBUG - Normalized path: D:\Additional-C\Baby Girl song\cook-veg\image.jpg
DEBUG - Resolved absolute path: D:\Additional-C\Baby Girl song\cook-veg\image.jpg
INFO - File read successfully: image.jpg (123456 bytes)
DEBUG - Content-Type: image/jpeg
```

**On File Not Found:**
```
INFO - GET /api/file/preview - Request for path: D:\Additional-C\...
DEBUG - Normalized path: D:\Additional-C\...
DEBUG - Resolved absolute path: D:\Additional-C\...
WARN - File not found: D:\Additional-C\...
```

**On Error:**
```
ERROR - Error serving file preview for path: D:\Additional-C\... 
java.nio.file.AccessDeniedException: D:\Additional-C\...
    at ...
```

### 5. DELETE /api/files
```
INFO - DELETE /api/files - Delete request for: D:\Additional-C\file.jpg
INFO - File deleted successfully: D:\Additional-C\file.jpg
```

**On Failure:**
```
ERROR - File deletion failed: D:\Additional-C\file.jpg - Access denied
```

### 6. DELETE /api/files/bulk
```
INFO - DELETE /api/files/bulk - Bulk delete request for 5 files
INFO - Bulk delete completed: 4 succeeded, 1 failed
```

## How to View Logs

### In Console (Development)
Logs appear in the terminal where you run:
```bash
mvnw spring-boot:run
```

### Log Format
```
2026-03-15 10:30:45.123  INFO 12345 --- [nio-8080-exec-1] c.f.d.controller.DuplicateFilesController : GET /api/file/preview - Request for path: D:\...
```

Components:
- `2026-03-15 10:30:45.123` - Timestamp
- `INFO` - Log level
- `12345` - Process ID
- `[nio-8080-exec-1]` - Thread name
- `c.f.d.controller.DuplicateFilesController` - Logger name (class)
- Message

## Troubleshooting with Logs

### Problem: Images Not Loading

**Look for:**
```
INFO - GET /api/file/preview - Request for path: ...
```

**If you DON'T see this:**
- Backend is not receiving the request
- Check if backend is running
- Check CORS configuration
- Check frontend is calling correct URL

**If you see:**
```
WARN - File not found: ...
```
- File doesn't exist at that path
- File was deleted after scan
- Path is incorrect

**If you see:**
```
ERROR - Error serving file preview for path: ...
java.nio.file.AccessDeniedException: ...
```
- Permission denied
- Check file permissions
- Try with files in different location

### Problem: Scan Not Working

**Look for:**
```
INFO - POST /api/scan - Received scan request for path: ...
INFO - Starting directory scan: ...
```

**If scan hangs:**
- Check if there's an error after "Starting directory scan"
- Large directories take time
- Check service logs for errors

### Problem: Delete Not Working

**Look for:**
```
INFO - DELETE /api/files - Delete request for: ...
INFO - File deleted successfully: ...
```

**If you see:**
```
ERROR - File deletion failed: ... - Access denied
```
- File is locked by another process
- Permission denied
- File is read-only

## Adjusting Log Levels

Edit `application.properties`:

```properties
# Show all logs from controller
logging.level.com.filemanager.duplicates.controller=DEBUG

# Show only INFO and above
logging.level.com.filemanager.duplicates.controller=INFO

# Show only errors
logging.level.com.filemanager.duplicates.controller=ERROR
```

## Next Steps

1. **Restart backend** to apply the new logging:
   ```bash
   cd backend/dupilcate-files-manager
   mvnw spring-boot:run
   ```

2. **Try to load an image** in the frontend

3. **Check backend console** for the logs

4. **Share the logs** if images still don't work:
   - Copy the entire log output for the preview request
   - Include any ERROR or WARN messages
   - This will show exactly what's happening

## Expected Output for Working Image

```
INFO - GET /api/file/preview - Request for path: D:\Additional-C\Baby Girl song\cook-veg\image.jpg
DEBUG - Normalized path: D:\Additional-C\Baby Girl song\cook-veg\image.jpg
DEBUG - Resolved absolute path: D:\Additional-C\Baby Girl song\cook-veg\image.jpg
INFO - File read successfully: image.jpg (245678 bytes)
DEBUG - Content-Type: image/jpeg
```

Then in browser: Image displays successfully ✓
