package com.smd.core.dto;

import com.smd.core.entity.CommentStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for changing comment status (resolve/close)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResolveCommentRequest {
    
    @NotNull(message = "Status is required")
    private CommentStatus status;
    
    private String resolutionNote; // Optional note when resolving
}
