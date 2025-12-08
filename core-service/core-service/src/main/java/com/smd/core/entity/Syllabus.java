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

    @Column(name="subjectCode", unique=true, nullable=false)
    private String subjectCode;

    @Column(name="subjectName", nullable=false)
    private String subjectName;

    @Column(columnDefinition="TEXT")
    private String description;

    private int credits;// tin chi
    private String status; //draft, approved, published

    @Column(name="created_at")
    private LocalDateTime created_at;

    @PrePersist
    protected void onCreate() {
        created_at = LocalDateTime.now();
    }
}

