package com.smd.core.service;

import com.smd.core.entity.Assessment;
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
    public Assessment createAssessment(Assessment assessment) {
        if (assessment.getSyllabus() != null && assessment.getSyllabus().getSyllabusId() != null) {
            syllabusRepository.findById(assessment.getSyllabus().getSyllabusId())
                    .orElseThrow(() -> new ResourceNotFoundException("Syllabus not found"));
        }
        return assessmentRepository.save(assessment);
    }

    @Transactional
    public Assessment updateAssessment(Long id, Assessment assessmentDetails) {
        Assessment assessment = getAssessmentById(id);
        
        assessment.setName(assessmentDetails.getName());
        assessment.setWeightPercent(assessmentDetails.getWeightPercent());
        assessment.setCriteria(assessmentDetails.getCriteria());
        
        if (assessmentDetails.getSyllabus() != null && assessmentDetails.getSyllabus().getSyllabusId() != null) {
            syllabusRepository.findById(assessmentDetails.getSyllabus().getSyllabusId())
                    .orElseThrow(() -> new ResourceNotFoundException("Syllabus not found"));
            assessment.setSyllabus(assessmentDetails.getSyllabus());
        }
        
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
