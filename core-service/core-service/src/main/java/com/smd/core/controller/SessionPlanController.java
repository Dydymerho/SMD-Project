package com.smd.core.controller;

import com.smd.core.entity.SessionPlan;
import com.smd.core.service.SessionPlanService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/session-plans")
@RequiredArgsConstructor
public class SessionPlanController {
    private final SessionPlanService sessionPlanService;

    @GetMapping
    public ResponseEntity<List<SessionPlan>> getAllSessionPlans() {
        return ResponseEntity.ok(sessionPlanService.getAllSessionPlans());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SessionPlan> getSessionPlanById(@PathVariable Long id) {
        return ResponseEntity.ok(sessionPlanService.getSessionPlanById(id));
    }

    @GetMapping("/syllabus/{syllabusId}")
    public ResponseEntity<List<SessionPlan>> getSessionPlansBySyllabusId(@PathVariable Long syllabusId) {
        return ResponseEntity.ok(sessionPlanService.getSessionPlansBySyllabusId(syllabusId));
    }

    @PostMapping
    public ResponseEntity<SessionPlan> createSessionPlan(@RequestBody SessionPlan sessionPlan) {
        return ResponseEntity.status(HttpStatus.CREATED).body(sessionPlanService.createSessionPlan(sessionPlan));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SessionPlan> updateSessionPlan(@PathVariable Long id, @RequestBody SessionPlan sessionPlan) {
        return ResponseEntity.ok(sessionPlanService.updateSessionPlan(id, sessionPlan));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSessionPlan(@PathVariable Long id) {
        sessionPlanService.deleteSessionPlan(id);
        return ResponseEntity.noContent().build();
    }
}
