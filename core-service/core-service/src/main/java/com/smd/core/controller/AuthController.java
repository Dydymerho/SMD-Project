package com.smd.core.controller;

import com.smd.core.dto.LoginRequest;
import com.smd.core.dto.LoginResponse;
import com.smd.core.dto.RegisterRequest;
import com.smd.core.dto.UserResponse;
import com.smd.core.entity.User;
import com.smd.core.exception.ResourceNotFoundException;
import com.smd.core.repository.UserRepository;
import com.smd.core.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    /**
     * Login endpoint
     * POST /api/auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Register endpoint
     * POST /api/auth/register
     */
    @PostMapping("/register")
    public ResponseEntity<LoginResponse> register(@Valid @RequestBody RegisterRequest request) {
        LoginResponse response = authService.register(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Get Current User Info
     * GET /api/auth/me
     * Trả về thông tin user đang đăng nhập + Timezone + Country
     */
    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        // 1. Lấy thông tin User từ Database dựa vào username trong token
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", userDetails.getUsername()));

        // 2. Convert Entity sang UserResponse DTO
        // (Sử dụng Builder của UserResponse đã có)
        UserResponse userResponse = UserResponse.builder()
                .userId(user.getUserId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .status(user.getStatus())
                .roleName(user.getRole() != null ? user.getRole().getRoleName() : null)
                .roleId(user.getRole() != null ? user.getRole().getRoleId() : null)
                .departmentId(user.getDepartment() != null ? user.getDepartment().getDepartmentId() : null)
                .departmentName(user.getDepartment() != null ? user.getDepartment().getDeptName() : null)
                .build();

        // 3. Lấy thông tin Múi giờ và Thời gian hiện tại
        ZoneId zoneId = ZoneId.systemDefault(); // Lấy múi giờ của server (ví dụ: Asia/Ho_Chi_Minh)
        ZonedDateTime currentDateTime = ZonedDateTime.now(zoneId);

        // 4. Đóng gói kết quả trả về
        Map<String, Object> response = new HashMap<>();
        response.put("user", userResponse);
        response.put("timezone", zoneId.toString());
        response.put("country", "Vietnam"); // Hardcode hoặc dùng Locale.getDefault().getDisplayCountry()
        response.put("serverTime", currentDateTime.toString());

        return ResponseEntity.ok(response);
    }
}
