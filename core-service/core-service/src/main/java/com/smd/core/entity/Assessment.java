package com.smd.core.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "assessment")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Assessment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "assessment_id")
    private Long assessmentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "syllabus_id", nullable = false)
    @ToString.Exclude
    private Syllabus syllabus;

    @Column(nullable = false)
    private String name;

    @Column(name = "weight_percent", nullable = false)
    private Float weightPercent;

    @Column(columnDefinition = "TEXT")
    private String criteria;
}
