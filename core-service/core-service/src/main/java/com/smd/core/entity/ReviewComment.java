package com.smd.core.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "review_comment")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewComment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "comment_id")
    private Long commentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "syllabus_id", nullable = false)
    @ToString.Exclude
    @JsonIgnore
    private Syllabus syllabus;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @ToString.Exclude
    @JsonIgnore
    private User user;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "edited_at")
    private LocalDateTime editedAt;

    @Column(name = "status", length = 50)
    private String status; // PENDING, RESOLVED, ARCHIVED

    @Column(name = "context_type", length = 100)
    private String contextType; // CLO, MODULE, ASSESSMENT, GENERAL

    @Column(name = "context_id")
    private Long contextId; // ID of the CLO, Module, Assessment, etc.

    @Column(name = "context_section", length = 255)
    private String contextSection; // Section reference (e.g., "Module 1", "Assessment 3")

    @Column(name = "parent_comment_id")
    private Long parentCommentId; // For nested comments/replies

    @Column(name = "reply_count")
    private Integer replyCount; // Count of replies to this comment

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resolved_by_id")
    @ToString.Exclude
    @JsonIgnore
    private User resolvedBy; // User who resolved the comment

    @Column(columnDefinition = "TEXT")
    private String resolutionNote; // Note explaining how the comment was resolved

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = "PENDING";
        }
        if (this.replyCount == null) {
            this.replyCount = 0;
        }
    }
}
