package com.smd.core.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ai_task")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AITask {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ai_task_id")
    private Long aiTaskId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "syllabus_id", nullable = true)
    @ToString.Exclude
    @JsonIgnore
    private Syllabus syllabus;

    @Enumerated(EnumType.STRING)
    @Column(name = "task_type", nullable = false)
    private TaskType taskType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TaskStatus status;

    @Column(name = "result_summary", columnDefinition = "TEXT")
    private String resultSummary;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) {
            status = TaskStatus.PENDING;
        }
    }

    public enum TaskType {
        GENERATE_CLO,
        SUGGEST_ASSESSMENT,
        IMPROVE_CONTENT,
        GRAMMAR_CHECK,
        PLAGIARISM_CHECK,
        EXTRACT_SYLLABUS // <--- Thêm loại mới này
    }

    public enum TaskStatus {
        PENDING,
        SUCCESS,
        FAILURE,
        PROCESSING
    }
}
