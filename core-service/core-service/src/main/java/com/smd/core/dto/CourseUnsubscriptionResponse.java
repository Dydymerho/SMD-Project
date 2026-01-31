package com.smd.core.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseUnsubscriptionResponse {
    private String message;
    private CourseSimpleDto course;
    private LocalDateTime unsubscribedAt;
}
