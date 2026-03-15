'use client';

import { useState, useEffect } from 'react';
import { DuplicateAnalysis, Notification, createSuccessNotification, createErrorNotification } from '@/types';
import { getAnalysis, scanDirectory, deleteFile, deleteFiles, APIError } from '@/lib/api/duplicateFilesAPI';
import TwoColumnLayout from '@/components/TwoColumnLayout';
import NotificationContainer from '@/components/NotificationContainer';
import ErrorBoundary from '@/components/ErrorBoundary';
import LeftSidebar from '@/components/LeftSidebar';
import FolderSelector from '@/components/FolderSelector';
import BackendStatusChecker from '@/components/BackendStatusChecker';

/**
 * PageState interface for managing the main page state
 * Validates Requirements 1.1, 4.2, 5.6
 */
interface PageState {
  analysis: DuplicateAnalysis | null;
  selectedFiles: Set<string>; // file paths
  loading: boolean;
  error: string | null;
  notifications: Notification[];
}

/**
 * Main page component for Duplicate Files Web UI
 * Manages state for file analysis, selections, and notifications
 */
export default function DuplicateFilesPage() {
  // Initialize state
  const [analysis, setAnalysis] = useState<DuplicateAnalysis | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [deletingFiles, setDeletingFiles] = useState<Set<string>>(new Set());
  const [activeView, setActiveView] = useState<string>('home');
  const [isScanning, setIsScanning] = useState<boolean>(false);

  // Helper function: Add a notification
  const addNotification = (notification: Notification) => {
    setNotifications((prev) => [...prev, notification]);
  };

  // Helper function: Remove a notification by ID
  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Helper function: Toggle file selection
  const toggleFileSelection = (path: string) => {
    setSelectedFiles((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  };

  // Helper function: Clear all selections
  const clearSelections = () => {
    setSelectedFiles(new Set());
  };

  /**
   * Handle refresh - re-fetch the current analysis
   */
  const handleRefresh = async () => {
    if (!analysis) return;
    
    setLoading(true);
    setError(null);

    try {
      const data = await getAnalysis();
      setAnalysis(data);
      
      // Show success notification
      addNotification(
        createSuccessNotification('Analysis refreshed successfully!')
      );
    } catch (err) {
      // Handle API errors
      if (err instanceof APIError) {
        setError(err.message);
        addNotification(createErrorNotification(err.message));
      } else {
        const errorMsg = 'Failed to refresh analysis. Please try again.';
        setError(errorMsg);
        addNotification(createErrorNotification(errorMsg));
      }
      console.error('Failed to refresh analysis:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle folder scan
   * Scans a directory for duplicate files
   * 
   * @param folderPath - Full path of the directory to scan
   */
  const handleScan = async (folderPath: string) => {
    setIsScanning(true);
    setLoading(true);
    setError(null);

    try {
      const data = await scanDirectory(folderPath);
      setAnalysis(data);
      
      // Switch to duplicates view after successful scan
      setActiveView('duplicates');
      
      // Show success notification
      addNotification(
        createSuccessNotification(
          `Scan complete! Found ${data.totalDuplicates} duplicate files.`
        )
      );
    } catch (err) {
      // Handle API errors
      if (err instanceof APIError) {
        setError(err.message);
        addNotification(createErrorNotification(err.message));
      } else {
        const errorMsg = 'Failed to scan directory. Please check the path and try again.';
        setError(errorMsg);
        addNotification(createErrorNotification(errorMsg));
      }
      console.error('Failed to scan directory:', err);
    } finally {
      setIsScanning(false);
      setLoading(false);
    }
  };

  /**
   * Handle individual file selection
   * Validates Requirements 4.2
   * 
   * @param path - Full path of the file to toggle selection
   */
  const handleFileSelect = (path: string) => {
    toggleFileSelection(path);
  };

  /**
   * Handle select all / unselect all duplicate files
   * Validates Requirements 4.4, 4.5
   */
  const handleSelectAll = () => {
    if (!analysis) return;

    // Get all duplicate file paths
    const allDuplicatePaths = Object.values(analysis.duplicateGroups)
      .flat()
      .map((file) => file.path);

    // If all duplicates are selected, unselect all (Requirement 4.5)
    // Otherwise, select all (Requirement 4.4)
    const allSelected = allDuplicatePaths.every((path) => selectedFiles.has(path));

    if (allSelected) {
      // Unselect all
      setSelectedFiles(new Set());
    } else {
      // Select all
      setSelectedFiles(new Set(allDuplicatePaths));
    }
  };

  /**
   * Handle individual file deletion
   * Validates Requirements 3.2, 3.3, 3.4, 3.5, 8.1, 8.2, 8.3
   * 
   * @param path - Full path of the file to delete
   */
  const handleFileDelete = async (path: string) => {
    // Mark file as deleting (Requirement 3.5, 8.1)
    setDeletingFiles((prev) => new Set(prev).add(path));

    // Store original analysis for rollback
    const originalAnalysis = analysis;

    try {
      // Optimistically update UI - remove file immediately (Requirement 3.3)
      if (analysis) {
        const updatedDuplicateGroups = { ...analysis.duplicateGroups };
        
        // Find and remove the file from its duplicate group
        for (const [hash, duplicates] of Object.entries(updatedDuplicateGroups)) {
          const filteredDuplicates = duplicates.filter((file) => file.path !== path);
          
          if (filteredDuplicates.length !== duplicates.length) {
            // File was found and removed
            if (filteredDuplicates.length === 0) {
              // No more duplicates in this group, remove the group
              delete updatedDuplicateGroups[hash];
            } else {
              updatedDuplicateGroups[hash] = filteredDuplicates;
            }
            break;
          }
        }

        setAnalysis({
          ...analysis,
          duplicateGroups: updatedDuplicateGroups,
          totalDuplicates: analysis.totalDuplicates - 1,
          totalFiles: analysis.totalFiles - 1,
        });
      }

      // Call API to delete file (Requirement 3.2)
      const result = await deleteFile(path);

      if (result.success) {
        // Show success notification (Requirement 8.2)
        addNotification(createSuccessNotification(`Successfully deleted: ${path}`));
      } else {
        // API returned success=false, roll back and show error (Requirement 3.4, 8.3)
        setAnalysis(originalAnalysis);
        addNotification(
          createErrorNotification(
            result.errorMessage || `Failed to delete: ${path}`,
            () => handleFileDelete(path) // Retry action (Requirement 7.5)
          )
        );
      }
    } catch (err) {
      // Roll back on failure (Requirement 3.4)
      setAnalysis(originalAnalysis);

      // Show error notification with retry (Requirement 3.4, 7.5, 8.3)
      if (err instanceof APIError) {
        addNotification(
          createErrorNotification(err.message, () => handleFileDelete(path))
        );
      } else {
        addNotification(
          createErrorNotification(
            `Failed to delete: ${path}. Please try again.`,
            () => handleFileDelete(path)
          )
        );
      }
      console.error('Failed to delete file:', err);
    } finally {
      // Remove file from deleting state (Requirement 3.5, 8.1)
      setDeletingFiles((prev) => {
        const newSet = new Set(prev);
        newSet.delete(path);
        return newSet;
      });
    }
  };

  /**
   * Handle bulk deletion of selected files
   * Validates Requirements 5.2, 5.3, 5.4, 5.5, 5.6
   */
  const handleDeleteSelected = async () => {
    if (selectedFiles.size === 0) return;

    // Convert selected files Set to array
    const selectedPaths = Array.from(selectedFiles);

    // Show loading state during bulk operation (Requirement 5.5)
    setLoading(true);

    // Mark all selected files as deleting
    setDeletingFiles(new Set(selectedPaths));

    // Store original analysis for rollback
    const originalAnalysis = analysis;

    try {
      // Optimistically update UI - remove all selected files immediately
      if (analysis) {
        const updatedDuplicateGroups = { ...analysis.duplicateGroups };
        let removedCount = 0;

        // Remove all selected files from their duplicate groups
        for (const [hash, duplicates] of Object.entries(updatedDuplicateGroups)) {
          const filteredDuplicates = duplicates.filter(
            (file) => !selectedFiles.has(file.path)
          );

          const filesRemovedFromGroup = duplicates.length - filteredDuplicates.length;
          removedCount += filesRemovedFromGroup;

          if (filteredDuplicates.length === 0) {
            // No more duplicates in this group, remove the group
            delete updatedDuplicateGroups[hash];
          } else if (filesRemovedFromGroup > 0) {
            updatedDuplicateGroups[hash] = filteredDuplicates;
          }
        }

        setAnalysis({
          ...analysis,
          duplicateGroups: updatedDuplicateGroups,
          totalDuplicates: analysis.totalDuplicates - removedCount,
          totalFiles: analysis.totalFiles - removedCount,
        });
      }

      // Call API to delete files (Requirement 5.2)
      const results = await deleteFiles(selectedPaths);

      // Separate successful and failed deletions
      const successfulDeletions = results.filter((result) => result.success);
      const failedDeletions = results.filter((result) => !result.success);

      if (failedDeletions.length > 0) {
        // Partial failure - roll back failed deletions (Requirement 5.4)
        const failedPaths = failedDeletions.map((result) => result.sourcePath);
        
        // Restore failed files to the UI
        if (originalAnalysis) {
          const restoredDuplicateGroups = { ...analysis?.duplicateGroups || {} };
          
          for (const [hash, duplicates] of Object.entries(originalAnalysis.duplicateGroups)) {
            const filesToRestore = duplicates.filter((file) =>
              failedPaths.includes(file.path)
            );
            
            if (filesToRestore.length > 0) {
              if (restoredDuplicateGroups[hash]) {
                restoredDuplicateGroups[hash] = [
                  ...restoredDuplicateGroups[hash],
                  ...filesToRestore,
                ];
              } else {
                restoredDuplicateGroups[hash] = filesToRestore;
              }
            }
          }

          setAnalysis({
            ...analysis!,
            duplicateGroups: restoredDuplicateGroups,
            totalDuplicates: (analysis?.totalDuplicates || 0) + failedPaths.length,
            totalFiles: (analysis?.totalFiles || 0) + failedPaths.length,
          });
        }

        // Show error notification with specific file paths and retry (Requirement 5.4, 7.5)
        const errorMessages = failedDeletions
          .map((result) => `${result.sourcePath}: ${result.errorMessage || 'Unknown error'}`)
          .join('\n');
        
        addNotification(
          createErrorNotification(
            `Failed to delete ${failedDeletions.length} file(s):\n${errorMessages}`,
            () => handleDeleteSelected() // Retry action
          )
        );
      }

      if (successfulDeletions.length > 0) {
        // Show success notification for successful deletions (Requirement 5.3)
        addNotification(
          createSuccessNotification(
            `Successfully deleted ${successfulDeletions.length} file(s)`
          )
        );
      }
    } catch (err) {
      // Complete failure - roll back all deletions (Requirement 5.4)
      setAnalysis(originalAnalysis);

      // Show error notification with retry (Requirement 7.5)
      if (err instanceof APIError) {
        addNotification(
          createErrorNotification(err.message, () => handleDeleteSelected())
        );
      } else {
        addNotification(
          createErrorNotification(
            'Failed to delete selected files. Please try again.',
            () => handleDeleteSelected()
          )
        );
      }
      console.error('Failed to delete selected files:', err);
    } finally {
      // Clear loading state
      setLoading(false);

      // Clear deleting files state
      setDeletingFiles(new Set());

      // Clear all selections after operation completes (Requirement 5.6)
      clearSelections();
    }
  };

  // Fetch duplicate analysis data on component mount (if available)
  // Validates Requirements 1.1, 8.4
  useEffect(() => {
    const fetchAnalysis = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getAnalysis();
        // Only set analysis if there's actual data
        if (data.totalFiles > 0) {
          setAnalysis(data);
          setActiveView('duplicates'); // Switch to duplicates view if data exists
        }
      } catch (err) {
        // Silently fail on initial load - user can scan manually
        console.log('No cached analysis available');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, []); // Empty dependency array - fetch only on mount

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-white dark:bg-black flex">
        {/* Skip to main content link for accessibility */}
        <a href="#main-content" className="skip-to-main">
          Skip to main content
        </a>

        {/* Left Sidebar */}
        <LeftSidebar 
          activeView={activeView} 
          onViewChange={setActiveView}
          totalFiles={analysis?.totalFiles}
          totalDuplicates={analysis?.totalDuplicates}
          onScanClick={() => setActiveView('home')}
          onRefresh={handleRefresh}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Professional header with clean design */}
          <header className="border-b-2 border-black dark:border-white bg-white dark:bg-black">
            <div className="px-8 py-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-black dark:text-white uppercase" id="page-title">
                    Duplicate Files Manager
                  </h1>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2 uppercase tracking-widest">
                    Professional File Management System
                  </p>
                </div>
                {/* Status indicator */}
                {!loading && !error && analysis && (
                  <div className="text-right">
                    <div className="text-xs uppercase tracking-widest text-gray-400 dark:text-gray-600 mb-2">
                      Status
                    </div>
                    <div className="flex items-center gap-2 justify-end">
                      <div className="w-2 h-2 bg-black dark:bg-white"></div>
                      <span className="text-sm font-medium text-black dark:text-white uppercase tracking-wider">Online</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto">
            <div className="px-8 py-12">
              {/* Main content area */}
              <main id="main-content" role="main" aria-labelledby="page-title">
                {/* Home View - Folder Selection */}
                {activeView === 'home' && (
                  <FolderSelector onScan={handleScan} isScanning={isScanning} />
                )}

                {/* Loading state - Validates Requirement 8.4 */}
                {loading && activeView !== 'home' && (
                  <div className="bg-gray-50 dark:bg-gray-950 border-2 border-black dark:border-white p-16" role="status" aria-live="polite">
                    <div className="flex flex-col items-center justify-center space-y-6">
                      <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-800 border-t-black dark:border-t-white animate-spin" aria-hidden="true"></div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-black dark:text-white uppercase tracking-widest mb-2">Loading Analysis</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 uppercase tracking-wider">Please wait...</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Error state - Validates Requirement 7.1, 7.2, 7.3, 7.4 */}
                {!loading && error && activeView !== 'home' && (
                  <div className="bg-white dark:bg-black border-4 border-black dark:border-white p-12" role="alert" aria-live="assertive">
                    <div className="mb-8">
                      <p className="text-xs uppercase tracking-widest text-gray-500 dark:text-gray-500 mb-3">System Error</p>
                      <p className="text-xl font-bold text-black dark:text-white">{error}</p>
                    </div>
                    <button
                      onClick={() => window.location.reload()}
                      className="px-8 py-4 bg-black dark:bg-white text-white dark:text-black text-xs font-bold uppercase tracking-widest hover:bg-gray-800 dark:hover:bg-gray-200 transition-all focus:outline-none focus:ring-4 focus:ring-black dark:focus:ring-white focus:ring-offset-4"
                      aria-label="Retry loading duplicate analysis"
                    >
                      Retry
                    </button>
                  </div>
                )}

                {/* Success state - data loaded - Validates Requirements 1.1, 1.2, 1.3 */}
                {!loading && !error && analysis && activeView === 'duplicates' && (
                  <div>
                    {/* Statistics bar - Clean minimal design */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                      <div className="bg-white dark:bg-black border-2 border-black dark:border-white p-8 hover:bg-gray-50 dark:hover:bg-gray-950 transition-colors">
                        <div className="text-xs uppercase tracking-widest text-gray-500 dark:text-gray-500 mb-3">
                          Total Files
                        </div>
                        <div className="text-5xl font-bold text-black dark:text-white tabular-nums">
                          {analysis.totalFiles}
                        </div>
                      </div>
                      <div className="bg-white dark:bg-black border-2 border-black dark:border-white p-8 hover:bg-gray-50 dark:hover:bg-gray-950 transition-colors">
                        <div className="text-xs uppercase tracking-widest text-gray-500 dark:text-gray-500 mb-3">
                          Unique Files
                        </div>
                        <div className="text-5xl font-bold text-black dark:text-white tabular-nums">
                          {analysis.totalUnique}
                        </div>
                      </div>
                      <div className="bg-white dark:bg-black border-2 border-black dark:border-white p-8 hover:bg-gray-50 dark:hover:bg-gray-950 transition-colors">
                        <div className="text-xs uppercase tracking-widest text-gray-500 dark:text-gray-500 mb-3">
                          Duplicates
                        </div>
                        <div className="text-5xl font-bold text-black dark:text-white tabular-nums">
                          {analysis.totalDuplicates}
                        </div>
                      </div>
                    </div>

                    <TwoColumnLayout
                      uniqueFiles={analysis.uniqueFiles}
                      duplicateGroups={analysis.duplicateGroups}
                      selectedFiles={selectedFiles}
                      onFileSelect={handleFileSelect}
                      onFileDelete={handleFileDelete}
                      onSelectAll={handleSelectAll}
                      onDeleteSelected={handleDeleteSelected}
                    />
                  </div>
                )}

                {/* Dashboard View */}
                {!loading && !error && activeView === 'dashboard' && (
                  <div className="bg-white dark:bg-black border-2 border-black dark:border-white p-16 text-center">
                    <div className="mb-8">
                      <svg className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <p className="text-sm text-gray-600 dark:text-gray-400 uppercase tracking-widest">
                        Dashboard View - Coming Soon
                      </p>
                    </div>
                    {analysis && (
                      <button
                        onClick={() => setActiveView('duplicates')}
                        className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black text-xs font-bold uppercase tracking-widest hover:bg-gray-800 dark:hover:bg-gray-200 transition-all"
                      >
                        View Duplicates
                      </button>
                    )}
                  </div>
                )}

                {/* Analytics View */}
                {!loading && !error && activeView === 'analytics' && (
                  <div className="bg-white dark:bg-black border-2 border-black dark:border-white p-16 text-center">
                    <div className="mb-8">
                      <svg className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-sm text-gray-600 dark:text-gray-400 uppercase tracking-widest">
                        Analytics View - Coming Soon
                      </p>
                    </div>
                    {analysis && (
                      <button
                        onClick={() => setActiveView('duplicates')}
                        className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black text-xs font-bold uppercase tracking-widest hover:bg-gray-800 dark:hover:bg-gray-200 transition-all"
                      >
                        View Duplicates
                      </button>
                    )}
                  </div>
                )}

                {/* Settings View */}
                {!loading && !error && activeView === 'settings' && (
                  <div className="bg-white dark:bg-black border-2 border-black dark:border-white p-16 text-center">
                    <div className="mb-8">
                      <svg className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <p className="text-sm text-gray-600 dark:text-gray-400 uppercase tracking-widest">
                        Settings View - Coming Soon
                      </p>
                    </div>
                  </div>
                )}

                {/* Empty state - no data yet */}
                {!loading && !error && !analysis && activeView === 'duplicates' && (
                  <div className="bg-gray-50 dark:bg-gray-950 border-2 border-black dark:border-white p-16 text-center" role="status">
                    <svg className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                    <p className="text-sm text-gray-600 dark:text-gray-400 uppercase tracking-widest mb-6">
                      No analysis data available
                    </p>
                    <button
                      onClick={() => setActiveView('home')}
                      className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black text-xs font-bold uppercase tracking-widest hover:bg-gray-800 dark:hover:bg-gray-200 transition-all"
                    >
                      Scan a Folder
                    </button>
                  </div>
                )}
              </main>
            </div>
          </div>
        </div>

        {/* Notification Container - Validates Requirements 8.1, 8.2, 8.3 */}
        <NotificationContainer
          notifications={notifications}
          onDismiss={removeNotification}
        />

        {/* Backend Status Checker */}
        <BackendStatusChecker />
      </div>
    </ErrorBoundary>
  );
}
