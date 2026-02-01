package com.smd.core.controller;

import com.smd.core.dto.BulkUserImportResponse;
import com.smd.core.dto.UpdateUserRequest;
import com.smd.core.dto.UserResponse;
import com.smd.core.service.BulkUserImportService;
import com.smd.core.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@Tag(name = "User Management", description = "APIs for managing users")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private BulkUserImportService bulkUserImportService;

    /**
     * Get all users
     * GET /api/users
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HEAD_OF_DEPARTMENT', 'ACADEMIC_AFFAIRS')")
    @Operation(summary = "Get all users", description = "Retrieve list of all users in the system")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        List<UserResponse> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    /**
     * Get user by ID
     * GET /api/users/{id}
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HEAD_OF_DEPARTMENT', 'ACADEMIC_AFFAIRS')")
    @Operation(summary = "Get user by ID", description = "Retrieve a specific user by their ID")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        UserResponse user = userService.getUserById(id);
        return ResponseEntity.ok(user);
    }

    /**
     * Update user
     * PUT /api/users/{id}
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update user", description = "Update user information")
    public ResponseEntity<UserResponse> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRequest request) {
        UserResponse updatedUser = userService.updateUser(id, request);
        return ResponseEntity.ok(updatedUser);
    }

    /**
     * Delete user
     * DELETE /api/users/{id}
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete user", description = "Delete a user from the system")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Bulk import users from Excel file
     * POST /api/users/bulk-import
     */
    @PostMapping(value = "/bulk-import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL')")
    @Operation(
        summary = "Bulk import users from Excel file", 
        description = "Import multiple users from an Excel file (.xlsx). Expected columns: Username, Full Name, Email, Role Code, Department Code. Default password for all users: Password123"
    )
    public ResponseEntity<BulkUserImportResponse> bulkImportUsers(
            @RequestParam("file") MultipartFile file) throws IOException {
        
        // Validate file
        if (file.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(BulkUserImportResponse.builder()
                            .message("File is empty")
                            .totalRows(0)
                            .successCount(0)
                            .errorCount(0)
                            .build());
        }

        // Validate file extension
        String filename = file.getOriginalFilename();
        if (filename == null || !filename.toLowerCase().endsWith(".xlsx")) {
            return ResponseEntity.badRequest()
                    .body(BulkUserImportResponse.builder()
                            .message("Invalid file format. Only .xlsx files are supported")
                            .totalRows(0)
                            .successCount(0)
                            .errorCount(0)
                            .build());
        }

        BulkUserImportResponse response = bulkUserImportService.importUsers(file);
        return ResponseEntity.ok(response);
    }

    /**
     * Download Excel template for bulk user import
     * GET /api/users/bulk-import/template
     */
    @GetMapping("/bulk-import/template")
    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL')")
    @Operation(
        summary = "Download bulk import Excel template",
        description = "Download an Excel template file with the correct format and sample data for bulk user import"
    )
    public ResponseEntity<Resource> downloadBulkImportTemplate() throws IOException {
        byte[] excelData = bulkUserImportService.generateExcelTemplate();
        
        ByteArrayResource resource = new ByteArrayResource(excelData);
        
        String filename = "user_bulk_import_template.xlsx";
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .contentLength(excelData.length)
                .body(resource);
    }
}
