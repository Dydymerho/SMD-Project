package com.smd.core.service;

import com.smd.core.entity.Syllabus;
import com.smd.core.repository.SyllabusRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SyllabusService {

    @Autowired
    private SyllabusRepository syllabusRepository;

    // Lấy tất cả danh sách
    public List<Syllabus> getAllSyllabuses() {
        return syllabusRepository.findAll();
    }

    // Tạo mới giáo trình
    public Syllabus createSyllabus(Syllabus newSyllabus) {
        // 1. Kiểm tra logic: Mã môn đã tồn tại chưa?
        if (syllabusRepository.existsBySubjectCode(newSyllabus.getSubjectCode())) {
            throw new RuntimeException("Mã môn học đã tồn tại: " + newSyllabus.getSubjectCode());
        }
        
        // 2. Gán trạng thái mặc định
        newSyllabus.setStatus("DRAFT");
        
        // 3. Lưu vào DB
        return syllabusRepository.save(newSyllabus);
    }
}