package com.smd.core.controller;

import com.smd.core.dto.AssignRoleRequest;
import com.smd.core.dto.UserRoleResponse;
import com.smd.core.entity.Role;
import com.smd.core.service.RoleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/roles")
@Tag(name = "Role Management", description = "APIs for managing user roles and permissions")
@SecurityRequirement(name = "bearerAuth")
public class RoleController {

    @Autowired
    private RoleService roleService;

    @GetMapping
    @Operation(summary = "Get all available roles", description = "Retrieve list of all roles in the system")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Roles retrieved successfully")
    })
    public ResponseEntity<List<Role>> getAllRoles() {
        return ResponseEntity.ok(roleService.getAllRoles());
    }

    @PostMapping
    @Operation(summary = "Create a new role", description = "Create a new role in the system (Admin only)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Role created successfully"),
        @ApiResponse(responseCode = "400", description = "Role already exists")
    })
    public ResponseEntity<Role> createRole(
            @Parameter(description = "Role name to create (e.g., ADMIN, LECTURER)")
            @RequestParam String roleName) {
        return ResponseEntity.ok(roleService.createRole(roleName));
    }

    @PostMapping("/assign")
    @Operation(
        summary = "Assign role to user",
        description = "Assign a specific role to a user. Only admins can perform this action."
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Role assigned successfully"),
        @ApiResponse(responseCode = "400", description = "User already has this role"),
        @ApiResponse(responseCode = "404", description = "User or role not found")
    })
    public ResponseEntity<UserRoleResponse> assignRole(@RequestBody AssignRoleRequest request) {
        return ResponseEntity.ok(roleService.assignRoleToUser(request));
    }

    @DeleteMapping("/remove")
    @Operation(
        summary = "Remove role from user",
        description = "Remove a specific role from a user. Only admins can perform this action."
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Role removed successfully"),
        @ApiResponse(responseCode = "404", description = "User or role not found")
    })
    public ResponseEntity<UserRoleResponse> removeRole(
            @Parameter(description = "User ID", required = true)
            @RequestParam Long userId,
            
            @Parameter(description = "Role name to remove", required = true)
            @RequestParam String roleName) {
        return ResponseEntity.ok(roleService.removeRoleFromUser(userId, roleName));
    }

    @GetMapping("/user/{userId}")
    @Operation(
        summary = "Get user's roles",
        description = "Retrieve all roles assigned to a specific user"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "User roles retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "User not found")
    })
    public ResponseEntity<UserRoleResponse> getUserRoles(
            @Parameter(description = "User ID", required = true)
            @PathVariable Long userId) {
        return ResponseEntity.ok(roleService.getUserRoles(userId));
    }

    @PostMapping("/initialize")
    @Operation(
        summary = "Initialize default roles",
        description = "Create default roles (ADMIN, LECTURER, HEAD_OF_DEPARTMENT, ACADEMIC_AFFAIRS, STUDENT) if they don't exist"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Default roles initialized")
    })
    public ResponseEntity<String> initializeDefaultRoles() {
        roleService.initializeDefaultRoles();
        return ResponseEntity.ok("Default roles initialized successfully");
    }
}
