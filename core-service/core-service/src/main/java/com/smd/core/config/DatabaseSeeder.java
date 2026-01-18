package com.smd.core.config;

import com.smd.core.entity.Role;
import com.smd.core.entity.User;
import com.smd.core.entity.UserRole;
import com.smd.core.repository.RoleRepository;
import com.smd.core.repository.UserRepository;
import com.smd.core.repository.UserRoleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class DatabaseSeeder implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        log.info("🚀 STARTING DATABASE SEEDING...");

        // 1. Khởi tạo danh sách Role chuẩn
        initRoles();

        // 2. Khởi tạo danh sách User và gán Role tương ứng
        // Mật khẩu chung cho tất cả: Password123
        String commonPass = "Password123";

        initUser("admin", "admin@smd.edu.vn", "System Administrator", commonPass, "ADMIN");
        initUser("lecturer", "lecturer@smd.edu.vn", "Lecturer User", commonPass, "LECTURER");
        initUser("head_dept", "head.dept@smd.edu.vn", "Head of Department", commonPass, "HEAD_OF_DEPARTMENT");
        initUser("academic", "academic@smd.edu.vn", "Academic Affairs Officer", commonPass, "ACADEMIC_AFFAIRS");
        initUser("principal", "principal@smd.edu.vn", "Principal User", commonPass, "PRINCIPAL");
        initUser("student", "student@smd.edu.vn", "Student User", commonPass, "STUDENT");

        log.info("✅ DATABASE SEEDING COMPLETED.");
    }

    private void initRoles() {
        String[] roles = {
            "ADMIN", "LECTURER", "HEAD_OF_DEPARTMENT", 
            "ACADEMIC_AFFAIRS", "PRINCIPAL", "STUDENT"
        };

        for (String roleName : roles) {
            if (roleRepository.findByRoleName(roleName).isEmpty()) {
                Role role = Role.builder().roleName(roleName).build();
                roleRepository.save(role);
                log.info("   + Created Role: {}", roleName);
            }
        }
    }

    private void initUser(String username, String email, String fullName, String rawPassword, String roleName) {
        // Kiểm tra nếu user đã tồn tại thì bỏ qua để tránh trùng lặp
        if (userRepository.findByUsername(username).isPresent()) {
            return;
        }

        // 1. Tạo User
        User user = User.builder()
                .username(username)
                .email(email)
                .fullName(fullName)
                .passwordHash(passwordEncoder.encode(rawPassword)) // Hash mật khẩu chuẩn theo môi trường hiện tại
                .status(User.UserStatus.ACTIVE) // Đảm bảo Enum UserStatus đúng với Entity của bạn
                .createdAt(LocalDateTime.now())
                .build();
        
        User savedUser = userRepository.save(user);

        // 2. Tìm Role tương ứng
        Role role = roleRepository.findByRoleName(roleName)
                .orElseThrow(() -> new RuntimeException("Role not found: " + roleName));

        // 3. Tạo liên kết User - Role
        UserRole userRole = UserRole.builder()
                .user(savedUser)
                .role(role)
                .build();

        userRoleRepository.save(userRole);
        
        log.info("   + Created User: {} | Role: {}", username, roleName);
    }
}