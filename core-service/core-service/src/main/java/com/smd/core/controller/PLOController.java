package com.smd.core.controller;

import com.smd.core.dto.PLOResponse;
import com.smd.core.entity.PLO;
import com.smd.core.service.PLOService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/plos")
@RequiredArgsConstructor
public class PLOController {
    private final PLOService ploService;

    @GetMapping
    public ResponseEntity<List<PLOResponse>> getAllPLOs() {
        List<PLO> plos = ploService.getAllPLOs();
        List<PLOResponse> response = plos.stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PLOResponse> getPLOById(@PathVariable Long id) {
        PLO plo = ploService.getPLOById(id);
        return ResponseEntity.ok(convertToDto(plo));
    }

    @GetMapping("/program/{programId}")
    public ResponseEntity<List<PLOResponse>> getPLOsByProgramId(@PathVariable Long programId) {
        List<PLO> plos = ploService.getPLOsByProgramId(programId);
        List<PLOResponse> response = plos.stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<PLOResponse> createPLO(@RequestBody PLO plo) {
        PLO created = ploService.createPLO(plo);
        return ResponseEntity.status(HttpStatus.CREATED).body(convertToDto(created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PLOResponse> updatePLO(@PathVariable Long id, @RequestBody PLO plo) {
        PLO updated = ploService.updatePLO(id, plo);
        return ResponseEntity.ok(convertToDto(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePLO(@PathVariable Long id) {
        ploService.deletePLO(id);
        return ResponseEntity.noContent().build();
    }

    private PLOResponse convertToDto(PLO plo) {
        return PLOResponse.builder()
            .ploId(plo.getPloId())
            .programId(plo.getProgram() != null ? plo.getProgram().getProgramId() : null)
            .ploCode(plo.getPloCode())
            .ploDescription(plo.getPloDescription())
            .build();
    }
}
