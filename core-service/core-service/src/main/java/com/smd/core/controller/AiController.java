package com.smd.core.controller;

import com.smd.core.entity.AITask;
import com.smd.core.service.AiClientService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiClientService aiService;

    // API 1: Upload File để Tóm tắt
    @Operation(summary = "Gửi file PDF/Word để AI tóm tắt (Async)")
    @PostMapping(value = "/summarize", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AITask> summarizeFile(
            @Parameter(description = "File PDF hoặc Word cần tóm tắt") 
            @RequestParam("file") MultipartFile file,
            
            @Parameter(description = "ID của Syllabus (nếu có, optional)")
            @RequestParam(value = "syllabusId", required = true) Long syllabusId
    ) {
        // Gọi service xử lý
        AITask task = aiService.requestSummarize(file, syllabusId);
        
        // Trả về Task (Lúc này resultSummary đang chứa ID của Celery, Status là PENDING)
        return ResponseEntity.ok(task);
    }

    // API 2: Kiểm tra kết quả
    @Operation(summary = "Kiểm tra trạng thái và lấy kết quả tóm tắt")
    @GetMapping("/tasks/{id}")
    public ResponseEntity<AITask> getTaskResult(
            @Parameter(description = "ID của AI Task (trả về từ API summarize)") 
            @PathVariable Long id
    ) {
        AITask task = aiService.checkTaskStatus(id);
        return ResponseEntity.ok(task);
    }
}