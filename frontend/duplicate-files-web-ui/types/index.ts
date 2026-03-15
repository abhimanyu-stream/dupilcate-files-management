/**
 * TypeScript interfaces and data models for Duplicate Files Web UI
 * Validates Requirements 6.3, 6.4
 */

// ============================================================================
// Core Data Interfaces
// ============================================================================

/**
 * Represents metadata for a file in the system.
 * Maps to backend FileInfo model.
 */
export interface FileInfo {
  path: string;
  size: number;
  extension: string;
  modificationDate: string; // ISO 8601 format from backend
  hash: string;
  filename: string;
  filenameWithoutExt: string;
  fileTypeCategory: string;
}

/**
 * Represents the complete duplicate analysis result.
 * Maps to backend DuplicateAnalysis model.
 */
export interface DuplicateAnalysis {
  uniqueFiles: FileInfo[];
  duplicateGroups: Record<string, FileInfo[]>; // hash -> array of duplicate files
  totalFiles: number;
  totalUnique: number;
  totalDuplicates: number;
}

/**
 * Represents the result of a file operation (e.g., deletion).
 * Maps to backend OperationResult model.
 */
export interface OperationResult {
  success: boolean;
  sourcePath: string;
  destinationPath: string | null;
  errorMessage: string | null;
}

/**
 * Represents a user notification message.
 */
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
  timestamp: number;
  retryAction?: () => void; // Optional retry function for error notifications
}

/**
 * Configuration for API client.
 */
export interface APIConfig {
  baseURL: string;
  timeout: number;
  headers: {
    'Content-Type': string;
  };
}

// ============================================================================
// Utility Functions for Data Transformation
// ============================================================================

/**
 * Parses ISO 8601 date string to Date object.
 * Handles backend LocalDateTime serialization format.
 * 
 * @param dateString - ISO 8601 formatted date string
 * @returns Date object or null if parsing fails
 */
export function parseDate(dateString: string): Date | null {
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
}

/**
 * Formats a Date object to human-readable string.
 * 
 * @param date - Date object to format
 * @returns Formatted date string (e.g., "Jan 15, 2024, 3:45 PM")
 */
export function formatDate(date: Date): string {
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Formats file size from bytes to human-readable format.
 * Validates Requirement 6.3: Display file size in human-readable format (KB, MB, GB)
 * 
 * @param bytes - File size in bytes
 * @returns Formatted size string (e.g., "1.5 MB", "234 KB", "2.3 GB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  // Limit to GB for practical purposes
  const index = Math.min(i, sizes.length - 1);
  const value = bytes / Math.pow(k, index);
  
  // Format with appropriate decimal places
  const formatted = index === 0 ? value.toString() : value.toFixed(2);
  
  return `${formatted} ${sizes[index]}`;
}

/**
 * Formats modification date from ISO string to readable format.
 * Validates Requirement 6.4: Display modification date in readable format
 * 
 * @param isoDateString - ISO 8601 date string from backend
 * @returns Formatted date string or "Unknown" if parsing fails
 */
export function formatModificationDate(isoDateString: string): string {
  const date = parseDate(isoDateString);
  return date ? formatDate(date) : 'Unknown';
}

/**
 * Creates a Map for efficient hash-to-unique-file lookup.
 * Enables quick relationship queries between unique files and duplicate groups.
 * 
 * @param uniqueFiles - Array of unique files
 * @returns Map of hash to unique FileInfo
 */
export function createHashToUniqueFileMap(uniqueFiles: FileInfo[]): Map<string, FileInfo> {
  const map = new Map<string, FileInfo>();
  
  for (const file of uniqueFiles) {
    map.set(file.hash, file);
  }
  
  return map;
}

/**
 * Creates a Map for efficient path-to-file lookup.
 * Useful for selection state management and file operations.
 * 
 * @param files - Array of files
 * @returns Map of path to FileInfo
 */
export function createPathToFileMap(files: FileInfo[]): Map<string, FileInfo> {
  const map = new Map<string, FileInfo>();
  
  for (const file of files) {
    map.set(file.path, file);
  }
  
  return map;
}

/**
 * Flattens duplicate groups into a single array of all duplicate files.
 * 
 * @param duplicateGroups - Record of hash to duplicate files array
 * @returns Flat array of all duplicate files
 */
export function flattenDuplicateGroups(duplicateGroups: Record<string, FileInfo[]>): FileInfo[] {
  const allDuplicates: FileInfo[] = [];
  
  for (const duplicates of Object.values(duplicateGroups)) {
    allDuplicates.push(...duplicates);
  }
  
  return allDuplicates;
}

/**
 * Generates a unique ID for notifications.
 * 
 * @returns Unique string ID
 */
export function generateNotificationId(): string {
  return `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Creates a success notification.
 * 
 * @param message - Success message to display
 * @returns Notification object
 */
export function createSuccessNotification(message: string): Notification {
  return {
    id: generateNotificationId(),
    type: 'success',
    message,
    timestamp: Date.now(),
  };
}

/**
 * Creates an error notification.
 * 
 * @param message - Error message to display
 * @param retryAction - Optional retry function
 * @returns Notification object
 */
export function createErrorNotification(message: string, retryAction?: () => void): Notification {
  return {
    id: generateNotificationId(),
    type: 'error',
    message,
    timestamp: Date.now(),
    retryAction,
  };
}

/**
 * Creates an info notification.
 * 
 * @param message - Info message to display
 * @returns Notification object
 */
export function createInfoNotification(message: string): Notification {
  return {
    id: generateNotificationId(),
    type: 'info',
    message,
    timestamp: Date.now(),
  };
}
