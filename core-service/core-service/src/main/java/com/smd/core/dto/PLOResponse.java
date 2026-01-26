package com.smd.core.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PLOResponse {
    private Long ploId;
    private Long programId;
    private String ploCode;
    private String ploDescription;
}
