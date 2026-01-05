package com.smd.core.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "plo")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PLO {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "plo_id")
    private Long ploId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "program_id", nullable = false)
    @ToString.Exclude
    private Program program;

    @Column(name = "plo_code", nullable = false)
    private String ploCode;

    @Column(name = "plo_description", columnDefinition = "TEXT")
    private String ploDescription;

    // Relationships
    @OneToMany(mappedBy = "plo", cascade = CascadeType.ALL)
    @ToString.Exclude
    private List<CLOPLOMapping> cloMappings;
}
