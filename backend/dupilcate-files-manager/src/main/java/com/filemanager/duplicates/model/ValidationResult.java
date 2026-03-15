package com.filemanager.duplicates.model;

/**
 * Represents the result of path validation.
 */
public class ValidationResult {
    private final boolean isValid;
    private final String normalizedPath;
    private final String errorMessage;
    
    public ValidationResult(boolean isValid, String normalizedPath, String errorMessage) {
        this.isValid = isValid;
        this.normalizedPath = normalizedPath;
        this.errorMessage = errorMessage;
    }
    
    public static ValidationResult success(String normalizedPath) {
        return new ValidationResult(true, normalizedPath, null);
    }
    
    public static ValidationResult failure(String errorMessage) {
        return new ValidationResult(false, null, errorMessage);
    }
    
    // Getters
    public boolean isValid() {
        return isValid;
    }
    
    public String getNormalizedPath() {
        return normalizedPath;
    }
    
    public String getErrorMessage() {
        return errorMessage;
    }
}
