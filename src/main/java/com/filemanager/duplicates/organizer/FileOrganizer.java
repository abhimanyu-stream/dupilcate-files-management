package com.filemanager.duplicates.organizer;

import com.filemanager.duplicates.hash.HashProcessor;
import com.filemanager.duplicates.model.FileInfo;
import com.filemanager.duplicates.model.OperationResult;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;

/**
 * Organizes files by moving them to appropriate target locations.
 * Handles unique files (preserving names) and duplicate files (with indexed naming).
 * Routes document files to date-based subfolders based on modification date.
 */
@Component
public class FileOrganizer {
    
    private final HashProcessor hashProcessor;
    
    public FileOrganizer(HashProcessor hashProcessor) {
        this.hashProcessor = hashProcessor;
    }
    
    /**
     * Organizes a unique file by moving it to the target folder while preserving its name.
     * For document files, routes to the appropriate date-based subfolder (latest/older).
     * 
     * @param file the FileInfo object representing the file to move
     * @param targetFolder the base target folder path
     * @return OperationResult indicating success or failure
     */
    public OperationResult organizeUniqueFile(FileInfo file, String targetFolder) {
        try {
            // Determine the actual target path (may include date subfolder for documents)
            String actualTargetFolder = determineTargetPath(file, targetFolder);
            
            Path sourcePath = Paths.get(file.getPath());
            String filename = file.getFilename();
            Path targetPath = Paths.get(actualTargetFolder, filename);
            
            // Handle filename collision
            targetPath = resolveCollision(targetPath);
            
            // Move the file
            Files.move(sourcePath, targetPath, StandardCopyOption.ATOMIC_MOVE);
            
            // Verify the move
            if (!verifyMove(file.getPath(), targetPath.toString(), file.getHash())) {
                return OperationResult.failure(file.getPath(), 
                    "Hash verification failed after move");
            }
            
            return OperationResult.success(file.getPath(), targetPath.toString());
            
        } catch (IOException e) {
            return OperationResult.failure(file.getPath(), 
                "Failed to move file: " + e.getMessage());
        }
    }
    
    /**
     * Organizes a duplicate file by moving it to the target folder with an indexed name.
     * For document files, routes to the appropriate date-based subfolder (latest/older).
     * 
     * @param file the FileInfo object representing the file to move
     * @param targetFolder the base target folder path
     * @param index the duplicate index (1, 2, 3, etc.)
     * @return OperationResult indicating success or failure
     */
    public OperationResult organizeDuplicateFile(FileInfo file, String targetFolder, int index) {
        try {
            // Determine the actual target path (may include date subfolder for documents)
            String actualTargetFolder = determineTargetPath(file, targetFolder);
            
            Path sourcePath = Paths.get(file.getPath());
            String renamedFilename = generateDuplicateName(file, index);
            Path targetPath = Paths.get(actualTargetFolder, renamedFilename);
            
            // Handle filename collision (in case the indexed name already exists)
            targetPath = resolveCollision(targetPath);
            
            // Move the file
            Files.move(sourcePath, targetPath, StandardCopyOption.ATOMIC_MOVE);
            
            // Verify the move
            if (!verifyMove(file.getPath(), targetPath.toString(), file.getHash())) {
                return OperationResult.failure(file.getPath(), 
                    "Hash verification failed after move");
            }
            
            return OperationResult.success(file.getPath(), targetPath.toString());
            
        } catch (IOException e) {
            return OperationResult.failure(file.getPath(), 
                "Failed to move file: " + e.getMessage());
        }
    }
    
    /**
     * Determines the target path for a file, routing document files to date-based subfolders.
     * 
     * @param file the FileInfo object
     * @param typeSubfolderPath the base type subfolder path
     * @return the actual target path (may include latest/older subfolder for documents)
     */
    public String determineTargetPath(FileInfo file, String typeSubfolderPath) {
        if (file.isDocumentFile()) {
            // Route to latest or older subfolder based on modification date
            LocalDateTime cutoffDate = LocalDateTime.now().minusDays(30);
            boolean isRecent = file.getModificationDate().isAfter(cutoffDate);
            
            String dateFolder = isRecent ? "latest" : "older";
            return Paths.get(typeSubfolderPath, dateFolder).toString();
        }
        
        return typeSubfolderPath;
    }
    
    /**
     * Verifies that a file was moved successfully by comparing hashes.
     * 
     * @param sourcePath the original source path (for reference only)
     * @param destinationPath the destination path where the file now exists
     * @param originalHash the hash computed at the source
     * @return true if verification succeeds, false otherwise
     */
    public boolean verifyMove(String sourcePath, String destinationPath, String originalHash) {
        try {
            // Check if destination file exists
            if (!Files.exists(Paths.get(destinationPath))) {
                return false;
            }
            
            // Compute hash at destination
            String destinationHash = hashProcessor.computeHash(destinationPath);
            
            // Compare with original hash
            return originalHash.equals(destinationHash);
            
        } catch (IOException e) {
            return false;
        }
    }
    
    /**
     * Generates a duplicate filename with the pattern: filename(n).extension
     * 
     * @param file the FileInfo object
     * @param index the duplicate index
     * @return the renamed filename
     */
    private String generateDuplicateName(FileInfo file, int index) {
        String filenameWithoutExt = file.getFilenameWithoutExt();
        String extension = file.getExtension();
        
        if (extension.isEmpty()) {
            // No extension: filename(n)
            return filenameWithoutExt + "(" + index + ")";
        } else {
            // With extension: filename(n).ext
            return filenameWithoutExt + "(" + index + ")" + extension;
        }
    }
    
    /**
     * Resolves filename collisions by appending additional indices.
     * If the target path already exists, tries filename(1)(1), filename(1)(2), etc.
     * 
     * @param targetPath the proposed target path
     * @return a non-colliding path
     */
    private Path resolveCollision(Path targetPath) {
        if (!Files.exists(targetPath)) {
            return targetPath;
        }
        
        // Extract filename and extension
        String filename = targetPath.getFileName().toString();
        int lastDotIndex = filename.lastIndexOf('.');
        String nameWithoutExt;
        String extension;
        
        if (lastDotIndex > 0) {
            nameWithoutExt = filename.substring(0, lastDotIndex);
            extension = filename.substring(lastDotIndex);
        } else {
            nameWithoutExt = filename;
            extension = "";
        }
        
        // Try appending (1), (2), (3), etc. until we find a non-existing path
        int collisionIndex = 1;
        Path newPath;
        do {
            String newFilename = nameWithoutExt + "(" + collisionIndex + ")" + extension;
            newPath = targetPath.getParent().resolve(newFilename);
            collisionIndex++;
        } while (Files.exists(newPath));
        
        return newPath;
    }
}
