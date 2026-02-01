package com.smd.core.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "syllabus")
@Getter
@Setter
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

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "published_at")
    private LocalDateTime publishedAt;

    @Column(name = "archived_at")
    private LocalDateTime archivedAt;

    @Column(name = "is_latest_version")
    private Boolean isLatestVersion;

    @Column(name = "previous_version_id")
    private Long previousVersionId;

    @Column(name = "version_notes", length = 1000)
    private String versionNotes;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "pdf_file_path", length = 500)
    private String pdfFilePath;

    @Column(name = "pdf_file_name")
    private String pdfFileName;

    @Column(name = "pdf_uploaded_at")
    private LocalDateTime pdfUploadedAt;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "program_id")
    @ToString.Exclude
    @JsonIgnoreProperties({"syllabuses", "plos", "department"})
    private Program program;

    // Relationships
    @OneToMany(mappedBy = "syllabus", cascade = CascadeType.ALL)
    @ToString.Exclude
    @JsonIgnore
    private List<Material> materials;

    @OneToMany(mappedBy = "syllabus", cascade = CascadeType.ALL)
    @ToString.Exclude
    @JsonIgnore
    private List<SessionPlan> sessionPlans;

    @OneToMany(mappedBy = "syllabus", cascade = CascadeType.ALL)
    @ToString.Exclude
    @JsonIgnore
    private List<Assessment> assessments;

    @OneToMany(mappedBy = "syllabus", cascade = CascadeType.ALL)
    @ToString.Exclude
    @JsonIgnore
    private List<CLO> clos;

    @OneToMany(mappedBy = "syllabus", cascade = CascadeType.ALL)
    @ToString.Exclude
    @JsonIgnore
    private List<ReviewComment> reviewComments;

    @OneToMany(mappedBy = "syllabus", cascade = CascadeType.ALL)
    @ToString.Exclude
    @JsonIgnore
    private List<SyllabusWorkflowHistory> workflowHistories;

    @OneToMany(mappedBy = "syllabus", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @OrderBy("createdAt ASC")
    @ToString.Exclude
    @JsonIgnore
    private List<AITask> aiTasks;

    @OneToMany(mappedBy = "syllabus", cascade = CascadeType.ALL)
    @ToString.Exclude
    @JsonIgnore
    private List<Notification> notifications;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (currentStatus == null) {
            currentStatus = SyllabusStatus.DRAFT;
        }
        if (versionNo == null) {
            versionNo = 1;
        }
        if (isLatestVersion == null) {
            isLatestVersion = true;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum SyllabusStatus {
        DRAFT,
        PENDING_REVIEW,
        PENDING_APPROVAL,
        APPROVED,
        PUBLISHED,
        ARCHIVED
    }
}