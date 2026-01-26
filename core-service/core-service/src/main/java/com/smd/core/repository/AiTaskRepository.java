package com.smd.core.repository;

import com.smd.core.entity.AITask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AiTaskRepository extends JpaRepository<AITask, Long> {
    // Tìm các task theo syllabus id để tránh tạo trùng lặp
    List<AITask> findBySyllabus_SyllabusId(Long syllabusId);
}