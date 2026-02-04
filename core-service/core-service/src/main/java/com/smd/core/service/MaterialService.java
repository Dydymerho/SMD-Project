package com.smd.core.service;

import com.smd.core.dto.MaterialRequest;
import com.smd.core.entity.Material;
import com.smd.core.entity.Syllabus;
import com.smd.core.exception.ResourceNotFoundException;
import com.smd.core.repository.MaterialRepository;
import com.smd.core.repository.SyllabusRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MaterialService {
    private final MaterialRepository materialRepository;
    private final SyllabusRepository syllabusRepository;

    @Transactional(readOnly = true)
    public List<Material> getAllMaterials() {
        return materialRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Material getMaterialById(Long id) {
        return materialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Material not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public List<Material> getMaterialsBySyllabusId(Long syllabusId) {
        return materialRepository.findBySyllabus_SyllabusId(syllabusId);
    }

    @Transactional
    public Material createMaterial(MaterialRequest request) {
        Syllabus syllabus = syllabusRepository.findById(request.getSyllabusId())
                .orElseThrow(() -> new ResourceNotFoundException("Syllabus not found with id: " + request.getSyllabusId()));
        
        Material material = Material.builder()
                .syllabus(syllabus)
                .title(request.getTitle())
                .author(request.getAuthor())
            .materialType(Material.MaterialType.valueOf(request.getMaterialType()))
                .build();
        
        return materialRepository.save(material);
    }

    @Transactional
    public Material updateMaterial(Long id, MaterialRequest request) {
        Material material = getMaterialById(id);
        
        Syllabus syllabus = syllabusRepository.findById(request.getSyllabusId())
                .orElseThrow(() -> new ResourceNotFoundException("Syllabus not found with id: " + request.getSyllabusId()));
        
        material.setTitle(request.getTitle());
        material.setAuthor(request.getAuthor());
        material.setMaterialType(Material.MaterialType.valueOf(request.getMaterialType()));
        material.setSyllabus(syllabus);
        
        return materialRepository.save(material);
    }

    @Transactional
    public void deleteMaterial(Long id) {
        if (!materialRepository.existsById(id)) {
            throw new ResourceNotFoundException("Material not found with id: " + id);
        }
        materialRepository.deleteById(id);
    }
}
