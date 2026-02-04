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
public class CLORequest {
    
    @NotNull(message = "Syllabus ID is required")
    private Long syllabusId;
    
    @NotBlank(message = "CLO code is required")
    private String cloCode;
    
    @NotBlank(message = "CLO description is required")
    private String cloDescription;
}
