package com.smd.core.repository;

import com.smd.core.entity.Report;
import com.smd.core.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
    // Lấy danh sách report của riêng sinh viên đó
    Page<Report> findByReporter(User reporter, Pageable pageable);
    
    // Admin lấy theo trạng thái
    Page<Report> findByStatus(Report.ReportStatus status, Pageable pageable);
}