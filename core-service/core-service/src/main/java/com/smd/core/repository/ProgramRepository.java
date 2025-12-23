package com.smd.core.repository;

import com.smd.core.entity.Program;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProgramRepository extends JpaRepository<Program, Long> {
    List<Program> findByDepartment_DepartmentId(Long departmentId);
}
