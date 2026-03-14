package com.filemanager.duplicates.organizer;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.io.TempDir;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.Set;

import static org.assertj.core.api.Assertions.*;

class FolderCreatorTest {
    
    @Test
    @DisplayName("Should create root folder at drive root")
    void shouldCreateRootFolderAtDriveRoot(@TempDir Path tempDir) throws IOException {
        FolderCreator folderCreator = new FolderCreator();
        
        String rootFolder = folderCreator.createRootFolder(tempDir.toString());
        
        assertThat(rootFolder).isNotNull();
        assertThat(Paths.get(rootFolder)).exists();
        assertThat(rootFolder).contains("Duplicate-Files-Organiser");
    }
    
    @Test
    @DisplayName("Should append timestamp when root folder already exists")
    void shouldAppendTimestampWhenRootFolderExists(@TempDir Path tempDir) throws IOException {
        FolderCreator folderCreator = new FolderCreator();
        
        // Create the folder first time
        String firstFolder = folderCreator.createRootFolder(tempDir.toString());
        
        // Create again - should append timestamp
        String secondFolder = folderCreator.createRootFolder(tempDir.toString());
        
        assertThat(firstFolder).isNotEqualTo(secondFolder);
        assertThat(secondFolder).matches(".*Duplicate-Files-Organiser_\\d{8}_\\d{6}.*");
        assertThat(Paths.get(firstFolder)).exists();
        assertThat(Paths.get(secondFolder)).exists();
    }
    
    @Test
    @DisplayName("Should create Unique and Duplicates subdirectories")
    void shouldCreateUniqueAndDuplicatesSubdirectories(@TempDir Path tempDir) throws IOException {
        FolderCreator folderCreator = new FolderCreator();
        
        String rootFolder = folderCreator.createRootFolder(tempDir.toString());
        Set<String> fileTypes = Set.of("images", "documents");
        
        folderCreator.createTypeSubfolders(rootFolder, fileTypes);
        
        Path uniquePath = Paths.get(rootFolder, "Unique");
        Path duplicatesPath = Paths.get(rootFolder, "Duplicates");
        
        assertThat(uniquePath).exists();
        assertThat(duplicatesPath).exists();
    }

    @Test
    @DisplayName("Should create type subfolders for each file type")
    void shouldCreateTypeSubfoldersForEachFileType(@TempDir Path tempDir) throws IOException {
        FolderCreator folderCreator = new FolderCreator();
        
        String rootFolder = folderCreator.createRootFolder(tempDir.toString());
        Set<String> fileTypes = Set.of("images", "documents", "videos");
        
        folderCreator.createTypeSubfolders(rootFolder, fileTypes);
        
        // Check Unique subfolders
        assertThat(Paths.get(rootFolder, "Unique", "images")).exists();
        assertThat(Paths.get(rootFolder, "Unique", "documents")).exists();
        assertThat(Paths.get(rootFolder, "Unique", "videos")).exists();
        
        // Check Duplicates subfolders
        assertThat(Paths.get(rootFolder, "Duplicates", "images")).exists();
        assertThat(Paths.get(rootFolder, "Duplicates", "documents")).exists();
        assertThat(Paths.get(rootFolder, "Duplicates", "videos")).exists();
    }
    
    @Test
    @DisplayName("Should create date subfolders for documents type")
    void shouldCreateDateSubfoldersForDocumentsType(@TempDir Path tempDir) throws IOException {
        FolderCreator folderCreator = new FolderCreator();
        
        String rootFolder = folderCreator.createRootFolder(tempDir.toString());
        Set<String> fileTypes = Set.of("documents");
        
        folderCreator.createTypeSubfolders(rootFolder, fileTypes);
        
        // Check latest and older subfolders in Unique/documents
        assertThat(Paths.get(rootFolder, "Unique", "documents", "latest")).exists();
        assertThat(Paths.get(rootFolder, "Unique", "documents", "older")).exists();
        
        // Check latest and older subfolders in Duplicates/documents
        assertThat(Paths.get(rootFolder, "Duplicates", "documents", "latest")).exists();
        assertThat(Paths.get(rootFolder, "Duplicates", "documents", "older")).exists();
    }
    
    @Test
    @DisplayName("Should not create date subfolders for non-document types")
    void shouldNotCreateDateSubfoldersForNonDocumentTypes(@TempDir Path tempDir) throws IOException {
        FolderCreator folderCreator = new FolderCreator();
        
        String rootFolder = folderCreator.createRootFolder(tempDir.toString());
        Set<String> fileTypes = Set.of("images", "videos");
        
        folderCreator.createTypeSubfolders(rootFolder, fileTypes);
        
        // Verify no date subfolders for images
        assertThat(Paths.get(rootFolder, "Unique", "images", "latest")).doesNotExist();
        assertThat(Paths.get(rootFolder, "Unique", "images", "older")).doesNotExist();
        
        // Verify no date subfolders for videos
        assertThat(Paths.get(rootFolder, "Unique", "videos", "latest")).doesNotExist();
        assertThat(Paths.get(rootFolder, "Unique", "videos", "older")).doesNotExist();
    }
    
    @Test
    @DisplayName("Should include installers in file type categories")
    void shouldIncludeInstallersInFileTypeCategories() {
        assertThat(FolderCreator.FILE_TYPE_CATEGORIES).containsKey("installers");
        assertThat(FolderCreator.FILE_TYPE_CATEGORIES.get("installers"))
            .contains(".exe", ".msi");
    }
    
    @Test
    @DisplayName("Should include archives in file type categories")
    void shouldIncludeArchivesInFileTypeCategories() {
        assertThat(FolderCreator.FILE_TYPE_CATEGORIES).containsKey("archives");
        assertThat(FolderCreator.FILE_TYPE_CATEGORIES.get("archives"))
            .contains(".zip", ".jar", ".rar", ".7z", ".tar", ".gz");
    }
    
    @Test
    @DisplayName("Should resolve type subfolder path correctly")
    void shouldResolveTypeSubfolderPathCorrectly(@TempDir Path tempDir) throws IOException {
        FolderCreator folderCreator = new FolderCreator();
        
        String rootFolder = folderCreator.createRootFolder(tempDir.toString());
        
        String uniqueImagesPath = folderCreator.getTypeSubfolderPath(rootFolder, "Unique", "images");
        String duplicatesDocumentsPath = folderCreator.getTypeSubfolderPath(rootFolder, "Duplicates", "documents");
        
        assertThat(uniqueImagesPath).endsWith("Unique" + java.io.File.separator + "images");
        assertThat(duplicatesDocumentsPath).endsWith("Duplicates" + java.io.File.separator + "documents");
    }
    
    @Test
    @DisplayName("Should determine latest subfolder for recent documents")
    void shouldDetermineLatestSubfolderForRecentDocuments(@TempDir Path tempDir) throws IOException {
        FolderCreator folderCreator = new FolderCreator();
        
        String rootFolder = folderCreator.createRootFolder(tempDir.toString());
        Set<String> fileTypes = Set.of("documents");
        folderCreator.createTypeSubfolders(rootFolder, fileTypes);
        
        String documentsPath = folderCreator.getTypeSubfolderPath(rootFolder, "Unique", "documents");
        LocalDateTime recentDate = LocalDateTime.now().minusDays(15);
        
        String dateSubfolderPath = folderCreator.getDateSubfolderPath(documentsPath, recentDate);
        
        assertThat(dateSubfolderPath).endsWith("latest");
    }
    
    @Test
    @DisplayName("Should determine older subfolder for old documents")
    void shouldDetermineOlderSubfolderForOldDocuments(@TempDir Path tempDir) throws IOException {
        FolderCreator folderCreator = new FolderCreator();
        
        String rootFolder = folderCreator.createRootFolder(tempDir.toString());
        Set<String> fileTypes = Set.of("documents");
        folderCreator.createTypeSubfolders(rootFolder, fileTypes);
        
        String documentsPath = folderCreator.getTypeSubfolderPath(rootFolder, "Unique", "documents");
        LocalDateTime oldDate = LocalDateTime.now().minusDays(45);
        
        String dateSubfolderPath = folderCreator.getDateSubfolderPath(documentsPath, oldDate);
        
        assertThat(dateSubfolderPath).endsWith("older");
    }
    
    @Test
    @DisplayName("Should handle boundary case of exactly 30 days")
    void shouldHandleBoundaryCaseOfExactly30Days(@TempDir Path tempDir) throws IOException {
        FolderCreator folderCreator = new FolderCreator();
        
        String rootFolder = folderCreator.createRootFolder(tempDir.toString());
        Set<String> fileTypes = Set.of("documents");
        folderCreator.createTypeSubfolders(rootFolder, fileTypes);
        
        String documentsPath = folderCreator.getTypeSubfolderPath(rootFolder, "Unique", "documents");
        LocalDateTime boundaryDate = LocalDateTime.now().minusDays(30).minusMinutes(1);
        
        String dateSubfolderPath = folderCreator.getDateSubfolderPath(documentsPath, boundaryDate);
        
        assertThat(dateSubfolderPath).endsWith("older");
    }
    
    @Test
    @DisplayName("Should create installers type subfolders")
    void shouldCreateInstallersTypeSubfolders(@TempDir Path tempDir) throws IOException {
        FolderCreator folderCreator = new FolderCreator();
        
        String rootFolder = folderCreator.createRootFolder(tempDir.toString());
        Set<String> fileTypes = Set.of("installers");
        
        folderCreator.createTypeSubfolders(rootFolder, fileTypes);
        
        assertThat(Paths.get(rootFolder, "Unique", "installers")).exists();
        assertThat(Paths.get(rootFolder, "Duplicates", "installers")).exists();
    }
    
    @Test
    @DisplayName("Should create archives type subfolders")
    void shouldCreateArchivesTypeSubfolders(@TempDir Path tempDir) throws IOException {
        FolderCreator folderCreator = new FolderCreator();
        
        String rootFolder = folderCreator.createRootFolder(tempDir.toString());
        Set<String> fileTypes = Set.of("archives");
        
        folderCreator.createTypeSubfolders(rootFolder, fileTypes);
        
        assertThat(Paths.get(rootFolder, "Unique", "archives")).exists();
        assertThat(Paths.get(rootFolder, "Duplicates", "archives")).exists();
    }
}
