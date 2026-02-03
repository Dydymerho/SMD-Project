package com.smd.core.dto;

import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CLOResponse {
    private Long cloId;
    private Long syllabusId;
    private String cloCode;
    private String cloDescription;
    private List<PLOMappingSummary> ploMappings;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PLOMappingSummary {
        private Long ploId;
        private String ploCode;
        private String mappingLevel;
    }
}
