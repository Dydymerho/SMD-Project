package com.smd.core.dto;

import com.smd.core.entity.Syllabus;
import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SyllabusResponse {
    
    private Long syllabusId;
    private Long courseId;
    private String courseName;
    private String courseCode;
    private Long lecturerId;
    private String lecturerName;
    private String academicYear;
    private Integer versionNo;
    private String currentStatus;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime publishedAt;
    private LocalDateTime archivedAt;
    private Boolean isLatestVersion;
    private Long previousVersionId;
    private String versionNotes;
    private String pdfFileName;
    private LocalDateTime pdfUploadedAt;
    private Long programId;
    private String programName;
    
    public static SyllabusResponse fromEntity(Syllabus syllabus) {
        return SyllabusResponse.builder()
                .syllabusId(syllabus.getSyllabusId())
                .courseId(syllabus.getCourse().getCourseId())
                .courseName(syllabus.getCourse().getCourseName())
                .courseCode(syllabus.getCourse().getCourseCode())
                .lecturerId(syllabus.getLecturer().getUserId())
                .lecturerName(syllabus.getLecturer().getFullName())
                .academicYear(syllabus.getAcademicYear())
                .versionNo(syllabus.getVersionNo())
                .currentStatus(syllabus.getCurrentStatus().name())
                .createdAt(syllabus.getCreatedAt())
                .updatedAt(syllabus.getUpdatedAt())
                .publishedAt(syllabus.getPublishedAt())
                .archivedAt(syllabus.getArchivedAt())
                .isLatestVersion(syllabus.getIsLatestVersion())
                .previousVersionId(syllabus.getPreviousVersionId())
                .versionNotes(syllabus.getVersionNotes())
                .pdfFileName(syllabus.getPdfFileName())
                .pdfUploadedAt(syllabus.getPdfUploadedAt())
                .programId(syllabus.getProgram() != null ? syllabus.getProgram().getProgramId() : null)
                .programName(syllabus.getProgram() != null ? syllabus.getProgram().getProgramName() : null)
                .build();
    }
}
