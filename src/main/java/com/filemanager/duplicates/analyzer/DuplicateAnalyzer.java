package com.filemanager.duplicates.analyzer;

import com.filemanager.duplicates.model.DuplicateAnalysis;
import com.filemanager.duplicates.model.FileInfo;
import org.springframework.stereotype.Component;

import java.util.*;

/**
 * Analyzes hashed files to identify duplicates.
 * 
 * Files with identical hashes form duplicate groups, where the first file
 * is designated as unique and all others are duplicates.
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4
 */
@Component
public class DuplicateAnalyzer {
    
    /**
     * Analyzes files to identify unique files and duplicates.
     * 
     * Groups files by their hash values. For each group:
     * - The first file is designated as the unique file
     * - All remaining files are marked as duplicates
     * 
     * @param files List of FileInfo objects with computed hashes
     * @return DuplicateAnalysis containing categorized files and statistics
     */
    public DuplicateAnalysis analyze(List<FileInfo> files) {
        // Group files by hash
        Map<String, List<FileInfo>> hashGroups = new HashMap<>();
        
        for (FileInfo file : files) {
            String hash = file.getHash();
            if (hash == null || hash.isEmpty()) {
                // Skip files without hashes
                continue;
            }
            
            hashGroups.computeIfAbsent(hash, k -> new ArrayList<>()).add(file);
        }
        
        // Separate unique files and duplicates
        List<FileInfo> uniqueFiles = new ArrayList<>();
        Map<String, List<FileInfo>> duplicateGroups = new HashMap<>();
        
        for (Map.Entry<String, List<FileInfo>> entry : hashGroups.entrySet()) {
            String hash = entry.getKey();
            List<FileInfo> group = entry.getValue();
            
            if (group.isEmpty()) {
                continue;
            }
            
            // First file in group is unique
            FileInfo uniqueFile = group.get(0);
            uniqueFiles.add(uniqueFile);
            
            // Remaining files are duplicates
            if (group.size() > 1) {
                List<FileInfo> duplicates = new ArrayList<>(group.subList(1, group.size()));
                duplicateGroups.put(hash, duplicates);
            }
        }
        
        // Calculate statistics
        int totalFiles = files.size();
        int totalUnique = uniqueFiles.size();
        int totalDuplicates = duplicateGroups.values().stream()
                .mapToInt(List::size)
                .sum();
        
        return new DuplicateAnalysis(
            uniqueFiles,
            duplicateGroups,
            totalFiles,
            totalUnique,
            totalDuplicates
        );
    }
    
    /**
     * Gets all unique files from the analysis.
     * 
     * @param analysis The duplicate analysis result
     * @return List of unique files
     */
    public List<FileInfo> getUniqueFiles(DuplicateAnalysis analysis) {
        return analysis.getUniqueFiles();
    }
    
    /**
     * Gets all duplicates for a specific unique file.
     * 
     * @param analysis The duplicate analysis result
     * @param uniqueFile The unique file to get duplicates for
     * @return List of duplicate files, or empty list if none exist
     */
    public List<FileInfo> getDuplicates(DuplicateAnalysis analysis, FileInfo uniqueFile) {
        String hash = uniqueFile.getHash();
        if (hash == null || hash.isEmpty()) {
            return Collections.emptyList();
        }
        
        return analysis.getDuplicateGroups().getOrDefault(hash, Collections.emptyList());
    }
}
