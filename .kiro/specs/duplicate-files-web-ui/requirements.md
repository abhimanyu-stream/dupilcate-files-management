# Requirements Document

## Introduction

This document specifies the requirements for a React Next.js web-based user interface that connects to the existing Spring Boot duplicate files management backend. The Web_UI enables users to visualize unique and duplicate files in a two-column layout, and provides functionality to delete duplicate files individually or in bulk.

## Glossary

- **Web_UI**: The React Next.js frontend application that provides the user interface
- **Backend_API**: The Spring Boot REST API that provides duplicate file analysis and file operations
- **Unique_File**: A file that has no duplicates based on SHA-256 hash comparison
- **Duplicate_File**: A file that shares the same SHA-256 hash with one or more other files
- **Duplicate_Group**: A collection of Duplicate_Files that share the same hash, associated with one Unique_File
- **File_Card**: A visual component displaying file information (name, path, size, modification date)
- **Selection_State**: The checked/unchecked state of a Duplicate_File for bulk operations

## Requirements

### Requirement 1: Display File Analysis Results

**User Story:** As a user, I want to see the results of duplicate file analysis, so that I can understand which files are unique and which are duplicates

#### Acceptance Criteria

1. WHEN the Web_UI loads, THE Web_UI SHALL fetch duplicate analysis data from the Backend_API
2. THE Web_UI SHALL display unique files in the left column
3. THE Web_UI SHALL display duplicate files in the right column
4. FOR EACH Unique_File displayed, THE Web_UI SHALL show the file name, path, size, and modification date
5. FOR EACH Duplicate_File displayed, THE Web_UI SHALL show the file name, path, size, and modification date
6. WHEN a Unique_File has associated duplicates, THE Web_UI SHALL visually indicate the relationship between the Unique_File and its Duplicate_Group

### Requirement 2: Two-Column Layout Structure

**User Story:** As a user, I want to see unique and duplicate files in separate columns, so that I can easily distinguish between them

#### Acceptance Criteria

1. THE Web_UI SHALL render a two-column layout with equal width columns
2. THE Web_UI SHALL label the left column as "Unique Files"
3. THE Web_UI SHALL label the right column as "Duplicate Files"
4. THE Web_UI SHALL display the total count of unique files in the left column header
5. THE Web_UI SHALL display the total count of duplicate files in the right column header
6. WHEN the viewport width is below 768 pixels, THE Web_UI SHALL stack the columns vertically

### Requirement 3: Delete Individual Duplicate Files

**User Story:** As a user, I want to delete duplicate files one by one, so that I can selectively remove unwanted duplicates

#### Acceptance Criteria

1. FOR EACH Duplicate_File, THE Web_UI SHALL display a delete button
2. WHEN the user clicks a delete button, THE Web_UI SHALL send a delete request to the Backend_API with the file path
3. WHEN the Backend_API confirms successful deletion, THE Web_UI SHALL remove the Duplicate_File from the display
4. WHEN the Backend_API returns an error, THE Web_UI SHALL display an error message to the user
5. WHILE a delete operation is in progress, THE Web_UI SHALL disable the delete button and show a loading indicator

### Requirement 4: Select Duplicate Files for Bulk Operations

**User Story:** As a user, I want to select multiple duplicate files, so that I can delete them all at once

#### Acceptance Criteria

1. FOR EACH Duplicate_File, THE Web_UI SHALL display a checkbox
2. WHEN the user clicks a checkbox, THE Web_UI SHALL toggle the Selection_State for that Duplicate_File
3. THE Web_UI SHALL display a "Select All" checkbox in the duplicate files column header
4. WHEN the user clicks "Select All", THE Web_UI SHALL set all Duplicate_Files to selected
5. WHEN the user clicks "Select All" again, THE Web_UI SHALL set all Duplicate_Files to unselected
6. THE Web_UI SHALL display the count of currently selected Duplicate_Files

### Requirement 5: Delete Selected Duplicate Files in Bulk

**User Story:** As a user, I want to delete all selected duplicate files at once, so that I can efficiently clean up multiple duplicates

#### Acceptance Criteria

1. WHEN at least one Duplicate_File is selected, THE Web_UI SHALL display a "Delete Selected" button
2. WHEN the user clicks "Delete Selected", THE Web_UI SHALL send delete requests to the Backend_API for all selected files
3. WHEN all delete operations complete successfully, THE Web_UI SHALL remove all deleted Duplicate_Files from the display
4. IF any delete operation fails, THE Web_UI SHALL display an error message indicating which files failed to delete
5. WHILE bulk delete operations are in progress, THE Web_UI SHALL disable the "Delete Selected" button and show a loading indicator
6. WHEN bulk delete completes, THE Web_UI SHALL clear all Selection_States

### Requirement 6: Display File Information Clearly

**User Story:** As a user, I want to see detailed information about each file, so that I can make informed decisions about which files to delete

#### Acceptance Criteria

1. FOR EACH File_Card, THE Web_UI SHALL display the file name prominently
2. FOR EACH File_Card, THE Web_UI SHALL display the full file path
3. FOR EACH File_Card, THE Web_UI SHALL display the file size in human-readable format (KB, MB, GB)
4. FOR EACH File_Card, THE Web_UI SHALL display the modification date in a readable format
5. FOR EACH File_Card, THE Web_UI SHALL display the file extension or type category

### Requirement 7: Handle API Communication Errors

**User Story:** As a user, I want to be notified when the application cannot communicate with the backend, so that I understand why operations are failing

#### Acceptance Criteria

1. WHEN the Web_UI cannot connect to the Backend_API, THE Web_UI SHALL display a connection error message
2. WHEN the Backend_API returns a 500 error, THE Web_UI SHALL display a server error message
3. WHEN the Backend_API returns a 404 error, THE Web_UI SHALL display a "resource not found" message
4. WHEN a network timeout occurs, THE Web_UI SHALL display a timeout error message
5. FOR EACH error message, THE Web_UI SHALL provide a "Retry" button to attempt the operation again

### Requirement 8: Provide Visual Feedback for User Actions

**User Story:** As a user, I want immediate visual feedback for my actions, so that I know the application is responding

#### Acceptance Criteria

1. WHEN a delete operation is in progress, THE Web_UI SHALL display a loading spinner on the affected File_Card
2. WHEN a delete operation succeeds, THE Web_UI SHALL display a success notification
3. WHEN a delete operation fails, THE Web_UI SHALL display an error notification
4. WHEN the Web_UI is fetching data from the Backend_API, THE Web_UI SHALL display a loading state
5. THE Web_UI SHALL automatically dismiss success notifications after 3 seconds

### Requirement 9: Connect to Backend API

**User Story:** As a developer, I want the Web_UI to connect to the existing Spring Boot backend, so that it can retrieve and manipulate file data

#### Acceptance Criteria

1. THE Web_UI SHALL configure the Backend_API base URL as an environment variable
2. THE Web_UI SHALL send GET requests to retrieve duplicate analysis data
3. THE Web_UI SHALL send DELETE requests with file paths to delete files
4. THE Web_UI SHALL include appropriate headers in all API requests
5. THE Web_UI SHALL handle CORS configuration for cross-origin requests

### Requirement 10: Maintain One-to-Many Relationship Visualization

**User Story:** As a user, I want to see which duplicate files correspond to which unique file, so that I understand the duplicate relationships

#### Acceptance Criteria

1. WHEN a Unique_File is displayed, THE Web_UI SHALL group its associated Duplicate_Files together in the right column
2. THE Web_UI SHALL use visual indicators (such as borders, colors, or connecting lines) to show the relationship between a Unique_File and its Duplicate_Group
3. WHEN the user hovers over a Unique_File, THE Web_UI SHALL highlight its associated Duplicate_Group
4. WHEN the user hovers over a Duplicate_File, THE Web_UI SHALL highlight its corresponding Unique_File
5. THE Web_UI SHALL display the count of duplicates for each Unique_File
