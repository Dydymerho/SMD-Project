package com.smd.core.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProgramResponse {
    private Long programId;
    private String programName;
    private DepartmentSimpleDto department;
}
