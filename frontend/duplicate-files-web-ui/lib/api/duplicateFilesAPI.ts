/**
 * API Client for Duplicate Files Management
 * Handles communication with Spring Boot backend
 * Validates Requirements 9.1, 9.2, 9.3, 9.4, 7.1, 7.2, 7.3, 7.4
 */

import { DuplicateAnalysis, OperationResult, APIConfig } from '@/types';

// ============================================================================
// Configuration
// ============================================================================

/**
 * API client configuration
 * Base URL is loaded from environment variable (Requirement 9.1)
 */
const API_CONFIG: APIConfig = {
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api',
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json', // Requirement 9.4
  },
};

// ============================================================================
// Error Handling
// ============================================================================

/**
 * HTTP status code to user-friendly error message mapping
 * Validates Requirements 7.1, 7.2, 7.3, 7.4
 */
const ERROR_MESSAGES: Record<number, string> = {
  400: 'Invalid request. Please try again.',
  404: 'Resource not found.', // Requirement 7.3
  500: 'Server error occurred. Please try again later.', // Requirement 7.2
  503: 'Service temporarily unavailable.',
};

const NETWORK_ERROR_MESSAGE = 'Cannot connect to server. Please check your connection.'; // Requirement 7.1
const TIMEOUT_ERROR_MESSAGE = 'Request timed out. Please try again.'; // Requirement 7.4

/**
 * Custom error class for API errors
 */
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public isNetworkError: boolean = false,
    public isTimeout: boolean = false
  ) {
    super(message);
    this.name = 'APIError';
  }
}

/**
 * Maps HTTP status codes and error types to user-friendly messages
 * Validates Requirements 7.1, 7.2, 7.3, 7.4
 */
function getErrorMessage(error: unknown): string {
  if (error instanceof APIError) {
    if (error.isTimeout) {
      return TIMEOUT_ERROR_MESSAGE;
    }
    if (error.isNetworkError) {
      return NETWORK_ERROR_MESSAGE;
    }
    if (error.statusCode && ERROR_MESSAGES[error.statusCode]) {
      return ERROR_MESSAGES[error.statusCode];
    }
    return error.message;
  }
  
  return 'An unexpected error occurred. Please try again.';
}

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validates a file path
 * Ensures path is not empty and is a string
 * Validates Requirement 9.3
 * 
 * @param path - File path to validate
 * @throws APIError if path is invalid
 */
function validateFilePath(path: string): void {
  if (!path || typeof path !== 'string') {
    throw new APIError('Invalid file path provided');
  }
  
  if (path.trim().length === 0) {
    throw new APIError('File path cannot be empty');
  }
}

/**
 * Validates an array of file paths
 * Ensures all paths are valid
 * Validates Requirement 9.3
 * 
 * @param paths - Array of file paths to validate
 * @throws APIError if any path is invalid
 */
function validateFilePaths(paths: string[]): void {
  if (!Array.isArray(paths)) {
    throw new APIError('Invalid file paths provided');
  }
  
  if (paths.length === 0) {
    throw new APIError('At least one file path must be provided');
  }
  
  paths.forEach((path, index) => {
    try {
      validateFilePath(path);
    } catch (error) {
      throw new APIError(`Invalid file path at index ${index}`);
    }
  });
}

// ============================================================================
// HTTP Client Utilities
// ============================================================================

/**
 * Creates an AbortController with timeout
 * Enables request timeout handling (Requirement 7.4)
 */
function createTimeoutController(timeoutMs: number): AbortController {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), timeoutMs);
  return controller;
}

/**
 * Performs HTTP request with timeout and error handling
 * Validates Requirements 9.4, 7.1, 7.2, 7.3, 7.4
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const controller = createTimeoutController(API_CONFIG.timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...API_CONFIG.headers,
        ...options.headers,
      },
      signal: controller.signal,
    });
    
    // Handle HTTP error responses
    if (!response.ok) {
      const statusCode = response.status;
      const errorMessage = ERROR_MESSAGES[statusCode] || `HTTP error ${statusCode}`;
      
      throw new APIError(errorMessage, statusCode, false, false);
    }
    
    return response;
  } catch (error) {
    // Handle timeout errors
    if (error instanceof Error && error.name === 'AbortError') {
      throw new APIError(TIMEOUT_ERROR_MESSAGE, undefined, false, true);
    }
    
    // Handle network errors (connection refused, DNS failure, etc.)
    if (error instanceof TypeError) {
      throw new APIError(NETWORK_ERROR_MESSAGE, undefined, true, false);
    }
    
    // Re-throw APIError instances
    if (error instanceof APIError) {
      throw error;
    }
    
    // Handle unexpected errors
    throw new APIError('An unexpected error occurred. Please try again.');
  }
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Fetches duplicate analysis data from the backend
 * Validates Requirement 9.2: Send GET requests to retrieve duplicate analysis data
 * 
 * @returns Promise resolving to DuplicateAnalysis object
 * @throws APIError if request fails
 */
export async function getAnalysis(): Promise<DuplicateAnalysis> {
  const url = `${API_CONFIG.baseURL}/analysis`;
  
  try {
    const response = await fetchWithTimeout(url, {
      method: 'GET',
    });
    
    const data = await response.json();
    return data as DuplicateAnalysis;
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    console.error('Failed to fetch analysis:', error);
    
    // Re-throw with user-friendly message
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(errorMessage);
  }
}

/**
 * Scans a directory for duplicate files
 * Validates Requirement 9.2: Send POST requests to scan directories
 * 
 * @param directoryPath - Full path of the directory to scan
 * @returns Promise resolving to DuplicateAnalysis object
 * @throws APIError if request fails or path is invalid
 */
export async function scanDirectory(directoryPath: string): Promise<DuplicateAnalysis> {
  // Validate directory path
  validateFilePath(directoryPath);
  
  const url = `${API_CONFIG.baseURL}/scan`;
  
  try {
    const response = await fetchWithTimeout(url, {
      method: 'POST',
      body: JSON.stringify({ path: directoryPath }),
    });
    
    const data = await response.json();
    return data as DuplicateAnalysis;
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    console.error(`Failed to scan directory ${directoryPath}:`, error);
    
    // Re-throw with user-friendly message
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(errorMessage);
  }
}

/**
 * Deletes a single file
 * Validates Requirement 9.3: Send DELETE requests with file paths to delete files
 * 
 * @param path - Full path of the file to delete
 * @returns Promise resolving to OperationResult
 * @throws APIError if request fails or path is invalid
 */
export async function deleteFile(path: string): Promise<OperationResult> {
  // Validate file path (Requirement 9.3)
  validateFilePath(path);
  
  const url = `${API_CONFIG.baseURL}/files`;
  
  try {
    const response = await fetchWithTimeout(url, {
      method: 'DELETE', // Requirement 9.3: Use DELETE HTTP method
      body: JSON.stringify({ path }), // Requirement 9.3: Include file path in request
    });
    
    const data = await response.json();
    return data as OperationResult;
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    console.error(`Failed to delete file ${path}:`, error);
    
    // Re-throw with user-friendly message
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(errorMessage);
  }
}

/**
 * Deletes multiple files in bulk
 * Validates Requirement 9.3: Send DELETE requests with file paths to delete files
 * 
 * @param paths - Array of file paths to delete
 * @returns Promise resolving to array of OperationResults
 * @throws APIError if request fails or paths are invalid
 */
export async function deleteFiles(paths: string[]): Promise<OperationResult[]> {
  // Validate file paths (Requirement 9.3)
  validateFilePaths(paths);
  
  const url = `${API_CONFIG.baseURL}/files/bulk`;
  
  try {
    const response = await fetchWithTimeout(url, {
      method: 'DELETE', // Requirement 9.3: Use DELETE HTTP method
      body: JSON.stringify({ paths }), // Requirement 9.3: Include file paths in request
    });
    
    const data = await response.json();
    return data as OperationResult[];
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    console.error(`Failed to delete files:`, error);
    
    // Re-throw with user-friendly message
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(errorMessage);
  }
}

// ============================================================================
// Exported API Interface
// ============================================================================

/**
 * Duplicate Files API client interface
 * Provides all API operations for duplicate file management
 */
export const duplicateFilesAPI = {
  getAnalysis,
  scanDirectory,
  deleteFile,
  deleteFiles,
  
  // Expose error class for error handling in components
  APIError,
  
  // Expose error message getter for consistent error display
  getErrorMessage,
};

export default duplicateFilesAPI;
