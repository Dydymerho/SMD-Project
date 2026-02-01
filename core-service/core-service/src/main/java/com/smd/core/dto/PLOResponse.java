package com.smd.core.dto;

import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PLOResponse {
    private Long ploId;
    private Long programId;
    private String ploCode;
    private String ploDescription;
    private Integer totalMappedCLOs;
    private List<CLOMappingSummary> cloMappings;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CLOMappingSummary {
        private Long cloId;
        private String cloCode;
        private Long syllabusId;
        private String courseCode;
        private String mappingLevel;
    }
}
