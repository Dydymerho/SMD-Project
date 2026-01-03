package com.smd.core.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "syllabus")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Syllabus {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "syllabus_id")
    private Long syllabusId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "course_id", nullable = false)
    @ToString.Exclude
    @JsonIgnoreProperties({"syllabuses", "prerequisiteRelations", "relatedToRelations", "department"})
    private Course course;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "lecturer_id", nullable = false)
    @ToString.Exclude
    @JsonIgnoreProperties({"syllabuses", "password", "department", "reviewComments"})
    private User lecturer;

    @Column(name = "academic_year", nullable = false)
    private String academicYear;

    @Column(name = "version_no", nullable = false)
    private Integer versionNo;

    @Enumerated(EnumType.STRING)
    @Column(name = "current_status", nullable = false)
    private SyllabusStatus currentStatus;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "program_id")
    @ToString.Exclude
    @JsonIgnoreProperties({"syllabuses", "plos", "department"})
    private Program program;

    // Relationships
    @OneToMany(mappedBy = "syllabus", cascade = CascadeType.ALL)
    @ToString.Exclude
    private List<Material> materials;

    @OneToMany(mappedBy = "syllabus", cascade = CascadeType.ALL)
    @ToString.Exclude
    private List<SessionPlan> sessionPlans;

    @OneToMany(mappedBy = "syllabus", cascade = CascadeType.ALL)
    @ToString.Exclude
    private List<Assessment> assessments;

    @OneToMany(mappedBy = "syllabus", cascade = CascadeType.ALL)
    @ToString.Exclude
    private List<CLO> clos;

    @OneToMany(mappedBy = "syllabus", cascade = CascadeType.ALL)
    @ToString.Exclude
    private List<ReviewComment> reviewComments;

    @OneToMany(mappedBy = "syllabus", cascade = CascadeType.ALL)
    @ToString.Exclude
    private List<SyllabusWorkflowHistory> workflowHistories;

    @OneToMany(mappedBy = "syllabus", cascade = CascadeType.ALL)
    @ToString.Exclude
    private List<AITask> aiTasks;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (currentStatus == null) {
            currentStatus = SyllabusStatus.DRAFT;
        }
        if (versionNo == null) {
            versionNo = 1;
        }
    }

    public enum SyllabusStatus {
        DRAFT,
        IN_REVIEW,
        APPROVED,
        PUBLISHED,
        ARCHIVED
    }
}