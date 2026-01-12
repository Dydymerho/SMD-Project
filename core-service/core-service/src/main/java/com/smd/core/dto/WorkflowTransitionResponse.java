package com.smd.core.dto;

import com.smd.core.entity.Syllabus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowTransitionResponse {
    private Long syllabusId;
    private String previousStatus;
    private String newStatus;
    private String actionBy;
    private String action;
    private String comment;
    private LocalDateTime actionTime;
    private String message;
    
    public static WorkflowTransitionResponse fromSyllabus(
            Syllabus syllabus, 
            String previousStatus, 
            String action,
            String actionBy,
            String comment,
            String message) {
        return WorkflowTransitionResponse.builder()
                .syllabusId(syllabus.getSyllabusId())
                .previousStatus(previousStatus)
                .newStatus(syllabus.getCurrentStatus().name())
                .actionBy(actionBy)
                .action(action)
                .comment(comment)
                .actionTime(LocalDateTime.now())
                .message(message)
                .build();
    }
}
