# Image Preview Debugging Guide

## Current Implementation

The image preview feature is implemented with:

1. **Frontend (FileCard.tsx)**:
   - Detects image files by extension (.jpg, .jpeg, .png, .gif, .bmp, .webp, .svg, .ico)
   - Shows thumbnail preview in file card
   - Opens full-size modal on click
   - Uses backend API endpoint for image serving

2. **Backend (DuplicateFilesController.java)**:
   - Endpoint: `GET /api/file/preview?path={filePath}`
   - Reads file from disk
   - Detects content type automatically
   - Serves file with proper headers

## How to Test

### 1. Test Backend Endpoint Directly

Open a browser or use curl to test the endpoint:

```bash
# Replace with actual image path from your scan
curl "http://localhost:8080/api/file/preview?path=C:/Users/Public/Pictures/sample.jpg"
```

Expected response:
- Status: 200 OK
- Content-Type: image/jpeg (or appropriate type)
- Body: Image binary data

### 2. Check Browser Console

When clicking on an image thumbnail:

1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for these log messages:
   - "Image preview URL: ..." - Shows the URL being used
   - "Image loaded successfully: ..." - Confirms image loaded
   - "Image failed to load: ..." - Shows if loading failed

4. Go to Network tab
5. Filter by "preview"
6. Click on an image thumbnail
7. Check the request:
   - Status should be 200
   - Response should show image data
   - Content-Type should be image/*

### 3. Common Issues and Solutions

#### Issue: CORS Error
**Symptom**: Console shows "CORS policy" error
**Solution**: Backend already has CORS configured for localhost:3000 and localhost:3001

#### Issue: 404 Not Found
**Symptom**: Network tab shows 404 status
**Possible causes**:
- File path is incorrect
- File was deleted
- Path encoding issue (spaces, special characters)

**Solution**: 
- Verify file exists at the path
- Check URL encoding in browser DevTools

#### Issue: Image Not Displaying
**Symptom**: Request succeeds but image doesn't show
**Possible causes**:
- Content-Type header is wrong
- File is corrupted
- Browser can't render the image format

**Solution**:
- Check Content-Type in Network tab
- Try opening the URL directly in browser
- Verify file is a valid image

#### Issue: Path Encoding Problems
**Symptom**: Paths with spaces or special characters fail
**Solution**: Frontend uses `encodeURIComponent()` to properly encode paths

### 4. Test with Sample Images

Create a test folder with sample images:

```
C:/Users/Public/Pictures/test/
  - image1.jpg
  - image2.png
  - image with spaces.jpg
```

Scan this folder and verify:
1. Thumbnails appear in file cards
2. Clicking thumbnail opens modal
3. Full-size image displays correctly
4. All image formats work (jpg, png, etc.)

### 5. Backend Logs

Check Spring Boot console for errors:
- File read errors
- Content type detection issues
- Path resolution problems

## Current Status

✅ Backend endpoint implemented: `/api/file/preview`
✅ Frontend uses backend API (not file:// protocol)
✅ CORS configured for localhost:3000
✅ Path encoding implemented
✅ Error handling with fallback UI
✅ Console logging for debugging

## Next Steps if Issues Persist

1. **Test with a specific image**:
   - Find an image file on your system
   - Note the exact path
   - Test the backend endpoint directly with that path
   - Check if it returns the image

2. **Check file permissions**:
   - Ensure the backend process has read access to the files
   - Windows: Check file properties > Security tab

3. **Verify path format**:
   - Windows paths should use backslashes: `C:\Users\...`
   - Frontend converts to forward slashes for URL
   - Backend should handle both formats

4. **Test with different image types**:
   - Try .jpg, .png, .gif
   - Some formats may not be supported by browser

## Example Working Request

```
GET http://localhost:8080/api/file/preview?path=C%3A%2FUsers%2FPublic%2FPictures%2Fsample.jpg

Response Headers:
Content-Type: image/jpeg
Cache-Control: max-age=3600

Response Body: [binary image data]
```

## Troubleshooting Checklist

- [ ] Backend is running on port 8080
- [ ] Frontend is running on port 3000
- [ ] CORS is configured correctly
- [ ] Image files exist at the scanned paths
- [ ] Browser console shows no errors
- [ ] Network tab shows 200 status for preview requests
- [ ] Content-Type header is correct
- [ ] Image URL is properly encoded
- [ ] File permissions allow reading
