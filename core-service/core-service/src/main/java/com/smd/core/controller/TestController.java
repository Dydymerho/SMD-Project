package com.smd.core.controller;

import com.smd.core.entity.Syllabus;
import com.smd.core.repository.SyllabusRepository;
import com.smd.core.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
@RequiredArgsConstructor
@Tag(name = "Test & Debug", description = "Testing and debugging endpoints - Remove in production")
public class TestController {
    
    private final NotificationService notificationService;
    private final SyllabusRepository syllabusRepository;
    
    @PostMapping("/notification/syllabus/{syllabusId}")
    @Operation(summary = "Test notification creation for a syllabus", description = "Manually trigger notification for testing")
    public ResponseEntity<Map<String, Object>> testNotification(
            @PathVariable Long syllabusId,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            Syllabus syllabus = syllabusRepository.findById(syllabusId)
                .orElseThrow(() -> new RuntimeException("Syllabus not found"));
            
            response.put("syllabusId", syllabusId);
            response.put("courseName", syllabus.getCourse().getCourseName());
            response.put("courseCode", syllabus.getCourse().getCourseCode());
            response.put("departmentName", syllabus.getCourse().getDepartment().getDeptName());
            
            if (syllabus.getCourse().getDepartment().getHeadOfDepartment() != null) {
                response.put("hodUsername", syllabus.getCourse().getDepartment().getHeadOfDepartment().getUsername());
                response.put("hodAssigned", true);
            } else {
                response.put("hodAssigned", false);
                response.put("error", "No Head of Department assigned to this department");
            }
            
            // Try to create notification
            notificationService.notifySyllabusSubmitted(syllabus, userDetails.getUsername());
            response.put("notificationSent", true);
            response.put("message", "Notification created successfully. Check logs for details.");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("error", e.getMessage());
            response.put("notificationSent", false);
            return ResponseEntity.status(500).body(response);
        }
    }
}
