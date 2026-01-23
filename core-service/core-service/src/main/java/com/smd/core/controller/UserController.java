package com.smd.core.controller;

import com.smd.core.dto.UserRoleResponse;
import com.smd.core.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<List<UserRoleResponse>> getAllUsers() {
        List<UserRoleResponse> users = userService.getAllUsersWithRoles();
        return ResponseEntity.ok(users);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Void> updateUserStatus(@PathVariable Long id, @RequestParam String status) {
        userService.updateStatus(id, status);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/roles")
    public ResponseEntity<Void> updateUserRoles(@PathVariable Long id, @RequestBody List<String> roles) {
        userService.assignRoles(id, roles);
        return ResponseEntity.ok().build();
    }
}