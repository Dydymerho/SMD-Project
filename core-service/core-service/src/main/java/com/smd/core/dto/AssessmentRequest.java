package com.smd.core.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssessmentRequest {
    
    @NotNull(message = "Syllabus ID is required")
    private Long syllabusId;
    
    @NotBlank(message = "Assessment name is required")
    private String name;
    
    @NotNull(message = "Weight percent is required")
    private Double weightPercent;
    
    private String criteria;
}
