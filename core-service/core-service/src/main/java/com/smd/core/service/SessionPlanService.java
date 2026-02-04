package com.smd.core.service;

import com.smd.core.dto.SessionPlanRequest;
import com.smd.core.entity.SessionPlan;
import com.smd.core.entity.Syllabus;
import com.smd.core.exception.ResourceNotFoundException;
import com.smd.core.repository.SessionPlanRepository;
import com.smd.core.repository.SyllabusRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SessionPlanService {
    private final SessionPlanRepository sessionPlanRepository;
    private final SyllabusRepository syllabusRepository;

    @Transactional(readOnly = true)
    public List<SessionPlan> getAllSessionPlans() {
        return sessionPlanRepository.findAll();
    }

    @Transactional(readOnly = true)
    public SessionPlan getSessionPlanById(Long id) {
        return sessionPlanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SessionPlan not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public List<SessionPlan> getSessionPlansBySyllabusId(Long syllabusId) {
        return sessionPlanRepository.findBySyllabus_SyllabusId(syllabusId);
    }

    @Transactional
    public SessionPlan createSessionPlan(SessionPlanRequest request) {
        Syllabus syllabus = syllabusRepository.findById(request.getSyllabusId())
                .orElseThrow(() -> new ResourceNotFoundException("Syllabus not found with id: " + request.getSyllabusId()));
        
        SessionPlan sessionPlan = SessionPlan.builder()
                .syllabus(syllabus)
                .weekNo(request.getWeekNo())
                .topic(request.getTopic())
                .teachingMethod(request.getTeachingMethod())
                .build();
        
        return sessionPlanRepository.save(sessionPlan);
    }

    @Transactional
    public SessionPlan updateSessionPlan(Long id, SessionPlanRequest request) {
        SessionPlan sessionPlan = getSessionPlanById(id);
        
        Syllabus syllabus = syllabusRepository.findById(request.getSyllabusId())
                .orElseThrow(() -> new ResourceNotFoundException("Syllabus not found with id: " + request.getSyllabusId()));
        
        sessionPlan.setWeekNo(request.getWeekNo());
        sessionPlan.setTopic(request.getTopic());
        sessionPlan.setTeachingMethod(request.getTeachingMethod());
        sessionPlan.setSyllabus(syllabus);
        
        return sessionPlanRepository.save(sessionPlan);
    }

    @Transactional
    public void deleteSessionPlan(Long id) {
        if (!sessionPlanRepository.existsById(id)) {
            throw new ResourceNotFoundException("SessionPlan not found with id: " + id);
        }
        sessionPlanRepository.deleteById(id);
    }
}
