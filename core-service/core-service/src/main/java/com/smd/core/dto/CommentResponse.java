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
                .build();
    }
}
