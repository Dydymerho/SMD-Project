package com.smd.core.controller;

import com.smd.core.dto.CommentRequest;
import com.smd.core.dto.CommentResponse;
import com.smd.core.dto.ResolveCommentRequest;
import com.smd.core.dto.UpdateCommentRequest;
import com.smd.core.entity.CommentContextType;
import com.smd.core.entity.CommentStatus;
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
@RequestMapping("/api/syllabuses/{syllabusId}/comments")
@RequiredArgsConstructor
@Tag(name = "Review Comments", description = "APIs for managing syllabus review comments with collaborative features")
@SecurityRequirement(name = "bearerAuth")
public class ReviewCommentController {
    
    private final ReviewCommentService reviewCommentService;

    @PostMapping
    @Operation(
        summary = "Add a comment to a syllabus",
        description = "Create a new review comment for a specific syllabus with optional context. Notifications will be sent to relevant users."
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

    @PutMapping("/{commentId}")
    @Operation(
        summary = "Edit a comment",
        description = "Update the content of an existing comment. Only the comment owner can edit their comment."
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Comment updated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid request data"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Forbidden - not comment owner"),
        @ApiResponse(responseCode = "404", description = "Comment not found")
    })
    public ResponseEntity<CommentResponse> updateComment(
            @Parameter(description = "ID of the syllabus", required = true)
            @PathVariable Long syllabusId,
            @Parameter(description = "ID of the comment to update", required = true)
            @PathVariable Long commentId,
            @Valid @RequestBody UpdateCommentRequest request) {
        
        CommentResponse response = reviewCommentService.updateComment(commentId, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{commentId}/replies")
    @Operation(
        summary = "Reply to a comment",
        description = "Add a reply to an existing comment, creating a threaded discussion"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Reply created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid request data"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "404", description = "Parent comment not found")
    })
    public ResponseEntity<CommentResponse> replyToComment(
            @Parameter(description = "ID of the syllabus", required = true)
            @PathVariable Long syllabusId,
            @Parameter(description = "ID of the parent comment to reply to", required = true)
            @PathVariable Long commentId,
            @Valid @RequestBody CommentRequest request) {
        
        CommentResponse response = reviewCommentService.replyToComment(commentId, request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/{commentId}/replies")
    @Operation(
        summary = "Get replies for a comment",
        description = "Retrieve all replies for a specific comment with pagination"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Replies retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "404", description = "Parent comment not found")
    })
    public ResponseEntity<Page<CommentResponse>> getReplies(
            @Parameter(description = "ID of the syllabus", required = true)
            @PathVariable Long syllabusId,
            @Parameter(description = "ID of the parent comment", required = true)
            @PathVariable Long commentId,
            @Parameter(description = "Page number (0-indexed)")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size")
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<CommentResponse> replies = reviewCommentService.getReplies(commentId, pageable);
        return ResponseEntity.ok(replies);
    }

    @PatchMapping("/{commentId}/resolve")
    @Operation(
        summary = "Resolve or close a comment",
        description = "Update the status of a comment (OPEN, RESOLVED, CLOSED). Only HoD, syllabus owner, or admin can resolve comments."
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Comment status updated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid request data"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Forbidden - insufficient permissions"),
        @ApiResponse(responseCode = "404", description = "Comment not found")
    })
    public ResponseEntity<CommentResponse> resolveComment(
            @Parameter(description = "ID of the syllabus", required = true)
            @PathVariable Long syllabusId,
            @Parameter(description = "ID of the comment to resolve", required = true)
            @PathVariable Long commentId,
            @Valid @RequestBody ResolveCommentRequest request) {
        
        CommentResponse response = reviewCommentService.resolveComment(commentId, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/context")
    @Operation(
        summary = "Get comments filtered by context",
        description = "Retrieve comments filtered by context type and/or context ID (e.g., all comments on CLOs or a specific CLO)"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Comments retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "404", description = "Syllabus not found")
    })
    public ResponseEntity<Page<CommentResponse>> getCommentsByContext(
            @Parameter(description = "ID of the syllabus", required = true)
            @PathVariable Long syllabusId,
            @Parameter(description = "Context type filter (e.g., CLO, ASSESSMENT)")
            @RequestParam(required = false) CommentContextType contextType,
            @Parameter(description = "Context ID filter (e.g., specific CLO ID)")
            @RequestParam(required = false) Long contextId,
            @Parameter(description = "Page number (0-indexed)")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size")
            @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<CommentResponse> comments = reviewCommentService.getCommentsByContext(
                syllabusId, contextType, contextId, pageable);
        return ResponseEntity.ok(comments);
    }

    @GetMapping("/status/{status}")
    @Operation(
        summary = "Get comments by status",
        description = "Retrieve comments filtered by status (OPEN, RESOLVED, CLOSED)"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Comments retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "404", description = "Syllabus not found")
    })
    public ResponseEntity<Page<CommentResponse>> getCommentsByStatus(
            @Parameter(description = "ID of the syllabus", required = true)
            @PathVariable Long syllabusId,
            @Parameter(description = "Status filter", required = true)
            @PathVariable CommentStatus status,
            @Parameter(description = "Page number (0-indexed)")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size")
            @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<CommentResponse> comments = reviewCommentService.getCommentsByStatus(syllabusId, status, pageable);
        return ResponseEntity.ok(comments);
    }

    @GetMapping("/unresolved-count")
    @Operation(
        summary = "Get unresolved comment count",
        description = "Get the number of unresolved (OPEN status) comments for a syllabus"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Count retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<Long> getUnresolvedCommentCount(
            @Parameter(description = "ID of the syllabus", required = true)
            @PathVariable Long syllabusId) {
        
        long count = reviewCommentService.getUnresolvedCommentCount(syllabusId);
        return ResponseEntity.ok(count);
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
