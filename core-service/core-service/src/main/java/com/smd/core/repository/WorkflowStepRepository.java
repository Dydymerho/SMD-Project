package com.smd.core.repository;

import com.smd.core.entity.WorkflowStep;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WorkflowStepRepository extends JpaRepository<WorkflowStep, Long> {
    
    /**
     * Find workflow step by name
     */
    Optional<WorkflowStep> findByStepName(String stepName);
    
    /**
     * Find workflow step by order
     */
    Optional<WorkflowStep> findByStepOrder(Integer stepOrder);
}
