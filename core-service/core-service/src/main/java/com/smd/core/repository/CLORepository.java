package com.smd.core.repository;

import com.smd.core.entity.CLO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CLORepository extends JpaRepository<CLO, Long> {
    List<CLO> findBySyllabus_SyllabusId(Long syllabusId);
}
