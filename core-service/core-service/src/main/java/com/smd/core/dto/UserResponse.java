package com.smd.core.dto;

import com.smd.core.entity.User.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private Long userId;
    private String username;
    private String fullName;
    private String email;
    private UserStatus status;
    private String roleName;
    private Long roleId;
    private Long departmentId;
    private String departmentName;
}
