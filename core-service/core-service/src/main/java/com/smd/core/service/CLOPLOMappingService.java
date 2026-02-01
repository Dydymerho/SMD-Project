package com.smd.core.service;

import com.smd.core.dto.CLOPLOMappingResponse;
import com.smd.core.entity.CLO;
import com.smd.core.entity.CLOPLOMapping;
import com.smd.core.entity.PLO;
import com.smd.core.exception.ResourceNotFoundException;
import com.smd.core.repository.CLOPLOMappingRepository;
import com.smd.core.repository.CLORepository;
import com.smd.core.repository.PLORepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CLOPLOMappingService {
    
    private final CLOPLOMappingRepository mappingRepository;
    private final CLORepository cloRepository;
    private final PLORepository ploRepository;
    
    @Transactional(readOnly = true)
    public List<CLOPLOMappingResponse> getAllMappings() {
        log.info("Fetching all CLO-PLO mappings");
        return mappingRepository.findAll().stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public CLOPLOMappingResponse getMappingById(Long id) {
        log.info("Fetching CLO-PLO mapping with id: {}", id);
        CLOPLOMapping mapping = mappingRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Mapping not found with id: " + id));
        return convertToDto(mapping);
    }
    
    @Transactional(readOnly = true)
    public List<CLOPLOMappingResponse> getMappingsByCloId(Long cloId) {
        log.info("Fetching mappings for CLO id: {}", cloId);
        return mappingRepository.findByClo_CloId(cloId).stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<CLOPLOMappingResponse> getMappingsByPloId(Long ploId) {
        log.info("Fetching mappings for PLO id: {}", ploId);
        return mappingRepository.findByPlo_PloId(ploId).stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<CLOPLOMappingResponse> getMappingsBySyllabusId(Long syllabusId) {
        log.info("Fetching mappings for Syllabus id: {}", syllabusId);
        return mappingRepository.findBySyllabusId(syllabusId).stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<CLOPLOMappingResponse> getMappingsByProgramId(Long programId) {
        log.info("Fetching mappings for Program id: {}", programId);
        return mappingRepository.findByProgramId(programId).stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
    }
    
    @Transactional
    public CLOPLOMappingResponse createMapping(Long cloId, Long ploId, String mappingLevel) {
        log.info("Creating mapping between CLO {} and PLO {} with level {}", cloId, ploId, mappingLevel);
        
        // Validate CLO exists
        CLO clo = cloRepository.findById(cloId)
            .orElseThrow(() -> new ResourceNotFoundException("CLO not found with id: " + cloId));
        
        // Validate PLO exists
        PLO plo = ploRepository.findById(ploId)
            .orElseThrow(() -> new ResourceNotFoundException("PLO not found with id: " + ploId));
        
        // Check if mapping already exists
        if (mappingRepository.findByClo_CloIdAndPlo_PloId(cloId, ploId).isPresent()) {
            throw new IllegalArgumentException("Mapping already exists between CLO " + cloId + " and PLO " + ploId);
        }
        
        // Validate mapping level
        CLOPLOMapping.MappingLevel level;
        try {
            level = CLOPLOMapping.MappingLevel.valueOf(mappingLevel.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid mapping level: " + mappingLevel + ". Must be LOW, MEDIUM, or HIGH");
        }
        
        // Create mapping
        CLOPLOMapping mapping = CLOPLOMapping.builder()
            .clo(clo)
            .plo(plo)
            .mappingLevel(level)
            .build();
        
        CLOPLOMapping saved = mappingRepository.save(mapping);
        log.info("Successfully created mapping with id: {}", saved.getMappingId());
        return convertToDto(saved);
    }
    
    @Transactional
    public CLOPLOMappingResponse updateMapping(Long id, String mappingLevel) {
        log.info("Updating mapping {} to level {}", id, mappingLevel);
        CLOPLOMapping mapping = mappingRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Mapping not found with id: " + id));
        
        // Validate mapping level
        CLOPLOMapping.MappingLevel level;
        try {
            level = CLOPLOMapping.MappingLevel.valueOf(mappingLevel.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid mapping level: " + mappingLevel + ". Must be LOW, MEDIUM, or HIGH");
        }
        
        mapping.setMappingLevel(level);
        CLOPLOMapping updated = mappingRepository.save(mapping);
        log.info("Successfully updated mapping with id: {}", id);
        return convertToDto(updated);
    }
    
    @Transactional
    public void deleteMapping(Long id) {
        log.info("Deleting mapping with id: {}", id);
        if (!mappingRepository.existsById(id)) {
            throw new ResourceNotFoundException("Mapping not found with id: " + id);
        }
        mappingRepository.deleteById(id);
        log.info("Successfully deleted mapping with id: {}", id);
    }
    
    @Transactional
    public void deleteMappingsByCloId(Long cloId) {
        log.info("Deleting all mappings for CLO id: {}", cloId);
        List<CLOPLOMapping> mappings = mappingRepository.findByClo_CloId(cloId);
        mappingRepository.deleteAll(mappings);
        log.info("Successfully deleted {} mappings for CLO id: {}", mappings.size(), cloId);
    }
    
    @Transactional
    public void deleteMappingsByPloId(Long ploId) {
        log.info("Deleting all mappings for PLO id: {}", ploId);
        List<CLOPLOMapping> mappings = mappingRepository.findByPlo_PloId(ploId);
        mappingRepository.deleteAll(mappings);
        log.info("Successfully deleted {} mappings for PLO id: {}", mappings.size(), ploId);
    }
    
    @Transactional
    public List<CLOPLOMappingResponse> createMappingsForCLO(Long cloId, List<Long> ploIds, String mappingLevel) {
        log.info("Creating {} mappings for CLO id: {} with level {}", ploIds.size(), cloId, mappingLevel);
        
        CLO clo = cloRepository.findById(cloId)
            .orElseThrow(() -> new ResourceNotFoundException("CLO not found with id: " + cloId));
        
        // Validate mapping level
        CLOPLOMapping.MappingLevel level;
        try {
            level = CLOPLOMapping.MappingLevel.valueOf(mappingLevel.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid mapping level: " + mappingLevel + ". Must be LOW, MEDIUM, or HIGH");
        }
        
        List<CLOPLOMapping> mappings = ploIds.stream()
            .map(ploId -> {
                PLO plo = ploRepository.findById(ploId)
                    .orElseThrow(() -> new ResourceNotFoundException("PLO not found with id: " + ploId));
                
                // Skip if mapping already exists
                if (mappingRepository.findByClo_CloIdAndPlo_PloId(cloId, ploId).isPresent()) {
                    log.warn("Mapping already exists between CLO {} and PLO {}, skipping", cloId, ploId);
                    return null;
                }
                
                return CLOPLOMapping.builder()
                    .clo(clo)
                    .plo(plo)
                    .mappingLevel(level)
                    .build();
            })
            .filter(mapping -> mapping != null)
            .collect(Collectors.toList());
        
        List<CLOPLOMapping> saved = mappingRepository.saveAll(mappings);
        log.info("Successfully created {} mappings for CLO id: {}", saved.size(), cloId);
        return saved.stream().map(this::convertToDto).collect(Collectors.toList());
    }
    
    // Helper method to convert entity to DTO
    private CLOPLOMappingResponse convertToDto(CLOPLOMapping mapping) {
        return CLOPLOMappingResponse.builder()
            .mappingId(mapping.getMappingId())
            .cloId(mapping.getClo().getCloId())
            .cloCode(mapping.getClo().getCloCode())
            .cloDescription(mapping.getClo().getCloDescription())
            .ploId(mapping.getPlo().getPloId())
            .ploCode(mapping.getPlo().getPloCode())
            .ploDescription(mapping.getPlo().getPloDescription())
            .mappingLevel(mapping.getMappingLevel().name())
            .build();
    }
}
