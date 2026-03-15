package com.filemanager.duplicates.model;

import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Represents metadata for a discovered file.
 */
public class FileInfo {
    private final String path;
    private final long size;
    private final String extension;
    private final LocalDateTime modificationDate;
    private String hash;
    
    public FileInfo(String path, long size, String extension, LocalDateTime modificationDate) {
        this.path = path;
        this.size = size;
        this.extension = extension;
        this.modificationDate = modificationDate;
        this.hash = null;
    }
    
    /**
     * Returns filename without path.
     */
    public String getFilename() {
        return Paths.get(path).getFileName().toString();
    }
    
    /**
     * Returns filename without extension.
     */
    public String getFilenameWithoutExt() {
        String filename = getFilename();
        int dotIndex = filename.lastIndexOf('.');
        return dotIndex > 0 ? filename.substring(0, dotIndex) : filename;
    }
    
    /**
     * Returns category based on extension.
     */
    public String getFileTypeCategory() {
        return FileTypeCategories.getCategoryForExtension(extension);
    }
    
    /**
     * Returns true if file is a document type.
     */
    public boolean isDocumentFile() {
        return getFileTypeCategory().equals("documents");
    }
    
    /**
     * Returns true if file was modified within the specified number of days.
     */
    public boolean isModifiedWithinDays(int days) {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(days);
        return modificationDate.isAfter(cutoffDate);
    }
    
    // Getters and setters
    public String getPath() {
        return path;
    }
    
    public long getSize() {
        return size;
    }
    
    public String getExtension() {
        return extension;
    }
    
    public LocalDateTime getModificationDate() {
        return modificationDate;
    }
    
    public String getHash() {
        return hash;
    }
    
    public void setHash(String hash) {
        this.hash = hash;
    }
}

/**
 * File type categories mapping.
 */
class FileTypeCategories {
    private static final Map<String, List<String>> CATEGORIES = Map.of(
        "images", List.of(".jpg", ".jpeg", ".png", ".gif", ".bmp", ".svg", ".webp"),
        "documents", List.of(".pdf", ".doc", ".docx", ".txt", ".rtf", ".odt", ".md"),
        "videos", List.of(".mp4", ".avi", ".mkv", ".mov", ".wmv", ".flv"),
        "audio", List.of(".mp3", ".wav", ".flac", ".aac", ".ogg", ".m4a"),
        "installers", List.of(".exe", ".msi"),
        "archives", List.of(".zip", ".rar", ".7z", ".tar", ".gz", ".jar")
    );
    
    public static String getCategoryForExtension(String extension) {
        String lowerExt = extension.toLowerCase();
        for (Map.Entry<String, List<String>> entry : CATEGORIES.entrySet()) {
            if (entry.getValue().contains(lowerExt)) {
                return entry.getKey();
            }
        }
        return "other";
    }
}
