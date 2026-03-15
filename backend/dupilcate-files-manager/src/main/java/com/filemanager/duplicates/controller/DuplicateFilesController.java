package com.filemanager.duplicates.controller;

import com.filemanager.duplicates.model.DuplicateAnalysis;
import com.filemanager.duplicates.model.OperationResult;
import com.filemanager.duplicates.service.DuplicateFileService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;

/**
 * REST Controller for duplicate file management operations.
 */
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class DuplicateFilesController {
    
    private static final Logger logger = LoggerFactory.getLogger(DuplicateFilesController.class);
    
    @Autowired
    private DuplicateFileService duplicateFileService;
    
    /**
     * GET /api/analysis
     * Returns the duplicate analysis result.
     */
    @GetMapping("/analysis")
    public ResponseEntity<DuplicateAnalysis> getAnalysis() {
        try {
            logger.info("GET /api/analysis - Fetching cached analysis");
            DuplicateAnalysis analysis = duplicateFileService.getCachedAnalysis();
            logger.info("Analysis retrieved successfully: {} total files, {} duplicates", 
                analysis.getTotalFiles(), analysis.getTotalDuplicates());
            return ResponseEntity.ok(analysis);
        } catch (Exception e) {
            logger.error("Error fetching analysis", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * POST /api/scan
     * Scans a directory and returns duplicate analysis.
     */
    @PostMapping("/scan")
    public ResponseEntity<DuplicateAnalysis> scanDirectory(@RequestBody Map<String, String> request) {
        try {
            String directoryPath = request.get("path");
            logger.info("POST /api/scan - Received scan request for path: {}", directoryPath);
            
            if (directoryPath == null || directoryPath.trim().isEmpty()) {
                logger.warn("Scan request rejected: empty or null path");
                return ResponseEntity.badRequest().build();
            }
            
            logger.info("Starting directory scan: {}", directoryPath);
            DuplicateAnalysis analysis = duplicateFileService.scanAndAnalyze(directoryPath);
            logger.info("Scan completed: {} total files, {} duplicates found", 
                analysis.getTotalFiles(), analysis.getTotalDuplicates());
            return ResponseEntity.ok(analysis);
            
        } catch (Exception e) {
            logger.error("Error scanning directory", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * DELETE /api/files
     * Deletes a single file.
     */
    @DeleteMapping("/files")
    public ResponseEntity<OperationResult> deleteFile(@RequestBody Map<String, String> request) {
        String filePath = null;
        try {
            filePath = request.get("path");
            logger.info("DELETE /api/files - Delete request for: {}", filePath);
            
            if (filePath == null || filePath.trim().isEmpty()) {
                logger.warn("Delete request rejected: empty or null path");
                return ResponseEntity.badRequest()
                    .body(OperationResult.failure("", "File path is required"));
            }
            
            OperationResult result = duplicateFileService.deleteFile(filePath);
            
            if (result.isSuccess()) {
                logger.info("File deleted successfully: {}", filePath);
                return ResponseEntity.ok(result);
            } else {
                logger.error("File deletion failed: {} - {}", filePath, result.getErrorMessage());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(result);
            }
            
        } catch (Exception e) {
            logger.error("Unexpected error deleting file: {}", filePath, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(OperationResult.failure("", "Unexpected error: " + e.getMessage()));
        }
    }
    
    /**
     * DELETE /api/files/bulk
     * Deletes multiple files.
     */
    @DeleteMapping("/files/bulk")
    public ResponseEntity<List<OperationResult>> deleteFiles(@RequestBody Map<String, List<String>> request) {
        try {
            List<String> filePaths = request.get("paths");
            logger.info("DELETE /api/files/bulk - Bulk delete request for {} files", 
                filePaths != null ? filePaths.size() : 0);
            
            if (filePaths == null || filePaths.isEmpty()) {
                logger.warn("Bulk delete request rejected: empty or null paths list");
                return ResponseEntity.badRequest().build();
            }
            
            List<OperationResult> results = duplicateFileService.deleteFiles(filePaths);
            long successCount = results.stream().filter(OperationResult::isSuccess).count();
            long failureCount = results.size() - successCount;
            logger.info("Bulk delete completed: {} succeeded, {} failed", successCount, failureCount);
            
            return ResponseEntity.ok(results);
            
        } catch (Exception e) {
            logger.error("Error in bulk delete operation", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * GET /api/file/preview
     * Serves a file for preview (images, etc.)
     */
    @GetMapping("/file/preview")
    public ResponseEntity<byte[]> getFilePreview(@RequestParam String path) {
        logger.info("GET /api/file/preview - Request for path: {}", path);
        
        try {
            // Normalize path for Windows (handle both forward and backward slashes)
            String normalizedPath = path.replace("/", "\\");
            logger.debug("Normalized path: {}", normalizedPath);
            
            Path filePath = Paths.get(normalizedPath);
            logger.debug("Resolved absolute path: {}", filePath.toAbsolutePath());
            
            if (!Files.exists(filePath)) {
                logger.warn("File not found: {}", filePath.toAbsolutePath());
                return ResponseEntity.notFound().build();
            }
            
            if (!Files.isRegularFile(filePath)) {
                logger.warn("Not a regular file: {}", filePath.toAbsolutePath());
                return ResponseEntity.badRequest().build();
            }
            
            // Read file bytes
            byte[] fileBytes = Files.readAllBytes(filePath);
            logger.info("File read successfully: {} ({} bytes)", filePath.getFileName(), fileBytes.length);
            
            // Determine content type based on file extension
            String contentType = Files.probeContentType(filePath);
            if (contentType == null) {
                // Fallback content type detection based on extension
                String fileName = filePath.getFileName().toString().toLowerCase();
                if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) {
                    contentType = "image/jpeg";
                } else if (fileName.endsWith(".png")) {
                    contentType = "image/png";
                } else if (fileName.endsWith(".gif")) {
                    contentType = "image/gif";
                } else if (fileName.endsWith(".bmp")) {
                    contentType = "image/bmp";
                } else if (fileName.endsWith(".webp")) {
                    contentType = "image/webp";
                } else if (fileName.endsWith(".svg")) {
                    contentType = "image/svg+xml";
                } else if (fileName.endsWith(".ico")) {
                    contentType = "image/x-icon";
                } else {
                    contentType = "application/octet-stream";
                }
            }
            logger.debug("Content-Type: {}", contentType);
            
            return ResponseEntity.ok()
                .header("Content-Type", contentType)
                .header("Cache-Control", "max-age=3600")
                .header("Access-Control-Allow-Origin", "*")
                .body(fileBytes);
            
        } catch (Exception e) {
            logger.error("Error serving file preview for path: {}", path, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * GET /api/health
     * Health check endpoint.
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        logger.debug("GET /api/health - Health check requested");
        return ResponseEntity.ok(Map.of(
            "status", "UP",
            "service", "Duplicate Files Manager"
        ));
    }
}
