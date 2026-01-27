package com.smd.core.dto;

import com.smd.core.entity.Material.MaterialType;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MaterialResponse {
    private Long materialId;
    private Long syllabusId;
    private String title;
    private String author;
    private MaterialType materialType;
}
