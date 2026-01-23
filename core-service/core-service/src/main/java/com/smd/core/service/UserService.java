package com.smd.core.service;

import com.smd.core.dto.UserRoleResponse;
import com.smd.core.entity.User;
import com.smd.core.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    // Lấy toàn bộ người dùng cho trang System Management
    @Transactional(readOnly = true)
    public List<UserRoleResponse> getAllUsersWithRoles() {
        try {
            return userRepository.findAll().stream().map(user -> {
                UserRoleResponse response = new UserRoleResponse();
                response.setUserId(user.getId());
                response.setFullName(user.getFullName());
                response.setUsername(user.getUsername());
                response.setEmail(user.getEmail());
                response.setStatus(user.getStatus().toString());

                if (user.getUserRoles() != null) {
                response.setRoles(user.getUserRoles().stream()
                    .map(ur -> ur.getRole().getName())
                    .collect(Collectors.toList()));
            }
                return response;
            }).collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("Lỗi tại UserService: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    public void updateStatus(Long id, String status) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với ID: " + id));
        user.setStatus(status);
        userRepository.save(user);
    }
}