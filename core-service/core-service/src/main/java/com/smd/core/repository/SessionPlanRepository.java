package com.smd.core.repository;

import com.smd.core.entity.SessionPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SessionPlanRepository extends JpaRepository<SessionPlan, Long> {
    List<SessionPlan> findBySyllabus_SyllabusId(Long syllabusId);
}
