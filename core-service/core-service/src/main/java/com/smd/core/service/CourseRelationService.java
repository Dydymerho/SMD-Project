package com.smd.core.service;

import com.smd.core.dto.CourseRelationshipDto;
import com.smd.core.dto.CourseTreeNodeDto;
import com.smd.core.entity.Course;
import com.smd.core.entity.CourseRelation;
import com.smd.core.exception.ResourceNotFoundException;
import com.smd.core.exception.ValidationException;
import com.smd.core.repository.CourseRelationRepository;
import com.smd.core.repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CourseRelationService {
    
    private final CourseRelationRepository relationRepository;
    private final CourseRepository courseRepository;
    
    /**
     * Tạo mới một relationship giữa 2 môn học
     */
    @Transactional
    public CourseRelationshipDto createRelationship(CourseRelationshipDto dto) {
        log.info("Creating course relationship: {} -> {}, type: {}", 
                dto.getCourseId(), dto.getRelatedCourseId(), dto.getRelationType());
        
        // Validate courses exist
        Course course = courseRepository.findById(dto.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course not found: " + dto.getCourseId()));
        
        Course relatedCourse = courseRepository.findById(dto.getRelatedCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Related course not found: " + dto.getRelatedCourseId()));
        
        // Validate không tạo relationship với chính nó
        if (dto.getCourseId().equals(dto.getRelatedCourseId())) {
            throw new ValidationException("Course cannot have relationship with itself");
        }
        
        // Parse relation type
        CourseRelation.RelationType relationType;
        try {
            relationType = CourseRelation.RelationType.valueOf(dto.getRelationType().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ValidationException("Invalid relation type: " + dto.getRelationType());
        }
        
        // Kiểm tra relationship đã tồn tại chưa
        if (relationRepository.existsRelationship(dto.getCourseId(), dto.getRelatedCourseId(), relationType)) {
            throw new ValidationException("Relationship already exists");
        }
        
        // Kiểm tra circular dependency cho PREREQUISITE
        if (relationType == CourseRelation.RelationType.PREREQUISITE) {
            if (hasCircularDependency(dto.getCourseId(), dto.getRelatedCourseId())) {
                throw new ValidationException("Creating this relationship would cause a circular dependency");
            }
        }
        
        // Tạo relationship
        CourseRelation relation = CourseRelation.builder()
                .course(course)
                .relatedCourse(relatedCourse)
                .relationType(relationType)
                .build();
        
        relation = relationRepository.save(relation);
        log.info("Created relationship with ID: {}", relation.getRelationId());
        
        return convertToDto(relation);
    }
    
    /**
     * Lấy tất cả relationships của một môn học
     */
    public List<CourseRelationshipDto> getCourseRelationships(Long courseId) {
        log.info("Getting relationships for course: {}", courseId);
        
        List<CourseRelation> relations = relationRepository.findByCourse_CourseId(courseId);
        return relations.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Xây dựng cây quan hệ của một môn học
     */
    public CourseTreeNodeDto getCourseTree(Long courseId) {
        log.info("Building course tree for course: {}", courseId);
        
        Set<Long> visited = new HashSet<>();
        return buildCourseTree(courseId, visited, 0);
    }
    
    /**
     * Đệ quy xây dựng cây quan hệ
     */
    private CourseTreeNodeDto buildCourseTree(Long courseId, Set<Long> visited, int level) {
        // Tránh vòng lặp
        if (visited.contains(courseId)) {
            log.warn("Circular reference detected for course: {}", courseId);
            return null;
        }
        visited.add(courseId);
        
        // Lấy thông tin môn học
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found: " + courseId));
        
        // Tạo node hiện tại
        CourseTreeNodeDto node = CourseTreeNodeDto.builder()
                .courseId(course.getCourseId())
                .courseCode(course.getCourseCode())
                .courseName(course.getCourseName())
                .credits(course.getCredits())
                .courseType(course.getCourseType().name())
                .level(level)
                .build();
        
        // Build prerequisites
        List<CourseRelation> prerequisites = relationRepository.findPrerequisitesByCourseId(courseId);
        List<CourseTreeNodeDto> prerequisiteNodes = prerequisites.stream()
                .map(rel -> buildCourseTree(rel.getRelatedCourse().getCourseId(), new HashSet<>(visited), level + 1))
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
        node.setPrerequisites(prerequisiteNodes);
        
        // Build corequisites
        List<CourseRelation> corequisites = relationRepository.findCorequisitesByCourseId(courseId);
        List<CourseTreeNodeDto> corequisiteNodes = corequisites.stream()
                .map(rel -> buildCourseTree(rel.getRelatedCourse().getCourseId(), new HashSet<>(visited), level + 1))
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
        node.setCorequisites(corequisiteNodes);
        
        // Build equivalents
        List<CourseRelation> equivalents = relationRepository.findByCourseIdAndType(
                courseId, CourseRelation.RelationType.EQUIVALENT);
        List<CourseTreeNodeDto> equivalentNodes = equivalents.stream()
                .map(rel -> {
                    Course equivCourse = rel.getRelatedCourse();
                    return CourseTreeNodeDto.builder()
                            .courseId(equivCourse.getCourseId())
                            .courseCode(equivCourse.getCourseCode())
                            .courseName(equivCourse.getCourseName())
                            .credits(equivCourse.getCredits())
                            .courseType(equivCourse.getCourseType().name())
                            .level(level)
                            .build();
                })
                .collect(Collectors.toList());
        node.setEquivalents(equivalentNodes);
        
        return node;
    }
    
    /**
     * Kiểm tra circular dependency
     */
    public boolean hasCircularDependency(Long courseId, Long relatedCourseId) {
        Set<Long> visited = new HashSet<>();
        return dfsCheckCycle(relatedCourseId, courseId, visited);
    }
    
    /**
     * DFS để kiểm tra vòng lặp
     */
    private boolean dfsCheckCycle(Long currentId, Long targetId, Set<Long> visited) {
        if (currentId.equals(targetId)) {
            return true; // Tìm thấy vòng lặp
        }
        
        if (visited.contains(currentId)) {
            return false;
        }
        visited.add(currentId);
        
        // Kiểm tra tất cả prerequisites của currentId
        List<CourseRelation> prerequisites = relationRepository.findPrerequisitesByCourseId(currentId);
        
        for (CourseRelation rel : prerequisites) {
            if (dfsCheckCycle(rel.getRelatedCourse().getCourseId(), targetId, visited)) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Lấy danh sách courses có thể thêm làm prerequisite
     */
    public List<CourseRelationshipDto> getAvailablePrerequisites(Long courseId) {
        log.info("Getting available prerequisites for course: {}", courseId);
        
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found: " + courseId));
        
        // Lấy tất cả courses trong cùng department
        List<Course> allCourses = courseRepository.findByDepartment_DepartmentId(
                course.getDepartment().getDepartmentId());
        
        // Lấy các prerequisite đã có
        List<CourseRelation> existing = relationRepository.findPrerequisitesByCourseId(courseId);
        Set<Long> existingIds = existing.stream()
                .map(rel -> rel.getRelatedCourse().getCourseId())
                .collect(Collectors.toSet());
        
        // Filter: không phải chính nó, chưa là prerequisite, không tạo vòng lặp
        return allCourses.stream()
                .filter(c -> !c.getCourseId().equals(courseId))
                .filter(c -> !existingIds.contains(c.getCourseId()))
                .filter(c -> !hasCircularDependency(courseId, c.getCourseId()))
                .map(c -> CourseRelationshipDto.builder()
                        .courseId(courseId)
                        .courseCode(course.getCourseCode())
                        .courseName(course.getCourseName())
                        .relatedCourseId(c.getCourseId())
                        .relatedCourseCode(c.getCourseCode())
                        .relatedCourseName(c.getCourseName())
                        .relationType("PREREQUISITE")
                        .build())
                .collect(Collectors.toList());
    }
    
    /**
     * Xóa relationship
     */
    @Transactional
    public void deleteRelationship(Long relationId) {
        log.info("Deleting relationship: {}", relationId);
        
        if (!relationRepository.existsById(relationId)) {
            throw new ResourceNotFoundException("Relationship not found: " + relationId);
        }
        
        relationRepository.deleteById(relationId);
    }
    
    /**
     * Lấy statistics về relationships
     */
    public Map<String, Object> getRelationshipStatistics(Long departmentId) {
        log.info("Getting relationship statistics for department: {}", departmentId);
        
        List<CourseRelation> relations = relationRepository.findByDepartmentId(departmentId);
        
        Map<String, Long> typeCount = relations.stream()
                .collect(Collectors.groupingBy(
                        rel -> rel.getRelationType().name(),
                        Collectors.counting()
                ));
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalRelationships", relations.size());
        stats.put("byType", typeCount);
        
        return stats;
    }
    
    /**
     * Convert entity to DTO
     */
    private CourseRelationshipDto convertToDto(CourseRelation relation) {
        return CourseRelationshipDto.builder()
                .relationId(relation.getRelationId())
                .courseId(relation.getCourse().getCourseId())
                .courseCode(relation.getCourse().getCourseCode())
                .courseName(relation.getCourse().getCourseName())
                .relatedCourseId(relation.getRelatedCourse().getCourseId())
                .relatedCourseCode(relation.getRelatedCourse().getCourseCode())
                .relatedCourseName(relation.getRelatedCourse().getCourseName())
                .relationType(relation.getRelationType().name())
                .build();
    }
}
