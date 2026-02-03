package com.smd.core.service;

import com.smd.core.dto.CommentRequest;
import com.smd.core.dto.CommentResponse;
import com.smd.core.dto.ResolveCommentRequest;
import com.smd.core.dto.UpdateCommentRequest;
import com.smd.core.entity.CommentContextType;
import com.smd.core.entity.CommentStatus;
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
                .contextType(request.getContextType() != null ? request.getContextType() : CommentContextType.SYLLABUS_GENERAL)
                .contextId(request.getContextId())
                .contextSection(request.getContextSection())
                .build();
        
        ReviewComment savedComment = reviewCommentRepository.save(comment);
        log.info("Comment {} created successfully for syllabus {}", savedComment.getCommentId(), syllabusId);
        
        // Send notification about new comment
        notificationService.notifyCommentAdded(syllabus, user, savedComment);
        
        return CommentResponse.fromEntity(savedComment);
    }

    /**
     * Update an existing comment (only by comment owner)
     */
    @Transactional
    public CommentResponse updateComment(Long commentId, UpdateCommentRequest request) {
        log.info("Updating comment {}", commentId);
        
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
        
        ReviewComment comment = reviewCommentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with id: " + commentId));
        
        // Check if user is comment owner
        if (!comment.getUser().getUserId().equals(currentUser.getUserId())) {
            throw new SecurityException("You can only edit your own comments");
        }
        
        // Update comment
        comment.setContent(request.getContent());
        comment.setEditedAt(LocalDateTime.now());
        comment.setEdited(true);
        
        ReviewComment updatedComment = reviewCommentRepository.save(comment);
        log.info("Comment {} updated successfully", commentId);
        
        return CommentResponse.fromEntity(updatedComment);
    }

    /**
     * Add a reply to a comment
     */
    @Transactional
    public CommentResponse replyToComment(Long parentCommentId, CommentRequest request) {
        log.info("Adding reply to comment {}", parentCommentId);
        
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
                .contextType(parentComment.getContextType())
                .contextId(parentComment.getContextId())
                .contextSection(parentComment.getContextSection())
                .build();
        
        // Add reply to parent
        parentComment.addReply(reply);
        
        ReviewComment savedReply = reviewCommentRepository.save(reply);
        reviewCommentRepository.save(parentComment); // Update reply count
        
        log.info("Reply {} created successfully for comment {}", savedReply.getCommentId(), parentCommentId);
        
        // Send notification about new reply
        notificationService.notifyCommentAdded(parentComment.getSyllabus(), user, savedReply);
        
        return CommentResponse.fromEntity(savedReply);
    }

    /**
     * Get all replies for a comment
     */
    @Transactional(readOnly = true)
    public Page<CommentResponse> getReplies(Long parentCommentId, Pageable pageable) {
        log.info("Fetching replies for comment {}", parentCommentId);
        
        // Verify parent comment exists
        if (!reviewCommentRepository.existsById(parentCommentId)) {
            throw new ResourceNotFoundException("Parent comment not found with id: " + parentCommentId);
        }
        
        return reviewCommentRepository.findRepliesByParentId(parentCommentId, pageable)
                .map(CommentResponse::fromEntity);
    }

    /**
     * Resolve or close a comment (by HoD, Syllabus owner, or admin)
     */
    @Transactional
    public CommentResponse resolveComment(Long commentId, ResolveCommentRequest request) {
        log.info("Resolving comment {} with status {}", commentId, request.getStatus());
        
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
        
        ReviewComment comment = reviewCommentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with id: " + commentId));
        
        // Check permissions: HoD, Syllabus owner, or Admin
        Syllabus syllabus = comment.getSyllabus();
        boolean isOwner = syllabus.getLecturer().getUserId().equals(currentUser.getUserId());
        boolean isHoD = currentUser.getUserRoles().stream()
                .anyMatch(ur -> ur.getRole().getRoleName().equals("HEAD_OF_DEPARTMENT"));
        boolean isAdmin = currentUser.getUserRoles().stream()
                .anyMatch(ur -> ur.getRole().getRoleName().equals("ADMIN"));
        
        if (!isOwner && !isHoD && !isAdmin) {
            throw new SecurityException("You don't have permission to resolve this comment");
        }
        
        // Update status
        comment.setStatus(request.getStatus());
        comment.setResolvedBy(currentUser);
        comment.setResolvedAt(LocalDateTime.now());
        comment.setResolutionNote(request.getResolutionNote());
        
        ReviewComment resolvedComment = reviewCommentRepository.save(comment);
        log.info("Comment {} resolved successfully by {}", commentId, username);
        
        return CommentResponse.fromEntity(resolvedComment);
    }

    /**
     * Get comments filtered by context
     */
    @Transactional(readOnly = true)
    public Page<CommentResponse> getCommentsByContext(
            Long syllabusId,
            CommentContextType contextType,
            Long contextId,
            Pageable pageable) {
        
        log.info("Fetching comments for syllabus {} with context type {} and context id {}", 
                syllabusId, contextType, contextId);
        
        // Verify syllabus exists
        if (!syllabusRepository.existsById(syllabusId)) {
            throw new ResourceNotFoundException("Syllabus not found with id: " + syllabusId);
        }
        
        Page<ReviewComment> comments;
        
        if (contextType != null && contextId != null) {
            comments = reviewCommentRepository.findBySyllabusIdAndContextTypeAndContextId(
                    syllabusId, contextType, contextId, pageable);
        } else if (contextType != null) {
            comments = reviewCommentRepository.findBySyllabusIdAndContextType(
                    syllabusId, contextType, pageable);
        } else {
            comments = reviewCommentRepository.findTopLevelCommentsBySyllabusId(syllabusId, pageable);
        }
        
        return comments.map(CommentResponse::fromEntity);
    }

    /**
     * Get comments by status
     */
    @Transactional(readOnly = true)
    public Page<CommentResponse> getCommentsByStatus(Long syllabusId, CommentStatus status, Pageable pageable) {
        log.info("Fetching comments for syllabus {} with status {}", syllabusId, status);
        
        if (!syllabusRepository.existsById(syllabusId)) {
            throw new ResourceNotFoundException("Syllabus not found with id: " + syllabusId);
        }
        
        return reviewCommentRepository.findBySyllabusIdAndStatus(syllabusId, status, pageable)
                .map(CommentResponse::fromEntity);
    }

    /**
     * Get unresolved comment count
     */
    @Transactional(readOnly = true)
    public long getUnresolvedCommentCount(Long syllabusId) {
        return reviewCommentRepository.countUnresolvedComments(syllabusId);
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
}
