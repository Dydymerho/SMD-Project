package com.smd.core.dto;

import com.smd.core.entity.CommentContextType;
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
    
    // Optional: Context information for targeted comments
    private CommentContextType contextType;
    private Long contextId;
    private String contextSection; // e.g., "CLO 1.2", "Week 3"
}
