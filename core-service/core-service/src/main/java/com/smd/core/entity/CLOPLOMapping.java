package com.smd.core.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "clo_plo_mapping")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CLOPLOMapping {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "mapping_id")
    private Long mappingId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "clo_id", nullable = false)
    @ToString.Exclude
    private CLO clo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plo_id", nullable = false)
    @ToString.Exclude
    private PLO plo;

    @Enumerated(EnumType.STRING)
    @Column(name = "mapping_level", nullable = false)
    private MappingLevel mappingLevel;

    public enum MappingLevel {
        LOW,
        MEDIUM,
        HIGH
    }
}
