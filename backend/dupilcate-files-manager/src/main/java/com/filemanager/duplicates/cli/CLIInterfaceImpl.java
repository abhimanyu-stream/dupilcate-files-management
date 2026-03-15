package com.filemanager.duplicates.cli;

import com.filemanager.duplicates.model.OperationStats;
import org.springframework.stereotype.Component;

import java.util.Scanner;

/**
 * Implementation of CLIInterface for command-line user interaction.
 * Handles user input collection and displays progress information.
 */
@Component
public class CLIInterfaceImpl implements CLIInterface {
    
    private final Scanner scanner;
    
    public CLIInterfaceImpl() {
        this.scanner = new Scanner(System.in);
    }
    
    /**
     * Prompts the user to provide a source path for scanning.
     * 
     * @return the path entered by the user
     */
    @Override
    public String promptForPath() {
        System.out.print("Enter the path to scan (directory, folder, or drive): ");
        return scanner.nextLine().trim();
    }
    
    /**
     * Displays an error message to System.err.
     * 
     * @param message the error message to display
     */
    @Override
    public void displayError(String message) {
        System.err.println("Error: " + message);
    }
    
    /**
     * Displays real-time progress during scanning, hashing, and moving operations.
     * Formats progress messages clearly for each stage.
     * 
     * @param stage the current operation stage (e.g., "Scanning", "Hashing", "Moving")
     * @param current the current item being processed
     * @param count the number of items processed so far
     */
    @Override
    public void displayProgress(String stage, String current, int count) {
        System.out.printf("[%s] Processed %d items | Current: %s%n", stage, count, current);
    }
    
    /**
     * Displays a summary of the operation results including statistics and errors.
     * 
     * @param stats the operation statistics to display
     */
    @Override
    public void displaySummary(OperationStats stats) {
        System.out.println("\n" + "=".repeat(60));
        System.out.println("OPERATION SUMMARY");
        System.out.println("=".repeat(60));
        
        System.out.println("\nFiles Scanned: " + stats.getFilesScanned());
        System.out.println("Unique Files Moved: " + stats.getUniqueFilesMoved());
        System.out.println("Duplicate Files Moved: " + stats.getDuplicateFilesMoved());
        System.out.printf("Success Rate: %.2f%%%n", stats.getSuccessRate());
        
        if (stats.getRootFolderPath() != null) {
            System.out.println("\nOrganized files location: " + stats.getRootFolderPath());
        }
        
        if (!stats.getErrors().isEmpty()) {
            System.out.println("\n" + "-".repeat(60));
            System.out.println("ERRORS (" + stats.getErrors().size() + ")");
            System.out.println("-".repeat(60));
            
            for (OperationStats.ErrorRecord error : stats.getErrors()) {
                System.out.println("File: " + error.getFilePath());
                System.out.println("Error: " + error.getErrorMessage());
                System.out.println();
            }
        }
        
        System.out.println("=".repeat(60));
    }
    
    /**
     * Prompts the user to continue or exit after completing a task.
     * 
     * @return true if user wants to continue, false if user wants to exit
     */
    @Override
    public boolean promptContinueOrExit() {
        System.out.println("\n" + "=".repeat(60));
        System.out.print("Do you want to organize another directory? (yes/no): ");
        String response = scanner.nextLine().trim().toLowerCase();
        
        return response.equals("yes") || response.equals("y");
    }
}
