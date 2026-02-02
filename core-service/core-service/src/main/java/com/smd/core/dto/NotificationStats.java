package com.smd.core.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationStats {
    private Long totalUnread;
    private Long pendingReviews;
    private Long pendingApprovals;
    private Long rejectedSyllabuses;
}
