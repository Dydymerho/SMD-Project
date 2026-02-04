package com.smd.core.controller;

import com.smd.core.dto.SessionPlanRequest;
import com.smd.core.dto.SessionPlanResponse;
import com.smd.core.entity.SessionPlan;
import com.smd.core.service.SessionPlanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/session-plans")
@RequiredArgsConstructor
public class SessionPlanController {
    private final SessionPlanService sessionPlanService;

    @GetMapping
    public ResponseEntity<List<SessionPlanResponse>> getAllSessionPlans() {
        List<SessionPlan> sessionPlans = sessionPlanService.getAllSessionPlans();
        List<SessionPlanResponse> response = sessionPlans.stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SessionPlanResponse> getSessionPlanById(@PathVariable Long id) {
        SessionPlan sessionPlan = sessionPlanService.getSessionPlanById(id);
        return ResponseEntity.ok(convertToDto(sessionPlan));
    }

    @GetMapping("/syllabus/{syllabusId}")
    public ResponseEntity<List<SessionPlanResponse>> getSessionPlansBySyllabusId(@PathVariable Long syllabusId) {
        List<SessionPlan> sessionPlans = sessionPlanService.getSessionPlansBySyllabusId(syllabusId);
        List<SessionPlanResponse> response = sessionPlans.stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<SessionPlanResponse> createSessionPlan(@Valid @RequestBody SessionPlanRequest request) {
        SessionPlan created = sessionPlanService.createSessionPlan(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(convertToDto(created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SessionPlanResponse> updateSessionPlan(@PathVariable Long id, @Valid @RequestBody SessionPlanRequest request) {
        SessionPlan updated = sessionPlanService.updateSessionPlan(id, request);
        return ResponseEntity.ok(convertToDto(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSessionPlan(@PathVariable Long id) {
        sessionPlanService.deleteSessionPlan(id);
        return ResponseEntity.noContent().build();
    }

    private SessionPlanResponse convertToDto(SessionPlan sessionPlan) {
        return SessionPlanResponse.builder()
            .sessionId(sessionPlan.getSessionId())
            .syllabusId(sessionPlan.getSyllabus() != null ? sessionPlan.getSyllabus().getSyllabusId() : null)
            .weekNo(sessionPlan.getWeekNo())
            .topic(sessionPlan.getTopic())
            .teachingMethod(sessionPlan.getTeachingMethod())
            .build();
    }
}
