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

    @GetMapping("/{id}")
    public ResponseEntity<Syllabus> getDetail(@PathVariable Long id) {
        return ResponseEntity.ok(syllabusService.getSyllabusById(id));
    }

    @GetMapping("/search")
    public ResponseEntity<List<Syllabus>> search(@RequestParam String keyword) {
        // URL dạng: /api/v1/syllabuses/search?keyword=Java
        return ResponseEntity.ok(syllabusService.search(keyword));
    }
    
    @GetMapping
    public ResponseEntity<List<Syllabus>> getAll() {
        return ResponseEntity.ok(syllabusService.getAllSyllabuses());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Syllabus> update(@PathVariable long id, @RequestBody Syllabus syllabus){
        return ResponseEntity.ok(syllabusService.updateSyllabus(id, syllabus));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable long id){
        syllabusService.deleteSyllabus(id);
        return ResponseEntity.noContent().build();
    }
}