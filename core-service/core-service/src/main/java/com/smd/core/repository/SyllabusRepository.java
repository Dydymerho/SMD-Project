package com.smd.core.repository;

import com.smd.core.entity.Syllabus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SyllabusRepository extends JpaRepository<Syllabus, Long> {
    
    // Check duplicate syllabus by course, academic year, and version
    boolean existsByCourse_CourseIdAndAcademicYearAndVersionNo(Long courseId, String academicYear, Integer versionNo);
    
    // Fallback search when Elasticsearch is unavailable
    List<Syllabus> findByAcademicYearContaining(String keyword);
}
