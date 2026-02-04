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
public class SessionPlanRequest {
    
    @NotNull(message = "Syllabus ID is required")
    private Long syllabusId;
    
    @NotNull(message = "Week number is required")
    private Integer weekNo;
    
    @NotBlank(message = "Topic is required")
    private String topic;
    
    private String teachingMethod;
}
