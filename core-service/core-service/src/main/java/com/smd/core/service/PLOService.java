package com.smd.core.service;

import com.smd.core.entity.PLO;
import com.smd.core.exception.ResourceNotFoundException;
import com.smd.core.repository.PLORepository;
import com.smd.core.repository.ProgramRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PLOService {
    private final PLORepository ploRepository;
    private final ProgramRepository programRepository;

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
