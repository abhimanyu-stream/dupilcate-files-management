# Image Preview Troubleshooting Guide

## Current Status

✅ Refresh functionality implemented and working
✅ Recent scans removal working
⚠️ Image preview needs debugging

## The Issue

Images are failing to load with error:
```
Image failed to load: D:\Additional-C\Baby Girl song\cook-veg\24d2ca2075d376f02d4beabe6b7f1d8f.jpg
```

## Root Cause Analysis

The error message alone doesn't tell us WHY the image failed. It could be:
1. Backend not running
2. File doesn't exist
3. Permission denied
4. Path encoding issue
5. CORS issue

## Step-by-Step Debugging

### Step 1: Verify Backend is Running

**Action**: Open in browser:
```
http://localhost:8080/api/health
```

**Expected**: 
```json
{"status":"UP","service":"Duplicate Files Manager"}
```

**If Failed**: Backend is not running. Start it:
```bash
cd backend/dupilcate-files-manager
mvnw spring-boot:run
```

Wait for: `Started DuplicateOrganizerApplication`

---

### Step 2: Test Image Endpoint Directly

**Action**: Copy one of the failing image URLs from browser console and paste in browser address bar.

Example:
```
http://localhost:8080/api/file/preview?path=D%3A%5CAdditional-C%5CBaby%20Girl%20song%5Ccook-veg%5C24d2ca2075d376f02d4beabe6b7f1d8f.jpg
```

**Possible Results**:

#### A) Image Displays ✅
- Backend is working
- File exists and is readable
- Issue is in frontend rendering
- **Next**: Check browser console for CORS errors

#### B) Blank Page or Error ❌
- Check backend console for logs
- Look for "File not found" or error messages

#### C) Connection Error ❌
- Backend is not running
- Go back to Step 1

---

### Step 3: Check Backend Console Logs

When you try to load an image, backend should log:

**Success Case**:
```
Preview request for path: D:\Additional-C\Baby Girl song\cook-veg\24d2ca2075d376f02d4beabe6b7f1d8f.jpg
Normalized path: D:\Additional-C\Baby Girl song\cook-veg\24d2ca2075d376f02d4beabe6b7f1d8f.jpg
Resolved file path: D:\Additional-C\Baby Girl song\cook-veg\24d2ca2075d376f02d4beabe6b7f1d8f.jpg
File read successfully, size: 123456 bytes
Content-Type: image/jpeg
```

**Failure Cases**:

#### File Not Found:
```
Preview request for path: D:\Additional-C\Baby Girl song\cook-veg\24d2ca2075d376f02d4beabe6b7f1d8f.jpg
Normalized path: D:\Additional-C\Baby Girl song\cook-veg\24d2ca2075d376f02d4beabe6b7f1d8f.jpg
Resolved file path: D:\Additional-C\Baby Girl song\cook-veg\24d2ca2075d376f02d4beabe6b7f1d8f.jpg
File not found: D:\Additional-C\Baby Girl song\cook-veg\24d2ca2075d376f02d4beabe6b7f1d8f.jpg
```

**Solution**: File was deleted or moved after scan. Re-scan the directory.

#### Permission Error:
```
Error serving file preview: java.nio.file.AccessDeniedException: D:\Additional-C\...
```

**Solution**: 
- Check file permissions in Windows
- Ensure backend has read access
- Try with files in a different location (e.g., C:\Users\Public\Pictures)

#### Path Error:
```
Error serving file preview: java.nio.file.InvalidPathException: ...
```

**Solution**: Path contains invalid characters or format issue

---

### Step 4: Check Browser Console

Open DevTools (F12) → Console

Look for:
```
=== IMAGE LOAD FAILED ===
File path: D:\Additional-C\Baby Girl song\cook-veg\24d2ca2075d376f02d4beabe6b7f1d8f.jpg
Image URL: http://localhost:8080/api/file/preview?path=...
HTTP Status: 404 Not Found
Error response: ...
=== END IMAGE ERROR ===
```

**Status Code Meanings**:
- **200 OK**: Image should load (if not, check CORS)
- **404 Not Found**: File doesn't exist at that path
- **500 Internal Server Error**: Backend error (check backend logs)
- **Network error**: Backend not running or not accessible

---

### Step 5: Verify File Exists

**Action**: Open File Explorer and navigate to:
```
D:\Additional-C\Baby Girl song\cook-veg\
```

**Check**:
- Does the folder exist?
- Does the file `24d2ca2075d376f02d4beabe6b7f1d8f.jpg` exist?
- Can you open the image in Windows Photo Viewer?

**If File Doesn't Exist**:
- It was deleted after the scan
- Re-scan the directory to get current files

**If File Exists**:
- Copy the full path from File Explorer address bar
- Compare with the path in the error message
- They should match exactly

---

## Common Solutions

### Solution 1: Restart Backend
The enhanced logging was added after backend started. Restart to apply:
```bash
# Stop backend (Ctrl+C)
cd backend/dupilcate-files-manager
mvnw spring-boot:run
```

### Solution 2: Re-scan Directory
Files may have been deleted/moved after initial scan:
1. Go to Home view
2. Enter the folder path again
3. Click Scan
4. Check if images load now

### Solution 3: Test with Simple Path
Try scanning a folder with simple path and no spaces:
```
C:\Users\Public\Pictures
```

If images work here but not in your original path, it's a path encoding issue.

### Solution 4: Check File Permissions
1. Right-click the image file
2. Properties → Security tab
3. Ensure "Users" or your account has "Read" permission

### Solution 5: Use Different Browser
Try Chrome, Edge, or Firefox to rule out browser-specific issues.

---

## What I Need to Help Further

If images still don't work after trying above steps, please provide:

1. **Backend console output** (copy the logs when you try to load an image)
2. **Browser console output** (the === IMAGE LOAD FAILED === section)
3. **Health check result** (http://localhost:8080/api/health)
4. **Direct URL test result** (paste image URL in browser, what happens?)
5. **File verification** (does the file exist in File Explorer?)

With this information, I can identify the exact issue and provide a targeted fix.

---

## Expected Behavior

When working correctly:

1. **Scan completes** → Images detected
2. **File cards show** → Thumbnail previews
3. **Click thumbnail** → Full-size modal opens
4. **Backend logs** → "File read successfully"
5. **Browser console** → "✓ Image loaded: filename.jpg"

---

## Files with Enhanced Logging

- ✅ `FileCard.tsx` - Detailed error logging
- ✅ `DuplicateFilesController.java` - Request/response logging
- ✅ Path normalization for Windows
- ✅ Fallback content type detection
- ✅ CORS headers configured

Everything is in place for debugging. Now we need to see what the logs actually show.
