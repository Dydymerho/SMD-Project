package com.smd.core.dto;

import com.smd.core.entity.CourseRelation.RelationType;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseRelationResponse {
    private Long relationId;
    private CourseResponse relatedCourse; // Thông tin môn học liên quan
    private RelationType relationType;    // Loại quan hệ (PREREQUISITE, COREQUISITE,...)
}