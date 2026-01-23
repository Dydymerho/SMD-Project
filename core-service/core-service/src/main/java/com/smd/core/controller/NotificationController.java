package com.smd.core.controller;

import com.smd.core.dto.NotificationResponse;
import com.smd.core.dto.NotificationStats;
import com.smd.core.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "APIs for managing user notifications")
@SecurityRequirement(name = "bearerAuth")
public class NotificationController {
    
    private final NotificationService notificationService;

    @GetMapping
    @Operation(
        summary = "Get user notifications (paginated)",
        description = "Retrieve all notifications for the current user with pagination"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Notifications retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<Page<NotificationResponse>> getNotifications(
            @Parameter(description = "Page number (0-indexed)", example = "0")
            @RequestParam(defaultValue = "0") int page,
            
            @Parameter(description = "Page size", example = "20")
            @RequestParam(defaultValue = "20") int size,
            
            @Parameter(hidden = true)
            @AuthenticationPrincipal UserDetails userDetails) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<NotificationResponse> notifications = notificationService.getUserNotifications(
            userDetails.getUsername(), pageable);
        
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/unread")
    @Operation(
        summary = "Get unread notifications",
        description = "Retrieve all unread notifications for the current user"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Unread notifications retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<List<NotificationResponse>> getUnreadNotifications(
            @Parameter(hidden = true)
            @AuthenticationPrincipal UserDetails userDetails) {
        
        List<NotificationResponse> notifications = notificationService.getUnreadNotifications(
            userDetails.getUsername());
        
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/stats")
    @Operation(
        summary = "Get notification statistics",
        description = "Get statistics about notifications (total unread, pending reviews, etc.)"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Statistics retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<NotificationStats> getNotificationStats(
            @Parameter(hidden = true)
            @AuthenticationPrincipal UserDetails userDetails) {
        
        NotificationStats stats = notificationService.getNotificationStats(userDetails.getUsername());
        return ResponseEntity.ok(stats);
    }

    @PutMapping("/{id}/read")
    @Operation(
        summary = "Mark notification as read",
        description = "Mark a specific notification as read"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Notification marked as read"),
        @ApiResponse(responseCode = "404", description = "Notification not found"),
        @ApiResponse(responseCode = "403", description = "Not authorized"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<Void> markAsRead(
            @Parameter(description = "Notification ID", required = true)
            @PathVariable Long id,
            
            @Parameter(hidden = true)
            @AuthenticationPrincipal UserDetails userDetails) {
        
        notificationService.markAsRead(id, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/read-all")
    @Operation(
        summary = "Mark all notifications as read",
        description = "Mark all unread notifications as read for the current user"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "All notifications marked as read"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<Void> markAllAsRead(
            @Parameter(hidden = true)
            @AuthenticationPrincipal UserDetails userDetails) {
        
        notificationService.markAllAsRead(userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }
}
