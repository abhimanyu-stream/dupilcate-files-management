package com.filemanager.duplicates.reporter;

import com.filemanager.duplicates.model.OperationStats;
import com.filemanager.duplicates.model.OperationStats.ErrorRecord;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * Tracks operation results and provides summary statistics.
 * Logs both successful operations and errors, then generates a final report
 * with counts and error details.
 */
@Component
public class ResultReporter {
    private int filesScanned;
    private int uniqueFilesMoved;
    private int duplicateFilesMoved;
    private final List<ErrorRecord> errors;
    private String rootFolderPath;
    
    public ResultReporter() {
        this.filesScanned = 0;
        this.uniqueFilesMoved = 0;
        this.duplicateFilesMoved = 0;
        this.errors = new ArrayList<>();
        this.rootFolderPath = null;
    }
    
    /**
     * Tracks a successful operation.
     * 
     * @param filePath the path of the file that was successfully processed
     * @param operation the type of operation (e.g., "unique_moved", "duplicate_moved")
     */
    public void addSuccess(String filePath, String operation) {
        if (operation == null) {
            throw new IllegalArgumentException("Operation cannot be null");
        }
        
        switch (operation.toLowerCase()) {
            case "unique_moved":
                uniqueFilesMoved++;
                break;
            case "duplicate_moved":
                duplicateFilesMoved++;
                break;
            case "scanned":
                filesScanned++;
                break;
            default:
                // Unknown operation type - ignore or log warning
                break;
        }
    }
    
    /**
     * Logs a failed operation with details.
     * 
     * @param filePath the path of the file that failed to process
     * @param operation the type of operation that failed
     * @param error the error message or reason for failure
     */
    public void addError(String filePath, String operation, String error) {
        if (filePath == null || error == null) {
            throw new IllegalArgumentException("File path and error message cannot be null");
        }
        
        String errorMessage = String.format("[%s] %s", operation != null ? operation : "UNKNOWN", error);
        errors.add(new ErrorRecord(filePath, errorMessage));
    }
    
    /**
     * Sets the number of files scanned.
     * 
     * @param count the total number of files scanned
     */
    public void setFilesScanned(int count) {
        this.filesScanned = count;
    }
    
    /**
     * Sets the root folder path where organized files are stored.
     * 
     * @param path the root folder path
     */
    public void setRootFolderPath(String path) {
        this.rootFolderPath = path;
    }
    
    /**
     * Calculates summary statistics and returns OperationStats.
     * 
     * @return OperationStats containing all tracked statistics
     */
    public OperationStats getSummary() {
        return new OperationStats(
            filesScanned,
            uniqueFilesMoved,
            duplicateFilesMoved,
            new ArrayList<>(errors), // Return a copy to prevent external modification
            rootFolderPath
        );
    }
    
    /**
     * Formats and displays the final report.
     * This method prints the report to standard output.
     */
    public void displayReport() {
        OperationStats stats = getSummary();
        
        System.out.println("\n" + "=".repeat(60));
        System.out.println("DUPLICATE FILES ORGANIZER - OPERATION SUMMARY");
        System.out.println("=".repeat(60));
        
        System.out.println("\nFiles Processed:");
        System.out.println("  Total files scanned: " + stats.getFilesScanned());
        System.out.println("  Unique files moved: " + stats.getUniqueFilesMoved());
        System.out.println("  Duplicate files moved: " + stats.getDuplicateFilesMoved());
        System.out.println("  Total files moved: " + (stats.getUniqueFilesMoved() + stats.getDuplicateFilesMoved()));
        
        if (stats.getRootFolderPath() != null) {
            System.out.println("\nOrganized files location:");
            System.out.println("  " + stats.getRootFolderPath());
        }
        
        System.out.println("\nOperation Status:");
        System.out.printf("  Success rate: %.2f%%\n", stats.getSuccessRate());
        System.out.println("  Errors encountered: " + stats.getErrors().size());
        
        if (!stats.getErrors().isEmpty()) {
            System.out.println("\n" + "-".repeat(60));
            System.out.println("ERROR DETAILS:");
            System.out.println("-".repeat(60));
            
            for (int i = 0; i < stats.getErrors().size(); i++) {
                ErrorRecord error = stats.getErrors().get(i);
                System.out.println("\n[" + (i + 1) + "] File: " + error.getFilePath());
                System.out.println("    Error: " + error.getErrorMessage());
            }
        }
        
        System.out.println("\n" + "=".repeat(60));
        
        if (stats.getErrors().isEmpty()) {
            System.out.println("Operation completed successfully!");
        } else {
            System.out.println("Operation completed with " + stats.getErrors().size() + " error(s).");
            System.out.println("Please review the errors above and take corrective action if needed.");
        }
        
        System.out.println("=".repeat(60) + "\n");
    }
}
