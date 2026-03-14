package com.filemanager.duplicates.scanner;

import com.filemanager.duplicates.model.FileInfo;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.attribute.BasicFileAttributes;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.function.Consumer;
import java.util.stream.Stream;

/**
 * Recursively scans directories to discover files.
 */
@Component
public class FileScanner {
    
    /**
     * Scans the source path recursively and returns a list of discovered files.
     * 
     * @param sourcePath the path to scan
     * @param progressCallback callback for progress updates
     * @return list of FileInfo objects for all discovered files
     */
    public List<FileInfo> scan(String sourcePath, Consumer<String> progressCallback) {
        List<FileInfo> files = new ArrayList<>();
        Path startPath = Paths.get(sourcePath);
        
        try (Stream<Path> pathStream = Files.walk(startPath)) {
            pathStream.forEach(path -> {
                if (Files.isRegularFile(path)) {
                    try {
                        FileInfo fileInfo = getFileInfo(path.toString());
                        files.add(fileInfo);
                        
                        if (progressCallback != null) {
                            progressCallback.accept("Scanning: " + path.getParent());
                        }
                    } catch (IOException e) {
                        // Log and continue - graceful handling of permission errors
                        if (progressCallback != null) {
                            progressCallback.accept("Warning: Could not access " + path + ": " + e.getMessage());
                        }
                    }
                }
            });
        } catch (IOException e) {
            if (progressCallback != null) {
                progressCallback.accept("Error scanning directory: " + e.getMessage());
            }
        }
        
        return files;
    }
    
    /**
     * Extracts file metadata for a given file path.
     * 
     * @param filePath the path to the file
     * @return FileInfo object containing file metadata
     * @throws IOException if file cannot be accessed
     */
    public FileInfo getFileInfo(String filePath) throws IOException {
        Path path = Paths.get(filePath);
        BasicFileAttributes attrs = Files.readAttributes(path, BasicFileAttributes.class);
        
        long size = attrs.size();
        String extension = getFileExtension(path.getFileName().toString());
        LocalDateTime modificationDate = LocalDateTime.ofInstant(
            attrs.lastModifiedTime().toInstant(),
            ZoneId.systemDefault()
        );
        
        return new FileInfo(filePath, size, extension, modificationDate);
    }
    
    /**
     * Extracts file extension from filename.
     */
    private String getFileExtension(String filename) {
        int dotIndex = filename.lastIndexOf('.');
        if (dotIndex > 0 && dotIndex < filename.length() - 1) {
            return filename.substring(dotIndex).toLowerCase();
        }
        return "";
    }
}
