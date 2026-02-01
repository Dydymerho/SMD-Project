package com.smd.core.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CLOPLOMappingResponse {
    private Long mappingId;
    private Long cloId;
    private String cloCode;
    private String cloDescription;
    private Long ploId;
    private String ploCode;
    private String ploDescription;
    private String mappingLevel; // LOW, MEDIUM, HIGH
}
