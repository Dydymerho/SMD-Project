package com.smd.core.controller;

import com.smd.core.entity.PLO;
import com.smd.core.service.PLOService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/plos")
@RequiredArgsConstructor
public class PLOController {
    private final PLOService ploService;

    @GetMapping
    public ResponseEntity<List<PLO>> getAllPLOs() {
        return ResponseEntity.ok(ploService.getAllPLOs());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PLO> getPLOById(@PathVariable Long id) {
        return ResponseEntity.ok(ploService.getPLOById(id));
    }

    @GetMapping("/program/{programId}")
    public ResponseEntity<List<PLO>> getPLOsByProgramId(@PathVariable Long programId) {
        return ResponseEntity.ok(ploService.getPLOsByProgramId(programId));
    }

    @PostMapping
    public ResponseEntity<PLO> createPLO(@RequestBody PLO plo) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ploService.createPLO(plo));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PLO> updatePLO(@PathVariable Long id, @RequestBody PLO plo) {
        return ResponseEntity.ok(ploService.updatePLO(id, plo));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePLO(@PathVariable Long id) {
        ploService.deletePLO(id);
        return ResponseEntity.noContent().build();
    }
}
