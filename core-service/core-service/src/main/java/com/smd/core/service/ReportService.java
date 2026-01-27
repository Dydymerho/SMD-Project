package com.smd.core.service;

import com.smd.core.dto.CreateReportRequest;
import com.smd.core.dto.ReportResponse;
import com.smd.core.entity.Report;
import com.smd.core.entity.User;
import com.smd.core.exception.ResourceNotFoundException;
import com.smd.core.repository.ReportRepository;
import com.smd.core.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ReportRepository reportRepository;
    private final UserRepository userRepository;

    @Transactional
    public ReportResponse createReport(String username, CreateReportRequest request) {
        User student = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Report report = Report.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .reporter(student)
                .status(Report.ReportStatus.PENDING)
                .build();

        Report savedReport = reportRepository.save(report);
        return ReportResponse.fromEntity(savedReport);
    }

    @Transactional(readOnly = true)
    public Page<ReportResponse> getMyReports(String username, Pageable pageable) {
        User student = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return reportRepository.findByReporter(student, pageable)
                .map(ReportResponse::fromEntity);
    }
}