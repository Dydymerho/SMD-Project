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
    private SyllabusRepository mysqlRepo; 

    @Autowired
    private SyllabusSearchRepository elasticRepo; 

    @Autowired
    private RedisTemplate<String, Object> redisTemplate; 

    // 1. tao moi
    public Syllabus createSyllabus(Syllabus newSyllabus) {
        // luu vao sql
        if (mysqlRepo.existsBySubjectCode(newSyllabus.getSubjectCode())) {
            throw new DuplicateResourceException("Syllabus", "subjectCode", newSyllabus.getSubjectCode());
        }
        newSyllabus.setStatus("DRAFT");
        Syllabus saved = mysqlRepo.save(newSyllabus);

        // dong bo sang elasticsearch
        SyllabusDocument doc = SyllabusDocument.builder()
                .id(saved.getId())
                .subjectCode(saved.getSubjectCode())
                .subjectName(saved.getSubjectName())
                .description(saved.getDescription())
                .build();
        elasticRepo.save(doc);

        // xoa cache cu (neu co)
        String key = "syllabus:" + saved.getId();
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

        // neu khong co, tim trong MySQL
        System.out.println("--> Lấy từ MYSQL");
        Syllabus fromDb = mysqlRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Syllabus", "id", id));

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
        return mysqlRepo.findAll();
    }
}