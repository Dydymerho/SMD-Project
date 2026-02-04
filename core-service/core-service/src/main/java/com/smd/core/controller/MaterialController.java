package com.smd.core.controller;

import com.smd.core.dto.MaterialRequest;
import com.smd.core.dto.MaterialResponse;
import com.smd.core.entity.Material;
import com.smd.core.service.MaterialService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/materials")
@RequiredArgsConstructor
public class MaterialController {
    private final MaterialService materialService;

    @GetMapping
    public ResponseEntity<List<MaterialResponse>> getAllMaterials() {
        List<Material> materials = materialService.getAllMaterials();
        List<MaterialResponse> response = materials.stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MaterialResponse> getMaterialById(@PathVariable Long id) {
        Material material = materialService.getMaterialById(id);
        return ResponseEntity.ok(convertToDto(material));
    }

    @GetMapping("/syllabus/{syllabusId}")
    public ResponseEntity<List<MaterialResponse>> getMaterialsBySyllabusId(@PathVariable Long syllabusId) {
        List<Material> materials = materialService.getMaterialsBySyllabusId(syllabusId);
        List<MaterialResponse> response = materials.stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<MaterialResponse> createMaterial(@Valid @RequestBody MaterialRequest request) {
        Material created = materialService.createMaterial(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(convertToDto(created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MaterialResponse> updateMaterial(@PathVariable Long id, @Valid @RequestBody MaterialRequest request) {
        Material updated = materialService.updateMaterial(id, request);
        return ResponseEntity.ok(convertToDto(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMaterial(@PathVariable Long id) {
        materialService.deleteMaterial(id);
        return ResponseEntity.noContent().build();
    }

    private MaterialResponse convertToDto(Material material) {
        return MaterialResponse.builder()
            .materialId(material.getMaterialId())
            .syllabusId(material.getSyllabus() != null ? material.getSyllabus().getSyllabusId() : null)
            .title(material.getTitle())
            .author(material.getAuthor())
            .materialType(material.getMaterialType())
            .build();
    }
}
