package com.smd.core.service;

import com.smd.core.dto.NotificationResponse;
import com.smd.core.dto.NotificationStats;
import com.smd.core.entity.Notification;
import com.smd.core.entity.ReviewComment;
import com.smd.core.entity.Syllabus;
import com.smd.core.entity.User;
import com.smd.core.exception.ResourceNotFoundException;
import com.smd.core.repository.NotificationRepository;
import com.smd.core.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {
    
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    /**
     * Create notification when syllabus is submitted for review
     */
    @Transactional
    public void notifySyllabusSubmitted(Syllabus syllabus, String submittedBy) {
        try {
            log.info("Attempting to create notification for syllabus {} submitted by {}", 
                syllabus.getSyllabusId(), submittedBy);
            
            // Check if department exists
            if (syllabus.getCourse() == null) {
                log.error("Course is null for syllabus {}", syllabus.getSyllabusId());
                return;
            }
            
            if (syllabus.getCourse().getDepartment() == null) {
                log.error("Department is null for course {}", syllabus.getCourse().getCourseId());
                return;
            }
            
            User hod = syllabus.getCourse().getDepartment().getHeadOfDepartment();
            
            if (hod == null) {
                log.warn("No Head of Department assigned for department {}. Notification cannot be sent.", 
                    syllabus.getCourse().getDepartment().getDeptName());
                return;
            }
            
            log.info("Found HOD: {} for department: {}", 
                hod.getUsername(), syllabus.getCourse().getDepartment().getDeptName());
            
            Notification notification = Notification.builder()
                .recipient(hod)
                .syllabus(syllabus)
                .type(Notification.NotificationType.SYLLABUS_SUBMITTED)
                .title("New Syllabus Submitted for Review")
                .message(String.format("Syllabus for %s (%s) v%d has been submitted by %s and requires your review.",
                    syllabus.getCourse().getCourseName(),
                    syllabus.getCourse().getCourseCode(),
                    syllabus.getVersionNo(),
                    submittedBy))
                .actionUrl("/api/v1/syllabuses/" + syllabus.getSyllabusId())
                .triggeredBy(submittedBy)
                .isRead(false)
                .build();
            
            notificationRepository.save(notification);
            log.info("✅ Notification saved successfully! Notification ID: {}, sent to HOD {} for syllabus {}", 
                notification.getNotificationId(), hod.getUsername(), syllabus.getSyllabusId());
        } catch (Exception e) {
            log.error("❌ Error creating notification for syllabus {}: {}", 
                syllabus.getSyllabusId(), e.getMessage(), e);
            // Don't throw exception to avoid breaking the workflow
        }
    }

    /**
     * Create notification when HOD approves syllabus
     */
    @Transactional
    public void notifyHODApproved(Syllabus syllabus, String approvedBy) {
        // Notify lecturer
        notifyLecturer(syllabus, approvedBy, 
            Notification.NotificationType.SYLLABUS_APPROVED_BY_HOD,
            "Syllabus Approved by HOD",
            "Your syllabus has been approved by the Head of Department and forwarded to Academic Affairs.");
        
        // Notify Academic Affairs
        List<User> aaUsers = userRepository.findByRole_RoleName("ACADEMIC_AFFAIRS");
        for (User aaUser : aaUsers) {
            Notification notification = Notification.builder()
                .recipient(aaUser)
                .syllabus(syllabus)
                .type(Notification.NotificationType.SYLLABUS_APPROVED_BY_HOD)
                .title("Syllabus Pending Your Approval")
                .message(String.format("Syllabus for %s (%s) v%d has been approved by HOD and requires your review.",
                    syllabus.getCourse().getCourseName(),
                    syllabus.getCourse().getCourseCode(),
                    syllabus.getVersionNo()))
                .actionUrl("/api/v1/syllabuses/" + syllabus.getSyllabusId())
                .triggeredBy(approvedBy)
                .isRead(false)
                .build();
            
            notificationRepository.save(notification);
        }
    }

    /**
     * Create notification when HOD rejects syllabus
     */
    @Transactional
    public void notifyHODRejected(Syllabus syllabus, String rejectedBy, String comments) {
        String message = String.format("Your syllabus for %s (%s) v%d has been rejected by the Head of Department.%s",
            syllabus.getCourse().getCourseName(),
            syllabus.getCourse().getCourseCode(),
            syllabus.getVersionNo(),
            comments != null && !comments.isEmpty() ? " Reason: " + comments : "");
        
        notifyLecturer(syllabus, rejectedBy,
            Notification.NotificationType.SYLLABUS_REJECTED_BY_HOD,
            "Syllabus Rejected by HOD",
            message);
    }

    /**
     * Create notification when Academic Affairs approves syllabus
     */
    @Transactional
    public void notifyAAApproved(Syllabus syllabus, String approvedBy) {
        // Notify lecturer
        notifyLecturer(syllabus, approvedBy,
            Notification.NotificationType.SYLLABUS_APPROVED_BY_AA,
            "Syllabus Approved by Academic Affairs",
            "Your syllabus has been approved by Academic Affairs and forwarded to the Principal.");
        
        // Notify Principal
        List<User> principals = userRepository.findByRole_RoleName("PRINCIPAL");
        for (User principal : principals) {
            Notification notification = Notification.builder()
                .recipient(principal)
                .syllabus(syllabus)
                .type(Notification.NotificationType.SYLLABUS_APPROVED_BY_AA)
                .title("Syllabus Awaiting Final Approval")
                .message(String.format("Syllabus for %s (%s) v%d requires your final approval for publication.",
                    syllabus.getCourse().getCourseName(),
                    syllabus.getCourse().getCourseCode(),
                    syllabus.getVersionNo()))
                .actionUrl("/api/v1/syllabuses/" + syllabus.getSyllabusId())
                .triggeredBy(approvedBy)
                .isRead(false)
                .build();
            
            notificationRepository.save(notification);
        }
    }

    /**
     * Create notification when Academic Affairs rejects syllabus
     */
    @Transactional
    public void notifyAARejected(Syllabus syllabus, String rejectedBy, String comments) {
        String message = String.format("Your syllabus for %s (%s) v%d has been rejected by Academic Affairs.%s",
            syllabus.getCourse().getCourseName(),
            syllabus.getCourse().getCourseCode(),
            syllabus.getVersionNo(),
            comments != null && !comments.isEmpty() ? " Reason: " + comments : "");
        
        notifyLecturer(syllabus, rejectedBy,
            Notification.NotificationType.SYLLABUS_REJECTED_BY_AA,
            "Syllabus Rejected by Academic Affairs",
            message);
    }

    /**
     * Create notification when Principal publishes syllabus
     */
    @Transactional
    public void notifySyllabusPublished(Syllabus syllabus, String publishedBy) {
        notifyLecturer(syllabus, publishedBy,
            Notification.NotificationType.SYLLABUS_PUBLISHED,
            "Syllabus Published",
            "Congratulations! Your syllabus has been approved and published by the Principal.");
    }

    /**
     * Create notification when Principal rejects syllabus
     */
    @Transactional
    public void notifyPrincipalRejected(Syllabus syllabus, String rejectedBy, String comments) {
        String message = String.format("Your syllabus for %s (%s) v%d has been rejected by the Principal.%s",
            syllabus.getCourse().getCourseName(),
            syllabus.getCourse().getCourseCode(),
            syllabus.getVersionNo(),
            comments != null && !comments.isEmpty() ? " Reason: " + comments : "");
        
        notifyLecturer(syllabus, rejectedBy,
            Notification.NotificationType.SYLLABUS_REJECTED_BY_PRINCIPAL,
            "Syllabus Rejected by Principal",
            message);
    }

    /**
     * Create notification when PDF is uploaded
     */
    @Transactional
    public void notifyPdfUploaded(Syllabus syllabus, String uploadedBy) {
        notifyLecturer(syllabus, uploadedBy,
            Notification.NotificationType.PDF_UPLOADED,
            "PDF Uploaded",
            String.format("PDF document has been uploaded for syllabus %s (%s) v%d.",
                syllabus.getCourse().getCourseName(),
                syllabus.getCourse().getCourseCode(),
                syllabus.getVersionNo()));
    }

    /**
     * Create notification when PDF is deleted
     */
    @Transactional
    public void notifyPdfDeleted(Syllabus syllabus, String deletedBy) {
        notifyLecturer(syllabus, deletedBy,
            Notification.NotificationType.PDF_DELETED,
            "PDF Deleted",
            String.format("PDF document has been deleted from syllabus %s (%s) v%d.",
                syllabus.getCourse().getCourseName(),
                syllabus.getCourse().getCourseCode(),
                syllabus.getVersionNo()));
    }

    /**
     * Helper method to notify lecturer
     */
    private void notifyLecturer(Syllabus syllabus, String triggeredBy, 
                                Notification.NotificationType type, 
                                String title, String message) {
        Notification notification = Notification.builder()
            .recipient(syllabus.getLecturer())
            .syllabus(syllabus)
            .type(type)
            .title(title)
            .message(message)
            .actionUrl("/api/v1/syllabuses/" + syllabus.getSyllabusId())
            .triggeredBy(triggeredBy)
            .isRead(false)
            .build();
        
        notificationRepository.save(notification);
        log.info("Notification sent to lecturer {} for syllabus {}", 
            syllabus.getLecturer().getUsername(), syllabus.getSyllabusId());
    }

    /**
     * Get all notifications for a user
     */
    @Transactional(readOnly = true)
    public Page<NotificationResponse> getUserNotifications(String username, Pageable pageable) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        return (Page<NotificationResponse>) notificationRepository.findByRecipientOrderByCreatedAtDesc(user, pageable)
            .map(NotificationResponse::fromEntity);
    }

    /**
     * Get unread notifications
     */
    @Transactional(readOnly = true)
    public List<NotificationResponse> getUnreadNotifications(String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        return notificationRepository.findByRecipientAndIsReadFalseOrderByCreatedAtDesc(user)
            .stream()
            .map(NotificationResponse::fromEntity)
            .collect(Collectors.toList());
    }

    /**
     * Mark notification as read
     */
    @Transactional
    public void markAsRead(Long notificationId, String username) {
        Notification notification = notificationRepository.findById(notificationId)
            .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        
        if (!notification.getRecipient().getUsername().equals(username)) {
            throw new IllegalStateException("Not authorized to mark this notification as read");
        }
        
        notificationRepository.markAsRead(notificationId, LocalDateTime.now());
    }

    /**
     * Mark all notifications as read
     */
    @Transactional
    public void markAllAsRead(String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        notificationRepository.markAllAsRead(user, LocalDateTime.now());
    }

    /**
     * Get notification statistics
     */
    @Transactional(readOnly = true)
    public NotificationStats getNotificationStats(String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        Long totalUnread = notificationRepository.countByRecipientAndIsReadFalse(user);
        
        // Count by specific types
        List<Notification> unreadNotifications = notificationRepository
            .findByRecipientAndIsReadFalseOrderByCreatedAtDesc(user);
        
        Long pendingReviews = unreadNotifications.stream()
            .filter(n -> n.getType() == Notification.NotificationType.SYLLABUS_SUBMITTED)
            .count();
        
        Long pendingApprovals = unreadNotifications.stream()
            .filter(n -> n.getType() == Notification.NotificationType.SYLLABUS_APPROVED_BY_HOD ||
                        n.getType() == Notification.NotificationType.SYLLABUS_APPROVED_BY_AA)
            .count();
        
        Long rejectedSyllabuses = unreadNotifications.stream()
            .filter(n -> n.getType().name().contains("REJECTED"))
            .count();
        
        return NotificationStats.builder()
            .totalUnread(totalUnread)
            .pendingReviews(pendingReviews)
            .pendingApprovals(pendingApprovals)
            .rejectedSyllabuses(rejectedSyllabuses)
            .build();
    }

    /**
     * Delete old notifications (cleanup job)
     */
    @Transactional
    public void deleteOldNotifications(int daysToKeep) {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(daysToKeep);
        notificationRepository.deleteOlderThan(cutoffDate);
        log.info("Deleted notifications older than {}", cutoffDate);
    }

    /**
     * Create notification when a comment is added to a syllabus
     */
    @Transactional
    public void notifyCommentAdded(Syllabus syllabus, User commenter, ReviewComment comment) {
        try {
            log.info("Creating notification for new comment on syllabus {} by {}", 
                syllabus.getSyllabusId(), commenter.getUsername());
            
            // Notify syllabus lecturer (if not the commenter)
            User lecturer = syllabus.getLecturer();
            if (lecturer != null && !lecturer.getUserId().equals(commenter.getUserId())) {
                Notification lecturerNotification = Notification.builder()
                    .recipient(lecturer)
                    .syllabus(syllabus)
                    .type(Notification.NotificationType.COMMENT_ADDED)
                    .title("New Comment on Your Syllabus")
                    .message(String.format("%s commented on your syllabus: %s (%s) v%d",
                        commenter.getFullName(),
                        syllabus.getCourse().getCourseName(),
                        syllabus.getCourse().getCourseCode(),
                        syllabus.getVersionNo()))
                    .actionUrl("/api/v1/syllabuses/" + syllabus.getSyllabusId())
                    .triggeredBy(commenter.getUsername())
                    .isRead(false)
                    .build();
                
                notificationRepository.save(lecturerNotification);
                log.info("Notification sent to lecturer {}", lecturer.getUsername());
            }
            
            // Notify HOD (if not the commenter)
            if (syllabus.getCourse() != null && syllabus.getCourse().getDepartment() != null) {
                User hod = syllabus.getCourse().getDepartment().getHeadOfDepartment();
                if (hod != null && !hod.getUserId().equals(commenter.getUserId())) {
                    Notification hodNotification = Notification.builder()
                        .recipient(hod)
                        .syllabus(syllabus)
                        .type(Notification.NotificationType.COMMENT_ADDED)
                        .title("New Comment on Syllabus")
                        .message(String.format("%s commented on syllabus: %s (%s) v%d",
                            commenter.getFullName(),
                            syllabus.getCourse().getCourseName(),
                            syllabus.getCourse().getCourseCode(),
                            syllabus.getVersionNo()))
                        .actionUrl("/api/v1/syllabuses/" + syllabus.getSyllabusId())
                        .triggeredBy(commenter.getUsername())
                        .isRead(false)
                        .build();
                    
                    notificationRepository.save(hodNotification);
                    log.info("Notification sent to HOD {}", hod.getUsername());
                }
            }
            
            // Notify Academic Affairs users if syllabus is in their review stage
            if (syllabus.getCurrentStatus() != null && 
                (syllabus.getCurrentStatus().equals("PENDING_APPROVAL") || 
                syllabus.getCurrentStatus().equals("APPROVED"))) {
                
                List<User> aaUsers = userRepository.findByRole_RoleName("ACADEMIC_AFFAIRS");
                for (User aaUser : aaUsers) {
                    if (!aaUser.getUserId().equals(commenter.getUserId())) {
                        Notification aaNotification = Notification.builder()
                            .recipient(aaUser)
                            .syllabus(syllabus)
                            .type(Notification.NotificationType.COMMENT_ADDED)
                            .title("New Comment on Syllabus Under Review")
                            .message(String.format("%s commented on syllabus: %s (%s) v%d",
                                commenter.getFullName(),
                                syllabus.getCourse().getCourseName(),
                                syllabus.getCourse().getCourseCode(),
                                syllabus.getVersionNo()))
                            .actionUrl("/api/v1/syllabuses/" + syllabus.getSyllabusId())
                            .triggeredBy(commenter.getUsername())
                            .isRead(false)
                            .build();
                        
                        notificationRepository.save(aaNotification);
                    }
                }
                log.info("Notifications sent to {} Academic Affairs users", aaUsers.size());
            }
            
            log.info("✅ Comment notification processing completed for syllabus {}", syllabus.getSyllabusId());
            
        } catch (Exception e) {
            log.error("❌ Error creating comment notification for syllabus {}: {}", 
                syllabus.getSyllabusId(), e.getMessage(), e);
            // Don't throw exception to avoid breaking the comment creation
        }
    }
}

