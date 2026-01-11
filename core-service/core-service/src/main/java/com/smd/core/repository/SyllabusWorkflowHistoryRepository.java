package com.smd.core.repository;

import com.smd.core.entity.SyllabusWorkflowHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SyllabusWorkflowHistoryRepository extends JpaRepository<SyllabusWorkflowHistory, Long> {
    
    /**
     * Get all workflow history for a syllabus, ordered by time
     */
    List<SyllabusWorkflowHistory> findBySyllabus_SyllabusIdOrderByActionTimeDesc(Long syllabusId);
    
    /**
     * Get latest workflow action for a syllabus
     */
    @Query("SELECT h FROM SyllabusWorkflowHistory h WHERE h.syllabus.syllabusId = :syllabusId ORDER BY h.actionTime DESC LIMIT 1")
    SyllabusWorkflowHistory findLatestBySyllabusId(@Param("syllabusId") Long syllabusId);
    
    /**
     * Count actions by a specific user for a syllabus
     */
    Long countBySyllabus_SyllabusIdAndActionBy_UserId(Long syllabusId, Long userId);
}
