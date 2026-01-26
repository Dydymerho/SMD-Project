package com.smd.core.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SessionPlanResponse {
    private Long sessionId;
    private Long syllabusId;
    private Integer weekNo;
    private String topic;
    private String teachingMethod;
}
