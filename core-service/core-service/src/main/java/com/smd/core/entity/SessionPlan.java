package com.smd.core.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "session_plan")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SessionPlan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "session_id")
    private Long sessionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "syllabus_id", nullable = false)
    @ToString.Exclude
    private Syllabus syllabus;

    @Column(name = "week_no", nullable = false)
    private Integer weekNo;

    @Column(columnDefinition = "TEXT")
    private String topic;

    @Column(name = "teaching_method")
    private String teachingMethod;
}
