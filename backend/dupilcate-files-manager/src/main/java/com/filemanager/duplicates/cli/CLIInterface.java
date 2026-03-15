package com.filemanager.duplicates.cli;

import com.filemanager.duplicates.model.OperationStats;

/**
 * Interface for managing user interaction and displaying progress information.
 * Handles input collection, error messages, progress updates, and final summaries.
 */
public interface CLIInterface {
    
    /**
     * Prompts the user to provide a source path for scanning.
     * 
     * @return the path entered by the user
     */
    String promptForPath();
    
    /**
     * Displays an error message to the user.
     * 
     * @param message the error message to display
     */
    void displayError(String message);
    
    /**
     * Displays real-time progress during operations.
     * 
     * @param stage the current operation stage (e.g., "Scanning", "Hashing", "Moving")
     * @param current the current item being processed
     * @param count the number of items processed so far
     */
    void displayProgress(String stage, String current, int count);
    
    /**
     * Displays a summary of the operation results.
     * 
     * @param stats the operation statistics to display
     */
    void displaySummary(OperationStats stats);
    
    /**
     * Prompts the user to continue or exit after completing a task.
     * 
     * @return true if user wants to continue, false if user wants to exit
     */
    boolean promptContinueOrExit();
}
