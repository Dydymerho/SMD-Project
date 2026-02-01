package com.smd.core.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Response DTO for bulk user import operation
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BulkUserImportResponse {
    private Integer totalRows;
    private Integer successCount;
    private Integer errorCount;
    private List<UserImportError> errors;
    private String message;
}
