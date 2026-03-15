package com.filemanager.duplicates.model;

import java.util.List;
import java.util.Map;

/**
 * Represents the result of duplicate analysis.
 */
public class DuplicateAnalysis {
    private final List<FileInfo> uniqueFiles;
    private final Map<String, List<FileInfo>> duplicateGroups;  // hash -> list of duplicates
    private final int totalFiles;
    private final int totalUnique;
    private final int totalDuplicates;
    
    public DuplicateAnalysis(List<FileInfo> uniqueFiles, 
                            Map<String, List<FileInfo>> duplicateGroups,
                            int totalFiles, 
                            int totalUnique, 
                            int totalDuplicates) {
        this.uniqueFiles = uniqueFiles;
        this.duplicateGroups = duplicateGroups;
        this.totalFiles = totalFiles;
        this.totalUnique = totalUnique;
        this.totalDuplicates = totalDuplicates;
    }
    
    // Getters
    public List<FileInfo> getUniqueFiles() {
        return uniqueFiles;
    }
    
    public Map<String, List<FileInfo>> getDuplicateGroups() {
        return duplicateGroups;
    }
    
    public int getTotalFiles() {
        return totalFiles;
    }
    
    public int getTotalUnique() {
        return totalUnique;
    }
    
    public int getTotalDuplicates() {
        return totalDuplicates;
    }
}
