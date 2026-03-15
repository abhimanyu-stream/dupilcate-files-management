package com.filemanager.duplicates.model;

import java.util.List;

/**
 * Represents summary statistics for the entire operation.
 */
public class OperationStats {
    private final int filesScanned;
    private final int uniqueFilesMoved;
    private final int duplicateFilesMoved;
    private final List<ErrorRecord> errors;
    private final String rootFolderPath;
    
    public OperationStats(int filesScanned, 
                         int uniqueFilesMoved, 
                         int duplicateFilesMoved,
                         List<ErrorRecord> errors, 
                         String rootFolderPath) {
        this.filesScanned = filesScanned;
        this.uniqueFilesMoved = uniqueFilesMoved;
        this.duplicateFilesMoved = duplicateFilesMoved;
        this.errors = errors;
        this.rootFolderPath = rootFolderPath;
    }
    
    /**
     * Returns percentage of successful operations.
     */
    public double getSuccessRate() {
        int totalAttempted = uniqueFilesMoved + duplicateFilesMoved + errors.size();
        if (totalAttempted == 0) return 100.0;
        return ((double)(uniqueFilesMoved + duplicateFilesMoved) / totalAttempted) * 100.0;
    }
    
    // Getters
    public int getFilesScanned() {
        return filesScanned;
    }
    
    public int getUniqueFilesMoved() {
        return uniqueFilesMoved;
    }
    
    public int getDuplicateFilesMoved() {
        return duplicateFilesMoved;
    }
    
    public List<ErrorRecord> getErrors() {
        return errors;
    }
    
    public String getRootFolderPath() {
        return rootFolderPath;
    }
    
    /**
     * Represents an error that occurred during file operations.
     */
    public static class ErrorRecord {
        private final String filePath;
        private final String errorMessage;
        
        public ErrorRecord(String filePath, String errorMessage) {
            this.filePath = filePath;
            this.errorMessage = errorMessage;
        }
        
        public String getFilePath() {
            return filePath;
        }
        
        public String getErrorMessage() {
            return errorMessage;
        }
    }
}
