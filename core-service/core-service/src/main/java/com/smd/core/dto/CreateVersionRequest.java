package com.smd.core.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateVersionRequest {
    
    @NotNull(message = "Source syllabus ID is required")
    private Long sourceSyllabusId;
    
    private String versionNotes;
    
    private Boolean copyMaterials = true;
    
    private Boolean copySessionPlans = true;
    
    private Boolean copyAssessments = true;
    
    private Boolean copyCLOs = true;
}
