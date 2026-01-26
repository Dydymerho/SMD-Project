package com.smd.core.controller;

import com.smd.core.dto.CLOResponse;
import com.smd.core.entity.CLO;
import com.smd.core.service.CLOService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/clos")
@RequiredArgsConstructor
public class CLOController {
    private final CLOService cloService;

    @GetMapping
    public ResponseEntity<List<CLOResponse>> getAllCLOs() {
        List<CLO> clos = cloService.getAllCLOs();
        List<CLOResponse> response = clos.stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CLOResponse> getCLOById(@PathVariable Long id) {
        CLO clo = cloService.getCLOById(id);
        return ResponseEntity.ok(convertToDto(clo));
    }

    @GetMapping("/syllabus/{syllabusId}")
    public ResponseEntity<List<CLOResponse>> getCLOsBySyllabusId(@PathVariable Long syllabusId) {
        List<CLO> clos = cloService.getCLOsBySyllabusId(syllabusId);
        List<CLOResponse> response = clos.stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<CLOResponse> createCLO(@RequestBody CLO clo) {
        CLO created = cloService.createCLO(clo);
        return ResponseEntity.status(HttpStatus.CREATED).body(convertToDto(created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CLOResponse> updateCLO(@PathVariable Long id, @RequestBody CLO clo) {
        CLO updated = cloService.updateCLO(id, clo);
        return ResponseEntity.ok(convertToDto(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCLO(@PathVariable Long id) {
        cloService.deleteCLO(id);
        return ResponseEntity.noContent().build();
    }

    private CLOResponse convertToDto(CLO clo) {
        return CLOResponse.builder()
            .cloId(clo.getCloId())
            .syllabusId(clo.getSyllabus() != null ? clo.getSyllabus().getSyllabusId() : null)
            .cloCode(clo.getCloCode())
            .cloDescription(clo.getCloDescription())
            .build();
    }
}
