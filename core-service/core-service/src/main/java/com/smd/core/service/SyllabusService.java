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
    @Transactional
    public Syllabus createSyllabus(Syllabus newSyllabus) {
        System.out.println("\n==> [CREATE] Bat dau tao Syllabus...");
        System.out.println("    Course ID: " + (newSyllabus.getCourse() != null ? newSyllabus.getCourse().getCourseId() : "null"));
        System.out.println("    Lecturer ID: " + (newSyllabus.getLecturer() != null ? newSyllabus.getLecturer().getUserId() : "null"));
        System.out.println("    Academic Year: " + newSyllabus.getAcademicYear());
        System.out.println("    Version: " + newSyllabus.getVersionNo());
        
        // Check duplicate
        if (newSyllabus.getCourse() != null && newSyllabus.getAcademicYear() != null && newSyllabus.getVersionNo() != null) {
            boolean exists = syllabusRepo.existsByCourse_CourseIdAndAcademicYearAndVersionNo(
                    newSyllabus.getCourse().getCourseId(),
                    newSyllabus.getAcademicYear(),
                    newSyllabus.getVersionNo()
            );
            if (exists) {
                System.err.println("==> [CREATE ERROR] Syllabus da ton tai!");
                throw new DuplicateResourceException(
                        "Syllabus", 
                        "course_academicYear_version", 
                        newSyllabus.getCourse().getCourseCode() + "_" + newSyllabus.getAcademicYear() + "_v" + newSyllabus.getVersionNo()
                );
            }
        }
        
        // Save to PostgreSQL - THIS IS THE CRITICAL PART
        System.out.println("==> [CREATE] Saving to PostgreSQL...");
        Syllabus saved = syllabusRepo.saveAndFlush(newSyllabus);
        System.out.println("==> [CREATE SUCCESS] Syllabus ID: " + saved.getSyllabusId() + " da luu vao PostgreSQL!");
        
        // Sync to Elasticsearch (async, don't fail if error)
        try {
            syncToElasticsearch(saved);
        } catch (Exception e) {
            System.err.println("==> [CREATE WARNING] Elasticsearch sync failed: " + e.getMessage());
        }

        // Clear cache
        try {
            String key = "syllabus:" + saved.getSyllabusId();
            redisTemplate.delete(key);
        } catch (Exception e) {
            System.err.println("==> [CREATE WARNING] Redis cache clear failed: " + e.getMessage());
        }

        return saved;
    }

    // 2. READ BY ID (with Redis cache)
    @Transactional(readOnly = true)
    public Syllabus getSyllabusById(Long id) {
        System.out.println("\n==> [READ] Lay Syllabus ID: " + id);
        String key = "syllabus:" + id;

        // Check Redis cache first
        try {
            Syllabus cached = (Syllabus) redisTemplate.opsForValue().get(key);
            if (cached != null) {
                System.out.println("==> [CACHE HIT] Lay tu Redis");
                return cached;
            }
        } catch (Exception e) {
            System.err.println("==> [CACHE ERROR] Redis error: " + e.getMessage());
        }

        // Cache miss → Query PostgreSQL
        System.out.println("==> [CACHE MISS] Query PostgreSQL...");
        Syllabus fromDb = syllabusRepo.findById(id)
                .orElseThrow(() -> {
                    System.err.println("==> [READ ERROR] Khong tim thay Syllabus ID: " + id);
                    return new ResourceNotFoundException("Syllabus", "syllabusId", id);
                });

        System.out.println("==> [READ SUCCESS] Tim thay Syllabus: " + fromDb.getAcademicYear());

        // Save to Redis cache (TTL: 10 minutes)
        try {
            redisTemplate.opsForValue().set(key, fromDb, Duration.ofMinutes(10));
        } catch (Exception e) {
            System.err.println("==> [CACHE ERROR] Khong the luu vao Redis: " + e.getMessage());
        }
        
        return fromDb;
    }

    // 3. SEARCH (Elasticsearch) - TRẢ ĐẦY ĐỦ THÔNG TIN
    public List<Syllabus> search(String keyword) {
        try {
            // Bước 1: Search trong Elasticsearch → Lấy IDs
            List<SyllabusDocument> documents = elasticRepo
                    .findBySubjectNameContainingOrSubjectCodeContainingOrFullTextContaining(
                        keyword, keyword, keyword
                    );
            
            if (documents.isEmpty()) {
                System.out.println("--> [SEARCH] Không tìm thấy trong Elasticsearch, fallback PostgreSQL");
                // Fallback: Search trực tiếp trong PostgreSQL
                return syllabusRepo.findByAcademicYearContaining(keyword);
            }

            // Bước 2: Extract IDs từ search results
            List<Long> ids = documents.stream()
                    .map(SyllabusDocument::getId)
                    .collect(Collectors.toList());
            
            // Bước 3: Query PostgreSQL để lấy FULL thông tin (với relationships)
            List<Syllabus> fullResults = syllabusRepo.findAllById(ids);
            
            System.out.println("--> [SEARCH] Tìm thấy " + fullResults.size() + "/" + ids.size() + " kết quả cho keyword: " + keyword);
            
            return fullResults;
        } catch (Exception e) {
            // Nếu Elasticsearch lỗi, fallback sang PostgreSQL
            System.err.println("--> [SEARCH ERROR] Elasticsearch error, fallback: " + e.getMessage());
            return syllabusRepo.findByAcademicYearContaining(keyword);
        }
    }
    
    // 4. READ ALL
    @Transactional(readOnly = true)
    public List<Syllabus> getAllSyllabuses() {
        System.out.println("\n==> [READ ALL] Lay danh sach tat ca Syllabuses...");
        List<Syllabus> all = syllabusRepo.findAll();
        System.out.println("==> [READ ALL] Tim thay " + all.size() + " Syllabus(es) trong database");
        return all;
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
        try {
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
        } catch (Exception e) {
            System.err.println("--> [ELASTICSEARCH ERROR] Không thể sync ID: " + syllabus.getSyllabusId() + " - " + e.getMessage());
            // Don't fail the entire operation if Elasticsearch sync fails
        }
    }
    
    /**
     * Reindex all syllabuses from PostgreSQL to Elasticsearch
     */
    @Transactional(readOnly = true)
    public void reindexAllToElasticsearch() {
        System.out.println("--> [REINDEX] Bắt đầu reindex toàn bộ Syllabus...");
        
        // Delete old index
        try {
            elasticRepo.deleteAll();
            System.out.println("--> [REINDEX] Đã xóa index cũ");
        } catch (Exception e) {
            System.err.println("--> [REINDEX WARNING] Không thể xóa index cũ: " + e.getMessage());
        }
        
        // Get all from PostgreSQL
        List<Syllabus> allSyllabuses = syllabusRepo.findAll();
        System.out.println("--> [REINDEX] Tìm thấy " + allSyllabuses.size() + " syllabus trong PostgreSQL");
        
        // Sync to Elasticsearch
        int successCount = 0;
        for (Syllabus syllabus : allSyllabuses) {
            try {
                syncToElasticsearch(syllabus);
                successCount++;
            } catch (Exception e) {
                System.err.println("--> [REINDEX ERROR] Lỗi sync ID " + syllabus.getSyllabusId() + ": " + e.getMessage());
            }
        }
        
        System.out.println("--> [REINDEX] Hoàn thành! Đã sync " + successCount + "/" + allSyllabuses.size() + " syllabus");
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