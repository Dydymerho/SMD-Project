package com.smd.core.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseSubscriptionResponse {
    private Long subscriptionId;
    private String message;
    private CourseSimpleDto course;
    private LocalDateTime subscribedAt;
}
