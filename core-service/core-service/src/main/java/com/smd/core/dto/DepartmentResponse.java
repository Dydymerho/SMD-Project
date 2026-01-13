package com.smd.core.dto;

import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DepartmentResponse {
    private Long departmentId;
    private String deptName;
    private List<CourseSimpleDto> courses;
    private List<ProgramSimpleDto> programs;
    private Integer totalCourses;
    private Integer totalPrograms;
}
