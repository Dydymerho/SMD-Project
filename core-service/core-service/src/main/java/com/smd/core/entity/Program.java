package com.smd.core.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "program")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Program {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "program_id")
    private Long programId;

    @Column(name = "program_name", nullable = false)
    private String programName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", nullable = false)
    @ToString.Exclude
    private Department department;

    // Relationships
    @OneToMany(mappedBy = "program", cascade = CascadeType.ALL)
    @ToString.Exclude
    private List<Syllabus> syllabuses;

    @OneToMany(mappedBy = "program", cascade = CascadeType.ALL)
    @ToString.Exclude
    private List<PLO> plos;
}
