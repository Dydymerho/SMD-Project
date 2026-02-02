package com.smd.core.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DepartmentSimpleDto {
    private Long departmentId;
    private String deptName;
}
