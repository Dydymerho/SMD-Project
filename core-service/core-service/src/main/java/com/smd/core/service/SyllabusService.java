package com.smd.core.service;

import com.smd.core.document.SyllabusDocument;
import com.smd.core.entity.Syllabus;
import com.smd.core.exception.DuplicateResourceException;
import com.smd.core.exception.ResourceNotFoundException;
import com.smd.core.repository.SyllabusRepository;
import com.smd.core.repository.SyllabusSearchRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SyllabusService {

    @Autowired
    private SyllabusRepository syllabusRepo; 

    @Autowired
    private SyllabusSearchRepository elasticRepo; 

    @Autowired
    private RedisTemplate<String, Object> redisTemplate; 

    // 1. CREATE
    public Syllabus createSyllabus(Syllabus newSyllabus) {
        // Check duplicate
        if (newSyllabus.getCourse() != null && newSyllabus.getAcademicYear() != null && newSyllabus.getVersionNo() != null) {
            boolean exists = syllabusRepo.existsByCourse_CourseIdAndAcademicYearAndVersionNo(
                    newSyllabus.getCourse().getCourseId(),
                    newSyllabus.getAcademicYear(),
                    newSyllabus.getVersionNo()
            );
            if (exists) {
                throw new DuplicateResourceException(
                        "Syllabus", 
                        "course_academicYear_version", 
                        newSyllabus.getCourse().getCourseCode() + "_" + newSyllabus.getAcademicYear() + "_v" + newSyllabus.getVersionNo()
                );
            }
        }
        
        // Save to PostgreSQL
        Syllabus saved = syllabusRepo.save(newSyllabus);
        
        // Sync to Elasticsearch
        syncToElasticsearch(saved);

        // Clear cache
        String key = "syllabus:" + saved.getSyllabusId();
        redisTemplate.delete(key);

        return saved;
    }

    // 2. READ BY ID (with Redis cache)
    public Syllabus getSyllabusById(Long id) {
        String key = "syllabus:" + id;

        // Check Redis cache first
        Syllabus cached = (Syllabus) redisTemplate.opsForValue().get(key);
        if (cached != null) {
            System.out.println("--> [CACHE HIT] Lấy từ Redis");
            return cached;
        }

        // Cache miss → Query PostgreSQL
        System.out.println("--> [CACHE MISS] Lấy từ PostgreSQL");
        Syllabus fromDb = syllabusRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Syllabus", "syllabusId", id));

        // Save to Redis cache (TTL: 10 minutes)
        redisTemplate.opsForValue().set(key, fromDb, Duration.ofMinutes(10));
        
        return fromDb;
    }

    // 3. SEARCH (Elasticsearch) - TRẢ ĐẦY ĐỦ THÔNG TIN
    public List<Syllabus> search(String keyword) {
        // Bước 1: Search trong Elasticsearch → Lấy IDs
        List<SyllabusDocument> documents = elasticRepo
                .findBySubjectNameContainingOrSubjectCodeContainingOrFullTextContaining(
                    keyword, keyword, keyword
                );
        
        if (documents.isEmpty()) {
            return List.of(); // Không tìm thấy gì
        }

        // Bước 2: Extract IDs từ search results
        List<Long> ids = documents.stream()
                .map(SyllabusDocument::getId)
                .collect(Collectors.toList());
        
        // Bước 3: Query PostgreSQL để lấy FULL thông tin (với relationships)
        List<Syllabus> fullResults = syllabusRepo.findAllById(ids);
        
        System.out.println("--> [SEARCH] Tìm thấy " + fullResults.size() + " kết quả cho keyword: " + keyword);
        
        return fullResults;
    }
    
    // 4. READ ALL
    public List<Syllabus> getAllSyllabuses() {
        return syllabusRepo.findAll();
    }

    // 5. UPDATE
    @Transactional
    public Syllabus updateSyllabus(Long id, Syllabus syllabusDetails) {
        Syllabus existing = syllabusRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Syllabus", "syllabusId", id));
        
        // Update fields
        if (syllabusDetails.getCourse() != null) {
            existing.setCourse(syllabusDetails.getCourse());
        }
        if (syllabusDetails.getLecturer() != null) {
            existing.setLecturer(syllabusDetails.getLecturer());
        }
        if (syllabusDetails.getProgram() != null) {
            existing.setProgram(syllabusDetails.getProgram());
        }
        if (syllabusDetails.getAcademicYear() != null) {
            existing.setAcademicYear(syllabusDetails.getAcademicYear());
        }
        if (syllabusDetails.getVersionNo() != null) {
            existing.setVersionNo(syllabusDetails.getVersionNo());
        }
        if (syllabusDetails.getCurrentStatus() != null) {
            existing.setCurrentStatus(syllabusDetails.getCurrentStatus());
        }
        
        // Save to PostgreSQL
        Syllabus updated = syllabusRepo.save(existing);
        
        // Update Elasticsearch
        syncToElasticsearch(updated);
        
        // Clear cache
        String key = "syllabus:" + id;
        redisTemplate.delete(key);
        
        System.out.println("--> [UPDATE] Đã cập nhật Syllabus ID: " + id);
        return updated;
    }

    // 6. DELETE
    @Transactional
    public void deleteSyllabus(Long id) {
        if (!syllabusRepo.existsById(id)) {
            throw new ResourceNotFoundException("Syllabus", "syllabusId", id);
        }
        
        // Delete from PostgreSQL
        syllabusRepo.deleteById(id);
        
        // Delete from Elasticsearch
        elasticRepo.deleteById(id);
        
        // Delete from Redis cache
        String key = "syllabus:" + id;
        redisTemplate.delete(key);
        
        System.out.println("--> [DELETE] Đã xóa Syllabus ID: " + id);
    }

    // ========== HELPER METHODS ==========

    /**
     * Sync Syllabus to Elasticsearch
     */
    private void syncToElasticsearch(Syllabus syllabus) {
        if (syllabus.getCourse() != null) {
            SyllabusDocument doc = SyllabusDocument.builder()
                    .id(syllabus.getSyllabusId())
                    .subjectCode(syllabus.getCourse().getCourseCode())
                    .subjectName(syllabus.getCourse().getCourseName())
                    .fullText(buildFullText(syllabus))
                    .build();
            elasticRepo.save(doc);
            System.out.println("--> [ELASTICSEARCH] Đã sync Syllabus ID: " + syllabus.getSyllabusId());
        }
    }

    /**
     * Build comprehensive search text
     */
    private String buildFullText(Syllabus s) {
        StringBuilder text = new StringBuilder();
        
        // Course info
        if (s.getCourse() != null) {
            text.append(s.getCourse().getCourseCode()).append(" ");
            text.append(s.getCourse().getCourseName()).append(" ");
        }
        
        // Academic year
        if (s.getAcademicYear() != null) {
            text.append(s.getAcademicYear()).append(" ");
        }
        
        // Program
        if (s.getProgram() != null) {
            text.append(s.getProgram().getProgramName()).append(" ");
        }
        
        // Lecturer
        if (s.getLecturer() != null) {
            text.append(s.getLecturer().getFullName()).append(" ");
        }
        
        return text.toString().trim();
    }
}