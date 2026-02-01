package com.smd.core.repository;

import com.smd.core.entity.CLOPLOMapping;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CLOPLOMappingRepository extends JpaRepository<CLOPLOMapping, Long> {
    
    // Find mappings by CLO
    List<CLOPLOMapping> findByClo_CloId(Long cloId);
    
    // Find mappings by PLO
    List<CLOPLOMapping> findByPlo_PloId(Long ploId);
    
    // Find mappings by Syllabus (through CLO)
    @Query("SELECT m FROM CLOPLOMapping m WHERE m.clo.syllabus.syllabusId = :syllabusId")
    List<CLOPLOMapping> findBySyllabusId(@Param("syllabusId") Long syllabusId);
    
    // Find mappings by Program (through PLO)
    @Query("SELECT m FROM CLOPLOMapping m WHERE m.plo.program.programId = :programId")
    List<CLOPLOMapping> findByProgramId(@Param("programId") Long programId);
    
    // Check if mapping exists
    Optional<CLOPLOMapping> findByClo_CloIdAndPlo_PloId(Long cloId, Long ploId);
    
    // Count mappings for PLO
    @Query("SELECT COUNT(m) FROM CLOPLOMapping m WHERE m.plo.ploId = :ploId")
    Long countByPloId(@Param("ploId") Long ploId);
    
    // Count mappings for CLO
    @Query("SELECT COUNT(m) FROM CLOPLOMapping m WHERE m.clo.cloId = :cloId")
    Long countByCloId(@Param("cloId") Long cloId);
    
    // Get coverage statistics
    @Query("SELECT m.plo.ploId, COUNT(DISTINCT m.clo.syllabus.syllabusId) as coverage " +
           "FROM CLOPLOMapping m WHERE m.plo.program.programId = :programId " +
           "GROUP BY m.plo.ploId")
    List<Object[]> getPLOCoverageByProgram(@Param("programId") Long programId);
}
