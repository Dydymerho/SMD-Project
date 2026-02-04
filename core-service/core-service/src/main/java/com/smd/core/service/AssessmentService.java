package com.smd.core.service;

import com.smd.core.dto.AssessmentRequest;
import com.smd.core.entity.Assessment;
import com.smd.core.entity.Syllabus;
import com.smd.core.exception.ResourceNotFoundException;
import com.smd.core.repository.AssessmentRepository;
import com.smd.core.repository.SyllabusRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AssessmentService {
    private final AssessmentRepository assessmentRepository;
    private final SyllabusRepository syllabusRepository;

    @Transactional(readOnly = true)
    public List<Assessment> getAllAssessments() {
        return assessmentRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Assessment getAssessmentById(Long id) {
        return assessmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Assessment not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public List<Assessment> getAssessmentsBySyllabusId(Long syllabusId) {
        return assessmentRepository.findBySyllabus_SyllabusId(syllabusId);
    }

    @Transactional
    public Assessment createAssessment(AssessmentRequest request) {
        Syllabus syllabus = syllabusRepository.findById(request.getSyllabusId())
                .orElseThrow(() -> new ResourceNotFoundException("Syllabus not found with id: " + request.getSyllabusId()));
        
        Assessment assessment = Assessment.builder()
                .syllabus(syllabus)
                .name(request.getName())
                .weightPercent(request.getWeightPercent().floatValue())
                .criteria(request.getCriteria())
                .build();
        
        return assessmentRepository.save(assessment);
    }

    @Transactional
    public Assessment updateAssessment(Long id, AssessmentRequest request) {
        Assessment assessment = getAssessmentById(id);
        
        Syllabus syllabus = syllabusRepository.findById(request.getSyllabusId())
                .orElseThrow(() -> new ResourceNotFoundException("Syllabus not found with id: " + request.getSyllabusId()));
        
        assessment.setName(request.getName());
        assessment.setWeightPercent(request.getWeightPercent().floatValue());
        assessment.setCriteria(request.getCriteria());
        assessment.setSyllabus(syllabus);
        
        return assessmentRepository.save(assessment);
    }

    @Transactional
    public void deleteAssessment(Long id) {
        if (!assessmentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Assessment not found with id: " + id);
        }
        assessmentRepository.deleteById(id);
    }
}
