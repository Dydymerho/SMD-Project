package com.smd.core.repository;

import com.smd.core.entity.Assessment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssessmentRepository extends JpaRepository<Assessment, Long> {
    List<Assessment> findBySyllabus_SyllabusId(Long syllabusId);
}
