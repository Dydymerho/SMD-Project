package com.smd.core.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProgramSimpleDto {
    private Long programId;
    private String programName;
}
