package com.smd.core.dto;

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
    private LocalDateTime editedAt;
    private String status; // PENDING, RESOLVED, ARCHIVED
    private String contextType; // CLO, MODULE, ASSESSMENT, GENERAL
    private Long contextId;
    private String contextSection;
    private Long parentCommentId;
    private Integer replyCount;
    private LocalDateTime resolvedAt;
    private Long resolvedById;
    private String resolvedByName;
    private String resolutionNote;

    public static CommentResponse fromEntity(ReviewComment comment) {
        return CommentResponse.builder()
                .commentId(comment.getCommentId())
                .syllabusId(comment.getSyllabus().getSyllabusId())
                .syllabusTitle(comment.getSyllabus().getCourse().getCourseName())
                .userId(comment.getUser().getUserId())
                .userName(comment.getUser().getFullName())
                .userEmail(comment.getUser().getEmail())
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .editedAt(comment.getEditedAt())
                .status(comment.getStatus())
                .contextType(comment.getContextType())
                .contextId(comment.getContextId())
                .contextSection(comment.getContextSection())
                .parentCommentId(comment.getParentCommentId())
                .replyCount(comment.getReplyCount())
                .resolvedAt(comment.getResolvedAt())
                .resolvedById(comment.getResolvedBy() != null ? comment.getResolvedBy().getUserId() : null)
                .resolvedByName(comment.getResolvedBy() != null ? comment.getResolvedBy().getFullName() : null)
                .resolutionNote(comment.getResolutionNote())
                .build();
    }
}
