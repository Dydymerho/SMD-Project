package com.smd.core.repository;

import com.smd.core.entity.CourseRelation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseRelationRepository extends JpaRepository<CourseRelation, Long> {
    
    /**
     * Tìm tất cả relationships của một môn học
     */
    List<CourseRelation> findByCourse_CourseId(Long courseId);
    
    /**
     * Tìm tất cả môn học liên quan đến một môn cụ thể
     */
    List<CourseRelation> findByRelatedCourse_CourseId(Long relatedCourseId);
    
    /**
     * Tìm relationships theo loại cụ thể
     */
    @Query("SELECT cr FROM CourseRelation cr WHERE cr.course.courseId = :courseId AND cr.relationType = :type")
    List<CourseRelation> findByCourseIdAndType(
            @Param("courseId") Long courseId, 
            @Param("type") CourseRelation.RelationType type);
    
    /**
     * Tìm tất cả prerequisites của một môn
     */
    @Query("SELECT cr FROM CourseRelation cr WHERE cr.course.courseId = :courseId AND cr.relationType = 'PREREQUISITE'")
    List<CourseRelation> findPrerequisitesByCourseId(@Param("courseId") Long courseId);
    
    /**
     * Tìm tất cả corequisites của một môn
     */
    @Query("SELECT cr FROM CourseRelation cr WHERE cr.course.courseId = :courseId AND cr.relationType = 'COREQUISITE'")
    List<CourseRelation> findCorequisitesByCourseId(@Param("courseId") Long courseId);
    
    /**
     * Kiểm tra xem relationship đã tồn tại chưa
     */
    @Query("SELECT COUNT(cr) > 0 FROM CourseRelation cr WHERE cr.course.courseId = :courseId " +
           "AND cr.relatedCourse.courseId = :relatedCourseId AND cr.relationType = :type")
    boolean existsRelationship(
            @Param("courseId") Long courseId,
            @Param("relatedCourseId") Long relatedCourseId,
            @Param("type") CourseRelation.RelationType type);
    
    /**
     * Tìm tất cả relationships trong một department
     */
    @Query("SELECT cr FROM CourseRelation cr WHERE cr.course.department.departmentId = :departmentId")
    List<CourseRelation> findByDepartmentId(@Param("departmentId") Long departmentId);
}
