# Test Backend Image Preview Endpoint

## Quick Test

Open this URL in your browser (replace with an actual image path from your scan):

```
http://localhost:8080/api/file/preview?path=D%3A%5CAdditional-C%5CBaby%20Girl%20song%5Ccook-veg%5C24d2ca2075d376f02d4beabe6b7f1d8f.jpg
```

## What to Check:

### If Backend is Running:
- You should see the image in the browser
- OR you should see an error message

### If Backend is NOT Running:
- Browser will show "Unable to connect" or "Connection refused"
- This means you need to start the backend

## Start Backend:

```bash
cd backend/dupilcate-files-manager
mvnw spring-boot:run
```

Wait for this message:
```
Started DuplicateOrganizerApplication in X.XXX seconds
```

## Check Backend Console:

When you try to load an image, you should see logs like:
```
Preview request for path: D:\Additional-C\Baby Girl song\cook-veg\24d2ca2075d376f02d4beabe6b7f1d8f.jpg
Normalized path: D:\Additional-C\Baby Girl song\cook-veg\24d2ca2075d376f02d4beabe6b7f1d8f.jpg
Resolved file path: D:\Additional-C\Baby Girl song\cook-veg\24d2ca2075d376f02d4beabe6b7f1d8f.jpg
File read successfully, size: 123456 bytes
Content-Type: image/jpeg
```

OR if there's an error:
```
Preview request for path: D:\Additional-C\Baby Girl song\cook-veg\24d2ca2075d376f02d4beabe6b7f1d8f.jpg
Normalized path: D:\Additional-C\Baby Girl song\cook-veg\24d2ca2075d376f02d4beabe6b7f1d8f.jpg
Resolved file path: D:\Additional-C\Baby Girl song\cook-veg\24d2ca2075d376f02d4beabe6b7f1d8f.jpg
File not found: D:\Additional-C\Baby Girl song\cook-veg\24d2ca2075d376f02d4beabe6b7f1d8f.jpg
```

## Common Issues:

### 1. Backend Not Running
**Symptom**: Browser shows connection error
**Solution**: Start the backend with `mvnw spring-boot:run`

### 2. File Not Found
**Symptom**: Backend logs show "File not found"
**Possible Causes**:
- File was deleted after scan
- File path is incorrect
- File is on a different drive that's not accessible

**Solution**: 
- Verify the file exists at that exact path in File Explorer
- Copy the path from File Explorer and compare

### 3. Permission Denied
**Symptom**: Backend logs show "Access denied" or permission error
**Solution**: 
- Check file permissions in Windows
- Run backend as administrator (not recommended for development)
- Move files to a location with read permissions

### 4. Path Encoding Issue
**Symptom**: Backend receives garbled path
**Solution**: Already handled - frontend uses `encodeURIComponent()`

## Next Steps:

1. **Start backend** if not running
2. **Try the URL** in browser directly
3. **Check backend console** for logs
4. **Share the backend logs** so I can see what's happening
