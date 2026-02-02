package com.smd.core.dto;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseTreeNodeDto {
    private Long courseId;
    private String courseCode;
    private String courseName;
    private Integer credits;
    private String courseType;
    private List<CourseTreeNodeDto> prerequisites;
    private List<CourseTreeNodeDto> corequisites;
    private List<CourseTreeNodeDto> equivalents;
    private Integer level; // Độ sâu trong cây
}
