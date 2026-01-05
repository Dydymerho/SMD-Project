package com.smd.core.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SyllabusUploadResponse {
    private Long syllabusId;
    private String fileName;
    private String filePath;
    private Long fileSize;
    private LocalDateTime uploadedAt;
    private String message;
}
