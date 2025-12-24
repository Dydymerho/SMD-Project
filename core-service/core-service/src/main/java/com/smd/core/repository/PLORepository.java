package com.smd.core.repository;

import com.smd.core.entity.PLO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PLORepository extends JpaRepository<PLO, Long> {
    List<PLO> findByProgram_ProgramId(Long programId);
}
