package com.filemanager.duplicates.hash;

import com.filemanager.duplicates.model.FileInfo;
import org.springframework.stereotype.Component;

import java.io.FileInputStream;
import java.io.IOException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Consumer;

/**
 * Computes cryptographic hashes for file content comparison.
 */
@Component
public class HashProcessor {
    
    private static final int CHUNK_SIZE = 64 * 1024; // 64KB chunks
    private static final String HASH_ALGORITHM = "SHA-256";
    
    /**
     * Computes SHA-256 hash for a single file.
     * 
     * @param filePath the path to the file
     * @return hex string representation of the hash
     * @throws IOException if file cannot be read
     */
    public String computeHash(String filePath) throws IOException {
        try {
            MessageDigest digest = MessageDigest.getInstance(HASH_ALGORITHM);
            
            try (FileInputStream fis = new FileInputStream(filePath)) {
                byte[] buffer = new byte[CHUNK_SIZE];
                int bytesRead;
                
                while ((bytesRead = fis.read(buffer)) != -1) {
                    digest.update(buffer, 0, bytesRead);
                }
            }
            
            byte[] hashBytes = digest.digest();
            return bytesToHex(hashBytes);
            
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }
    
    /**
     * Computes hashes for a batch of files.
     * 
     * @param files list of FileInfo objects to process
     * @param progressCallback callback for progress updates
     * @return map of file paths to their hash values
     */
    public Map<String, String> computeHashesBatch(List<FileInfo> files, Consumer<String> progressCallback) {
        Map<String, String> fileHashes = new HashMap<>();
        int processed = 0;
        int total = files.size();
        
        for (FileInfo file : files) {
            try {
                String hash = computeHash(file.getPath());
                fileHashes.put(file.getPath(), hash);
                file.setHash(hash);
                
                processed++;
                if (progressCallback != null) {
                    progressCallback.accept("Computing hashes: " + processed + "/" + total);
                }
                
            } catch (IOException e) {
                // Log error and continue with remaining files
                if (progressCallback != null) {
                    progressCallback.accept("Error hashing " + file.getPath() + ": " + e.getMessage());
                }
            }
        }
        
        return fileHashes;
    }
    
    /**
     * Converts byte array to hex string.
     */
    private String bytesToHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder();
        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }
}
