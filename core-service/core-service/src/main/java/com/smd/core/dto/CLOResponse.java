package com.smd.core.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CLOResponse {
    private Long cloId;
    private Long syllabusId;
    private String cloCode;
    private String cloDescription;
}
