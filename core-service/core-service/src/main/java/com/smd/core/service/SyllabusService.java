package com.smd.core.service;

import com.smd.core.document.SyllabusDocument;
import com.smd.core.dto.*;
import com.smd.core.entity.*;
import com.smd.core.exception.DuplicateResourceException;
import com.smd.core.exception.InvalidDataException;
import com.smd.core.exception.ResourceNotFoundException;
import com.smd.core.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class SyllabusService {

    @Autowired
    private SyllabusRepository syllabusRepo; 

    @Autowired
    private SyllabusSearchRepository elasticRepo; 

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private AuditLogService auditLogService;
    
    @Autowired
    private SessionPlanRepository sessionPlanRepository;
    
    @Autowired
    private AssessmentRepository assessmentRepository;
    
    @Autowired
    private MaterialRepository materialRepository;
    
    @Value("${file.upload.path:uploads/syllabus/pdf}")
    private String uploadPath; 

    // 1. CREATE WITH AUTO-VERSIONING
    @Transactional
    public Syllabus createSyllabus(Syllabus newSyllabus) {
        System.out.println("\n==> [CREATE] Bat dau tao Syllabus...");
        System.out.println("    Course ID: " + (newSyllabus.getCourse() != null ? newSyllabus.getCourse().getCourseId() : "null"));
        System.out.println("    Lecturer ID: " + (newSyllabus.getLecturer() != null ? newSyllabus.getLecturer().getUserId() : "null"));
        System.out.println("    Academic Year: " + newSyllabus.getAcademicYear());
        System.out.println("    Version: " + newSyllabus.getVersionNo());
        
        // AUTO-DETERMINE VERSION NUMBER if not provided
        if (newSyllabus.getVersionNo() == null && newSyllabus.getCourse() != null && newSyllabus.getAcademicYear() != null) {
            Integer nextVersion = determineNextVersionNumber(
                newSyllabus.getCourse().getCourseId(), 
                newSyllabus.getAcademicYear()
            );
            newSyllabus.setVersionNo(nextVersion);
            System.out.println("==> [AUTO-VERSION] Auto-determined version: " + nextVersion);
        }
        
        // Check duplicate
        if (newSyllabus.getCourse() != null && newSyllabus.getAcademicYear() != null && newSyllabus.getVersionNo() != null) {
            boolean exists = syllabusRepo.existsByCourse_CourseIdAndAcademicYearAndVersionNo(
                    newSyllabus.getCourse().getCourseId(),
                    newSyllabus.getAcademicYear(),
                    newSyllabus.getVersionNo()
            );
            if (exists) {
                System.err.println("==> [CREATE ERROR] Syllabus da ton tai!");
                throw new DuplicateResourceException(
                        "Syllabus", 
                        "course_academicYear_version", 
                        newSyllabus.getCourse().getCourseCode() + "_" + newSyllabus.getAcademicYear() + "_v" + newSyllabus.getVersionNo()
                );
            }
        }
        
        // Mark old versions as not latest
        if (newSyllabus.getCourse() != null && newSyllabus.getAcademicYear() != null) {
            updateOldVersionsAsNotLatest(
                newSyllabus.getCourse().getCourseId(), 
                newSyllabus.getAcademicYear()
            );
        }
        
        // Ensure this is marked as latest version
        newSyllabus.setIsLatestVersion(true);
        
        // Save to PostgreSQL - THIS IS THE CRITICAL PART
        System.out.println("==> [CREATE] Saving to PostgreSQL...");
        Syllabus saved = syllabusRepo.saveAndFlush(newSyllabus);
        System.out.println("==> [CREATE SUCCESS] Syllabus ID: " + saved.getSyllabusId() + " da luu vao PostgreSQL!");
        
        // Sync to Elasticsearch (async, don't fail if error)
        try {
            syncToElasticsearch(saved);
        } catch (Exception e) {
            System.err.println("==> [CREATE WARNING] Elasticsearch sync failed: " + e.getMessage());
        }

        // Clear cache
        try {
            String key = "syllabus:" + saved.getSyllabusId();
            redisTemplate.delete(key);
        } catch (Exception e) {
            System.err.println("==> [CREATE WARNING] Redis cache clear failed: " + e.getMessage());
        }

        return saved;
    }
    
    // VERSIONING: Determine next version number for a course and academic year
    @Transactional(readOnly = true)
    public Integer determineNextVersionNumber(Long courseId, String academicYear) {
        Integer maxVersion = syllabusRepo.findMaxVersionNoForCourseAndYear(courseId, academicYear);
        return (maxVersion == null || maxVersion == 0) ? 1 : maxVersion + 1;
    }
    
    // VERSIONING: Mark all old versions as not latest
    @Transactional
    public void updateOldVersionsAsNotLatest(Long courseId, String academicYear) {
        List<Syllabus> oldVersions = syllabusRepo.findAllVersionsByCourseAndYear(courseId, academicYear);
        for (Syllabus old : oldVersions) {
            if (old.getIsLatestVersion()) {
                old.setIsLatestVersion(false);
                syllabusRepo.save(old);
            }
        }
    }
    
    // VERSIONING: Create new version from existing syllabus
    @Transactional
    public Syllabus createNewVersion(Long sourceSyllabusId, String versionNotes, 
                                     boolean copyMaterials, boolean copySessionPlans, 
                                     boolean copyAssessments, boolean copyCLOs) {
        // Get source syllabus
        Syllabus source = getSyllabusById(sourceSyllabusId);
        
        // Create new syllabus with incremented version
        Integer nextVersion = determineNextVersionNumber(
            source.getCourse().getCourseId(), 
            source.getAcademicYear()
        );
        
        Syllabus newVersion = Syllabus.builder()
                .course(source.getCourse())
                .lecturer(source.getLecturer())
                .academicYear(source.getAcademicYear())
                .versionNo(nextVersion)
                .currentStatus(Syllabus.SyllabusStatus.DRAFT)
                .program(source.getProgram())
                .previousVersionId(sourceSyllabusId)
                .versionNotes(versionNotes)
                .description(source.getDescription())
                .isLatestVersion(true)
                .build();
        
        // Mark old versions as not latest
        updateOldVersionsAsNotLatest(source.getCourse().getCourseId(), source.getAcademicYear());
        
        // Save new version
        Syllabus saved = syllabusRepo.saveAndFlush(newVersion);
        
        // Copy content based on flags
        if (copyMaterials || copySessionPlans || copyAssessments || copyCLOs) {
            copyContentFromSourceVersion(saved, source, copyMaterials, copySessionPlans, copyAssessments, copyCLOs);
        }
        
        return saved;
    }
    
    // VERSIONING: Copy content from source version
    @Transactional
    public void copyContentFromSourceVersion(Syllabus target, Syllabus source,
                                             boolean copyMaterials, boolean copySessionPlans,
                                             boolean copyAssessments, boolean copyCLOs) {
        // Note: Actual copying logic would need Material, SessionPlan, Assessment, CLO services
        // For now, this is a placeholder - implementation would involve deep copying of related entities
        System.out.println("==> [COPY CONTENT] Copying from Syllabus ID " + source.getSyllabusId() + " to " + target.getSyllabusId());
        System.out.println("    Copy Materials: " + copyMaterials);
        System.out.println("    Copy SessionPlans: " + copySessionPlans);
        System.out.println("    Copy Assessments: " + copyAssessments);
        System.out.println("    Copy CLOs: " + copyCLOs);
        
        // TODO: Implement actual copying with respective service classes
    }
    
    // VERSIONING: Get all versions of a syllabus for a course and year
    @Transactional(readOnly = true)
    public List<Syllabus> getAllVersions(Long courseId, String academicYear) {
        return syllabusRepo.findAllVersionsByCourseAndYear(courseId, academicYear);
    }
    
    // VERSIONING: Get latest version
    @Transactional(readOnly = true)
    public Syllabus getLatestVersion(Long courseId, String academicYear) {
        return syllabusRepo.findLatestVersionByCourseAndYear(courseId, academicYear)
                .orElseThrow(() -> new ResourceNotFoundException(
                    "Syllabus", 
                    "courseId_academicYear", 
                    courseId + "_" + academicYear
                ));
    }

    // 2. READ BY ID (with Redis cache)
    @Transactional(readOnly = true)
    public Syllabus getSyllabusById(Long id) {
        System.out.println("\n==> [READ] Lay Syllabus ID: " + id);
        String key = "syllabus:" + id;

        // Check Redis cache first
        try {
            Syllabus cached = (Syllabus) redisTemplate.opsForValue().get(key);
            if (cached != null) {
                System.out.println("==> [CACHE HIT] Lay tu Redis");
                return cached;
            }
        } catch (Exception e) {
            System.err.println("==> [CACHE ERROR] Redis error: " + e.getMessage());
        }

        // Cache miss → Query PostgreSQL
        System.out.println("==> [CACHE MISS] Query PostgreSQL...");
        Syllabus fromDb = syllabusRepo.findById(id)
                .orElseThrow(() -> {
                    System.err.println("==> [READ ERROR] Khong tim thay Syllabus ID: " + id);
                    return new ResourceNotFoundException("Syllabus", "syllabusId", id);
                });

        System.out.println("==> [READ SUCCESS] Tim thay Syllabus: " + fromDb.getAcademicYear());

        // Save to Redis cache (TTL: 10 minutes)
        try {
            redisTemplate.opsForValue().set(key, fromDb, Duration.ofMinutes(10));
        } catch (Exception e) {
            System.err.println("==> [CACHE ERROR] Khong the luu vao Redis: " + e.getMessage());
        }
        
        return fromDb;
    }
    
    // GET SYLLABUS DETAIL WITH ALL RELATED DATA
    @Transactional(readOnly = true)
    public SyllabusDetailResponse getSyllabusDetail(Long syllabusId) {
        System.out.println("\n==> [DETAIL] Getting full syllabus detail for ID: " + syllabusId);
        
        // Get syllabus from database
        Syllabus syllabus = syllabusRepo.findById(syllabusId)
                .orElseThrow(() -> {
                    System.err.println("==> [DETAIL ERROR] Syllabus not found with ID: " + syllabusId);
                    return new ResourceNotFoundException("Syllabus", "syllabusId", syllabusId);
                });
        
        // Get related data
        List<SessionPlan> sessionPlans = sessionPlanRepository.findBySyllabus_SyllabusId(syllabusId);
        List<Assessment> assessments = assessmentRepository.findBySyllabus_SyllabusId(syllabusId);
        List<Material> materials = materialRepository.findBySyllabus_SyllabusId(syllabusId);
        
        // Convert to DTO using static method
        SyllabusDetailResponse response = SyllabusDetailResponse.fromEntity(
                syllabus, sessionPlans, assessments, materials);
        
        System.out.println("==> [DETAIL SUCCESS] Retrieved detail with " + 
                response.getSessionPlans().size() + " session plans, " +
                response.getAssessments().size() + " assessments, " +
                response.getMaterials().size() + " materials");
        
        return response;
    }

    // 3. SEARCH (Elasticsearch) - TRẢ ĐẦY ĐỦ THÔNG TIN
    public List<Syllabus> search(String keyword) {
        try {
            // Bước 1: Search trong Elasticsearch → Lấy IDs
            List<SyllabusDocument> documents = elasticRepo
                    .findBySubjectNameContainingOrSubjectCodeContainingOrFullTextContaining(
                        keyword, keyword, keyword
                    );
            
            if (documents.isEmpty()) {
                System.out.println("--> [SEARCH] Không tìm thấy trong Elasticsearch, fallback PostgreSQL");
                // Fallback: Search trực tiếp trong PostgreSQL
                return syllabusRepo.searchByKeyword(keyword);
            }

            // Bước 2: Extract IDs từ search results
            List<Long> ids = documents.stream()
                    .map(SyllabusDocument::getId)
                    .collect(Collectors.toList());
            
            // Bước 3: Query PostgreSQL để lấy FULL thông tin (với relationships)
            List<Syllabus> fullResults = syllabusRepo.findAllById(ids);
            
            System.out.println("--> [SEARCH] Tìm thấy " + fullResults.size() + "/" + ids.size() + " kết quả cho keyword: " + keyword);
            
            return fullResults;
        } catch (Exception e) {
            // Nếu Elasticsearch lỗi, fallback sang PostgreSQL
            System.err.println("--> [SEARCH ERROR] Elasticsearch error, fallback: " + e.getMessage());
            return syllabusRepo.searchByKeyword(keyword);
        }
    }
    
    // 4. READ ALL
    @Transactional(readOnly = true)
    public List<Syllabus> getAllSyllabuses() {
        System.out.println("\n==> [READ ALL] Lay danh sach tat ca Syllabuses...");
        List<Syllabus> all = syllabusRepo.findAll();
        System.out.println("==> [READ ALL] Tim thay " + all.size() + " Syllabus(es) trong database");
        return all;
    }

    // 5. UPDATE
    @Transactional
    public Syllabus updateSyllabus(Long id, Syllabus syllabusDetails) {
        Syllabus existing = syllabusRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Syllabus", "syllabusId", id));
        
        // Update fields
        if (syllabusDetails.getCourse() != null) {
            existing.setCourse(syllabusDetails.getCourse());
        }
        if (syllabusDetails.getLecturer() != null) {
            existing.setLecturer(syllabusDetails.getLecturer());
        }
        if (syllabusDetails.getProgram() != null) {
            existing.setProgram(syllabusDetails.getProgram());
        }
        if (syllabusDetails.getAcademicYear() != null) {
            existing.setAcademicYear(syllabusDetails.getAcademicYear());
        }
        if (syllabusDetails.getVersionNo() != null) {
            existing.setVersionNo(syllabusDetails.getVersionNo());
        }
        if (syllabusDetails.getCurrentStatus() != null) {
            existing.setCurrentStatus(syllabusDetails.getCurrentStatus());
        }
        if (syllabusDetails.getDescription() != null) {
            existing.setDescription(syllabusDetails.getDescription());
        }
        
        // Save to PostgreSQL
        Syllabus updated = syllabusRepo.save(existing);
        
        // Update Elasticsearch
        syncToElasticsearch(updated);
        
        // Clear cache
        String key = "syllabus:" + id;
        redisTemplate.delete(key);
        
        System.out.println("--> [UPDATE] Đã cập nhật Syllabus ID: " + id);
        return updated;
    }

    // 6. DELETE
    @Transactional
    public void deleteSyllabus(Long id) {
        if (!syllabusRepo.existsById(id)) {
            throw new ResourceNotFoundException("Syllabus", "syllabusId", id);
        }
        
        // Delete from PostgreSQL
        syllabusRepo.deleteById(id);
        
        // Delete from Elasticsearch
        elasticRepo.deleteById(id);
        
        // Delete from Redis cache
        String key = "syllabus:" + id;
        redisTemplate.delete(key);
        
        System.out.println("--> [DELETE] Đã xóa Syllabus ID: " + id);
    }

    // ========== HELPER METHODS ==========

    /**
     * Sync Syllabus to Elasticsearch
     */
    private void syncToElasticsearch(Syllabus syllabus) {
        try {
            if (syllabus.getCourse() != null) {
                SyllabusDocument doc = SyllabusDocument.builder()
                        .id(syllabus.getSyllabusId())
                        .subjectCode(syllabus.getCourse().getCourseCode())
                        .subjectName(syllabus.getCourse().getCourseName())
                        .description(syllabus.getDescription())
                        .fullText(buildFullText(syllabus))
                        .build();
                elasticRepo.save(doc);
                System.out.println("--> [ELASTICSEARCH] Đã sync Syllabus ID: " + syllabus.getSyllabusId());
            }
        } catch (Exception e) {
            System.err.println("--> [ELASTICSEARCH ERROR] Không thể sync ID: " + syllabus.getSyllabusId() + " - " + e.getMessage());
            // Don't fail the entire operation if Elasticsearch sync fails
        }
    }
    
    /**
     * Reindex all syllabuses from PostgreSQL to Elasticsearch
     */
    @Transactional(readOnly = true)
    public void reindexAllToElasticsearch() {
        System.out.println("--> [REINDEX] Bắt đầu reindex toàn bộ Syllabus...");
        
        // Delete old index
        try {
            elasticRepo.deleteAll();
            System.out.println("--> [REINDEX] Đã xóa index cũ");
        } catch (Exception e) {
            System.err.println("--> [REINDEX WARNING] Không thể xóa index cũ: " + e.getMessage());
        }
        
        // Get all from PostgreSQL
        List<Syllabus> allSyllabuses = syllabusRepo.findAll();
        System.out.println("--> [REINDEX] Tìm thấy " + allSyllabuses.size() + " syllabus trong PostgreSQL");
        
        // Sync to Elasticsearch
        int successCount = 0;
        for (Syllabus syllabus : allSyllabuses) {
            try {
                syncToElasticsearch(syllabus);
                successCount++;
            } catch (Exception e) {
                System.err.println("--> [REINDEX ERROR] Lỗi sync ID " + syllabus.getSyllabusId() + ": " + e.getMessage());
            }
        }
        
        System.out.println("--> [REINDEX] Hoàn thành! Đã sync " + successCount + "/" + allSyllabuses.size() + " syllabus");
    }

    /**
     * Build comprehensive search text
     */
    private String buildFullText(Syllabus s) {
        StringBuilder text = new StringBuilder();
        
        // Course info
        if (s.getCourse() != null) {
            text.append(s.getCourse().getCourseCode()).append(" ");
            text.append(s.getCourse().getCourseName()).append(" ");
        }
        
        // Academic year
        if (s.getAcademicYear() != null) {
            text.append(s.getAcademicYear()).append(" ");
        }
        
        // Program
        if (s.getProgram() != null) {
            text.append(s.getProgram().getProgramName()).append(" ");
        }
        
        // Lecturer
        if (s.getLecturer() != null) {
            text.append(s.getLecturer().getFullName()).append(" ");
        }
        
        // Description
        if (s.getDescription() != null) {
            text.append(s.getDescription()).append(" ");
        }
        
        return text.toString().trim();
    }
    
    // ==================== PDF UPLOAD METHODS ====================
    
    /**
     * Check if user has permission to upload/delete PDF for a syllabus
     * Permission rules:
     * 1. Lecturer who owns the syllabus
     * 2. Admin (any user with ADMIN role)
     * 3. Head of Department (user with HEAD_OF_DEPARTMENT role in the same department as the syllabus's course)
     */
    private boolean hasPermissionToManagePdf(Syllabus syllabus, String username) {
        User user = userRepository.findByUsername(username)
            .orElse(null);
        
        if (user == null) {
            return false;
        }
        
        // Rule 1: Lecturer owns the syllabus
        if (syllabus.getLecturer() != null && 
            syllabus.getLecturer().getUsername().equals(username)) {
            return true;
        }
        
        // Rule 2: User is Admin
        if (user.getUserRoles() != null) {
            boolean isAdmin = user.getUserRoles().stream()
                .anyMatch(ur -> ur.getRole() != null && 
                               "ADMIN".equalsIgnoreCase(ur.getRole().getRoleName()));
            if (isAdmin) {
                System.out.println("==> [PERMISSION] User is ADMIN - access granted");
                return true;
            }
            
            // Rule 3: User is Department Head in the same department
            boolean isDeptHead = user.getUserRoles().stream()
                .anyMatch(ur -> ur.getRole() != null && 
                               "HEAD_OF_DEPARTMENT".equalsIgnoreCase(ur.getRole().getRoleName()));
            
            if (isDeptHead && user.getDepartment() != null && 
                syllabus.getCourse() != null && syllabus.getCourse().getDepartment() != null) {
                boolean sameDepartment = user.getDepartment().getDepartmentId()
                    .equals(syllabus.getCourse().getDepartment().getDepartmentId());
                if (sameDepartment) {
                    System.out.println("==> [PERMISSION] User is HEAD_OF_DEPARTMENT in same department - access granted");
                    return true;
                }
            }
        }
        
        return false;
    }
    
    /**
     * Upload PDF file for a syllabus
     */
    @Transactional
    public SyllabusUploadResponse uploadPdf(Long syllabusId, MultipartFile file, String username) {
        System.out.println("\n==> [UPLOAD DOCUMENT] Starting document upload for syllabusId: " + syllabusId);
        
        // Validate file
        if (file == null || file.isEmpty()) {
            throw new InvalidDataException("File is empty");
        }
        
        // Check file type - Allow PDF and Word documents
        String contentType = file.getContentType();
        List<String> allowedTypes = java.util.Arrays.asList(
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        );
        
        if (contentType == null || !allowedTypes.contains(contentType)) {
            throw new InvalidDataException("Only PDF and Word files are allowed (.pdf, .doc, .docx). Current type: " + contentType);
        }
        
        // Check file size (10MB)
        long maxSize = 10 * 1024 * 1024; // 10MB in bytes
        if (file.getSize() > maxSize) {
            throw new InvalidDataException("File size exceeds maximum allowed size of 10MB");
        }
        
        // Get syllabus
        Syllabus syllabus = syllabusRepo.findById(syllabusId)
            .orElseThrow(() -> new ResourceNotFoundException("Syllabus", "syllabusId", syllabusId));

        // Check permission using enhanced permission system
        if (!hasPermissionToManagePdf(syllabus, username)) {
            throw new InvalidDataException("You don't have permission to upload PDF for this syllabus. Only the lecturer, admin, or department head can upload.");
        }

        try {
            // Create upload directory if not exists
            Path uploadDir = Paths.get(uploadPath);
            if (!Files.exists(uploadDir)) {
                Files.createDirectories(uploadDir);
                System.out.println("==> Created upload directory: " + uploadDir.toAbsolutePath());
            }

            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String fileExtension = ".pdf";
            if (originalFilename != null && originalFilename.contains(".")) {
                fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String newFilename = syllabusId + "_" + UUID.randomUUID().toString() + fileExtension;
            
            // Save file
            Path filePath = uploadDir.resolve(newFilename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            System.out.println("==> File saved to: " + filePath.toAbsolutePath());

            // Delete old file if exists
            if (syllabus.getPdfFilePath() != null) {
                try {
                    Path oldFile = Paths.get(syllabus.getPdfFilePath());
                    Files.deleteIfExists(oldFile);
                    System.out.println("==> Deleted old file: " + oldFile);
                } catch (IOException e) {
                    System.err.println("==> Warning: Could not delete old file: " + e.getMessage());
                }
            }

            // Update syllabus
            syllabus.setPdfFilePath(filePath.toString());
            syllabus.setPdfFileName(originalFilename);
            syllabus.setPdfUploadedAt(LocalDateTime.now());
            syllabusRepo.save(syllabus);
            
            // Audit log
            java.util.Map<String, Object> additionalData = new java.util.HashMap<>();
            additionalData.put("fileName", originalFilename);
            additionalData.put("fileSize", file.getSize());
            additionalData.put("filePath", filePath.toString());
            
            auditLogService.logAction(
                syllabus,
                SyllabusAuditLog.AuditAction.UPLOAD_PDF.name(),
                username,
                null,
                null,
                "Uploaded PDF: " + originalFilename + " (" + file.getSize() + " bytes)",
                additionalData
            );
            
            // Clear cache
            try {
                String key = "syllabus:" + syllabusId;
                redisTemplate.delete(key);
            } catch (Exception e) {
                System.err.println("==> [UPLOAD PDF WARNING] Redis cache clear failed: " + e.getMessage());
            }

            System.out.println("==> [UPLOAD PDF] Completed successfully");
            
            return SyllabusUploadResponse.builder()
                .syllabusId(syllabusId)
                .fileName(originalFilename)
                .filePath(filePath.toString())
                .fileSize(file.getSize())
                .uploadedAt(syllabus.getPdfUploadedAt())
                .message("PDF uploaded successfully")
                .build();

        } catch (IOException e) {
            System.err.println("==> [UPLOAD PDF ERROR] " + e.getMessage());
            throw new RuntimeException("Failed to upload file: " + e.getMessage());
        }
    }

    /**
     * Download document file of a syllabus (PDF or Word)
     */
    public byte[] downloadPdf(Long syllabusId) {
        System.out.println("\n==> [DOWNLOAD DOCUMENT] Starting document download for syllabusId: " + syllabusId);
        
        Syllabus syllabus = syllabusRepo.findById(syllabusId)
            .orElseThrow(() -> new ResourceNotFoundException("Syllabus", "syllabusId", syllabusId));

        if (syllabus.getPdfFilePath() == null) {
            throw new ResourceNotFoundException("Document file not found for syllabus ID: " + syllabusId);
        }

        try {
            Path filePath = Paths.get(syllabus.getPdfFilePath());
            if (!Files.exists(filePath)) {
                throw new ResourceNotFoundException("Document file does not exist at path: " + filePath);
            }
            
            byte[] content = Files.readAllBytes(filePath);
            System.out.println("==> [DOWNLOAD DOCUMENT] Completed successfully. Size: " + content.length + " bytes");
            return content;
        } catch (IOException e) {
            System.err.println("==> [DOWNLOAD DOCUMENT ERROR] " + e.getMessage());
            throw new RuntimeException("Failed to download file: " + e.getMessage());
        }
    }
    
    /**
     * Get content type based on file extension
     */
    public String getContentTypeForFile(String fileName) {
        if (fileName == null) {
            return "application/octet-stream";
        }
        
        String lowerFileName = fileName.toLowerCase();
        if (lowerFileName.endsWith(".pdf")) {
            return "application/pdf";
        } else if (lowerFileName.endsWith(".docx")) {
            return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        } else if (lowerFileName.endsWith(".doc")) {
            return "application/msword";
        }
        
        return "application/octet-stream";
    }

    /**
     * Delete PDF file of a syllabus
     */
    @Transactional
    public void deletePdf(Long syllabusId, String username) {
        System.out.println("\n==> [DELETE PDF] Starting PDF deletion for syllabusId: " + syllabusId);
        
        Syllabus syllabus = syllabusRepo.findById(syllabusId)
            .orElseThrow(() -> new ResourceNotFoundException("Syllabus", "syllabusId", syllabusId));

        // Check permission using enhanced permission system
        if (!hasPermissionToManagePdf(syllabus, username)) {
            throw new InvalidDataException("You don't have permission to delete PDF for this syllabus. Only the lecturer, admin, or department head can delete.");
        }

        if (syllabus.getPdfFilePath() == null) {
            throw new ResourceNotFoundException("PDF file not found for syllabus ID: " + syllabusId);
        }

        try {
            Path filePath = Paths.get(syllabus.getPdfFilePath());
            String deletedFileName = syllabus.getPdfFileName();
            
            Files.deleteIfExists(filePath);
            System.out.println("==> Deleted file: " + filePath);
            
            // Update syllabus
            syllabus.setPdfFilePath(null);
            syllabus.setPdfFileName(null);
            syllabus.setPdfUploadedAt(null);
            syllabusRepo.save(syllabus);
            
            // Audit log
            auditLogService.logAction(
                syllabus,
                SyllabusAuditLog.AuditAction.DELETE_PDF.name(),
                username,
                "Deleted PDF: " + deletedFileName
            );
            
            // Clear cache
            try {
                String key = "syllabus:" + syllabusId;
                redisTemplate.delete(key);
            } catch (Exception e) {
                System.err.println("==> [DELETE PDF WARNING] Redis cache clear failed: " + e.getMessage());
            }
            
            System.out.println("==> [DELETE PDF] Completed successfully");
        } catch (IOException e) {
            System.err.println("==> [DELETE PDF ERROR] " + e.getMessage());
            throw new RuntimeException("Failed to delete file: " + e.getMessage());
        }
    }

    /**
     * Get PDF information of a syllabus
     */
    public SyllabusUploadResponse getPdfInfo(Long syllabusId) {
        System.out.println("\n==> [GET PDF INFO] Getting PDF info for syllabusId: " + syllabusId);
        
        Syllabus syllabus = syllabusRepo.findById(syllabusId)
            .orElseThrow(() -> new ResourceNotFoundException("Syllabus", "syllabusId", syllabusId));

        if (syllabus.getPdfFilePath() == null) {
            return SyllabusUploadResponse.builder()
                .syllabusId(syllabusId)
                .message("No PDF uploaded for this syllabus")
                .build();
        }

        // Get file size if file exists
        Long fileSize = null;
        try {
            Path filePath = Paths.get(syllabus.getPdfFilePath());
            if (Files.exists(filePath)) {
                fileSize = Files.size(filePath);
            }
        } catch (IOException e) {
            System.err.println("==> Warning: Could not get file size: " + e.getMessage());
        }

        return SyllabusUploadResponse.builder()
            .syllabusId(syllabusId)
            .fileName(syllabus.getPdfFileName())
            .filePath(syllabus.getPdfFilePath())
            .fileSize(fileSize)
            .uploadedAt(syllabus.getPdfUploadedAt())
            .message("PDF information retrieved successfully")
            .build();
    }
}