package com.smd.core.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowTransitionRequest {
    
    @NotNull(message = "Syllabus ID is required")
    private Long syllabusId;
    
    private String comment;
    
    // For rejection, can specify what to do
    private Boolean returnToDraft; // true = return to DRAFT, false = return to previous state
}
