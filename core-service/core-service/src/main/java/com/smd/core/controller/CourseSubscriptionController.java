package com.smd.core.controller;

import com.smd.core.dto.CourseSimpleDto;
import com.smd.core.service.CourseSubscriptionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
@Tag(name = "Course Subscriptions", description = "Manage course follow/unfollow for students")
public class CourseSubscriptionController {

    private final CourseSubscriptionService subscriptionService;

    @PostMapping("/{courseId}/follow")
    @Operation(summary = "Follow a course", description = "Subscribe to receive notifications for course updates")
    public ResponseEntity<Void> followCourse(
            @PathVariable Long courseId,
            @AuthenticationPrincipal UserDetails userDetails) {
        subscriptionService.followCourse(userDetails.getUsername(), courseId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{courseId}/follow")
    @Operation(summary = "Unfollow a course", description = "Unsubscribe from course updates")
    public ResponseEntity<Void> unfollowCourse(
            @PathVariable Long courseId,
            @AuthenticationPrincipal UserDetails userDetails) {
        subscriptionService.unfollowCourse(userDetails.getUsername(), courseId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/following")
    @Operation(summary = "Get followed courses", description = "List all courses the current user is following")
    public ResponseEntity<List<CourseSimpleDto>> getFollowedCourses(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(subscriptionService.getFollowedCourses(userDetails.getUsername()));
    }
}