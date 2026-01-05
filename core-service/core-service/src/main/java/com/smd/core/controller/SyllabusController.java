package com.smd.core.controller;

import com.smd.core.document.SyllabusDocument;
import com.smd.core.dto.SyllabusUploadResponse;
import com.smd.core.entity.Syllabus;
import com.smd.core.service.SyllabusService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/syllabuses")
@Tag(name = "Syllabus Management", description = "APIs for managing syllabuses")
public class SyllabusController {
    @Autowired
    private SyllabusService syllabusService;

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Syllabus syllabus) {
        return ResponseEntity.ok(syllabusService.createSyllabus(syllabus));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Syllabus> getDetail(@PathVariable Long id) {
        return ResponseEntity.ok(syllabusService.getSyllabusById(id));
    }

    @GetMapping("/search")
    public ResponseEntity<List<Syllabus>> search(@RequestParam String keyword) {
        // URL dạng: /api/v1/syllabuses/search?keyword=Java
        return ResponseEntity.ok(syllabusService.search(keyword));
    }
    
    @GetMapping
    public ResponseEntity<List<Syllabus>> getAll() {
        return ResponseEntity.ok(syllabusService.getAllSyllabuses());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Syllabus> update(@PathVariable long id, @RequestBody Syllabus syllabus){
        return ResponseEntity.ok(syllabusService.updateSyllabus(id, syllabus));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable long id){
        syllabusService.deleteSyllabus(id);
        return ResponseEntity.noContent().build();
    }
    
    @PostMapping("/reindex")
    @Operation(summary = "Reindex all syllabuses to Elasticsearch")
    public ResponseEntity<String> reindex() {
        syllabusService.reindexAllToElasticsearch();
        return ResponseEntity.ok("Reindex completed successfully");
    }

    // ==================== PDF UPLOAD ENDPOINTS ====================
    
    @PostMapping(value = "/{id}/upload-pdf", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(
        summary = "Upload PDF for syllabus",
        description = "Upload a PDF file for a specific syllabus. Only the lecturer who owns the syllabus can upload. Maximum file size: 10MB"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "PDF uploaded successfully",
            content = @Content(schema = @Schema(implementation = SyllabusUploadResponse.class))),
        @ApiResponse(responseCode = "400", description = "Invalid file format or empty file"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Forbidden - Not the syllabus owner"),
        @ApiResponse(responseCode = "404", description = "Syllabus not found")
    })
    public ResponseEntity<SyllabusUploadResponse> uploadPdf(
            @Parameter(description = "Syllabus ID", required = true)
            @PathVariable Long id,
            
            @Parameter(
                description = "PDF file to upload (max 10MB)",
                required = true,
                content = @Content(mediaType = MediaType.MULTIPART_FORM_DATA_VALUE)
            )
            @RequestParam("file") MultipartFile file,
            
            @Parameter(hidden = true)
            @AuthenticationPrincipal UserDetails userDetails) {
        
        String username = userDetails != null ? userDetails.getUsername() : "anonymous";
        SyllabusUploadResponse response = syllabusService.uploadPdf(id, file, username);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/download-pdf")
    @Operation(
        summary = "Download PDF of syllabus",
        description = "Download the PDF file associated with a syllabus"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "PDF downloaded successfully",
            content = @Content(mediaType = MediaType.APPLICATION_PDF_VALUE)),
        @ApiResponse(responseCode = "404", description = "Syllabus or PDF not found")
    })
    public ResponseEntity<byte[]> downloadPdf(
            @Parameter(description = "Syllabus ID", required = true)
            @PathVariable Long id) {
        
        byte[] pdfContent = syllabusService.downloadPdf(id);
        
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"syllabus_" + id + ".pdf\"")
            .contentType(MediaType.APPLICATION_PDF)
            .body(pdfContent);
    }

    @DeleteMapping("/{id}/delete-pdf")
    @Operation(
        summary = "Delete PDF of syllabus",
        description = "Delete the PDF file associated with a syllabus. Only the lecturer who owns the syllabus can delete."
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "PDF deleted successfully"),
        @ApiResponse(responseCode = "403", description = "Forbidden - Not the syllabus owner"),
        @ApiResponse(responseCode = "404", description = "Syllabus or PDF not found")
    })
    public ResponseEntity<Void> deletePdf(
            @Parameter(description = "Syllabus ID", required = true)
            @PathVariable Long id,
            
            @Parameter(hidden = true)
            @AuthenticationPrincipal UserDetails userDetails) {
        
        String username = userDetails != null ? userDetails.getUsername() : "anonymous";
        syllabusService.deletePdf(id, username);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/pdf-info")
    @Operation(
        summary = "Get PDF information",
        description = "Get information about the uploaded PDF file for a syllabus including filename, size, and upload date"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "PDF info retrieved successfully",
            content = @Content(schema = @Schema(implementation = SyllabusUploadResponse.class))),
        @ApiResponse(responseCode = "404", description = "Syllabus not found")
    })
    public ResponseEntity<SyllabusUploadResponse> getPdfInfo(
            @Parameter(description = "Syllabus ID", required = true)
            @PathVariable Long id) {
        
        SyllabusUploadResponse response = syllabusService.getPdfInfo(id);
        return ResponseEntity.ok(response);
    }
}