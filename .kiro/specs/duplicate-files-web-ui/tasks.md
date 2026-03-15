# Implementation Plan: Duplicate Files Web UI

## Overview

This implementation plan breaks down the development of a Next.js web UI for managing duplicate files into discrete, actionable tasks. The UI connects to an existing Spring Boot backend and provides a two-column layout for visualizing and managing unique and duplicate files. Each task builds incrementally, with early validation through property-based tests to catch errors quickly.

## Tasks

- [x] 1. Initialize Next.js project and configure development environment
  - Create Next.js 14+ project with TypeScript and App Router in the `frontend` directory
  - Install dependencies: React 18+, TypeScript, Tailwind CSS, fast-check, Jest, React Testing Library, MSW
  - Configure Tailwind CSS with custom theme colors for file type categories and relationship highlighting
  - Set up Jest and React Testing Library for testing
  - Create `.env.local` file with `NEXT_PUBLIC_API_BASE_URL` environment variable
  - Configure ESLint and TypeScript strict mode
  - _Requirements: 9.1_

- [x] 2. Define TypeScript interfaces and data models
  - Create `types/index.ts` with interfaces: `FileInfo`, `DuplicateAnalysis`, `OperationResult`, `Notification`, `APIConfig`
  - Create utility functions for data transformation: date parsing, size formatting (bytes to KB/MB/GB), hash mapping
  - _Requirements: 6.3, 6.4_

- [ ]* 2.1 Write property test for data transformation utilities
  - **Property 3: File cards display complete information** (partial validation for size/date formatting)
  - **Validates: Requirements 6.3, 6.4**

- [x] 3. Implement API client layer
  - Create `lib/api/duplicateFilesAPI.ts` with functions: `getAnalysis()`, `deleteFile(path)`, `deleteFiles(paths[])`
  - Implement error handling with HTTP status code mapping (404, 500, timeout, network errors)
  - Configure API client with base URL from environment variable, timeout, and headers
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 7.1, 7.2, 7.3, 7.4_

- [ ]* 3.1 Write unit tests for API client error handling
  - Test network timeout scenarios
  - Test HTTP error responses (404, 500)
  - Test connection failures
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [x] 4. Create FileCard component
  - Implement `components/FileCard.tsx` with props: `file`, `isUnique`, `isSelected`, `isDeleting`, `onSelect`, `onDelete`, `highlightGroup`
  - Display file name, full path, human-readable size, formatted modification date, file type category badge
  - Add checkbox and delete button for duplicate files (conditional rendering based on `isUnique`)
  - Show loading spinner when `isDeleting` is true
  - Disable delete button during operations
  - _Requirements: 1.4, 1.5, 3.1, 4.1, 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ]* 4.1 Write property test for FileCard rendering
  - **Property 3: File cards display complete information**
  - **Validates: Requirements 1.4, 1.5, 6.1, 6.2, 6.3, 6.4, 6.5**

- [ ]* 4.2 Write property test for FileCard interactive controls
  - **Property 6: Duplicate files have interactive controls**
  - **Validates: Requirements 3.1, 4.1**

- [ ]* 4.3 Write property test for checkbox toggle behavior
  - **Property 11: Checkbox click toggles selection state**
  - **Validates: Requirements 4.2**

- [ ]* 4.4 Write unit tests for FileCard edge cases
  - Test rendering with very long file paths
  - Test rendering with zero-byte files
  - Test rendering with missing optional props
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 5. Create DuplicateGroup component
  - Implement `components/DuplicateGroup.tsx` with props: `hash`, `uniqueFile`, `duplicates`, `selectedFiles`, `onFileSelect`, `onFileDelete`, `isHighlighted`
  - Render group header showing duplicate count
  - Render FileCard for each duplicate in the group
  - Apply colored border and visual connection indicator to unique file
  - Apply highlight styling when `isHighlighted` is true
  - _Requirements: 1.6, 10.1, 10.2, 10.5_

- [ ]* 5.1 Write property test for duplicate group file associations
  - **Property 26: Duplicate groups maintain file associations**
  - **Validates: Requirements 10.1**

- [ ]* 5.2 Write property test for duplicate count accuracy
  - **Property 28: Duplicate count displays accurate numbers**
  - **Validates: Requirements 10.5**

- [x] 6. Create ColumnHeader component
  - Implement `components/ColumnHeader.tsx` with props: `title`, `count`, `showSelectAll`, `showDeleteSelected`, `selectedCount`, `onSelectAll`, `onDeleteSelected`
  - Display column title and file count
  - Conditionally render "Select All" checkbox for duplicate column
  - Conditionally render "Delete Selected" button when selections exist
  - Show loading state during bulk operations
  - _Requirements: 2.2, 2.3, 2.4, 2.5, 4.3, 4.6, 5.1_

- [ ]* 6.1 Write property test for column count accuracy
  - **Property 5: Column counts match actual data**
  - **Validates: Requirements 2.4, 2.5**

- [ ]* 6.2 Write property test for selection count accuracy
  - **Property 14: Selection count matches actual selections**
  - **Validates: Requirements 4.6**

- [ ]* 6.3 Write property test for delete button visibility
  - **Property 15: Delete selected button visibility depends on selection**
  - **Validates: Requirements 5.1**

- [x] 7. Create TwoColumnLayout component
  - Implement `components/TwoColumnLayout.tsx` with props: `uniqueFiles`, `duplicateGroups`, `selectedFiles`, `onFileSelect`, `onFileDelete`, `onSelectAll`, `onDeleteSelected`
  - Render UniqueFilesColumn with ColumnHeader and FileCard components for each unique file
  - Render DuplicateFilesColumn with ColumnHeader and DuplicateGroup components
  - Implement responsive layout: equal width columns on desktop, stacked on mobile (<768px)
  - Implement hover state management for bidirectional highlighting between unique files and duplicate groups
  - _Requirements: 1.2, 1.3, 2.1, 2.6, 10.3, 10.4_

- [ ]* 7.1 Write property test for unique files column rendering
  - **Property 1: Unique files render in left column**
  - **Validates: Requirements 1.2**

- [ ]* 7.2 Write property test for duplicate files column rendering
  - **Property 2: Duplicate files render in right column**
  - **Validates: Requirements 1.3**

- [ ]* 7.3 Write property test for visual relationship indicators
  - **Property 4: Visual relationship indicators connect unique files to duplicates**
  - **Validates: Requirements 1.6, 10.2**

- [ ]* 7.4 Write property test for hover interactions
  - **Property 27: Hover interactions trigger bidirectional highlighting**
  - **Validates: Requirements 10.3, 10.4**

- [ ]* 7.5 Write unit tests for responsive layout
  - Test column stacking at 768px breakpoint
  - Test equal width columns on desktop
  - _Requirements: 2.6_

- [x] 8. Create NotificationToast component
  - Implement `components/NotificationToast.tsx` to display success, error, and info notifications
  - Support notification types: success, error, info
  - Auto-dismiss success notifications after 3 seconds
  - Include retry button for error notifications
  - Allow manual dismissal for all notification types
  - _Requirements: 7.5, 8.2, 8.3, 8.5_

- [ ]* 8.1 Write unit tests for notification behavior
  - Test auto-dismiss timer for success notifications
  - Test retry button functionality
  - Test manual dismissal
  - _Requirements: 7.5, 8.2, 8.3, 8.5_

- [x] 9. Implement main DuplicateFilesPage component - state management
  - Create `app/page.tsx` as the main page component
  - Define PageState interface with: `analysis`, `selectedFiles`, `loading`, `error`, `notifications`
  - Implement state management using useState/useReducer hooks
  - Create helper functions for state updates: `addNotification`, `removeNotification`, `toggleFileSelection`, `clearSelections`
  - _Requirements: 1.1, 4.2, 5.6_

- [x] 10. Implement main DuplicateFilesPage component - data fetching
  - Implement `useEffect` hook to fetch duplicate analysis data on component mount
  - Call `getAnalysis()` from API client
  - Update state with fetched data or error
  - Display loading state while fetching
  - _Requirements: 1.1, 8.4_

- [ ]* 10.1 Write property test for data fetch loading state
  - **Property 22: Data fetch operations show loading state**
  - **Validates: Requirements 8.4**

- [x] 11. Implement main DuplicateFilesPage component - individual delete operations
  - Implement `handleFileDelete(path: string)` function
  - Call `deleteFile(path)` from API client
  - Update UI optimistically (remove file immediately)
  - Roll back on failure and show error notification
  - Show loading state on affected FileCard during operation
  - Display success notification on successful deletion
  - _Requirements: 3.2, 3.3, 3.4, 3.5, 8.1, 8.2, 8.3_

- [ ]* 11.1 Write property test for delete API call
  - **Property 7: Delete operation triggers API call with correct path**
  - **Validates: Requirements 3.2**

- [ ]* 11.2 Write property test for successful deletion UI update
  - **Property 8: Successful deletion removes file from display**
  - **Validates: Requirements 3.3**

- [ ]* 11.3 Write property test for failed operation notifications
  - **Property 9: Failed operations display error notifications**
  - **Validates: Requirements 3.4, 8.3**

- [ ]* 11.4 Write property test for operation loading state
  - **Property 10: Operations in progress show loading state**
  - **Validates: Requirements 3.5, 5.5, 8.1**

- [ ]* 11.5 Write property test for success notifications
  - **Property 21: Successful operations display success notifications**
  - **Validates: Requirements 8.2**

- [ ]* 11.6 Write property test for success notification auto-dismiss
  - **Property 23: Success notifications auto-dismiss after timeout**
  - **Validates: Requirements 8.5**

- [x] 12. Implement main DuplicateFilesPage component - selection operations
  - Implement `handleFileSelect(path: string)` to toggle individual file selection
  - Implement `handleSelectAll()` to select/unselect all duplicate files
  - Update `selectedFiles` Set in state
  - _Requirements: 4.2, 4.4, 4.5_

- [ ]* 12.1 Write property test for select all behavior
  - **Property 12: Select all selects every duplicate file**
  - **Validates: Requirements 4.4**

- [ ]* 12.2 Write property test for select all toggle idempotence
  - **Property 13: Select all toggle returns to unselected state**
  - **Validates: Requirements 4.5**

- [x] 13. Implement main DuplicateFilesPage component - bulk delete operations
  - Implement `handleDeleteSelected()` function
  - Call `deleteFiles(selectedPaths)` from API client
  - Update UI optimistically (remove all selected files immediately)
  - Roll back failed deletions and show error notification with specific file paths
  - Show loading state during bulk operation
  - Clear all selections after operation completes
  - Display success notification for successful deletions
  - _Requirements: 5.2, 5.3, 5.4, 5.5, 5.6_

- [ ]* 13.1 Write property test for bulk delete API calls
  - **Property 16: Bulk delete triggers API calls for all selected files**
  - **Validates: Requirements 5.2**

- [ ]* 13.2 Write property test for bulk delete success
  - **Property 17: Successful bulk delete removes all deleted files**
  - **Validates: Requirements 5.3**

- [ ]* 13.3 Write property test for bulk delete partial failure
  - **Property 18: Bulk delete errors identify failed files**
  - **Validates: Requirements 5.4**

- [ ]* 13.4 Write property test for bulk delete selection clearing
  - **Property 19: Bulk delete completion clears selections**
  - **Validates: Requirements 5.6**

- [x] 14. Implement main DuplicateFilesPage component - error handling and retry
  - Implement retry functionality for failed operations
  - Store failed operation context in notification for retry button
  - Implement error boundary component to catch rendering errors
  - Add fallback UI for error states
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ]* 14.1 Write property test for error retry functionality
  - **Property 20: Error messages include retry functionality**
  - **Validates: Requirements 7.5**

- [ ]* 14.2 Write unit tests for error boundary
  - Test component rendering error recovery
  - Test fallback UI display
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [x] 15. Wire all components together in DuplicateFilesPage
  - Render TwoColumnLayout with all props connected to state and handlers
  - Render NotificationToast component with notifications from state
  - Render LoadingState component when `loading` is true
  - Render ErrorState component when `error` is not null
  - Pass all event handlers to child components
  - _Requirements: 1.1, 1.2, 1.3, 8.1, 8.2, 8.3, 8.4_

- [ ]* 15.1 Write integration tests for complete page functionality
  - Test full user flow: load data, select files, delete files
  - Test error recovery flow
  - Test bulk operations flow
  - _Requirements: 1.1, 3.2, 3.3, 4.2, 4.4, 5.2, 5.3_

- [x] 16. Checkpoint - Ensure all tests pass
  - Run all unit tests and property-based tests
  - Verify test coverage meets minimum thresholds (80% line, 75% branch, 80% function)
  - Ensure all 28 correctness properties have corresponding property tests
  - Ensure all tests pass, ask the user if questions arise

- [x] 17. Implement API request validation
  - Add validation for API request payloads (file paths, headers)
  - Ensure DELETE requests use correct HTTP method
  - Ensure all requests include Content-Type: application/json header
  - _Requirements: 9.3, 9.4_

- [ ]* 17.1 Write property test for delete request format
  - **Property 24: Delete requests use correct HTTP method and payload**
  - **Validates: Requirements 9.3**

- [ ]* 17.2 Write property test for API request headers
  - **Property 25: API requests include required headers**
  - **Validates: Requirements 9.4**

- [x] 18. Add responsive design polish and accessibility
  - Ensure all interactive elements have proper ARIA labels
  - Add keyboard navigation support for all operations
  - Test responsive layout on various screen sizes
  - Add focus indicators for keyboard navigation
  - Ensure color contrast meets WCAG AA standards
  - _Requirements: 2.6_

- [ ]* 18.1 Write unit tests for accessibility
  - Test ARIA labels on all interactive elements
  - Test keyboard navigation
  - Test focus management
  - _Requirements: 2.6_

- [x] 19. Configure production build and deployment
  - Create `next.config.js` with production optimizations
  - Configure environment variables for production
  - Set up CORS configuration documentation for backend integration
  - Create README.md with setup instructions, environment variables, and development commands
  - Test production build locally
  - _Requirements: 9.1, 9.5_

- [x] 20. Final checkpoint - Ensure all tests pass and application is ready
  - Run full test suite with increased property test iterations (1000+)
  - Verify all requirements are covered by implementation
  - Test complete user flows manually
  - Ensure all tests pass, ask the user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples, edge cases, and integration points
- The implementation uses TypeScript as specified in the design document
- All 28 correctness properties from the design document have corresponding property test tasks
