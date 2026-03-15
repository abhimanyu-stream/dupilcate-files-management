package com.filemanager.duplicates.model;

/**
 * Represents the result of a file operation.
 */
public class OperationResult {
    private final boolean success;
    private final String sourcePath;
    private final String destinationPath;
    private final String errorMessage;
    
    public OperationResult(boolean success, String sourcePath, 
                          String destinationPath, String errorMessage) {
        this.success = success;
        this.sourcePath = sourcePath;
        this.destinationPath = destinationPath;
        this.errorMessage = errorMessage;
    }
    
    public static OperationResult success(String sourcePath, String destinationPath) {
        return new OperationResult(true, sourcePath, destinationPath, null);
    }
    
    public static OperationResult failure(String sourcePath, String errorMessage) {
        return new OperationResult(false, sourcePath, null, errorMessage);
    }
    
    // Getters
    public boolean isSuccess() {
        return success;
    }
    
    public String getSourcePath() {
        return sourcePath;
    }
    
    public String getDestinationPath() {
        return destinationPath;
    }
    
    public String getErrorMessage() {
        return errorMessage;
    }
}
