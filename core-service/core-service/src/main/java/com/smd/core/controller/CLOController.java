package com.smd.core.controller;

import com.smd.core.entity.CLO;
import com.smd.core.service.CLOService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clos")
@RequiredArgsConstructor
public class CLOController {
    private final CLOService cloService;

    @GetMapping
    public ResponseEntity<List<CLO>> getAllCLOs() {
        return ResponseEntity.ok(cloService.getAllCLOs());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CLO> getCLOById(@PathVariable Long id) {
        return ResponseEntity.ok(cloService.getCLOById(id));
    }

    @GetMapping("/syllabus/{syllabusId}")
    public ResponseEntity<List<CLO>> getCLOsBySyllabusId(@PathVariable Long syllabusId) {
        return ResponseEntity.ok(cloService.getCLOsBySyllabusId(syllabusId));
    }

    @PostMapping
    public ResponseEntity<CLO> createCLO(@RequestBody CLO clo) {
        return ResponseEntity.status(HttpStatus.CREATED).body(cloService.createCLO(clo));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CLO> updateCLO(@PathVariable Long id, @RequestBody CLO clo) {
        return ResponseEntity.ok(cloService.updateCLO(id, clo));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCLO(@PathVariable Long id) {
        cloService.deleteCLO(id);
        return ResponseEntity.noContent().build();
    }
}
