package com.smd.core.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "workflow_step")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkflowStep {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "step_id")
    private Long stepId;

    @Column(name = "step_name", nullable = false)
    private String stepName;

    @Column(name = "step_order", nullable = false)
    private Integer stepOrder;

    // Relationships
    @OneToMany(mappedBy = "workflowStep", cascade = CascadeType.ALL)
    @ToString.Exclude
    private List<SyllabusWorkflowHistory> workflowHistories;
}
