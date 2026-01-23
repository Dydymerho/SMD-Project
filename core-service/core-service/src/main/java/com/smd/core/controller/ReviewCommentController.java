package com.smd.core.controller;

import com.smd.core.dto.CommentRequest;
import com.smd.core.dto.CommentResponse;
import com.smd.core.service.ReviewCommentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/syllabuses/{syllabusId}/comments")
@RequiredArgsConstructor
@Tag(name = "Review Comments", description = "APIs for managing syllabus review comments")
@SecurityRequirement(name = "bearerAuth")
public class ReviewCommentController {
    
    private final ReviewCommentService reviewCommentService;

    @PostMapping
    @Operation(
        summary = "Add a comment to a syllabus",
        description = "Create a new review comment for a specific syllabus. Notifications will be sent to relevant users."
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Comment created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid request data"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "404", description = "Syllabus not found")
    })
    public ResponseEntity<CommentResponse> addComment(
            @Parameter(description = "ID of the syllabus to comment on", required = true)
            @PathVariable Long syllabusId,
            @Valid @RequestBody CommentRequest request) {
        
        CommentResponse response = reviewCommentService.addComment(syllabusId, request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(
        summary = "Get all comments for a syllabus (paginated)",
        description = "Retrieve all review comments for a specific syllabus with pagination"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Comments retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "404", description = "Syllabus not found")
    })
    public ResponseEntity<Page<CommentResponse>> getComments(
            @Parameter(description = "ID of the syllabus", required = true)
            @PathVariable Long syllabusId,
            @Parameter(description = "Page number (0-indexed)")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size")
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<CommentResponse> comments = reviewCommentService.getCommentsBySyllabus(syllabusId, pageable);
        return ResponseEntity.ok(comments);
    }

    @GetMapping("/all")
    @Operation(
        summary = "Get all comments for a syllabus (list)",
        description = "Retrieve all review comments for a specific syllabus as a list (no pagination)"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Comments retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "404", description = "Syllabus not found")
    })
    public ResponseEntity<List<CommentResponse>> getAllComments(
            @Parameter(description = "ID of the syllabus", required = true)
            @PathVariable Long syllabusId) {
        
        List<CommentResponse> comments = reviewCommentService.getAllCommentsBySyllabus(syllabusId);
        return ResponseEntity.ok(comments);
    }

    @GetMapping("/recent")
    @Operation(
        summary = "Get recent comments",
        description = "Get the 5 most recent comments for a syllabus"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Recent comments retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<List<CommentResponse>> getRecentComments(
            @Parameter(description = "ID of the syllabus", required = true)
            @PathVariable Long syllabusId) {
        
        List<CommentResponse> comments = reviewCommentService.getRecentComments(syllabusId);
        return ResponseEntity.ok(comments);
    }

    @GetMapping("/count")
    @Operation(
        summary = "Get comment count",
        description = "Get the total number of comments for a syllabus"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Comment count retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "404", description = "Syllabus not found")
    })
    public ResponseEntity<Long> getCommentCount(
            @Parameter(description = "ID of the syllabus", required = true)
            @PathVariable Long syllabusId) {
        
        long count = reviewCommentService.getCommentCount(syllabusId);
        return ResponseEntity.ok(count);
    }

    @DeleteMapping("/{commentId}")
    @Operation(
        summary = "Delete a comment",
        description = "Delete a review comment. Only the comment owner or admin can delete."
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Comment deleted successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Forbidden - not comment owner or admin"),
        @ApiResponse(responseCode = "404", description = "Comment not found")
    })
    public ResponseEntity<Void> deleteComment(
            @Parameter(description = "ID of the syllabus", required = true)
            @PathVariable Long syllabusId,
            @Parameter(description = "ID of the comment to delete", required = true)
            @PathVariable Long commentId) {
        
        reviewCommentService.deleteComment(commentId);
        return ResponseEntity.noContent().build();
    }
}
