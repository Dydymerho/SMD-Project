package com.smd.core.service;

import com.smd.core.dto.PLOResponse;
import com.smd.core.entity.CLOPLOMapping;
import com.smd.core.entity.PLO;
import com.smd.core.exception.ResourceNotFoundException;
import com.smd.core.repository.CLOPLOMappingRepository;
import com.smd.core.repository.PLORepository;
import com.smd.core.repository.ProgramRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PLOService {
    private final PLORepository ploRepository;
    private final ProgramRepository programRepository;
    private final CLOPLOMappingRepository mappingRepository;

    @Transactional(readOnly = true)
    public List<PLO> getAllPLOs() {
        return ploRepository.findAll();
    }

    @Transactional(readOnly = true)
    public PLO getPLOById(Long id) {
        return ploRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PLO not found with id: " + id));
    }
    
    @Transactional(readOnly = true)
    public PLOResponse getPLOWithCoverage(Long id) {
        PLO plo = getPLOById(id);
        List<CLOPLOMapping> mappings = mappingRepository.findByPlo_PloId(id);
        
        Long totalMappedCLOs = mappingRepository.countByPloId(id);
        
        List<PLOResponse.CLOMappingSummary> cloMappings = mappings.stream()
            .map(m -> PLOResponse.CLOMappingSummary.builder()
                .cloId(m.getClo().getCloId())
                .cloCode(m.getClo().getCloCode())
                .syllabusId(m.getClo().getSyllabus().getSyllabusId())
                .courseCode(m.getClo().getSyllabus().getCourse().getCourseCode())
                .mappingLevel(m.getMappingLevel().name())
                .build())
            .collect(Collectors.toList());
        
        return PLOResponse.builder()
            .ploId(plo.getPloId())
            .programId(plo.getProgram().getProgramId())
            .ploCode(plo.getPloCode())
            .ploDescription(plo.getPloDescription())
            .totalMappedCLOs(totalMappedCLOs.intValue())
            .cloMappings(cloMappings)
            .build();
    }

    @Transactional(readOnly = true)
    public List<PLO> getPLOsByProgramId(Long programId) {
        return ploRepository.findByProgram_ProgramId(programId);
    }

    @Transactional
    public PLO createPLO(PLO plo) {
        if (plo.getProgram() != null && plo.getProgram().getProgramId() != null) {
            programRepository.findById(plo.getProgram().getProgramId())
                    .orElseThrow(() -> new ResourceNotFoundException("Program not found"));
        }
        return ploRepository.save(plo);
    }

    @Transactional
    public PLO updatePLO(Long id, PLO ploDetails) {
        PLO plo = getPLOById(id);
        
        plo.setPloCode(ploDetails.getPloCode());
        plo.setPloDescription(ploDetails.getPloDescription());
        
        if (ploDetails.getProgram() != null && ploDetails.getProgram().getProgramId() != null) {
            programRepository.findById(ploDetails.getProgram().getProgramId())
                    .orElseThrow(() -> new ResourceNotFoundException("Program not found"));
            plo.setProgram(ploDetails.getProgram());
        }
        
        return ploRepository.save(plo);
    }

    @Transactional
    public void deletePLO(Long id) {
        if (!ploRepository.existsById(id)) {
            throw new ResourceNotFoundException("PLO not found with id: " + id);
        }
        ploRepository.deleteById(id);
    }
}
