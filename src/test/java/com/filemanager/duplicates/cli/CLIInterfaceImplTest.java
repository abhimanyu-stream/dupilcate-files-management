package com.filemanager.duplicates.cli;

import com.filemanager.duplicates.model.OperationStats;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.io.PrintStream;
import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Unit tests for CLIInterfaceImpl.
 */
class CLIInterfaceImplTest {
    
    private final InputStream originalSystemIn = System.in;
    private final PrintStream originalSystemOut = System.out;
    private final PrintStream originalSystemErr = System.err;
    
    private ByteArrayOutputStream outputStream;
    private ByteArrayOutputStream errorStream;
    
    @BeforeEach
    void setUp() {
        outputStream = new ByteArrayOutputStream();
        errorStream = new ByteArrayOutputStream();
        System.setOut(new PrintStream(outputStream));
        System.setErr(new PrintStream(errorStream));
    }
    
    @AfterEach
    void tearDown() {
        System.setIn(originalSystemIn);
        System.setOut(originalSystemOut);
        System.setErr(originalSystemErr);
    }
    
    @Test
    @DisplayName("Should prompt for path and return user input")
    void shouldPromptForPathAndReturnInput() {
        String testPath = "C:\\TestFolder";
        System.setIn(new ByteArrayInputStream(testPath.getBytes()));
        
        CLIInterface cli = new CLIInterfaceImpl();
        String result = cli.promptForPath();
        
        assertThat(result).isEqualTo(testPath);
        assertThat(outputStream.toString()).contains("Enter the path to scan");
    }
    
    @Test
    @DisplayName("Should trim whitespace from user input")
    void shouldTrimWhitespaceFromInput() {
        String testPath = "  C:\\TestFolder  \n";
        System.setIn(new ByteArrayInputStream(testPath.getBytes()));
        
        CLIInterface cli = new CLIInterfaceImpl();
        String result = cli.promptForPath();
        
        assertThat(result).isEqualTo("C:\\TestFolder");
    }
    
    @Test
    @DisplayName("Should display error message to System.err")
    void shouldDisplayErrorToSystemErr() {
        CLIInterface cli = new CLIInterfaceImpl();
        String errorMessage = "Invalid path provided";
        
        cli.displayError(errorMessage);
        
        assertThat(errorStream.toString()).contains("Error: " + errorMessage);
    }
    
    @Test
    @DisplayName("Should display progress with stage, count, and current item")
    void shouldDisplayProgress() {
        CLIInterface cli = new CLIInterfaceImpl();
        
        cli.displayProgress("Scanning", "C:\\folder\\file.txt", 42);
        
        String output = outputStream.toString();
        assertThat(output).contains("[Scanning]");
        assertThat(output).contains("42");
        assertThat(output).contains("C:\\folder\\file.txt");
    }
    
    @Test
    @DisplayName("Should display summary with all statistics")
    void shouldDisplaySummaryWithStatistics() {
        CLIInterface cli = new CLIInterfaceImpl();
        
        List<OperationStats.ErrorRecord> errors = new ArrayList<>();
        OperationStats stats = new OperationStats(
            100,  // filesScanned
            60,   // uniqueFilesMoved
            35,   // duplicateFilesMoved
            errors,
            "C:\\Duplicate-Files-Organiser"
        );
        
        cli.displaySummary(stats);
        
        String output = outputStream.toString();
        assertThat(output).contains("OPERATION SUMMARY");
        assertThat(output).contains("Files Scanned: 100");
        assertThat(output).contains("Unique Files Moved: 60");
        assertThat(output).contains("Duplicate Files Moved: 35");
        assertThat(output).contains("Success Rate:");
        assertThat(output).contains("C:\\Duplicate-Files-Organiser");
    }
    
    @Test
    @DisplayName("Should display errors in summary when present")
    void shouldDisplayErrorsInSummary() {
        CLIInterface cli = new CLIInterfaceImpl();
        
        List<OperationStats.ErrorRecord> errors = new ArrayList<>();
        errors.add(new OperationStats.ErrorRecord(
            "C:\\file1.txt", 
            "Permission denied"
        ));
        errors.add(new OperationStats.ErrorRecord(
            "C:\\file2.txt", 
            "File locked"
        ));
        
        OperationStats stats = new OperationStats(
            50,
            30,
            15,
            errors,
            "C:\\Duplicate-Files-Organiser"
        );
        
        cli.displaySummary(stats);
        
        String output = outputStream.toString();
        assertThat(output).contains("ERRORS (2)");
        assertThat(output).contains("C:\\file1.txt");
        assertThat(output).contains("Permission denied");
        assertThat(output).contains("C:\\file2.txt");
        assertThat(output).contains("File locked");
    }
    
    @Test
    @DisplayName("Should not display error section when no errors")
    void shouldNotDisplayErrorSectionWhenNoErrors() {
        CLIInterface cli = new CLIInterfaceImpl();
        
        List<OperationStats.ErrorRecord> errors = new ArrayList<>();
        OperationStats stats = new OperationStats(
            50,
            30,
            15,
            errors,
            "C:\\Duplicate-Files-Organiser"
        );
        
        cli.displaySummary(stats);
        
        String output = outputStream.toString();
        assertThat(output).doesNotContain("ERRORS");
    }
    
    @Test
    @DisplayName("Should handle null root folder path in summary")
    void shouldHandleNullRootFolderPath() {
        CLIInterface cli = new CLIInterfaceImpl();
        
        List<OperationStats.ErrorRecord> errors = new ArrayList<>();
        OperationStats stats = new OperationStats(
            10,
            5,
            3,
            errors,
            null
        );
        
        cli.displaySummary(stats);
        
        String output = outputStream.toString();
        assertThat(output).contains("OPERATION SUMMARY");
        assertThat(output).doesNotContain("Organized files location:");
    }
    
    @Test
    @DisplayName("Should format progress messages clearly for scanning stage")
    void shouldFormatScanningProgress() {
        CLIInterface cli = new CLIInterfaceImpl();
        
        cli.displayProgress("Scanning", "C:\\Documents\\report.pdf", 15);
        
        String output = outputStream.toString();
        assertThat(output).contains("[Scanning]");
        assertThat(output).contains("Processed 15 items");
        assertThat(output).contains("C:\\Documents\\report.pdf");
    }
    
    @Test
    @DisplayName("Should format progress messages clearly for hashing stage")
    void shouldFormatHashingProgress() {
        CLIInterface cli = new CLIInterfaceImpl();
        
        cli.displayProgress("Hashing", "C:\\Photos\\vacation.jpg", 42);
        
        String output = outputStream.toString();
        assertThat(output).contains("[Hashing]");
        assertThat(output).contains("Processed 42 items");
        assertThat(output).contains("C:\\Photos\\vacation.jpg");
    }
    
    @Test
    @DisplayName("Should format progress messages clearly for moving stage")
    void shouldFormatMovingProgress() {
        CLIInterface cli = new CLIInterfaceImpl();
        
        cli.displayProgress("Moving", "C:\\Videos\\movie.mp4", 8);
        
        String output = outputStream.toString();
        assertThat(output).contains("[Moving]");
        assertThat(output).contains("Processed 8 items");
        assertThat(output).contains("C:\\Videos\\movie.mp4");
    }
}
