package com.smd.core.dto;

import com.smd.core.entity.CommentContextType;
import com.smd.core.entity.CommentStatus;
import com.smd.core.entity.ReviewComment;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommentResponse {
    
    private Long commentId;
    private Long syllabusId;
    private String syllabusTitle;
    private Long userId;
    private String userName;
    private String userEmail;
    private String content;
    private LocalDateTime createdAt;
    
    // Edit tracking
    private LocalDateTime editedAt;
    private boolean isEdited;
    
    // Thread/Reply support
    private Long parentCommentId;
    private int replyCount;
    
    // Status management
    private CommentStatus status;
    private Long resolvedById;
    private String resolvedByName;
    private LocalDateTime resolvedAt;
    private String resolutionNote;
    
    // Context information
    private CommentContextType contextType;
    private Long contextId;
    private String contextSection;

    public static CommentResponse fromEntity(ReviewComment comment) {
        CommentResponse.CommentResponseBuilder builder = CommentResponse.builder()
                .commentId(comment.getCommentId())
                .syllabusId(comment.getSyllabus().getSyllabusId())
                .syllabusTitle(comment.getSyllabus().getCourse().getCourseName())
                .userId(comment.getUser().getUserId())
                .userName(comment.getUser().getFullName())
                .userEmail(comment.getUser().getEmail())
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .editedAt(comment.getEditedAt())
                .isEdited(comment.isEdited())
                .replyCount(comment.getReplyCount())
                .status(comment.getStatus())
                .resolvedAt(comment.getResolvedAt())
                .resolutionNote(comment.getResolutionNote())
                .contextType(comment.getContextType())
                .contextId(comment.getContextId())
                .contextSection(comment.getContextSection());
        
        // Handle parent comment
        if (comment.getParentComment() != null) {
            builder.parentCommentId(comment.getParentComment().getCommentId());
        }
        
        // Handle resolver
        if (comment.getResolvedBy() != null) {
            builder.resolvedById(comment.getResolvedBy().getUserId())
                   .resolvedByName(comment.getResolvedBy().getFullName());
        }
        
        return builder.build();
    }
}
