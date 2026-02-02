package com.smd.core.dto;

import com.smd.core.entity.Assessment;
import com.smd.core.entity.CourseRelation; // [Mới] Import Entity
import com.smd.core.entity.Material;
import com.smd.core.entity.SessionPlan;
import com.smd.core.entity.Syllabus;
import lombok.*;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * DTO for returning complete syllabus details including related data
 * Used for mobile SubjectDetailScreen
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SyllabusDetailResponse {
        
    // Basic Syllabus Information
        private Long id;
        private String courseCode;
        private String courseName;
        private String deptName;
        private String aiSumary;
        private String lecturerName;
        private Integer credit;
        private String academicYear;
    private String type;  // Type of syllabus (e.g., "Chính quy", "Liên thông")
    private String description;  // Description of the syllabus
    private List<String> target;  // Learning objectives/targets
        
    // Related Data
        private List<SessionPlanResponse> sessionPlans;
        private List<AssessmentResponse> assessments;
        private List<MaterialResponse> materials;

        // [Mới] Danh sách môn học liên quan (Môn tiên quyết, song hành...)
        private List<CourseRelationResponse> courseRelations;
        
        /**
         * Convert Syllabus entity and related data to SyllabusDetailResponse DTO
         */
        public static SyllabusDetailResponse fromEntity(
                Syllabus syllabus,
                List<SessionPlan> sessionPlans,
                List<Assessment> assessments,
                List<Material> materials) {
        
        Long syllabusId = syllabus.getSyllabusId();
        
        // Convert SessionPlans to DTOs
        List<SessionPlanResponse> sessionPlanResponses = sessionPlans.stream()
                .map(sp -> SessionPlanResponse.builder()
                        .sessionId(sp.getSessionId())
                        .syllabusId(syllabusId)
                        .weekNo(sp.getWeekNo())
                        .topic(sp.getTopic())
                        .teachingMethod(sp.getTeachingMethod())
                        .build())
                .collect(Collectors.toList());
        
        // Convert Assessments to DTOs
        List<AssessmentResponse> assessmentResponses = assessments.stream()
                .map(a -> AssessmentResponse.builder()
                        .assessmentId(a.getAssessmentId())
                        .syllabusId(syllabusId)
                        .name(a.getName())
                        .weightPercent(a.getWeightPercent())
                        .criteria(a.getCriteria())
                        .build())
                .collect(Collectors.toList());
        
        // Convert Materials to DTOs
        List<MaterialResponse> materialResponses = materials.stream()
                .map(m -> MaterialResponse.builder()
                        .materialId(m.getMaterialId())
                        .syllabusId(syllabusId)
                        .title(m.getTitle())
                        .author(m.getAuthor())
                        .materialType(m.getMaterialType())
                        .build())
                .collect(Collectors.toList());

        // [Mới] Convert Course Relations to DTOs
        List<CourseRelationResponse> relationResponses = new ArrayList<>();
        if (syllabus.getCourse() != null && syllabus.getCourse().getPrerequisiteRelations() != null) {
                relationResponses = syllabus.getCourse().getPrerequisiteRelations().stream()
                .map(rel -> CourseRelationResponse.builder()
                        .relationId(rel.getRelationId())
                        .relationType(rel.getRelationType())
                        .relatedCourse(CourseResponse.builder()
                        .courseId(rel.getRelatedCourse().getCourseId())
                        .courseCode(rel.getRelatedCourse().getCourseCode())
                        .courseName(rel.getRelatedCourse().getCourseName())
                        .credits(rel.getRelatedCourse().getCredits())
                        .department(rel.getRelatedCourse().getDepartment() != null ? 
                                DepartmentSimpleDto.builder()
                                .departmentId(rel.getRelatedCourse().getDepartment().getDepartmentId())
                                .deptName(rel.getRelatedCourse().getDepartment().getDeptName())
                                .build() : null)
                        .build())
                        .build())
                .collect(Collectors.toList());
        }
        
        // Get AI summary from latest AI task
        String aiSummary = null;
        if (syllabus.getAiTasks() != null && !syllabus.getAiTasks().isEmpty()) {
                aiSummary = syllabus.getAiTasks().get(syllabus.getAiTasks().size() - 1).getResultSummary();
        }
        
        // Build and return response
        return SyllabusDetailResponse.builder()
                .id(syllabusId)
                .courseCode(syllabus.getCourse().getCourseCode())
                .courseName(syllabus.getCourse().getCourseName())
                .deptName(syllabus.getCourse().getDepartment() != null ? 
                        syllabus.getCourse().getDepartment().getDeptName() : null)
                .aiSumary(aiSummary)
                .lecturerName(syllabus.getLecturer().getFullName())
                .credit(syllabus.getCourse().getCredits())
                .academicYear(syllabus.getAcademicYear())
                .type(syllabus.getCourse().getCourseType() != null ? syllabus.getCourse().getCourseType().name(): null)  // Using status as type for now
                .description(syllabus.getDescription())
                .target(new ArrayList<>())  // Empty list for now, can be populated if target field exists
                .sessionPlans(sessionPlanResponses)
                .assessments(assessmentResponses)
                .materials(materialResponses)
                .courseRelations(relationResponses) // [Mới] Thêm vào builder
                .build();
        }
}
