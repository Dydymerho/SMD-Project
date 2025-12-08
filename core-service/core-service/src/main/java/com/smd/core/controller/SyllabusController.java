package com.smd.core.controller;

import com.smd.core.document.SyllabusDocument;
import com.smd.core.entity.Syllabus;
import com.smd.core.service.SyllabusService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/syllabuses")
public class SyllabusController {
    @Autowired
    private SyllabusService syllabusService;

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Syllabus syllabus) {
        return ResponseEntity.ok(syllabusService.createSyllabus(syllabus));
    }

    // API mới: Lấy chi tiết (Sẽ test Redis ở đây)
    @GetMapping("/{id}")
    public ResponseEntity<Syllabus> getDetail(@PathVariable Long id) {
        return ResponseEntity.ok(syllabusService.getSyllabusById(id));
    }

    // API mới: Tìm kiếm (Sẽ test Elasticsearch ở đây)
    @GetMapping("/search")
    public ResponseEntity<List<SyllabusDocument>> search(@RequestParam String keyword) {
        // URL dạng: /api/v1/syllabuses/search?keyword=Java
        return ResponseEntity.ok(syllabusService.search(keyword));
    }
    
    @GetMapping
    public ResponseEntity<List<Syllabus>> getAll() {
        return ResponseEntity.ok(syllabusService.getAllSyllabuses());
    }
}