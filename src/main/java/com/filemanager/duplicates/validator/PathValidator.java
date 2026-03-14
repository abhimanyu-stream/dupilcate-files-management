package com.filemanager.duplicates.validator;

import com.filemanager.duplicates.model.ValidationResult;
import org.springframework.stereotype.Component;

import java.nio.file.Files;
import java.nio.file.InvalidPathException;
import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * Validates user-provided paths before processing.
 */
@Component
public class PathValidator {
    
    /**
     * Validates a path and returns a ValidationResult with normalized path or error message.
     * 
     * @param path the path to validate
     * @return ValidationResult containing validation status and normalized path or error
     */
    public ValidationResult validatePath(String path) {
        if (path == null || path.trim().isEmpty()) {
            return ValidationResult.failure("Path cannot be empty");
        }
        
        try {
            Path normalizedPath = Paths.get(path).toAbsolutePath().normalize();
            
            if (!Files.exists(normalizedPath)) {
                return ValidationResult.failure("Path does not exist: " + path);
            }
            
            if (!Files.isDirectory(normalizedPath)) {
                return ValidationResult.failure("Path is not a directory: " + path);
            }
            
            if (!isAccessible(normalizedPath.toString())) {
                return ValidationResult.failure("Path is not accessible (permission denied): " + path);
            }
            
            return ValidationResult.success(normalizedPath.toString());
            
        } catch (InvalidPathException e) {
            return ValidationResult.failure("Invalid path format: " + path);
        } catch (SecurityException e) {
            return ValidationResult.failure("Security exception accessing path: " + path);
        }
    }
    
    /**
     * Checks if a path is accessible (has read permissions).
     * 
     * @param path the path to check
     * @return true if the path is readable, false otherwise
     */
    public boolean isAccessible(String path) {
        try {
            Path p = Paths.get(path);
            return Files.isReadable(p);
        } catch (Exception e) {
            return false;
        }
    }
}
