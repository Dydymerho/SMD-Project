package com.smd.core.service;

import com.smd.core.entity.SessionPlan;
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
    public SessionPlan createSessionPlan(SessionPlan sessionPlan) {
        if (sessionPlan.getSyllabus() != null && sessionPlan.getSyllabus().getSyllabusId() != null) {
            syllabusRepository.findById(sessionPlan.getSyllabus().getSyllabusId())
                    .orElseThrow(() -> new ResourceNotFoundException("Syllabus not found"));
        }
        return sessionPlanRepository.save(sessionPlan);
    }

    @Transactional
    public SessionPlan updateSessionPlan(Long id, SessionPlan sessionPlanDetails) {
        SessionPlan sessionPlan = getSessionPlanById(id);
        
        sessionPlan.setWeekNo(sessionPlanDetails.getWeekNo());
        sessionPlan.setTopic(sessionPlanDetails.getTopic());
        sessionPlan.setTeachingMethod(sessionPlanDetails.getTeachingMethod());
        
        if (sessionPlanDetails.getSyllabus() != null && sessionPlanDetails.getSyllabus().getSyllabusId() != null) {
            syllabusRepository.findById(sessionPlanDetails.getSyllabus().getSyllabusId())
                    .orElseThrow(() -> new ResourceNotFoundException("Syllabus not found"));
            sessionPlan.setSyllabus(sessionPlanDetails.getSyllabus());
        }
        
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
