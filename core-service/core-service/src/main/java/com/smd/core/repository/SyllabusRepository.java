package com.smd.core.repository;

import com.smd.core.entity.Syllabus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SyllabusRepository extends JpaRepository<Syllabus, Long> {
    
    boolean existsBySubjectCode(String subjectCode);
}
