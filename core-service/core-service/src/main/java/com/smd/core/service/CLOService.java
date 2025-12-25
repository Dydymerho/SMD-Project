package com.smd.core.service;

import com.smd.core.entity.CLO;
import com.smd.core.exception.ResourceNotFoundException;
import com.smd.core.repository.CLORepository;
import com.smd.core.repository.SyllabusRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CLOService {
    private final CLORepository cloRepository;
    private final SyllabusRepository syllabusRepository;

    @Transactional(readOnly = true)
    public List<CLO> getAllCLOs() {
        return cloRepository.findAll();
    }

    @Transactional(readOnly = true)
    public CLO getCLOById(Long id) {
        return cloRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CLO not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public List<CLO> getCLOsBySyllabusId(Long syllabusId) {
        return cloRepository.findBySyllabus_SyllabusId(syllabusId);
    }

    @Transactional
    public CLO createCLO(CLO clo) {
        if (clo.getSyllabus() != null && clo.getSyllabus().getSyllabusId() != null) {
            syllabusRepository.findById(clo.getSyllabus().getSyllabusId())
                    .orElseThrow(() -> new ResourceNotFoundException("Syllabus not found"));
        }
        return cloRepository.save(clo);
    }

    @Transactional
    public CLO updateCLO(Long id, CLO cloDetails) {
        CLO clo = getCLOById(id);
        
        clo.setCloCode(cloDetails.getCloCode());
        clo.setCloDescription(cloDetails.getCloDescription());
        
        if (cloDetails.getSyllabus() != null && cloDetails.getSyllabus().getSyllabusId() != null) {
            syllabusRepository.findById(cloDetails.getSyllabus().getSyllabusId())
                    .orElseThrow(() -> new ResourceNotFoundException("Syllabus not found"));
            clo.setSyllabus(cloDetails.getSyllabus());
        }
        
        return cloRepository.save(clo);
    }

    @Transactional
    public void deleteCLO(Long id) {
        if (!cloRepository.existsById(id)) {
            throw new ResourceNotFoundException("CLO not found with id: " + id);
        }
        cloRepository.deleteById(id);
    }
}
