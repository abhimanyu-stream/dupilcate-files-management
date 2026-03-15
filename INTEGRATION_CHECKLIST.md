# Integration Checklist

Use this checklist to verify the frontend and backend are properly integrated.

## ✅ Pre-Integration Checklist

### Backend Setup
- [ ] Java 17+ installed (`java -version`)
- [ ] Maven wrapper present (`mvnw` or `mvnw.cmd`)
- [ ] Backend directory exists: `backend/dupilcate-files-manager`
- [ ] `pom.xml` is present
- [ ] `application.properties` configured correctly

### Frontend Setup
- [ ] Node.js 18+ installed (`node -version`)
- [ ] npm installed (`npm -version`)
- [ ] Frontend directory exists: `frontend/duplicate-files-web-ui`
- [ ] `package.json` is present
- [ ] `.env.local` file exists with correct API URL

## ✅ Configuration Checklist

### Backend Configuration
- [ ] **Port**: Server runs on port 8080
  - File: `backend/dupilcate-files-manager/src/main/resources/application.properties`
  - Setting: `server.port=8080`

- [ ] **CORS**: Frontend origins are allowed
  - File: `backend/dupilcate-files-manager/src/main/java/com/filemanager/duplicates/config/CorsConfig.java`
  - Allowed origins:
    - [ ] `http://localhost:3000`
    - [ ] `http://localhost:3001`
    - [ ] `http://127.0.0.1:3000`
    - [ ] `http://127.0.0.1:3001`

- [ ] **Controller**: REST endpoints are defined
  - File: `backend/dupilcate-files-manager/src/main/java/com/filemanager/duplicates/controller/DuplicateFilesController.java`
  - Endpoints:
    - [ ] `GET /api/health`
    - [ ] `GET /api/analysis`
    - [ ] `POST /api/scan`
    - [ ] `DELETE /api/files`
    - [ ] `DELETE /api/files/bulk`

### Frontend Configuration
- [ ] **API URL**: Environment variable is set
  - File: `frontend/duplicate-files-web-ui/.env.local`
  - Setting: `NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api`

- [ ] **API Client**: Client is implemented
  - File: `frontend/duplicate-files-web-ui/lib/api/duplicateFilesAPI.ts`
  - Functions:
    - [ ] `getAnalysis()`
    - [ ] `scanDirectory()`
    - [ ] `deleteFile()`
    - [ ] `deleteFiles()`

- [ ] **Main Page**: Page imports API client
  - File: `frontend/duplicate-files-web-ui/app/page.tsx`
  - Imports: `getAnalysis, scanDirectory, deleteFile, deleteFiles, APIError`

## ✅ Runtime Checklist

### Start Services
- [ ] Backend started successfully
  ```bash
  cd backend/dupilcate-files-manager
  ./mvnw spring-boot:run
  ```
  - [ ] No errors in console
  - [ ] Message: "Started DuplicateOrganizerApplication"
  - [ ] Port 8080 is listening

- [ ] Frontend started successfully
  ```bash
  cd frontend/duplicate-files-web-ui
  npm run dev
  ```
  - [ ] No errors in console
  - [ ] Message: "Ready in X ms"
  - [ ] Port 3000 (or 3001) is listening

### Test Backend
- [ ] Health endpoint responds
  ```bash
  curl http://localhost:8080/api/health
  ```
  Expected: `{"status":"UP","service":"Duplicate Files Manager"}`

- [ ] Analysis endpoint responds
  ```bash
  curl http://localhost:8080/api/analysis
  ```
  Expected: JSON with `uniqueFiles`, `duplicateGroups`, etc.

- [ ] Scan endpoint accepts requests
  ```bash
  curl -X POST http://localhost:8080/api/scan \
    -H "Content-Type: application/json" \
    -d '{"path":"C:/Users/Public"}'
  ```
  Expected: JSON with analysis results

### Test Frontend
- [ ] Frontend loads in browser
  - URL: `http://localhost:3000`
  - [ ] No console errors
  - [ ] Page renders correctly

- [ ] Frontend connects to backend
  - [ ] Status indicator shows "Online"
  - [ ] No CORS errors in console
  - [ ] No network errors in console

- [ ] API calls work
  - [ ] Analysis data loads
  - [ ] File operations work (if data available)

## ✅ Integration Test Checklist

### Automated Tests
- [ ] Run integration test script
  - Windows: `.\test-integration.ps1`
  - Linux/Mac: `./test-integration.sh`
  - [ ] All tests pass
  - [ ] No errors reported

### Manual Tests
- [ ] **Test 1: Health Check**
  - Open: `http://localhost:8080/api/health`
  - Expected: JSON response with status "UP"

- [ ] **Test 2: Frontend Loads**
  - Open: `http://localhost:3000`
  - Expected: UI loads without errors

- [ ] **Test 3: API Communication**
  - Open browser DevTools (F12)
  - Go to Network tab
  - Refresh page
  - Expected: See request to `/api/analysis`
  - Expected: Response status 200

- [ ] **Test 4: Scan Directory**
  - Use curl or Postman to scan a directory
  - Refresh frontend
  - Expected: See analysis results

- [ ] **Test 5: Delete File** (if duplicates exist)
  - Click delete button in UI
  - Expected: File removed from list
  - Expected: Success notification shown

## ✅ Error Handling Checklist

### Network Errors
- [ ] Stop backend
- [ ] Refresh frontend
- [ ] Expected: Error message about connection
- [ ] Start backend
- [ ] Refresh frontend
- [ ] Expected: Application works again

### CORS Errors
- [ ] Check browser console for CORS errors
- [ ] If present:
  - [ ] Verify backend CORS configuration
  - [ ] Verify frontend URL matches allowed origins
  - [ ] Restart backend after changes

### Timeout Errors
- [ ] API client has 30-second timeout
- [ ] Long operations should complete within timeout
- [ ] If timeout occurs, error message is shown

## ✅ Documentation Checklist

- [ ] README.md exists at root
- [ ] QUICK_START.md provides startup instructions
- [ ] INTEGRATION_GUIDE.md explains integration details
- [ ] INTEGRATION_CHECKLIST.md (this file) helps verify setup
- [ ] Backend README exists
- [ ] Frontend package.json has correct scripts

## ✅ Final Verification

### Complete Integration Test
1. [ ] Start backend
2. [ ] Start frontend
3. [ ] Open `http://localhost:3000`
4. [ ] Verify status shows "Online"
5. [ ] Use API to scan a directory
6. [ ] Verify results appear in UI
7. [ ] Test file deletion (if duplicates exist)
8. [ ] Verify notifications work
9. [ ] Check browser console for errors
10. [ ] Check backend console for errors

### Production Readiness
- [ ] Backend builds successfully: `./mvnw clean package`
- [ ] Frontend builds successfully: `npm run build`
- [ ] Environment variables documented
- [ ] CORS configured for production domains
- [ ] Error handling tested
- [ ] Security considerations reviewed

## 🎉 Integration Complete!

If all items are checked, your frontend and backend are successfully integrated!

### Next Steps
1. Deploy to production environment
2. Configure production URLs
3. Set up monitoring and logging
4. Implement authentication (if needed)
5. Add additional features

### Troubleshooting
If any items are not checked, refer to:
- [QUICK_START.md](./QUICK_START.md) for setup help
- [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) for detailed information
- Backend/Frontend console logs for error messages

---

**Integration Status**: ⬜ Not Started | 🔄 In Progress | ✅ Complete

**Last Verified**: _____________

**Verified By**: _____________
