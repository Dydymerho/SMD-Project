package com.smd.core.controller;

import com.smd.core.entity.Syllabus;
import com.smd.core.service.SyllabusService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/syllabuses") // Đường dẫn gốc: http://localhost:8080/api/v1/syllabuses
public class SyllabusController {
    @Autowired
    private SyllabusService syllabusService;

    // API: Lấy danh sách (GET)
    @GetMapping
    public ResponseEntity<List<Syllabus>> getAll() {
        return ResponseEntity.ok(syllabusService.getAllSyllabuses());
    }

    // API: Tạo mới (POST)
    @PostMapping
    public ResponseEntity<?> create(@RequestBody Syllabus syllabus) {
        try {
            Syllabus created = syllabusService.createSyllabus(syllabus);
            return ResponseEntity.ok(created);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
