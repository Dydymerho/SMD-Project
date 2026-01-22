package com.smd.core.repository;

import com.smd.core.entity.Notification;
import com.smd.core.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    // Find by user
    List<Notification> findByRecipientOrderByCreatedAtDesc(User recipient);
    
    Page<Notification> findByRecipientOrderByCreatedAtDesc(User recipient, Pageable pageable);
    
    // Find unread
    List<Notification> findByRecipientAndIsReadFalseOrderByCreatedAtDesc(User recipient);
    
    Page<Notification> findByRecipientAndIsReadFalseOrderByCreatedAtDesc(User recipient, Pageable pageable);
    
    // Count unread
    Long countByRecipientAndIsReadFalse(User recipient);
    
    // Find by type
    List<Notification> findByRecipientAndTypeOrderByCreatedAtDesc(User recipient, Notification.NotificationType type);
    
    // Mark as read
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true, n.readAt = :readAt WHERE n.notificationId = :id")
    void markAsRead(@Param("id") Long id, @Param("readAt") LocalDateTime readAt);
    
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true, n.readAt = :readAt WHERE n.recipient = :recipient AND n.isRead = false")
    void markAllAsRead(@Param("recipient") User recipient, @Param("readAt") LocalDateTime readAt);
    
    // Delete old notifications
    @Modifying
    @Query("DELETE FROM Notification n WHERE n.createdAt < :cutoffDate")
    void deleteOlderThan(@Param("cutoffDate") LocalDateTime cutoffDate);
    
    // Get notifications by syllabus
    @Query("SELECT n FROM Notification n WHERE n.syllabus.syllabusId = :syllabusId ORDER BY n.createdAt DESC")
    List<Notification> findBySyllabusIdOrderByCreatedAtDesc(@Param("syllabusId") Long syllabusId);
}
