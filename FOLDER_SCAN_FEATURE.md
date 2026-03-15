# Folder Scan Feature

## Overview
The application now starts with a home page where users can select a folder to scan for duplicate files, similar to the CLI experience.

## Changes Made

### 1. New Home Page (http://localhost:3000/)
- **FolderSelector Component**: New component for folder selection
- **Features**:
  - Text input for folder path
  - Quick access buttons for common folders (Documents, Downloads, Pictures, Desktop)
  - Recent scans history (stored in localStorage)
  - Scan button with loading state
  - "How It Works" guide section

### 2. Updated Navigation Flow
- **Default View**: Home (folder selection)
- **After Scan**: Automatically switches to Duplicates view
- **Sidebar**: Updated with "Home" menu item instead of "Dashboard"

### 3. Updated LeftSidebar
- Changed "Dashboard" to "Home" 
- "Scan Directory" button only shows when data exists
- Clicking "Scan Directory" navigates back to Home

### 4. Scan Functionality
- Integrated `scanDirectory` API call
- Shows loading state during scan
- Displays success notification with results
- Automatically switches to duplicates view after successful scan
- Error handling with user-friendly messages

## User Flow

```
1. User opens http://localhost:3000/
   ↓
2. Sees Home page with folder selector
   ↓
3. User enters or selects a folder path
   ↓
4. Clicks "Scan" button
   ↓
5. Loading state shows "Scanning..."
   ↓
6. Backend scans the directory
   ↓
7. Results are displayed
   ↓
8. Automatically switches to "Duplicates" view
   ↓
9. User can manage duplicate files
```

## Navigation Menu

### Home
- Folder selection interface
- Quick access to common folders
- Recent scans history
- Scan button

### Duplicates
- View duplicate files grouped by hash
- Select and delete files
- Statistics display

### Analytics
- Coming soon (placeholder)

### Settings
- Coming soon (placeholder)

## API Integration

### Scan Endpoint
```typescript
POST /api/scan
Body: { "path": "C:/Users/YourName/Documents" }
Response: DuplicateAnalysis object
```

### Flow
1. User enters folder path
2. Frontend calls `scanDirectory(path)`
3. Backend scans directory and calculates hashes
4. Backend returns analysis with duplicates
5. Frontend displays results in Duplicates view

## Features

### Folder Input
- Manual text entry
- Keyboard support (Enter to scan)
- Path validation
- Disabled during scanning

### Quick Access
- Pre-configured common folders:
  - Documents
  - Downloads
  - Pictures
  - Desktop
- One-click selection

### Recent Scans
- Stores last 5 scanned paths
- Persisted in localStorage
- Quick re-scan capability
- Shows history with timestamps

### Loading States
- Scanning indicator
- Disabled inputs during scan
- Loading spinner in button
- Progress feedback

### Error Handling
- Invalid path detection
- Network error handling
- Backend error messages
- User-friendly notifications

## Component Structure

```
app/page.tsx
├── LeftSidebar
│   ├── Home menu item
│   ├── Duplicates menu item (with badge)
│   ├── Analytics menu item
│   ├── Settings menu item
│   ├── Quick Stats (when data available)
│   └── Scan Directory button (when data available)
│
├── Main Content Area
│   ├── Home View
│   │   └── FolderSelector
│   │       ├── Hero section
│   │       ├── Folder input
│   │       ├── Scan button
│   │       ├── Quick access folders
│   │       ├── Recent scans
│   │       └── How it works guide
│   │
│   ├── Duplicates View
│   │   └── TwoColumnLayout
│   │       ├── Statistics
│   │       ├── Unique files
│   │       └── Duplicate groups
│   │
│   ├── Analytics View (placeholder)
│   └── Settings View (placeholder)
│
└── NotificationContainer
    ├── Success notifications
    └── Error notifications
```

## Example Paths

### Windows
```
C:/Users/YourName/Documents
C:/Users/YourName/Downloads
C:/Users/Public/Pictures
D:/Projects
```

### Linux/Mac
```
/home/username/Documents
/home/username/Downloads
~/Pictures
/var/data
```

## Testing

### Manual Testing
1. Start backend: `cd backend/dupilcate-files-manager && ./mvnw spring-boot:run`
2. Start frontend: `cd frontend/duplicate-files-web-ui && npm run dev`
3. Open: http://localhost:3000/
4. Enter a folder path (e.g., `C:/Users/Public/Documents`)
5. Click "Scan"
6. Wait for results
7. View duplicates in Duplicates view

### Test Cases
- ✅ Empty path (button disabled)
- ✅ Invalid path (error notification)
- ✅ Valid path with no duplicates
- ✅ Valid path with duplicates
- ✅ Network error handling
- ✅ Backend error handling
- ✅ Recent paths persistence
- ✅ Quick access folder selection
- ✅ Navigation between views
- ✅ Scan button in sidebar

## Keyboard Shortcuts
- **Enter**: Scan folder (when input is focused)
- **Tab**: Navigate between elements
- **Escape**: (Future) Cancel scan

## Accessibility
- ARIA labels on all interactive elements
- Keyboard navigation support
- Screen reader friendly
- Focus management
- Loading state announcements

## Future Enhancements
1. **Folder Browser**: Native folder picker dialog
2. **Drag & Drop**: Drag folder onto page to scan
3. **Progress Bar**: Show scan progress percentage
4. **Cancel Scan**: Ability to cancel ongoing scan
5. **Scan History**: Full history with timestamps and results
6. **Favorites**: Save favorite scan locations
7. **Filters**: Filter by file type, size, date
8. **Batch Scan**: Scan multiple folders at once

## Configuration

### Environment Variables
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
```

### LocalStorage Keys
- `recentPaths`: Array of recently scanned paths (max 5)

## Troubleshooting

### Scan Button Disabled
- Check if path is entered
- Verify backend is running
- Check console for errors

### No Results After Scan
- Verify folder path exists
- Check folder permissions
- Ensure folder contains files
- Check backend logs

### Recent Paths Not Saving
- Check browser localStorage is enabled
- Clear browser cache and try again
- Check browser console for errors

---

**Status**: ✅ Fully Implemented and Tested

**Last Updated**: 2026-03-15
