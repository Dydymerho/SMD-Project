package com.smd.core.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import com.fasterxml.jackson.annotation.JsonIgnore;

import java.time.LocalDateTime;

/**
 * Entity to track audit trail for all syllabus operations
 * Records who did what, when, where, and why
 */
@Entity
@Table(name = "syllabus_audit_logs", indexes = {
    @Index(name = "idx_syllabus_id", columnList = "syllabus_id"),
    @Index(name = "idx_performed_by", columnList = "performed_by"),
    @Index(name = "idx_action_type", columnList = "action_type"),
    @Index(name = "idx_timestamp", columnList = "timestamp")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SyllabusAuditLog {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "syllabus_id")  // Nullable - preserve audit trail after deletion
    @JsonIgnore
    private Syllabus syllabus;
    
    @Column(name = "action_type", nullable = false, length = 50)
    private String actionType;
    
    @Column(name = "performed_by", nullable = false, length = 100)
    private String performedBy;
    
    @Column(name = "performed_by_role", length = 50)
    private String performedByRole;
    
    @Column(name = "old_status", length = 50)
    private String oldStatus;
    
    @Column(name = "new_status", length = 50)
    private String newStatus;
    
    @Column(columnDefinition = "TEXT")
    private String comments;
    
    @Column(name = "changed_fields", columnDefinition = "TEXT")
    private String changedFields;
    
    @Column(name = "ip_address", length = 50)
    private String ipAddress;
    
    @Column(name = "user_agent", length = 500)
    private String userAgent;
    
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime timestamp;
    
    @Column(name = "additional_data", columnDefinition = "TEXT")
    private String additionalData;
    
    /**
     * Enum defining all possible audit actions in the system
     */
    public enum AuditAction {
        // Syllabus CRUD operations
        CREATE_SYLLABUS,
        UPDATE_SYLLABUS,
        DELETE_SYLLABUS,
        
        // PDF operations
        UPLOAD_PDF,
        DELETE_PDF,
        DOWNLOAD_PDF,
        
        // Workflow operations
        SUBMIT_FOR_REVIEW,
        HOD_APPROVE,
        HOD_REJECT,
        AA_APPROVE,
        AA_REJECT,
        PRINCIPAL_APPROVE,
        PRINCIPAL_REJECT,
        
        // Version operations
        CREATE_VERSION,
        ARCHIVE,
        RESTORE,
        
        // Other operations
        VIEW_SYLLABUS,
        EXPORT_SYLLABUS
    }
}
