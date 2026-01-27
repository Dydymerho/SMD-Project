package com.smd.core.dto;

import com.smd.core.entity.Report;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder // Tự động sinh ra Builder pattern
@NoArgsConstructor
@AllArgsConstructor
public class ReportResponse {
    private Long reportId;
    private String title;
    private String description;
    private String status;
    private LocalDateTime createdAt;
    
    // Thông tin người gửi
    private Long reporterId;
    private String reporterName;
    private String reporterEmail;

    /**
     * Phương thức tĩnh giúp chuyển đổi từ Entity sang DTO sử dụng Builder.
     * Giúp code trong Service ngắn gọn và dễ đọc hơn.
     */
    public static ReportResponse fromEntity(Report report) {
        // Khởi tạo builder
        ReportResponseBuilder builder = ReportResponse.builder()
                .reportId(report.getReportId())
                .title(report.getTitle())
                .description(report.getDescription())
                .status(report.getStatus().name())
                .createdAt(report.getCreatedAt());

        // Mapping thông tin người gửi nếu có
        if (report.getReporter() != null) {
            builder.reporterId(report.getReporter().getUserId())
                    .reporterName(report.getReporter().getFullName())
                    .reporterEmail(report.getReporter().getEmail());
        }

        return builder.build();
    }
}