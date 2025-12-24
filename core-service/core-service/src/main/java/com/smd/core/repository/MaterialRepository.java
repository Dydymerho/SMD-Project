package com.smd.core.repository;

import com.smd.core.entity.Material;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaterialRepository extends JpaRepository<Material, Long> {
    List<Material> findBySyllabus_SyllabusId(Long syllabusId);
}
