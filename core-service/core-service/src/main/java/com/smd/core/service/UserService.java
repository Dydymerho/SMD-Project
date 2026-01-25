package com.smd.core.service;

import com.smd.core.dto.UpdateUserRequest;
import com.smd.core.dto.UserResponse;
import com.smd.core.entity.Department;
import com.smd.core.entity.Role;
import com.smd.core.entity.User;
import com.smd.core.entity.UserRole;
import com.smd.core.exception.DuplicateResourceException;
import com.smd.core.exception.ResourceNotFoundException;
import com.smd.core.repository.RoleRepository;
import com.smd.core.repository.UserRepository;
import com.smd.core.repository.UserRoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRoleRepository userRoleRepository;

    /**
     * Get all users
     */
    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        List<User> users = userRepository.findAll();
        return users.stream()
                .map(this::convertToUserResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get user by ID
     */
    @Transactional(readOnly = true)
    public UserResponse getUserById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "userId", userId));
        return convertToUserResponse(user);
    }

    /**
     * Update user
     */
    @Transactional
    public UserResponse updateUser(Long userId, UpdateUserRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "userId", userId));

        // Check if email is being changed and if it's already in use
        if (!user.getEmail().equals(request.getEmail()) && 
            userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("User", "email", request.getEmail());
        }

        // Update basic info
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());

        // Update department if provided
        if (request.getDepartmentId() != null) {
            Department department = new Department();
            department.setDepartmentId(request.getDepartmentId());
            user.setDepartment(department);
        }

        // Update status if provided
        if (request.getStatus() != null) {
            user.setStatus(request.getStatus());
        }

        // Update role if provided
        if (request.getRoleId() != null) {
            Role role = roleRepository.findById(request.getRoleId())
                    .orElseThrow(() -> new ResourceNotFoundException("Role", "roleId", request.getRoleId()));
            
            // Remove existing roles
            if (user.getUserRoles() != null) {
                userRoleRepository.deleteAll(user.getUserRoles());
                user.getUserRoles().clear();
            } else {
                user.setUserRoles(new ArrayList<>());
            }
            
            // Add new role
            UserRole userRole = new UserRole();
            userRole.setUser(user);
            userRole.setRole(role);
            user.getUserRoles().add(userRole);
        }

        User updatedUser = userRepository.save(user);
        return convertToUserResponse(updatedUser);
    }

    /**
     * Delete user
     */
    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "userId", userId));
        userRepository.delete(user);
    }

    /**
     * Convert User entity to UserResponse DTO
     */
    private UserResponse convertToUserResponse(User user) {
        UserResponse response = new UserResponse();
        response.setUserId(user.getUserId());
        response.setUsername(user.getUsername());
        response.setFullName(user.getFullName());
        response.setEmail(user.getEmail());
        response.setStatus(user.getStatus());

        // Get role information
        if (user.getRole() != null) {
            response.setRoleName(user.getRole().getRoleName());
            response.setRoleId(user.getRole().getRoleId());
        }

        // Get department information
        if (user.getDepartment() != null) {
            response.setDepartmentId(user.getDepartment().getDepartmentId());
            response.setDepartmentName(user.getDepartment().getDeptName());
        }

        return response;
    }
}
