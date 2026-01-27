package com.smd.core.repository;

import com.smd.core.entity.ReviewComment;
import com.smd.core.entity.Syllabus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewCommentRepository extends JpaRepository<ReviewComment, Long> {
    
    /**
     * Find all comments for a specific syllabus, ordered by creation date (newest first)
     */
    Page<ReviewComment> findBySyllabusOrderByCreatedAtDesc(Syllabus syllabus, Pageable pageable);
    
    /**
     * Find all comments for a specific syllabus
     */
    List<ReviewComment> findBySyllabusOrderByCreatedAtDesc(Syllabus syllabus);
    
    /**
     * Count comments for a specific syllabus
     */
    long countBySyllabus(Syllabus syllabus);
    
    /**
     * Find recent comments by syllabus ID
     */
    List<ReviewComment> findTop5BySyllabus_SyllabusIdOrderByCreatedAtDesc(Long syllabusId);
}
