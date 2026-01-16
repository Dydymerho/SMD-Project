package com.smd.core.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.smd.core.entity.SyllabusAuditLog;
import lombok.*;

import java.time.LocalDateTime;

/**
 * DTO for Audit Log responses
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AuditLogResponse {
    
    private Long id;
    private Long syllabusId;
    private String actionType;
    private String performedBy;
    private String performedByRole;
    private String oldStatus;
    private String newStatus;
    private String comments;
    private String changedFields;
    private String ipAddress;
    private String userAgent;
    private LocalDateTime timestamp;
    private String additionalData;
    
    // Course info for context
    private String courseCode;
    private String courseName;
    private String academicYear;
    private Integer versionNo;
    
    /**
     * Convert entity to DTO
     */
    public static AuditLogResponse fromEntity(SyllabusAuditLog entity) {
        AuditLogResponseBuilder builder = AuditLogResponse.builder()
                .id(entity.getId())
                .syllabusId(entity.getSyllabus().getSyllabusId())
                .actionType(entity.getActionType())
                .performedBy(entity.getPerformedBy())
                .performedByRole(entity.getPerformedByRole())
                .oldStatus(entity.getOldStatus())
                .newStatus(entity.getNewStatus())
                .comments(entity.getComments())
                .changedFields(entity.getChangedFields())
                .ipAddress(entity.getIpAddress())
                .userAgent(entity.getUserAgent())
                .timestamp(entity.getTimestamp())
                .additionalData(entity.getAdditionalData());
        
        // Add course context if available
        if (entity.getSyllabus().getCourse() != null) {
            builder.courseCode(entity.getSyllabus().getCourse().getCourseCode())
                   .courseName(entity.getSyllabus().getCourse().getCourseName());
        }
        
        builder.academicYear(entity.getSyllabus().getAcademicYear())
               .versionNo(entity.getSyllabus().getVersionNo());
        
        return builder.build();
    }
}
