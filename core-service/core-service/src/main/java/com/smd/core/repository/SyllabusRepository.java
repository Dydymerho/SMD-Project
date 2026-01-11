package com.smd.core.repository;

import com.smd.core.entity.Syllabus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SyllabusRepository extends JpaRepository<Syllabus, Long> {
    
    // Check duplicate syllabus by course, academic year, and version
    boolean existsByCourse_CourseIdAndAcademicYearAndVersionNo(Long courseId, String academicYear, Integer versionNo);
    
    // Fallback search when Elasticsearch is unavailable
    List<Syllabus> findByAcademicYearContaining(String keyword);
    
    // === VERSIONING QUERIES ===
    
    // Find specific version of a syllabus
    Optional<Syllabus> findByCourse_CourseIdAndAcademicYearAndVersionNo(Long courseId, String academicYear, Integer versionNo);
    
    // Get maximum version number for a course in an academic year
    @Query("SELECT COALESCE(MAX(s.versionNo), 0) FROM Syllabus s WHERE s.course.courseId = :courseId AND s.academicYear = :academicYear")
    Integer findMaxVersionNoForCourseAndYear(@Param("courseId") Long courseId, @Param("academicYear") String academicYear);
    
    // Get all versions of a syllabus for a course in an academic year (ordered by version)
    @Query("SELECT s FROM Syllabus s WHERE s.course.courseId = :courseId AND s.academicYear = :academicYear ORDER BY s.versionNo DESC")
    List<Syllabus> findAllVersionsByCourseAndYear(@Param("courseId") Long courseId, @Param("academicYear") String academicYear);
    
    // Get the latest version for a course and academic year
    @Query("SELECT s FROM Syllabus s WHERE s.course.courseId = :courseId AND s.academicYear = :academicYear AND s.isLatestVersion = true")
    Optional<Syllabus> findLatestVersionByCourseAndYear(@Param("courseId") Long courseId, @Param("academicYear") String academicYear);
    
    // Get all latest versions for a specific course (across all years)
    List<Syllabus> findByCourse_CourseIdAndIsLatestVersionTrue(Long courseId);
    
    // Update old versions to not be latest
    @Query("UPDATE Syllabus s SET s.isLatestVersion = false WHERE s.course.courseId = :courseId AND s.academicYear = :academicYear AND s.isLatestVersion = true")
    void updateOldVersionsAsNotLatest(@Param("courseId") Long courseId, @Param("academicYear") String academicYear);
    
    // Find syllabuses by status
    List<Syllabus> findByCurrentStatus(Syllabus.SyllabusStatus status);
}
