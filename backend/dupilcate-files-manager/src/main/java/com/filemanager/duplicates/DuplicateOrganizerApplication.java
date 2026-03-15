package com.filemanager.duplicates;

import com.filemanager.duplicates.analyzer.DuplicateAnalyzer;
import com.filemanager.duplicates.cli.CLIInterface;
import com.filemanager.duplicates.hash.HashProcessor;
import com.filemanager.duplicates.model.DuplicateAnalysis;
import com.filemanager.duplicates.model.FileInfo;
import com.filemanager.duplicates.model.OperationResult;
import com.filemanager.duplicates.model.ValidationResult;
import com.filemanager.duplicates.organizer.FileOrganizer;
import com.filemanager.duplicates.organizer.FolderCreator;
import com.filemanager.duplicates.reporter.ResultReporter;
import com.filemanager.duplicates.scanner.FileScanner;
import com.filemanager.duplicates.validator.PathValidator;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.nio.file.Paths;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Main application class for the Duplicate Files Organizer.
 * Orchestrates the entire workflow: prompt → validate → scan → hash → analyze → 
 * create folders → organize files → report.
 */
@SpringBootApplication
public class DuplicateOrganizerApplication implements CommandLineRunner {
    
    private final CLIInterface cli;
    private final PathValidator pathValidator;
    private final FileScanner fileScanner;
    private final HashProcessor hashProcessor;
    private final DuplicateAnalyzer duplicateAnalyzer;
    private final FolderCreator folderCreator;
    private final FileOrganizer fileOrganizer;
    private final ResultReporter resultReporter;
    
    // Flag to disable CLI mode when running as web server
    private boolean cliMode = false;
    
    public DuplicateOrganizerApplication(
            CLIInterface cli,
            PathValidator pathValidator,
            FileScanner fileScanner,
            HashProcessor hashProcessor,
            DuplicateAnalyzer duplicateAnalyzer,
            FolderCreator folderCreator,
            FileOrganizer fileOrganizer,
            ResultReporter resultReporter) {
        this.cli = cli;
        this.pathValidator = pathValidator;
        this.fileScanner = fileScanner;
        this.hashProcessor = hashProcessor;
        this.duplicateAnalyzer = duplicateAnalyzer;
        this.folderCreator = folderCreator;
        this.fileOrganizer = fileOrganizer;
        this.resultReporter = resultReporter;
    }
    
    public static void main(String[] args) {
        SpringApplication.run(DuplicateOrganizerApplication.class, args);
    }
    
    @Override
    public void run(String... args) throws Exception {
        // Check if CLI mode is enabled via command line argument
        for (String arg : args) {
            if ("--cli".equals(arg)) {
                cliMode = true;
                break;
            }
        }
        
        if (!cliMode) {
            System.out.println("=".repeat(60));
            System.out.println("DUPLICATE FILES MANAGER - WEB MODE");
            System.out.println("=".repeat(60));
            System.out.println("REST API is running on http://localhost:8080");
            System.out.println("Frontend should be accessible at http://localhost:3000");
            System.out.println();
            System.out.println("Available endpoints:");
            System.out.println("  GET  /api/health       - Health check");
            System.out.println("  GET  /api/analysis     - Get cached analysis");
            System.out.println("  POST /api/scan         - Scan directory");
            System.out.println("  DELETE /api/files      - Delete single file");
            System.out.println("  DELETE /api/files/bulk - Delete multiple files");
            System.out.println("=".repeat(60));
            System.out.println();
            System.out.println("To run in CLI mode, use: java -jar app.jar --cli");
            System.out.println();
            return;
        }
        
        // Original CLI mode code
        boolean continueRunning = true;
        
        while (continueRunning) {
            System.out.println("=".repeat(60));
            System.out.println("DUPLICATE FILES ORGANIZER");
            System.out.println("=".repeat(60));
            System.out.println();
            
            // Stage 1: Prompt and validate path
            String validatedPath = promptAndValidatePath();
            if (validatedPath == null) {
                // Ask if user wants to try again or exit
                continueRunning = cli.promptContinueOrExit();
                continue;
            }
            
            // Stage 2: Scan files
            List<FileInfo> files = scanFiles(validatedPath);
            if (files.isEmpty()) {
                System.out.println("No files found in the specified path.");
                continueRunning = cli.promptContinueOrExit();
                continue;
            }
            
            // Stage 3: Compute hashes
            computeHashes(files);
            
            // Stage 4: Analyze duplicates
            DuplicateAnalysis analysis = analyzeDuplicates(files);
            
            // Stage 5: Create folder structure
            String rootFolder = createFolderStructure(validatedPath, analysis);
            if (rootFolder == null) {
                continueRunning = cli.promptContinueOrExit();
                continue;
            }
            
            // Stage 6: Organize files
            organizeFiles(analysis, rootFolder);
            
            // Stage 7: Display report
            displayReport();
            
            // Stage 8: Ask user to continue or exit
            continueRunning = cli.promptContinueOrExit();
        }
        
        System.out.println("\nThank you for using Duplicate Files Organizer. Goodbye!");
    }
    
    /**
     * Prompts user for path and validates it.
     * Retries up to 3 times on invalid input.
     * 
     * @return validated path or null if validation fails
     */
    private String promptAndValidatePath() {
        int maxAttempts = 3;
        int attempts = 0;
        
        while (attempts < maxAttempts) {
            try {
                String path = cli.promptForPath();
                
                if (path.isEmpty()) {
                    cli.displayError("Path cannot be empty. Please try again.");
                    attempts++;
                    continue;
                }
                
                ValidationResult result = pathValidator.validatePath(path);
                
                if (result.isValid()) {
                    System.out.println("Path validated: " + result.getNormalizedPath());
                    return result.getNormalizedPath();
                } else {
                    cli.displayError(result.getErrorMessage());
                    attempts++;
                }
            } catch (Exception e) {
                cli.displayError("Unexpected error during validation: " + e.getMessage());
                attempts++;
            }
        }
        
        cli.displayError("Maximum validation attempts reached. Exiting.");
        return null;
    }
    
    /**
     * Scans files in the validated path.
     * 
     * @param path the validated path to scan
     * @return list of discovered files
     */
    private List<FileInfo> scanFiles(String path) {
        System.out.println("\n" + "-".repeat(60));
        System.out.println("SCANNING FILES");
        System.out.println("-".repeat(60));
        
        try {
            List<FileInfo> files = fileScanner.scan(path, message -> {
                System.out.println(message);
            });
            
            System.out.println("\nScan complete. Found " + files.size() + " files.");
            resultReporter.setFilesScanned(files.size());
            
            return files;
        } catch (Exception e) {
            cli.displayError("Error during file scanning: " + e.getMessage());
            return List.of();
        }
    }
    
    /**
     * Computes hashes for all discovered files.
     * 
     * @param files the list of files to hash
     */
    private void computeHashes(List<FileInfo> files) {
        System.out.println("\n" + "-".repeat(60));
        System.out.println("COMPUTING FILE HASHES");
        System.out.println("-".repeat(60));
        
        try {
            hashProcessor.computeHashesBatch(files, message -> {
                System.out.println(message);
            });
            
            System.out.println("\nHash computation complete.");
        } catch (Exception e) {
            cli.displayError("Error during hash computation: " + e.getMessage());
        }
    }
    
    /**
     * Analyzes files to identify duplicates.
     * 
     * @param files the list of hashed files
     * @return duplicate analysis result
     */
    private DuplicateAnalysis analyzeDuplicates(List<FileInfo> files) {
        System.out.println("\n" + "-".repeat(60));
        System.out.println("ANALYZING DUPLICATES");
        System.out.println("-".repeat(60));
        
        try {
            DuplicateAnalysis analysis = duplicateAnalyzer.analyze(files);
            
            System.out.println("\nAnalysis complete:");
            System.out.println("  Total files: " + analysis.getTotalFiles());
            System.out.println("  Unique files: " + analysis.getTotalUnique());
            System.out.println("  Duplicate files: " + analysis.getTotalDuplicates());
            
            return analysis;
        } catch (Exception e) {
            cli.displayError("Error during duplicate analysis: " + e.getMessage());
            return new DuplicateAnalysis(List.of(), java.util.Map.of(), 0, 0, 0);
        }
    }
    
    /**
     * Creates the folder structure for organized files.
     * 
     * @param sourcePath the source path being scanned
     * @param analysis the duplicate analysis result
     * @return root folder path or null if creation fails
     */
    private String createFolderStructure(String sourcePath, DuplicateAnalysis analysis) {
        System.out.println("\n" + "-".repeat(60));
        System.out.println("CREATING FOLDER STRUCTURE");
        System.out.println("-".repeat(60));
        
        try {
            // Extract drive root from source path
            String driveRoot = Paths.get(sourcePath).getRoot().toString();
            
            // Create root folder
            String rootFolder = folderCreator.createRootFolder(driveRoot);
            System.out.println("Created root folder: " + rootFolder);
            
            // Collect all file types
            Set<String> fileTypes = new HashSet<>();
            for (FileInfo file : analysis.getUniqueFiles()) {
                fileTypes.add(file.getFileTypeCategory());
            }
            for (List<FileInfo> duplicates : analysis.getDuplicateGroups().values()) {
                for (FileInfo file : duplicates) {
                    fileTypes.add(file.getFileTypeCategory());
                }
            }
            
            // Create type subfolders
            folderCreator.createTypeSubfolders(rootFolder, fileTypes);
            System.out.println("Created type subfolders for: " + fileTypes);
            
            resultReporter.setRootFolderPath(rootFolder);
            
            return rootFolder;
        } catch (Exception e) {
            cli.displayError("Error creating folder structure: " + e.getMessage());
            return null;
        }
    }
    
    /**
     * Organizes files by moving them to appropriate locations.
     * 
     * @param analysis the duplicate analysis result
     * @param rootFolder the root folder path
     */
    private void organizeFiles(DuplicateAnalysis analysis, String rootFolder) {
        System.out.println("\n" + "-".repeat(60));
        System.out.println("ORGANIZING FILES");
        System.out.println("-".repeat(60));
        
        // Organize unique files
        organizeUniqueFiles(analysis.getUniqueFiles(), rootFolder);
        
        // Organize duplicate files
        organizeDuplicateFiles(analysis, rootFolder);
        
        System.out.println("\nFile organization complete.");
    }
    
    /**
     * Organizes unique files.
     * 
     * @param uniqueFiles list of unique files
     * @param rootFolder the root folder path
     */
    private void organizeUniqueFiles(List<FileInfo> uniqueFiles, String rootFolder) {
        System.out.println("\nOrganizing unique files...");
        int count = 0;
        
        for (FileInfo file : uniqueFiles) {
            try {
                String fileType = file.getFileTypeCategory();
                String targetFolder = folderCreator.getTypeSubfolderPath(rootFolder, "Unique", fileType);
                
                OperationResult result = fileOrganizer.organizeUniqueFile(file, targetFolder);
                
                if (result.isSuccess()) {
                    resultReporter.addSuccess(file.getPath(), "unique_moved");
                    count++;
                    
                    if (count % 10 == 0) {
                        System.out.println("  Moved " + count + "/" + uniqueFiles.size() + " unique files");
                    }
                } else {
                    resultReporter.addError(file.getPath(), "unique_move", result.getErrorMessage());
                    System.err.println("  Failed to move: " + file.getPath());
                }
            } catch (Exception e) {
                resultReporter.addError(file.getPath(), "unique_move", e.getMessage());
                System.err.println("  Error moving " + file.getPath() + ": " + e.getMessage());
            }
        }
        
        System.out.println("Moved " + count + "/" + uniqueFiles.size() + " unique files");
    }
    
    /**
     * Organizes duplicate files.
     * 
     * @param analysis the duplicate analysis result
     * @param rootFolder the root folder path
     */
    private void organizeDuplicateFiles(DuplicateAnalysis analysis, String rootFolder) {
        System.out.println("\nOrganizing duplicate files...");
        int count = 0;
        int totalDuplicates = analysis.getTotalDuplicates();
        
        for (FileInfo uniqueFile : analysis.getUniqueFiles()) {
            List<FileInfo> duplicates = duplicateAnalyzer.getDuplicates(analysis, uniqueFile);
            
            for (int i = 0; i < duplicates.size(); i++) {
                FileInfo duplicate = duplicates.get(i);
                int duplicateIndex = i + 1; // Start from 1
                
                try {
                    String fileType = duplicate.getFileTypeCategory();
                    String targetFolder = folderCreator.getTypeSubfolderPath(rootFolder, "Duplicates", fileType);
                    
                    OperationResult result = fileOrganizer.organizeDuplicateFile(duplicate, targetFolder, duplicateIndex);
                    
                    if (result.isSuccess()) {
                        resultReporter.addSuccess(duplicate.getPath(), "duplicate_moved");
                        count++;
                        
                        if (count % 10 == 0) {
                            System.out.println("  Moved " + count + "/" + totalDuplicates + " duplicate files");
                        }
                    } else {
                        resultReporter.addError(duplicate.getPath(), "duplicate_move", result.getErrorMessage());
                        System.err.println("  Failed to move: " + duplicate.getPath());
                    }
                } catch (Exception e) {
                    resultReporter.addError(duplicate.getPath(), "duplicate_move", e.getMessage());
                    System.err.println("  Error moving " + duplicate.getPath() + ": " + e.getMessage());
                }
            }
        }
        
        System.out.println("Moved " + count + "/" + totalDuplicates + " duplicate files");
    }
    
    /**
     * Displays the final report.
     */
    private void displayReport() {
        resultReporter.displayReport();
    }
}
