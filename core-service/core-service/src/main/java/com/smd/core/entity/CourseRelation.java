package com.smd.core.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "course_relation")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseRelation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "relation_id")
    private Long relationId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    @ToString.Exclude
    private Course course;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "related_course_id", nullable = false)
    @ToString.Exclude
    private Course relatedCourse;

    @Enumerated(EnumType.STRING)
    @Column(name = "relation_type", nullable = false)
    private RelationType relationType;

    public enum RelationType {
        PREREQUISITE,    // Môn học trước
        COREQUISITE,     // Môn học song hành
        EQUIVALENT       // Môn tương đương
    }
}
