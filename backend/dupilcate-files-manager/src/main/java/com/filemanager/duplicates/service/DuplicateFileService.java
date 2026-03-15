package com.filemanager.duplicates.service;

import com.filemanager.duplicates.analyzer.DuplicateAnalyzer;
import com.filemanager.duplicates.hash.HashProcessor;
import com.filemanager.duplicates.model.DuplicateAnalysis;
import com.filemanager.duplicates.model.FileInfo;
import com.filemanager.duplicates.model.OperationResult;
import com.filemanager.duplicates.scanner.FileScanner;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Service for managing duplicate file operations.
 */
@Service
public class DuplicateFileService {
    
    private final FileScanner fileScanner;
    private final HashProcessor hashProcessor;
    private final DuplicateAnalyzer duplicateAnalyzer;
    private DuplicateAnalysis cachedAnalysis;
    
    public DuplicateFileService() {
        this.fileScanner = new FileScanner();
        this.hashProcessor = new HashProcessor();
        this.duplicateAnalyzer = new DuplicateAnalyzer();
    }
    
    /**
     * Scans a directory and analyzes for duplicates.
     */
    public DuplicateAnalysis scanAndAnalyze(String directoryPath) {
        try {
            // Scan directory
            List<FileInfo> allFiles = fileScanner.scan(directoryPath, null);
            
            // Calculate hashes
            hashProcessor.computeHashesBatch(allFiles, null);
            
            // Analyze duplicates
            cachedAnalysis = duplicateAnalyzer.analyze(allFiles);
            
            return cachedAnalysis;
        } catch (Exception e) {
            throw new RuntimeException("Failed to scan and analyze directory: " + e.getMessage(), e);
        }
    }
    
    /**
     * Gets the cached analysis result.
     */
    public DuplicateAnalysis getCachedAnalysis() {
        if (cachedAnalysis == null) {
            // Return empty analysis if no scan has been performed
            return new DuplicateAnalysis(
                new ArrayList<>(),
                Map.of(),
                0,
                0,
                0
            );
        }
        return cachedAnalysis;
    }
    
    /**
     * Deletes a single file.
     */
    public OperationResult deleteFile(String filePath) {
        try {
            Path path = Paths.get(filePath);
            
            if (!Files.exists(path)) {
                return OperationResult.failure(filePath, "File does not exist");
            }
            
            if (!Files.isRegularFile(path)) {
                return OperationResult.failure(filePath, "Path is not a regular file");
            }
            
            Files.delete(path);
            
            // Update cached analysis
            if (cachedAnalysis != null) {
                updateCachedAnalysisAfterDeletion(filePath);
            }
            
            return OperationResult.success(filePath, null);
            
        } catch (IOException e) {
            return OperationResult.failure(filePath, "Failed to delete file: " + e.getMessage());
        } catch (Exception e) {
            return OperationResult.failure(filePath, "Unexpected error: " + e.getMessage());
        }
    }
    
    /**
     * Deletes multiple files.
     */
    public List<OperationResult> deleteFiles(List<String> filePaths) {
        List<OperationResult> results = new ArrayList<>();
        
        for (String filePath : filePaths) {
            results.add(deleteFile(filePath));
        }
        
        return results;
    }
    
    /**
     * Updates the cached analysis after a file deletion.
     */
    private void updateCachedAnalysisAfterDeletion(String deletedFilePath) {
        // Remove from duplicate groups
        Map<String, List<FileInfo>> duplicateGroups = cachedAnalysis.getDuplicateGroups();
        
        for (Map.Entry<String, List<FileInfo>> entry : duplicateGroups.entrySet()) {
            List<FileInfo> files = entry.getValue();
            files.removeIf(file -> file.getPath().equals(deletedFilePath));
        }
        
        // Remove empty groups
        duplicateGroups.entrySet().removeIf(entry -> entry.getValue().isEmpty());
    }
}
