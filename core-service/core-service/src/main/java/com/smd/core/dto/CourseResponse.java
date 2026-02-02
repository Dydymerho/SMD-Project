package com.smd.core.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseResponse {
    private Long courseId;
    private String courseCode;
    private String courseName;
    private Integer credits;
    private DepartmentSimpleDto department;
    private String courseType; // Trả về dưới dạng String (MANDATORY/ELECTIVE)
}
