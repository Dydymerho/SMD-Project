package com.smd.core.dto;

import com.smd.core.entity.Notification;
import com.smd.core.entity.Syllabus;
import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {
    private Long notificationId;
    private String type;
    private String title;
    private String message;
    private Boolean isRead;
    private LocalDateTime readAt;
    private String actionUrl;
    private String triggeredBy;
    private LocalDateTime createdAt;
    
    // Syllabus info
    private Long syllabusId;
    private String courseName;
    private String courseCode;
    private String academicYear;
    private Integer versionNo;

    public static NotificationResponse fromEntity(Notification notification) {
        NotificationResponseBuilder builder = NotificationResponse.builder()
            .notificationId(notification.getNotificationId())
            .type(notification.getType().name())
            .title(notification.getTitle())
            .message(notification.getMessage())
            .isRead(notification.getIsRead())
            .readAt(notification.getReadAt())
            .actionUrl(notification.getActionUrl())
            .triggeredBy(notification.getTriggeredBy())
            .createdAt(notification.getCreatedAt());

        if (notification.getSyllabus() != null) {
            Syllabus syllabus = notification.getSyllabus();
            builder.syllabusId(syllabus.getSyllabusId())
                   .courseName(syllabus.getCourse().getCourseName())
                   .courseCode(syllabus.getCourse().getCourseCode())
                   .academicYear(syllabus.getAcademicYear())
                   .versionNo(syllabus.getVersionNo());
        }

        return builder.build();
    }
}
