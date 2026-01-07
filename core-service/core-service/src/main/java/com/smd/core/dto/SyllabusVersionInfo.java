package com.smd.core.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SyllabusVersionInfo {
    
    private Long syllabusId;
    private Integer versionNo;
    private String currentStatus;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime publishedAt;
    private LocalDateTime archivedAt;
    private Boolean isLatestVersion;
    private String versionNotes;
    private String lecturerName;
    private Boolean hasPdf;
}
