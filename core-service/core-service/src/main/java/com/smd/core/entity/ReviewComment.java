package com.smd.core.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

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
    
    // Edit tracking
    @Column(name = "edited_at")
    private LocalDateTime editedAt;
    
    @Column(name = "is_edited")
    @Builder.Default
    private boolean isEdited = false;
    
    // Thread/Reply support (self-referencing)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_comment_id")
    @ToString.Exclude
    @JsonIgnore
    private ReviewComment parentComment;
    
    @OneToMany(mappedBy = "parentComment", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    @JsonIgnore
    @Builder.Default
    private List<ReviewComment> replies = new ArrayList<>();
    
    @Column(name = "reply_count")
    @Builder.Default
    private int replyCount = 0;
    
    // Status management
    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20)
    @Builder.Default
    private CommentStatus status = CommentStatus.OPEN;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resolved_by_id")
    @ToString.Exclude
    @JsonIgnore
    private User resolvedBy;
    
    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;
    
    @Column(name = "resolution_note", columnDefinition = "TEXT")
    private String resolutionNote;
    
    // Context support (comment on specific sections)
    @Enumerated(EnumType.STRING)
    @Column(name = "context_type", length = 30)
    @Builder.Default
    private CommentContextType contextType = CommentContextType.SYLLABUS_GENERAL;
    
    @Column(name = "context_id")
    private Long contextId;
    
    @Column(name = "context_section")
    private String contextSection; // e.g., "CLO 1.2", "Week 3", "Assessment 1"

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) {
            status = CommentStatus.OPEN;
        }
        if (contextType == null) {
            contextType = CommentContextType.SYLLABUS_GENERAL;
        }
    }
    
    /**
     * Helper method to add a reply to this comment
     */
    public void addReply(ReviewComment reply) {
        replies.add(reply);
        reply.setParentComment(this);
        this.replyCount++;
    }
    
    /**
     * Helper method to remove a reply from this comment
     */
    public void removeReply(ReviewComment reply) {
        replies.remove(reply);
        reply.setParentComment(null);
        this.replyCount = Math.max(0, this.replyCount - 1);
    }
}
