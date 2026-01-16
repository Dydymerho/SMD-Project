package com.smd.core.repository;

import com.smd.core.entity.SyllabusAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository for accessing audit log records
 */
@Repository
public interface SyllabusAuditLogRepository extends JpaRepository<SyllabusAuditLog, Long> {
    
    /**
     * Find all audit logs for a specific syllabus, ordered by most recent first
     */
    List<SyllabusAuditLog> findBySyllabus_SyllabusIdOrderByTimestampDesc(Long syllabusId);
    
    /**
     * Find all audit logs by a specific user, ordered by most recent first
     */
    List<SyllabusAuditLog> findByPerformedByOrderByTimestampDesc(String username);
    
    /**
     * Find all audit logs of a specific action type
     */
    List<SyllabusAuditLog> findByActionTypeOrderByTimestampDesc(String actionType);
    
    /**
     * Find audit logs within a date range
     */
    @Query("SELECT a FROM SyllabusAuditLog a WHERE a.timestamp BETWEEN :startDate AND :endDate ORDER BY a.timestamp DESC")
    List<SyllabusAuditLog> findByDateRange(
        @Param("startDate") LocalDateTime startDate, 
        @Param("endDate") LocalDateTime endDate
    );
    
    /**
     * Find workflow-specific actions for a syllabus (submit, approve, reject)
     */
    @Query("SELECT a FROM SyllabusAuditLog a WHERE a.syllabus.syllabusId = :syllabusId " +
           "AND (a.actionType LIKE '%SUBMIT%' OR a.actionType LIKE '%APPROVE%' OR a.actionType LIKE '%REJECT%') " +
           "ORDER BY a.timestamp ASC")
    List<SyllabusAuditLog> findWorkflowHistory(@Param("syllabusId") Long syllabusId);
    
    /**
     * Find all audit logs for a syllabus by a specific user
     */
    @Query("SELECT a FROM SyllabusAuditLog a WHERE a.syllabus.syllabusId = :syllabusId " +
           "AND a.performedBy = :username ORDER BY a.timestamp DESC")
    List<SyllabusAuditLog> findBySyllabusAndUser(
        @Param("syllabusId") Long syllabusId, 
        @Param("username") String username
    );
    
    /**
     * Count audit logs by action type
     */
    @Query("SELECT a.actionType, COUNT(a) FROM SyllabusAuditLog a GROUP BY a.actionType")
    List<Object[]> countByActionType();
    
    /**
     * Find recent audit logs (last N days)
     */
    @Query("SELECT a FROM SyllabusAuditLog a WHERE a.timestamp >= :cutoffDate ORDER BY a.timestamp DESC")
    List<SyllabusAuditLog> findRecentLogs(@Param("cutoffDate") LocalDateTime cutoffDate);
    
    /**
     * Find logs for syllabuses in a specific academic year
     */
    @Query("SELECT a FROM SyllabusAuditLog a WHERE a.syllabus.academicYear = :academicYear ORDER BY a.timestamp DESC")
    List<SyllabusAuditLog> findByAcademicYear(@Param("academicYear") String academicYear);
}
