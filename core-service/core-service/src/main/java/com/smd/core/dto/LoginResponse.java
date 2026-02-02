package com.smd.core.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    private String token;
    private String type = "Bearer";
    private Long userId;
    private String username;
    private String fullName;
    private String email;
    private String roleName;
    private Long roleId;
    
    public LoginResponse(String token, Long userId, String username, String fullName, String email, String roleName, Long roleId) {
        this.token = token;
        this.type = "Bearer";
        this.userId = userId;
        this.username = username;
        this.fullName = fullName;
        this.email = email;
        this.roleName = roleName;
        this.roleId = roleId;
    }
}
