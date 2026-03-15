# Image Preview Troubleshooting Guide

## Test the Backend Endpoint

### 1. Check if backend is running
```bash
curl http://localhost:8080/api/health
```

Expected response:
```json
{"status":"UP","service":"Duplicate Files Manager"}
```

### 2. Test the file preview endpoint directly

Replace `YOUR_IMAGE_PATH` with an actual image path from your scan:

```bash
curl "http://localhost:8080/api/file/preview?path=D:\Additional-C\god%20songs\image.jpg" --output test-image.jpg
```

Or in PowerShell:
```powershell
Invoke-WebRequest -Uri "http://localhost:8080/api/file/preview?path=D:\Additional-C\god songs\image.jpg" -OutFile "test-image.jpg"
```

### 3. Check browser console

Open browser DevTools (F12) and check:
- **Console tab**: Look for errors
- **Network tab**: Check if the request to `/api/file/preview` is being made
  - Status should be 200
  - Response should be image data

## Common Issues

### Issue 1: CORS Error
**Symptom**: Console shows "CORS policy" error

**Solution**: Backend CORS is already configured for localhost:3000 and localhost:3001

### Issue 2: 404 Not Found
**Symptom**: Network tab shows 404 for `/api/file/preview`

**Solution**: 
- Verify backend is running
- Check the URL is correct: `http://localhost:8080/api/file/preview?path=...`

### Issue 3: 400 Bad Request
**Symptom**: Network tab shows 400

**Solution**: File path might be invalid or file doesn't exist
- Check the path is correct
- Verify file exists at that location

### Issue 4: Image not displaying
**Symptom**: Request succeeds but image doesn't show

**Solution**: Check Content-Type header in response
- Should be `image/jpeg`, `image/png`, etc.
- Not `application/octet-stream`

## Debug Steps

1. **Open browser DevTools** (F12)
2. **Go to Network tab**
3. **Scan a folder with images**
4. **Look for requests to** `/api/file/preview`
5. **Click on a request** to see details:
   - Request URL
   - Status code
   - Response headers
   - Response preview

## Manual Test

1. Start backend:
   ```bash
   cd backend/dupilcate-files-manager
   ./mvnw spring-boot:run
   ```

2. Test endpoint in browser:
   ```
   http://localhost:8080/api/file/preview?path=C:/Users/Public/Pictures/sample.jpg
   ```
   (Replace with actual image path)

3. If image displays in browser, frontend integration is the issue
4. If image doesn't display, backend has an issue

## Expected Behavior

When working correctly:
1. User scans folder with images
2. FileCard component detects image files
3. Thumbnail shows in card using backend URL
4. Click thumbnail opens full-size preview modal
5. Both use same backend endpoint

## Verification Checklist

- [ ] Backend is running on port 8080
- [ ] Frontend is running on port 3000
- [ ] CORS is configured correctly
- [ ] File paths are correct (Windows backslashes)
- [ ] Images exist at the scanned paths
- [ ] Browser console shows no errors
- [ ] Network tab shows 200 responses for `/api/file/preview`
