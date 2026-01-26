package com.smd.core.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssessmentResponse {
    private Long assessmentId;
    private Long syllabusId;
    private String name;
    private Float weightPercent;
    private String criteria;
}
