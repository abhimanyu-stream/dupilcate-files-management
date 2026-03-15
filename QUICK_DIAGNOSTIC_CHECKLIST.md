# Quick Diagnostic Checklist for Image Preview

## Step 1: Check Backend is Running ⚠️ CRITICAL

Open this URL in your browser:
```
http://localhost:8080/api/health
```

**Expected Result:**
```json
{"status":"UP","service":"Duplicate Files Manager"}
```

**If you get an error:**
- Backend is NOT running
- Start it now:
  ```bash
  cd backend/dupilcate-files-manager
  mvnw spring-boot:run
  ```

---

## Step 2: Check Browser Console (Full Output)

Open DevTools (F12) → Console tab

Look for the COMPLETE error output:
```
=== IMAGE LOAD FAILED ===
File path: D:\Additional-C\Baby Girl song\cook-veg\image.jpg
Image URL: http://localhost:8080/api/file/preview?path=...
HTTP Status: 404 Not Found
Error response: ...
=== END IMAGE ERROR ===
```

**Copy and share the ENTIRE output between the === markers**

---

## Step 3: Check Backend Console

Look at the terminal where backend is running.

**You should see:**
```
INFO - GET /api/file/preview - Request for path: D:\Additional-C\...
DEBUG - Normalized path: D:\Additional-C\...
INFO - File read successfully: image.jpg (123456 bytes)
```

**If you DON'T see any logs:**
- Backend is not receiving the request
- Possible CORS issue
- Check if backend is actually running

**If you see "File not found":**
- File doesn't exist at that path
- Verify file exists in File Explorer

---

## Step 4: Test Direct URL

Copy one image URL from browser console and paste in browser address bar.

Example:
```
http://localhost:8080/api/file/preview?path=D%3A%5CAdditional-C%5CBaby%20Girl%20song%5Ccook-veg%5Cimage.jpg
```

**What happens?**
- [ ] Image displays → Backend works, frontend issue
- [ ] Error page → Backend error (check backend console)
- [ ] Connection refused → Backend not running
- [ ] Blank page → Check backend console for logs

---

## Step 5: Verify File Exists

Open File Explorer and navigate to the path shown in the error.

Example: `D:\Additional-C\Baby Girl song\cook-veg\`

**Check:**
- [ ] Folder exists
- [ ] File exists
- [ ] You can open the image in Windows Photo Viewer
- [ ] File is not corrupted

---

## Common Issues & Solutions

### Issue 1: Backend Not Running
**Symptom:** Connection refused, no backend logs
**Solution:** Start backend with `mvnw spring-boot:run`

### Issue 2: File Not Found (404)
**Symptom:** Backend logs show "File not found"
**Solution:** 
- File was deleted after scan
- Re-scan the directory
- Verify file exists in File Explorer

### Issue 3: CORS Error
**Symptom:** Browser console shows CORS error
**Solution:** 
- Already configured in backend
- Restart backend to apply changes
- Check backend is running on port 8080

### Issue 4: Permission Denied (500)
**Symptom:** Backend logs show AccessDeniedException
**Solution:**
- Check file permissions
- Try with files in C:\Users\Public\Pictures
- Run backend as administrator (not recommended)

---

## What to Share for Help

If images still don't work, please provide:

1. **Backend health check result** (http://localhost:8080/api/health)
2. **Complete browser console output** (=== IMAGE LOAD FAILED === section)
3. **Backend console logs** (when you try to load an image)
4. **Direct URL test result** (paste image URL in browser)
5. **File verification** (does file exist in File Explorer?)

With this information, I can identify the exact problem and provide a fix.

---

## Expected Working Flow

1. Frontend requests image: `GET http://localhost:8080/api/file/preview?path=...`
2. Backend logs: `INFO - GET /api/file/preview - Request for path: ...`
3. Backend logs: `INFO - File read successfully: image.jpg (123456 bytes)`
4. Browser console: `✓ Image loaded: image.jpg`
5. Image displays in UI ✓

If any step fails, that's where the problem is.
