package com.smd.core.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "notification_id")
    private Long notificationId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @ToString.Exclude
    @JsonIgnoreProperties({"syllabuses", "reviewComments", "workflowHistories", "userRoles", "department", "passwordHash", "notifications"})
    private User recipient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "syllabus_id")
    @ToString.Exclude
    @JsonIgnoreProperties({"materials", "sessionPlans", "assessments", "clos", "reviewComments", "workflowHistories", "aiTasks", "notifications", "lecturer", "course"})
    private Syllabus syllabus;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private NotificationType type;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Column(name = "is_read", nullable = false)
    private Boolean isRead = false;

    @Column(name = "read_at")
    private LocalDateTime readAt;

    @Column(name = "action_url", length = 500)
    private String actionUrl;

    @Column(name = "triggered_by", length = 100)
    private String triggeredBy;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public enum NotificationType {
        SYLLABUS_SUBMITTED,
        SYLLABUS_APPROVED_BY_HOD,
        SYLLABUS_REJECTED_BY_HOD,
        SYLLABUS_APPROVED_BY_AA,
        SYLLABUS_REJECTED_BY_AA,
        SYLLABUS_PUBLISHED,
        SYLLABUS_REJECTED_BY_PRINCIPAL,
        PDF_UPLOADED,
        PDF_DELETED,
        COMMENT_ADDED,
        DEADLINE_REMINDER
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (isRead == null) {
            isRead = false;
        }
    }
}
