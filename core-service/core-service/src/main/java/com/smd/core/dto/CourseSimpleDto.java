package com.smd.core.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseSimpleDto {
    private Long courseId;
    private String courseCode;
    private String courseName;
    private Integer credits;
}
