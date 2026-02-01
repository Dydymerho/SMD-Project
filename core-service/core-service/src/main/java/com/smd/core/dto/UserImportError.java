package com.smd.core.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for representing validation errors during bulk user import
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserImportError {
    private Integer rowNumber;
    private String username;
    private String fullName;
    private String email;
    private String roleCode;
    private String departmentCode;
    private String errorMessage;
}
