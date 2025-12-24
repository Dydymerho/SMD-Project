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

import java.time.Duration;
import java.util.List;

@Service
public class SyllabusService {

    @Autowired
    private SyllabusRepository syllabusRepo; 

    @Autowired
    private SyllabusSearchRepository elasticRepo; 

    @Autowired
    private RedisTemplate<String, Object> redisTemplate; 

    // 1. tao moi
    public Syllabus createSyllabus(Syllabus newSyllabus) {
        // Check duplicate syllabus (same course, academic year, and version)
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
        
        // Sync to Elasticsearch for full-text search
        if (saved.getCourse() != null) {
            SyllabusDocument doc = SyllabusDocument.builder()
                    .id(saved.getSyllabusId())
                    .subjectCode(saved.getCourse().getCourseCode())
                    .subjectName(saved.getCourse().getCourseName())
                    .description(saved.getCourse().getCourseName() + " - " + saved.getAcademicYear())
                    .build();
            elasticRepo.save(doc);
        }

        // Clear cache
        String key = "syllabus:" + saved.getSyllabusId();
        redisTemplate.delete(key);

        return saved;
    }

    // 2. LẤY CHI TIẾT (uu tien doc redis)
    public Syllabus getSyllabusById(Long id) {
        String key = "syllabus:" + id;

        // tim trong redis truoc
        Syllabus cached = (Syllabus) redisTemplate.opsForValue().get(key);
        if (cached != null) {
            System.out.println("--> Lấy từ REDIS");
            return cached;
        }

        // neu khong co, tim trong PostgreSQL
        System.out.println("--> Lấy từ PostgreSQL");
        Syllabus fromDb = syllabusRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Syllabus", "syllabusId", id));

        // luu nguoc vao Redis (Lan sau se nhanh) - Het han sau 10 phut
        redisTemplate.opsForValue().set(key, fromDb, Duration.ofMinutes(10));
        
        return fromDb;
    }

    // 3. TÌM KIẾM (Dùng Elasticsearch)
    public List<SyllabusDocument> search(String keyword) {
        return elasticRepo.findBySubjectNameContainingOrSubjectCodeContainingOrDescriptionContaining(
                keyword, keyword, keyword
        );
    }
    
    public List<Syllabus> getAllSyllabuses() {
        return syllabusRepo.findAll();
    }
}