package com.smd.core.controller;

import com.smd.core.dto.AiTaskResponse;
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
            
            @Parameter(description = "ID của Syllabus (có thể bỏ qua)")
            @RequestParam(value = "syllabusId", required = false) Long syllabusId
    ) {
        // Gọi service xử lý
        AITask task = aiService.requestSummarize(file, syllabusId);
        
        // Trả về Task (Lúc này resultSummary đang chứa ID của Celery, Status là PENDING)
        return ResponseEntity.ok(task);
    }

    // API 2: Kiểm tra kết quả và trả về full response từ AI
    @Operation(summary = "Kiểm tra trạng thái và lấy kết quả đầy đủ từ AI")
    @GetMapping("/tasks/{id}")
    public ResponseEntity<Object> getTaskResult(
            @Parameter(description = "ID của AI Task") 
            @PathVariable Long id
    ) {
        // Trả về toàn bộ response từ Python AI (bao gồm cả JSON result)
        Object fullResult = aiService.getFullTaskResult(id);
        return ResponseEntity.ok(fullResult);
    }

    // API Mới: Upload file để trích xuất thông tin
    @Operation(summary = "Upload file PDF/Word để AI trích xuất Syllabus JSON (Async)")
    @PostMapping(value = "/extract-syllabus", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AiTaskResponse> extractSyllabus(
            @Parameter(description = "File PDF/Word syllabus") 
            @RequestParam("file") MultipartFile file
    ) {
        // Gọi service
        AITask task = aiService.requestExtractSyllabus(file);
        
        // Trả về task_id cho Frontend polling
        return ResponseEntity.ok(AiTaskResponse.builder()
                .taskId(String.valueOf(task.getAiTaskId())) // Trả về external ID (Celery ID)
                .status(task.getStatus().name())
                .message("File uploaded successfully. Extraction started.")
                .build());
    }
}