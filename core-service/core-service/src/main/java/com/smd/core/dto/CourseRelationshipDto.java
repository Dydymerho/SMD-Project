package com.smd.core.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseRelationshipDto {
    private Long relationId;
    private Long courseId;
    private String courseCode;
    private String courseName;
    private Long relatedCourseId;
    private String relatedCourseCode;
    private String relatedCourseName;
    private String relationType;
}
