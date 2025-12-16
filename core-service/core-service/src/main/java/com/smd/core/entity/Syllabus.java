package com.smd.core.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "syllabuses")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Syllabus {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "subject_code", unique = true, nullable = false, length = 50)
    private String subjectCode;

    @Column(name = "subject_name", nullable = false, length = 255)
    private String subjectName;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private int credits; // tin chi

    @Column(length = 20)
    private String status; // draft, approved, published

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}