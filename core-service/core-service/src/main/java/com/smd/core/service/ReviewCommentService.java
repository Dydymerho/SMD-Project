package com.smd.core.service;

import com.smd.core.dto.CommentRequest;
import com.smd.core.dto.CommentResponse;
import com.smd.core.entity.ReviewComment;
import com.smd.core.entity.Syllabus;
import com.smd.core.entity.User;
import com.smd.core.exception.ResourceNotFoundException;
import com.smd.core.repository.ReviewCommentRepository;
import com.smd.core.repository.SyllabusRepository;
import com.smd.core.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReviewCommentService {
    
    private final ReviewCommentRepository reviewCommentRepository;
    private final SyllabusRepository syllabusRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    /**
     * Add a comment to a syllabus
     */
    @Transactional
    public CommentResponse addComment(Long syllabusId, CommentRequest request) {
        log.info("Adding comment to syllabus {}", syllabusId);
        
        // Get current user
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
        
        // Get syllabus
        Syllabus syllabus = syllabusRepository.findById(syllabusId)
                .orElseThrow(() -> new ResourceNotFoundException("Syllabus not found with id: " + syllabusId));
        
        // Create comment
        ReviewComment comment = ReviewComment.builder()
                .syllabus(syllabus)
                .user(user)
                .content(request.getContent())
                .contextType(request.getContextType())
                .contextId(request.getContextId())
                .contextSection(request.getContextSection())
                .parentCommentId(request.getParentCommentId())
                .status(request.getStatus() != null ? request.getStatus() : "PENDING")
                .build();
        
        ReviewComment savedComment = reviewCommentRepository.save(comment);
        log.info("Comment {} created successfully for syllabus {}", savedComment.getCommentId(), syllabusId);
        
        // Send notification about new comment
        notificationService.notifyCommentAdded(syllabus, user, savedComment);
        
        return CommentResponse.fromEntity(savedComment);
    }

    /**
     * Get all comments for a syllabus (paginated)
     */
    @Transactional(readOnly = true)
    public Page<CommentResponse> getCommentsBySyllabus(Long syllabusId, Pageable pageable) {
        log.info("Fetching comments for syllabus {}", syllabusId);
        
        Syllabus syllabus = syllabusRepository.findById(syllabusId)
                .orElseThrow(() -> new ResourceNotFoundException("Syllabus not found with id: " + syllabusId));
        
        return (Page<CommentResponse>) reviewCommentRepository.findBySyllabusOrderByCreatedAtDesc(syllabus, pageable)
                .map(CommentResponse::fromEntity);
    }

    /**
     * Get all comments for a syllabus (list)
     */
    @Transactional(readOnly = true)
    public List<CommentResponse> getAllCommentsBySyllabus(Long syllabusId) {
        log.info("Fetching all comments for syllabus {}", syllabusId);
        
        Syllabus syllabus = syllabusRepository.findById(syllabusId)
                .orElseThrow(() -> new ResourceNotFoundException("Syllabus not found with id: " + syllabusId));
        
        return reviewCommentRepository.findBySyllabusOrderByCreatedAtDesc(syllabus)
                .stream()
                .map(CommentResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get comment count for a syllabus
     */
    @Transactional(readOnly = true)
    public long getCommentCount(Long syllabusId) {
        Syllabus syllabus = syllabusRepository.findById(syllabusId)
                .orElseThrow(() -> new ResourceNotFoundException("Syllabus not found with id: " + syllabusId));
        
        return reviewCommentRepository.countBySyllabus(syllabus);
    }

    /**
     * Get a specific comment by ID
     */
    @Transactional(readOnly = true)
    public CommentResponse getCommentById(Long commentId) {
        ReviewComment comment = reviewCommentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with id: " + commentId));
        
        return CommentResponse.fromEntity(comment);
    }

    /**
     * Delete a comment (only by comment owner or admin)
     */
    @Transactional
    public void deleteComment(Long commentId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
        
        ReviewComment comment = reviewCommentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with id: " + commentId));
        
        // Check if user is comment owner or has admin role
        boolean isOwner = comment.getUser().getUserId().equals(currentUser.getUserId());
        boolean isAdmin = currentUser.getUserRoles().stream()
                .anyMatch(ur -> ur.getRole().getRoleName().equals("ADMIN"));
        
        if (!isOwner && !isAdmin) {
            throw new SecurityException("You don't have permission to delete this comment");
        }
        
        reviewCommentRepository.delete(comment);
        log.info("Comment {} deleted by {}", commentId, username);
    }

    /**
     * Get recent comments for a syllabus (top 5)
     */
    @Transactional(readOnly = true)
    public List<CommentResponse> getRecentComments(Long syllabusId) {
        return reviewCommentRepository.findTop5BySyllabus_SyllabusIdOrderByCreatedAtDesc(syllabusId)
                .stream()
                .map(CommentResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Resolve a comment
     */
    @Transactional
    public CommentResponse resolveComment(Long commentId, String resolutionNote) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
        
        ReviewComment comment = reviewCommentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with id: " + commentId));
        
        comment.setStatus("RESOLVED");
        comment.setResolvedAt(LocalDateTime.now());
        comment.setResolvedBy(currentUser);
        comment.setResolutionNote(resolutionNote);
        
        ReviewComment saved = reviewCommentRepository.save(comment);
        log.info("Comment {} resolved by {}", commentId, username);
        
        return CommentResponse.fromEntity(saved);
    }

    /**
     * Add a reply to a comment
     */
    @Transactional
    public CommentResponse replyToComment(Long parentCommentId, CommentRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
        
        ReviewComment parentComment = reviewCommentRepository.findById(parentCommentId)
                .orElseThrow(() -> new ResourceNotFoundException("Parent comment not found with id: " + parentCommentId));
        
        // Create reply
        ReviewComment reply = ReviewComment.builder()
                .syllabus(parentComment.getSyllabus())
                .user(user)
                .content(request.getContent())
                .parentCommentId(parentCommentId)
                .status("PENDING")
                .build();
        
        ReviewComment savedReply = reviewCommentRepository.save(reply);
        
        // Update parent comment's reply count
        parentComment.setReplyCount((parentComment.getReplyCount() != null ? parentComment.getReplyCount() : 0) + 1);
        reviewCommentRepository.save(parentComment);
        
        log.info("Reply {} created for comment {}", savedReply.getCommentId(), parentCommentId);
        
        return CommentResponse.fromEntity(savedReply);
    }
}
