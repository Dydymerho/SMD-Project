package com.smd.core.service;

import com.smd.core.entity.Material;
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
    public Material createMaterial(Material material) {
        if (material.getSyllabus() != null && material.getSyllabus().getSyllabusId() != null) {
            syllabusRepository.findById(material.getSyllabus().getSyllabusId())
                    .orElseThrow(() -> new ResourceNotFoundException("Syllabus not found"));
        }
        return materialRepository.save(material);
    }

    @Transactional
    public Material updateMaterial(Long id, Material materialDetails) {
        Material material = getMaterialById(id);
        
        material.setTitle(materialDetails.getTitle());
        material.setAuthor(materialDetails.getAuthor());
        material.setMaterialType(materialDetails.getMaterialType());
        
        if (materialDetails.getSyllabus() != null && materialDetails.getSyllabus().getSyllabusId() != null) {
            syllabusRepository.findById(materialDetails.getSyllabus().getSyllabusId())
                    .orElseThrow(() -> new ResourceNotFoundException("Syllabus not found"));
            material.setSyllabus(materialDetails.getSyllabus());
        }
        
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
