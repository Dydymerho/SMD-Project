package com.smd.core.controller;

import com.smd.core.document.SyllabusDocument;
import com.smd.core.dto.*;
import com.smd.core.entity.Syllabus;
import com.smd.core.entity.SyllabusWorkflowHistory;
import com.smd.core.service.SyllabusService;
import com.smd.core.service.WorkflowService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
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
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/syllabuses")
@Tag(name = "Syllabus Management", description = "APIs for managing syllabuses")
public class SyllabusController {
    @Autowired
    private SyllabusService syllabusService;
    
    @Autowired
    private WorkflowService workflowService;

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
    // ==================== VERSIONING ENDPOINTS ====================
    
    @PostMapping("/create-with-dto")
    @Operation(
        summary = "Create new syllabus with auto-versioning",
        description = "Create a new syllabus. Version number will be automatically determined. Optionally copy content from a previous version."
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Syllabus created successfully",
            content = @Content(schema = @Schema(implementation = SyllabusResponse.class))),
        @ApiResponse(responseCode = "400", description = "Invalid request data"),
        @ApiResponse(responseCode = "409", description = "Syllabus already exists")
    })
    public ResponseEntity<SyllabusResponse> createWithDto(
            @Valid @RequestBody CreateSyllabusRequest request) {
        
        // Convert DTO to Entity (simplified - in production would use proper mapping service)
        Syllabus syllabus = new Syllabus();
        // Note: Would need to fetch Course, User, Program from repositories
        // This is simplified for demonstration
        syllabus.setAcademicYear(request.getAcademicYear());
        syllabus.setVersionNotes(request.getVersionNotes());
        
        Syllabus created = syllabusService.createSyllabus(syllabus);
        SyllabusResponse response = SyllabusResponse.fromEntity(created);
        
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/create-version")
    @Operation(
        summary = "Create new version from existing syllabus",
        description = "Create a new version of an existing syllabus with option to copy materials, session plans, assessments, and CLOs"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "New version created successfully",
            content = @Content(schema = @Schema(implementation = SyllabusResponse.class))),
        @ApiResponse(responseCode = "404", description = "Source syllabus not found")
    })
    public ResponseEntity<SyllabusResponse> createVersion(
            @Valid @RequestBody CreateVersionRequest request) {
        
        Syllabus newVersion = syllabusService.createNewVersion(
            request.getSourceSyllabusId(),
            request.getVersionNotes(),
            request.getCopyMaterials(),
            request.getCopySessionPlans(),
            request.getCopyAssessments(),
            request.getCopyCLOs()
        );
        
        SyllabusResponse response = SyllabusResponse.fromEntity(newVersion);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/course/{courseId}/versions")
    @Operation(
        summary = "Get all versions of a syllabus",
        description = "Get all versions of a syllabus for a specific course and academic year"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Versions retrieved successfully")
    })
    public ResponseEntity<List<SyllabusVersionInfo>> getAllVersions(
            @Parameter(description = "Course ID", required = true)
            @PathVariable Long courseId,
            
            @Parameter(description = "Academic year (e.g., 2024-2025)", required = true)
            @RequestParam String academicYear) {
        
        List<Syllabus> versions = syllabusService.getAllVersions(courseId, academicYear);
        
        List<SyllabusVersionInfo> response = versions.stream()
            .map(s -> SyllabusVersionInfo.builder()
                .syllabusId(s.getSyllabusId())
                .versionNo(s.getVersionNo())
                .currentStatus(s.getCurrentStatus().name())
                .createdAt(s.getCreatedAt())
                .updatedAt(s.getUpdatedAt())
                .publishedAt(s.getPublishedAt())
                .archivedAt(s.getArchivedAt())
                .isLatestVersion(s.getIsLatestVersion())
                .versionNotes(s.getVersionNotes())
                .lecturerName(s.getLecturer().getFullName())
                .hasPdf(s.getPdfFileName() != null)
                .build())
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/course/{courseId}/latest")
    @Operation(
        summary = "Get latest version of syllabus",
        description = "Get the most recent version of a syllabus for a specific course and academic year"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Latest version retrieved successfully",
            content = @Content(schema = @Schema(implementation = SyllabusResponse.class))),
        @ApiResponse(responseCode = "404", description = "No syllabus found")
    })
    public ResponseEntity<SyllabusResponse> getLatestVersion(
            @Parameter(description = "Course ID", required = true)
            @PathVariable Long courseId,
            
            @Parameter(description = "Academic year (e.g., 2024-2025)", required = true)
            @RequestParam String academicYear) {
        
        Syllabus latest = syllabusService.getLatestVersion(courseId, academicYear);
        SyllabusResponse response = SyllabusResponse.fromEntity(latest);
        
        return ResponseEntity.ok(response);
    }
    
    // ==================== WORKFLOW ENDPOINTS ====================
    
    @PostMapping("/{id}/submit-for-review")
    @Operation(
        summary = "Submit syllabus for review (LECTURER only)",
        description = "Lecturer submits their draft syllabus for HOD review. Changes status from DRAFT to PENDING_REVIEW.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Syllabus submitted successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid status or not in DRAFT"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Not the owner or not a LECTURER"),
        @ApiResponse(responseCode = "404", description = "Syllabus not found")
    })
    public ResponseEntity<WorkflowTransitionResponse> submitForReview(
            @PathVariable Long id,
            @RequestBody(required = false) WorkflowTransitionRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        if (request == null) {
            request = new WorkflowTransitionRequest();
        }
        request.setSyllabusId(id);
        
        WorkflowTransitionResponse response = workflowService.submitForReview(request, userDetails.getUsername());
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/{id}/hod-approve")
    @Operation(
        summary = "HOD approves syllabus (HEAD_OF_DEPARTMENT only)",
        description = "Head of Department approves the syllabus. Changes status from PENDING_REVIEW to PENDING_APPROVAL.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Syllabus approved by HOD"),
        @ApiResponse(responseCode = "400", description = "Invalid status or not in PENDING_REVIEW"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Not a HEAD_OF_DEPARTMENT"),
        @ApiResponse(responseCode = "404", description = "Syllabus not found")
    })
    public ResponseEntity<WorkflowTransitionResponse> hodApprove(
            @PathVariable Long id,
            @RequestBody(required = false) WorkflowTransitionRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        if (request == null) {
            request = new WorkflowTransitionRequest();
        }
        request.setSyllabusId(id);
        
        WorkflowTransitionResponse response = workflowService.approveByHOD(request, userDetails.getUsername());
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/{id}/hod-reject")
    @Operation(
        summary = "HOD rejects syllabus (HEAD_OF_DEPARTMENT only)",
        description = "Head of Department rejects the syllabus. Changes status from PENDING_REVIEW back to DRAFT.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Syllabus rejected by HOD"),
        @ApiResponse(responseCode = "400", description = "Invalid status or not in PENDING_REVIEW"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Not a HEAD_OF_DEPARTMENT"),
        @ApiResponse(responseCode = "404", description = "Syllabus not found")
    })
    public ResponseEntity<WorkflowTransitionResponse> hodReject(
            @PathVariable Long id,
            @RequestBody(required = false) WorkflowTransitionRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        if (request == null) {
            request = new WorkflowTransitionRequest();
        }
        request.setSyllabusId(id);
        
        WorkflowTransitionResponse response = workflowService.rejectByHOD(request, userDetails.getUsername());
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/{id}/aa-approve")
    @Operation(
        summary = "Academic Affairs approves syllabus (ACADEMIC_AFFAIRS only)",
        description = "Academic Affairs approves the syllabus. Changes status from PENDING_APPROVAL to APPROVED.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Syllabus approved by Academic Affairs"),
        @ApiResponse(responseCode = "400", description = "Invalid status or not in PENDING_APPROVAL"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Not ACADEMIC_AFFAIRS"),
        @ApiResponse(responseCode = "404", description = "Syllabus not found")
    })
    public ResponseEntity<WorkflowTransitionResponse> aaApprove(
            @PathVariable Long id,
            @RequestBody(required = false) WorkflowTransitionRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        if (request == null) {
            request = new WorkflowTransitionRequest();
        }
        request.setSyllabusId(id);
        
        WorkflowTransitionResponse response = workflowService.approveByAA(request, userDetails.getUsername());
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/{id}/aa-reject")
    @Operation(
        summary = "Academic Affairs rejects syllabus (ACADEMIC_AFFAIRS only)",
        description = "Academic Affairs rejects the syllabus. Changes status from PENDING_APPROVAL back to PENDING_REVIEW.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Syllabus rejected by Academic Affairs"),
        @ApiResponse(responseCode = "400", description = "Invalid status or not in PENDING_APPROVAL"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Not ACADEMIC_AFFAIRS"),
        @ApiResponse(responseCode = "404", description = "Syllabus not found")
    })
    public ResponseEntity<WorkflowTransitionResponse> aaReject(
            @PathVariable Long id,
            @RequestBody(required = false) WorkflowTransitionRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        if (request == null) {
            request = new WorkflowTransitionRequest();
        }
        request.setSyllabusId(id);
        
        WorkflowTransitionResponse response = workflowService.rejectByAA(request, userDetails.getUsername());
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/{id}/principal-approve")
    @Operation(
        summary = "Principal approves syllabus (PRINCIPAL only)",
        description = "Principal approves the syllabus for publication. Changes status from APPROVED to PUBLISHED.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Syllabus published by Principal"),
        @ApiResponse(responseCode = "400", description = "Invalid status or not in APPROVED"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Not PRINCIPAL"),
        @ApiResponse(responseCode = "404", description = "Syllabus not found")
    })
    public ResponseEntity<WorkflowTransitionResponse> principalApprove(
            @PathVariable Long id,
            @RequestBody(required = false) WorkflowTransitionRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        if (request == null) {
            request = new WorkflowTransitionRequest();
        }
        request.setSyllabusId(id);
        
        WorkflowTransitionResponse response = workflowService.approveByPrincipal(request, userDetails.getUsername());
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/{id}/principal-reject")
    @Operation(
        summary = "Principal rejects syllabus (PRINCIPAL only)",
        description = "Principal rejects the syllabus. Changes status from APPROVED back to PENDING_APPROVAL.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Syllabus rejected by Principal"),
        @ApiResponse(responseCode = "400", description = "Invalid status or not in APPROVED"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Not PRINCIPAL"),
        @ApiResponse(responseCode = "404", description = "Syllabus not found")
    })
    public ResponseEntity<WorkflowTransitionResponse> principalReject(
            @PathVariable Long id,
            @RequestBody(required = false) WorkflowTransitionRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        if (request == null) {
            request = new WorkflowTransitionRequest();
        }
        request.setSyllabusId(id);
        
        WorkflowTransitionResponse response = workflowService.rejectByPrincipal(request, userDetails.getUsername());
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/{id}/workflow-history")
    @Operation(
        summary = "Get workflow history for a syllabus",
        description = "Retrieve the complete workflow history including all approvals, rejections, and status changes.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Workflow history retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "Syllabus not found")
    })
    public ResponseEntity<List<SyllabusWorkflowHistory>> getWorkflowHistory(
            @PathVariable Long id) {
        
        List<SyllabusWorkflowHistory> history = workflowService.getWorkflowHistory(id);
        return ResponseEntity.ok(history);
    }
    
    @GetMapping("/by-status/{status}")
    @Operation(
        summary = "Get syllabuses by status",
        description = "Get all syllabuses with a specific status. Results are filtered based on user role: " +
                     "LECTURER sees only their own, HOD sees their department's, AA/ADMIN see all.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Syllabuses retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<List<Syllabus>> getSyllabusesByStatus(
            @PathVariable String status,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        Syllabus.SyllabusStatus syllabusStatus = Syllabus.SyllabusStatus.valueOf(status.toUpperCase());
        List<Syllabus> syllabuses = workflowService.getSyllabusesByStatus(syllabusStatus, userDetails.getUsername());
        return ResponseEntity.ok(syllabuses);
    }
}

