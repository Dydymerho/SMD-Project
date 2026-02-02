package com.smd.core.service;

import com.smd.core.dto.LoginRequest;
import com.smd.core.dto.LoginResponse;
import com.smd.core.dto.RegisterRequest;
import com.smd.core.entity.Department;
import com.smd.core.entity.User;
import com.smd.core.exception.DuplicateResourceException;
import com.smd.core.exception.InvalidDataException;
import com.smd.core.repository.UserRepository;
import com.smd.core.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    /**
     * Login user and return JWT token
     */
    @Transactional
    public LoginResponse login(LoginRequest request) {
        try {
            // Authenticate user
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    request.getUsername(),
                    request.getPassword()
                )
            );

            // Load user details
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();

            // Generate JWT token
            String token = jwtUtil.generateToken(userDetails);

            // Get user info
            User user = userRepository.findByUsername(request.getUsername())
                    .orElseThrow(() -> new InvalidDataException("username", request.getUsername(), "User không tồn tại"));

            // Get role information
            String roleName = null;
            Long roleId = null;
            if (user.getRole() != null) {
                roleName = user.getRole().getRoleName();
                roleId = user.getRole().getRoleId();
            }

            return new LoginResponse(
                token,
                user.getUserId(),
                user.getUsername(),
                user.getFullName(),
                user.getEmail(),
                roleName,
                roleId
            );

        } catch (AuthenticationException e) {
            throw new InvalidDataException("credentials", "", "Username hoặc password không đúng");
        }
    }

    /**
     * Register new user
     */
    @Transactional
    public LoginResponse register(RegisterRequest request) {
        // Check if username already exists
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new DuplicateResourceException("User", "username", request.getUsername());
        }

        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("User", "email", request.getEmail());
        }

        // Create new user
        User newUser = User.builder()
                .username(request.getUsername())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .email(request.getEmail())
                .status(User.UserStatus.ACTIVE)
                .build();

        // Set department if provided
        if (request.getDepartmentId() != null) {
            Department department = new Department();
            department.setDepartmentId(request.getDepartmentId());
            newUser.setDepartment(department);
        }

        User savedUser = userRepository.save(newUser);

        // Generate JWT token
        String token = jwtUtil.generateToken(savedUser.getUsername());

        // Get role information
        String roleName = null;
        Long roleId = null;
        if (savedUser.getRole() != null) {
            roleName = savedUser.getRole().getRoleName();
            roleId = savedUser.getRole().getRoleId();
        }

        return new LoginResponse(
            token,
            savedUser.getUserId(),
            savedUser.getUsername(),
            savedUser.getFullName(),
            savedUser.getEmail(),
            roleName,
            roleId
        );
    }
}
