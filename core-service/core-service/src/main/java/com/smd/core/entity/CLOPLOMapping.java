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
    @Column(name = "clo_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "clo_id", nullable = false, insertable = false, updatable = false)
    @ToString.Exclude
    private CLO clo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plo_id", nullable = false, insertable = false, updatable = false)
    @ToString.Exclude
    private PLO plo;

    @Column(name = "clo_id", nullable = false)
    private Long cloIdFk;

    @Column(name = "plo_id", nullable = false)
    private Long ploIdFk;

    @Enumerated(EnumType.STRING)
    @Column(name = "mapping_level", nullable = false)
    private MappingLevel mappingLevel;

    public enum MappingLevel {
        LOW,
        MEDIUM,
        HIGH
    }
}
