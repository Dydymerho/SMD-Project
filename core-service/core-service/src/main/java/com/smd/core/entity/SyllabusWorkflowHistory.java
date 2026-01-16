package com.smd.core.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "syllabus_workflow_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SyllabusWorkflowHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "history_id")
    private Long historyId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "syllabus_id", nullable = false)
    @ToString.Exclude
    @JsonIgnore
    private Syllabus syllabus;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "step_id", nullable = false)
    @ToString.Exclude
    @JsonIgnore
    private WorkflowStep workflowStep;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "action_by", nullable = false)
    @ToString.Exclude
    @JsonIgnore
    private User actionBy;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private WorkflowAction action;

    @Column(columnDefinition = "TEXT")
    private String comment;

    @Column(name = "action_time", nullable = false)
    private LocalDateTime actionTime;

    @PrePersist
    protected void onCreate() {
        actionTime = LocalDateTime.now();
    }

    public enum WorkflowAction {
        SUBMIT,
        APPROVE,
        REJECT,
        REQUEST_REVISION,
        PUBLISH,
        ARCHIVE
    }
}
