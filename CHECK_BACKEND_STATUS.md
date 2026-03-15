# Check Backend Status

## Step 1: Is Backend Running?

Open this URL in your browser:
```
http://localhost:8080/api/health
```

### Expected Response:
```json
{
  "status": "UP",
  "service": "Duplicate Files Manager"
}
```

### If You See This:
✅ Backend is running correctly
→ Continue to Step 2

### If You See Error:
❌ Backend is NOT running
→ Start it with:
```bash
cd backend/dupilcate-files-manager
mvnw spring-boot:run
```

---

## Step 2: Test Image Preview Endpoint

Once backend is running, test with a real image path from your scan.

### Example (replace with your actual path):
```
http://localhost:8080/api/file/preview?path=D%3A%5CAdditional-C%5CBaby%20Girl%20song%5Ccook-veg%5C24d2ca2075d376f02d4beabe6b7f1d8f.jpg
```

### Expected Result:
- Image displays in browser
- OR error message appears

---

## Step 3: Check Backend Console

Look for these logs in the backend console:

```
Preview request for path: D:\Additional-C\Baby Girl song\cook-veg\24d2ca2075d376f02d4beabe6b7f1d8f.jpg
Normalized path: D:\Additional-C\Baby Girl song\cook-veg\24d2ca2075d376f02d4beabe6b7f1d8f.jpg
Resolved file path: D:\Additional-C\Baby Girl song\cook-veg\24d2ca2075d376f02d4beabe6b7f1d8f.jpg
```

### If You See "File not found":
The file doesn't exist at that path. Possible reasons:
1. File was deleted after scan
2. File is on external drive that's disconnected
3. Path is incorrect

### If You See "Error serving file preview":
There's a server error. Check the full stack trace in console.

---

## Step 4: Check Browser Console

Open DevTools (F12) → Console tab

Look for these logs:
```
=== IMAGE LOAD FAILED ===
File path: D:\Additional-C\Baby Girl song\cook-veg\24d2ca2075d376f02d4beabe6b7f1d8f.jpg
Image URL: http://localhost:8080/api/file/preview?path=...
HTTP Status: 404 Not Found
=== END IMAGE ERROR ===
```

### Status Codes:
- **200**: Success (image should load)
- **404**: File not found on server
- **500**: Server error
- **Network error**: Backend not running or not accessible

---

## Quick Diagnosis:

| Symptom | Cause | Solution |
|---------|-------|----------|
| "Connection refused" | Backend not running | Start backend |
| "404 Not Found" | File doesn't exist | Verify file path |
| "500 Server Error" | Backend error | Check backend logs |
| "Network error" | Backend not accessible | Check firewall/ports |
| Image loads in browser but not in app | CORS issue | Already configured, restart backend |

---

## What to Share:

If images still don't work, please share:

1. **Backend console output** when you try to load an image
2. **Browser console output** (the === IMAGE LOAD FAILED === section)
3. **Result of health check** (http://localhost:8080/api/health)
4. **Result of direct image URL** in browser

This will help me identify the exact issue.
