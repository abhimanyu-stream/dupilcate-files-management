package com.filemanager.duplicates.analyzer;

import com.filemanager.duplicates.model.DuplicateAnalysis;
import com.filemanager.duplicates.model.FileInfo;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Unit tests for DuplicateAnalyzer.
 */
class DuplicateAnalyzerTest {
    
    private DuplicateAnalyzer analyzer;
    
    @BeforeEach
    void setUp() {
        analyzer = new DuplicateAnalyzer();
    }
    
    @Test
    @DisplayName("Should identify two identical files as duplicates")
    void shouldIdentifyTwoIdenticalFilesAsDuplicates() {
        // Arrange
        List<FileInfo> files = new ArrayList<>();
        
        FileInfo file1 = new FileInfo("C:\\photos\\photo1.jpg", 1024, ".jpg", LocalDateTime.now());
        file1.setHash("abc123");
        
        FileInfo file2 = new FileInfo("C:\\backup\\photo1.jpg", 1024, ".jpg", LocalDateTime.now());
        file2.setHash("abc123");
        
        files.add(file1);
        files.add(file2);
        
        // Act
        DuplicateAnalysis analysis = analyzer.analyze(files);
        
        // Assert
        assertThat(analysis.getTotalFiles()).isEqualTo(2);
        assertThat(analysis.getTotalUnique()).isEqualTo(1);
        assertThat(analysis.getTotalDuplicates()).isEqualTo(1);
        assertThat(analysis.getUniqueFiles()).containsExactly(file1);
        assertThat(analysis.getDuplicateGroups().get("abc123")).containsExactly(file2);
    }
    
    @Test
    @DisplayName("Should identify three identical files with first as unique")
    void shouldIdentifyThreeIdenticalFilesWithFirstAsUnique() {
        // Arrange
        List<FileInfo> files = new ArrayList<>();
        
        FileInfo file1 = new FileInfo("C:\\photos\\photo1.jpg", 1024, ".jpg", LocalDateTime.now());
        file1.setHash("abc123");
        
        FileInfo file2 = new FileInfo("C:\\backup\\photo1.jpg", 1024, ".jpg", LocalDateTime.now());
        file2.setHash("abc123");
        
        FileInfo file3 = new FileInfo("C:\\archive\\photo1.jpg", 1024, ".jpg", LocalDateTime.now());
        file3.setHash("abc123");
        
        files.add(file1);
        files.add(file2);
        files.add(file3);
        
        // Act
        DuplicateAnalysis analysis = analyzer.analyze(files);
        
        // Assert
        assertThat(analysis.getTotalFiles()).isEqualTo(3);
        assertThat(analysis.getTotalUnique()).isEqualTo(1);
        assertThat(analysis.getTotalDuplicates()).isEqualTo(2);
        assertThat(analysis.getUniqueFiles()).containsExactly(file1);
        assertThat(analysis.getDuplicateGroups().get("abc123")).containsExactly(file2, file3);
    }
    
    @Test
    @DisplayName("Should handle multiple duplicate groups")
    void shouldHandleMultipleDuplicateGroups() {
        // Arrange
        List<FileInfo> files = new ArrayList<>();
        
        // Group 1: photo files
        FileInfo photo1 = new FileInfo("C:\\photos\\photo1.jpg", 1024, ".jpg", LocalDateTime.now());
        photo1.setHash("hash1");
        
        FileInfo photo2 = new FileInfo("C:\\backup\\photo1.jpg", 1024, ".jpg", LocalDateTime.now());
        photo2.setHash("hash1");
        
        // Group 2: document files
        FileInfo doc1 = new FileInfo("C:\\docs\\report.pdf", 2048, ".pdf", LocalDateTime.now());
        doc1.setHash("hash2");
        
        FileInfo doc2 = new FileInfo("C:\\backup\\report.pdf", 2048, ".pdf", LocalDateTime.now());
        doc2.setHash("hash2");
        
        files.add(photo1);
        files.add(photo2);
        files.add(doc1);
        files.add(doc2);
        
        // Act
        DuplicateAnalysis analysis = analyzer.analyze(files);
        
        // Assert
        assertThat(analysis.getTotalFiles()).isEqualTo(4);
        assertThat(analysis.getTotalUnique()).isEqualTo(2);
        assertThat(analysis.getTotalDuplicates()).isEqualTo(2);
        assertThat(analysis.getUniqueFiles()).containsExactlyInAnyOrder(photo1, doc1);
        assertThat(analysis.getDuplicateGroups().get("hash1")).containsExactly(photo2);
        assertThat(analysis.getDuplicateGroups().get("hash2")).containsExactly(doc2);
    }
    
    @Test
    @DisplayName("Should handle files with same name but different content")
    void shouldHandleFilesWithSameNameButDifferentContent() {
        // Arrange
        List<FileInfo> files = new ArrayList<>();
        
        FileInfo file1 = new FileInfo("C:\\photos\\photo.jpg", 1024, ".jpg", LocalDateTime.now());
        file1.setHash("hash1");
        
        FileInfo file2 = new FileInfo("C:\\backup\\photo.jpg", 2048, ".jpg", LocalDateTime.now());
        file2.setHash("hash2");
        
        files.add(file1);
        files.add(file2);
        
        // Act
        DuplicateAnalysis analysis = analyzer.analyze(files);
        
        // Assert
        assertThat(analysis.getTotalFiles()).isEqualTo(2);
        assertThat(analysis.getTotalUnique()).isEqualTo(2);
        assertThat(analysis.getTotalDuplicates()).isEqualTo(0);
        assertThat(analysis.getUniqueFiles()).containsExactlyInAnyOrder(file1, file2);
        assertThat(analysis.getDuplicateGroups()).isEmpty();
    }
    
    @Test
    @DisplayName("Should handle files with different names but same content")
    void shouldHandleFilesWithDifferentNamesButSameContent() {
        // Arrange
        List<FileInfo> files = new ArrayList<>();
        
        FileInfo file1 = new FileInfo("C:\\photos\\vacation.jpg", 1024, ".jpg", LocalDateTime.now());
        file1.setHash("abc123");
        
        FileInfo file2 = new FileInfo("C:\\backup\\holiday.jpg", 1024, ".jpg", LocalDateTime.now());
        file2.setHash("abc123");
        
        files.add(file1);
        files.add(file2);
        
        // Act
        DuplicateAnalysis analysis = analyzer.analyze(files);
        
        // Assert
        assertThat(analysis.getTotalFiles()).isEqualTo(2);
        assertThat(analysis.getTotalUnique()).isEqualTo(1);
        assertThat(analysis.getTotalDuplicates()).isEqualTo(1);
        assertThat(analysis.getUniqueFiles()).containsExactly(file1);
        assertThat(analysis.getDuplicateGroups().get("abc123")).containsExactly(file2);
    }
    
    @Test
    @DisplayName("Should skip files without hashes")
    void shouldSkipFilesWithoutHashes() {
        // Arrange
        List<FileInfo> files = new ArrayList<>();
        
        FileInfo file1 = new FileInfo("C:\\photos\\photo1.jpg", 1024, ".jpg", LocalDateTime.now());
        file1.setHash("abc123");
        
        FileInfo file2 = new FileInfo("C:\\locked\\locked.jpg", 1024, ".jpg", LocalDateTime.now());
        // No hash set (null)
        
        files.add(file1);
        files.add(file2);
        
        // Act
        DuplicateAnalysis analysis = analyzer.analyze(files);
        
        // Assert
        assertThat(analysis.getTotalFiles()).isEqualTo(2);
        assertThat(analysis.getTotalUnique()).isEqualTo(1);
        assertThat(analysis.getTotalDuplicates()).isEqualTo(0);
        assertThat(analysis.getUniqueFiles()).containsExactly(file1);
    }
    
    @Test
    @DisplayName("Should handle empty file list")
    void shouldHandleEmptyFileList() {
        // Arrange
        List<FileInfo> files = new ArrayList<>();
        
        // Act
        DuplicateAnalysis analysis = analyzer.analyze(files);
        
        // Assert
        assertThat(analysis.getTotalFiles()).isEqualTo(0);
        assertThat(analysis.getTotalUnique()).isEqualTo(0);
        assertThat(analysis.getTotalDuplicates()).isEqualTo(0);
        assertThat(analysis.getUniqueFiles()).isEmpty();
        assertThat(analysis.getDuplicateGroups()).isEmpty();
    }
    
    @Test
    @DisplayName("Should get duplicates for a unique file")
    void shouldGetDuplicatesForUniqueFile() {
        // Arrange
        List<FileInfo> files = new ArrayList<>();
        
        FileInfo file1 = new FileInfo("C:\\photos\\photo1.jpg", 1024, ".jpg", LocalDateTime.now());
        file1.setHash("abc123");
        
        FileInfo file2 = new FileInfo("C:\\backup\\photo1.jpg", 1024, ".jpg", LocalDateTime.now());
        file2.setHash("abc123");
        
        files.add(file1);
        files.add(file2);
        
        DuplicateAnalysis analysis = analyzer.analyze(files);
        
        // Act
        List<FileInfo> duplicates = analyzer.getDuplicates(analysis, file1);
        
        // Assert
        assertThat(duplicates).containsExactly(file2);
    }
    
    @Test
    @DisplayName("Should return empty list for unique file with no duplicates")
    void shouldReturnEmptyListForUniqueFileWithNoDuplicates() {
        // Arrange
        List<FileInfo> files = new ArrayList<>();
        
        FileInfo file1 = new FileInfo("C:\\photos\\photo1.jpg", 1024, ".jpg", LocalDateTime.now());
        file1.setHash("abc123");
        
        files.add(file1);
        
        DuplicateAnalysis analysis = analyzer.analyze(files);
        
        // Act
        List<FileInfo> duplicates = analyzer.getDuplicates(analysis, file1);
        
        // Assert
        assertThat(duplicates).isEmpty();
    }
}
