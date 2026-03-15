package com.filemanager.duplicates.organizer;

import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Creates the target folder structure for organizing files.
 * Creates a root folder at the drive root, with Unique and Duplicates subdirectories,
 * each containing type-based subfolders. Document type subfolders have additional
 * date-based subfolders (latest/older).
 */
@Component
public class FolderCreator {
    
    private static final String ROOT_FOLDER_NAME = "Duplicate-Files-Organiser";
    private static final String UNIQUE_FOLDER = "Unique";
    private static final String DUPLICATES_FOLDER = "Duplicates";
    private static final String LATEST_FOLDER = "latest";
    private static final String OLDER_FOLDER = "older";
    private static final DateTimeFormatter TIMESTAMP_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss");
    
    /**
     * File type categories mapping.
     */
    public static final Map<String, List<String>> FILE_TYPE_CATEGORIES = Map.of(
        "images", List.of(".jpg", ".jpeg", ".png", ".gif", ".bmp", ".svg", ".webp"),
        "documents", List.of(".pdf", ".doc", ".docx", ".txt", ".rtf", ".odt", ".md"),
        "videos", List.of(".mp4", ".avi", ".mkv", ".mov", ".wmv", ".flv"),
        "audio", List.of(".mp3", ".wav", ".flac", ".aac", ".ogg", ".m4a"),
        "installers", List.of(".exe", ".msi"),
        "archives", List.of(".zip", ".rar", ".7z", ".tar", ".gz", ".jar")
    );
    
    /**
     * Creates the root folder at the drive root.
     * If the folder already exists, appends a timestamp (YYYYMMDD_HHMMSS).
     * 
     * @param driveRoot the root of the drive (e.g., "C:\")
     * @return the path to the created root folder
     * @throws IOException if folder creation fails
     */
    public String createRootFolder(String driveRoot) throws IOException {
        Path rootPath = Paths.get(driveRoot, ROOT_FOLDER_NAME);
        
        // If folder exists, append timestamp
        if (Files.exists(rootPath)) {
            String timestamp = LocalDateTime.now().format(TIMESTAMP_FORMATTER);
            String folderNameWithTimestamp = ROOT_FOLDER_NAME + "_" + timestamp;
            rootPath = Paths.get(driveRoot, folderNameWithTimestamp);
        }
        
        Files.createDirectories(rootPath);
        return rootPath.toString();
    }
    
    /**
     * Creates type-based subfolders within Unique and Duplicates directories.
     * 
     * @param root the root folder path
     * @param fileTypes the set of file type categories encountered
     * @throws IOException if folder creation fails
     */
    public void createTypeSubfolders(String root, Set<String> fileTypes) throws IOException {
        Path rootPath = Paths.get(root);
        
        // Create Unique and Duplicates folders
        Path uniquePath = rootPath.resolve(UNIQUE_FOLDER);
        Path duplicatesPath = rootPath.resolve(DUPLICATES_FOLDER);
        Files.createDirectories(uniquePath);
        Files.createDirectories(duplicatesPath);
        
        // Create type subfolders in both Unique and Duplicates
        for (String fileType : fileTypes) {
            Path uniqueTypeFolder = uniquePath.resolve(fileType);
            Path duplicatesTypeFolder = duplicatesPath.resolve(fileType);
            
            Files.createDirectories(uniqueTypeFolder);
            Files.createDirectories(duplicatesTypeFolder);
            
            // Create date subfolders for documents
            if ("documents".equals(fileType)) {
                createDateSubfoldersForDocuments(uniqueTypeFolder.toString());
                createDateSubfoldersForDocuments(duplicatesTypeFolder.toString());
            }
        }
    }
    
    /**
     * Creates "latest" and "older" subfolders within a documents type subfolder.
     * 
     * @param typeSubfolderPath the path to the documents type subfolder
     * @throws IOException if folder creation fails
     */
    public void createDateSubfoldersForDocuments(String typeSubfolderPath) throws IOException {
        Path typeFolder = Paths.get(typeSubfolderPath);
        Path latestFolder = typeFolder.resolve(LATEST_FOLDER);
        Path olderFolder = typeFolder.resolve(OLDER_FOLDER);
        
        Files.createDirectories(latestFolder);
        Files.createDirectories(olderFolder);
    }
    
    /**
     * Resolves the path to a type subfolder.
     * 
     * @param root the root folder path
     * @param category "Unique" or "Duplicates"
     * @param fileType the file type category (e.g., "images", "documents")
     * @return the path to the type subfolder
     */
    public String getTypeSubfolderPath(String root, String category, String fileType) {
        return Paths.get(root, category, fileType).toString();
    }
    
    /**
     * Determines the date-based subfolder path (latest vs older) for a document file.
     * 
     * @param typeSubfolderPath the path to the documents type subfolder
     * @param modificationDate the file's modification date
     * @return the path to either the "latest" or "older" subfolder
     */
    public String getDateSubfolderPath(String typeSubfolderPath, LocalDateTime modificationDate) {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(30);
        boolean isRecent = modificationDate.isAfter(cutoffDate);
        
        String dateFolder = isRecent ? LATEST_FOLDER : OLDER_FOLDER;
        return Paths.get(typeSubfolderPath, dateFolder).toString();
    }
}
