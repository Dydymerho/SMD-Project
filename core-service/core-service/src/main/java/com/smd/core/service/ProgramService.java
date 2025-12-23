package com.smd.core.service;

import com.smd.core.entity.Program;
import com.smd.core.exception.ResourceNotFoundException;
import com.smd.core.repository.DepartmentRepository;
import com.smd.core.repository.ProgramRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProgramService {
    private final ProgramRepository programRepository;
    private final DepartmentRepository departmentRepository;

    @Transactional(readOnly = true)
    public List<Program> getAllPrograms() {
        return programRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Program getProgramById(Long id) {
        return programRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Program not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public List<Program> getProgramsByDepartmentId(Long departmentId) {
        return programRepository.findByDepartment_DepartmentId(departmentId);
    }

    @Transactional
    public Program createProgram(Program program) {
        if (program.getDepartment() != null && program.getDepartment().getDepartmentId() != null) {
            departmentRepository.findById(program.getDepartment().getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found"));
        }
        return programRepository.save(program);
    }

    @Transactional
    public Program updateProgram(Long id, Program programDetails) {
        Program program = getProgramById(id);
        program.setProgramName(programDetails.getProgramName());
        
        if (programDetails.getDepartment() != null && programDetails.getDepartment().getDepartmentId() != null) {
            departmentRepository.findById(programDetails.getDepartment().getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found"));
            program.setDepartment(programDetails.getDepartment());
        }
        
        return programRepository.save(program);
    }

    @Transactional
    public void deleteProgram(Long id) {
        if (!programRepository.existsById(id)) {
            throw new ResourceNotFoundException("Program not found with id: " + id);
        }
        programRepository.deleteById(id);
    }
}
