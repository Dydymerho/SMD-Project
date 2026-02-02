package com.smd.core.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for representing a single row of user data from Excel import
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserImportRow {
    private Integer rowNumber;
    private String username;
    private String fullName;
    private String email;
    private String roleCode;
    private String departmentCode;
}
