package com.smd.core.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommentRequest {
    
    @NotBlank(message = "Comment content is required")
    private String content;
    
    private String type; // REVIEW, FEEDBACK, BUG_REPORT, SUGGESTION, etc.
    
    private String contextType; // CLO, MODULE, ASSESSMENT, GENERAL
    
    private Long contextId; // ID of the CLO, Module, Assessment, etc.
    
    private String contextSection; // Section reference
    
    private Long parentCommentId; // For replies to existing comments
    
    private String status; // PENDING, RESOLVED, ARCHIVED
}
