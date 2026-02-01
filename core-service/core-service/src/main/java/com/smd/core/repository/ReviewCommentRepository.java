package com.smd.core.repository;

import com.smd.core.entity.CommentContextType;
import com.smd.core.entity.CommentStatus;
import com.smd.core.entity.ReviewComment;
import com.smd.core.entity.Syllabus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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
    
    /**
     * Find all replies for a parent comment
     */
    @Query("SELECT rc FROM ReviewComment rc WHERE rc.parentComment.commentId = :parentId ORDER BY rc.createdAt ASC")
    Page<ReviewComment> findRepliesByParentId(@Param("parentId") Long parentId, Pageable pageable);
    
    /**
     * Find all replies for a parent comment (list)
     */
    @Query("SELECT rc FROM ReviewComment rc WHERE rc.parentComment.commentId = :parentId ORDER BY rc.createdAt ASC")
    List<ReviewComment> findRepliesByParentId(@Param("parentId") Long parentId);
    
    /**
     * Find comments by syllabus and context type
     */
    @Query("SELECT rc FROM ReviewComment rc WHERE rc.syllabus.syllabusId = :syllabusId AND rc.contextType = :contextType AND rc.parentComment IS NULL ORDER BY rc.createdAt DESC")
    Page<ReviewComment> findBySyllabusIdAndContextType(
        @Param("syllabusId") Long syllabusId,
        @Param("contextType") CommentContextType contextType,
        Pageable pageable
    );
    
    /**
     * Find comments by syllabus, context type and context ID
     */
    @Query("SELECT rc FROM ReviewComment rc WHERE rc.syllabus.syllabusId = :syllabusId AND rc.contextType = :contextType AND rc.contextId = :contextId AND rc.parentComment IS NULL ORDER BY rc.createdAt DESC")
    Page<ReviewComment> findBySyllabusIdAndContextTypeAndContextId(
        @Param("syllabusId") Long syllabusId,
        @Param("contextType") CommentContextType contextType,
        @Param("contextId") Long contextId,
        Pageable pageable
    );
    
    /**
     * Find top-level comments by syllabus (exclude replies)
     */
    @Query("SELECT rc FROM ReviewComment rc WHERE rc.syllabus.syllabusId = :syllabusId AND rc.parentComment IS NULL ORDER BY rc.createdAt DESC")
    Page<ReviewComment> findTopLevelCommentsBySyllabusId(@Param("syllabusId") Long syllabusId, Pageable pageable);
    
    /**
     * Find comments by status
     */
    @Query("SELECT rc FROM ReviewComment rc WHERE rc.syllabus.syllabusId = :syllabusId AND rc.status = :status AND rc.parentComment IS NULL ORDER BY rc.createdAt DESC")
    Page<ReviewComment> findBySyllabusIdAndStatus(
        @Param("syllabusId") Long syllabusId,
        @Param("status") CommentStatus status,
        Pageable pageable
    );
    
    /**
     * Count unresolved comments for a syllabus
     */
    @Query("SELECT COUNT(rc) FROM ReviewComment rc WHERE rc.syllabus.syllabusId = :syllabusId AND rc.status = 'OPEN' AND rc.parentComment IS NULL")
    long countUnresolvedComments(@Param("syllabusId") Long syllabusId);
}
