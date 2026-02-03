package com.smd.core.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smd.core.dto.AiStatusResponse;
import com.smd.core.dto.AiTaskResponse;
import com.smd.core.entity.AITask;
import com.smd.core.entity.Syllabus; // Import Syllabus
import com.smd.core.exception.ResourceNotFoundException; // Import Exception
import com.smd.core.repository.AiTaskRepository;
import com.smd.core.repository.SyllabusRepository; // Import Repository

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AiClientService {

    private final AiTaskRepository aiTaskRepository;
    private final SyllabusRepository syllabusRepository; // 1. Inject Repository này
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper;


    // Cấu hình trong application.properties: ai-service.url=http://localhost:8000
    @Value("${ai-service.url}")
    private String aiServiceUrl;

    /**
     * Gửi file sang AI Service để yêu cầu tóm tắt
     */
    public AITask requestSummarize(MultipartFile file, Long syllabusId) {
        String url = aiServiceUrl + "/summarize-async";

        try {
            // 1. Chuẩn bị Header Multipart
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            // 2. Chuẩn bị Body chứa file
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            
            // Bọc file vào Resource và đặt tên file (Quan trọng!)
            ByteArrayResource fileResource = new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename(); 
                }
            };
            
            body.add("file", fileResource); // "file" phải khớp với tham số bên Python

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            // 3. Gọi API Python
            ResponseEntity<AiTaskResponse> response = restTemplate.postForEntity(url, requestEntity, AiTaskResponse.class);
            
            if (response.getBody() == null || response.getBody().getTaskId() == null) {
                throw new RuntimeException("AI Service không trả về Task ID");
            }

            // --- ĐOẠN LOGIC MỚI: Xử lý Syllabus tùy chọn ---
            Syllabus syllabusEntity = null;
            if (syllabusId != null) {
                syllabusEntity = syllabusRepository.findById(syllabusId)
                        .orElseThrow(() -> new ResourceNotFoundException("Syllabus not found with id " + syllabusId));
            }

            // 4. Lưu Task vào DB (Trạng thái PENDING)
            // Lưu ý: Mình tạm lưu Celery Task ID vào resultSummary để dùng tra cứu sau này
            AITask task = AITask.builder()
                    .taskType(AITask.TaskType.IMPROVE_CONTENT)
                    .status(AITask.TaskStatus.PENDING)
                    .resultSummary(response.getBody().getTaskId())
                    .syllabus(syllabusEntity) // Truyền null nếu không có ID, truyền entity nếu có
                    .build();
            
            // Nếu muốn link với Syllabus thì set syllabus ở đây (cần findById trước)
            // task.setSyllabus(syllabusRepository.findById(syllabusId).orElse(null));

            return aiTaskRepository.save(task);

        } catch (IOException e) {
            throw new RuntimeException("Lỗi đọc file: " + e.getMessage());
        } catch (Exception e) {
            throw new RuntimeException("Lỗi gọi AI Service: " + e.getMessage());
        }
    }

    /**
     * Kiểm tra trạng thái Task dựa trên ID trong Database
     */
    public AITask checkTaskStatus(Long dbTaskId) {
        AITask task = aiTaskRepository.findById(dbTaskId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Task ID: " + dbTaskId));

        // Nếu đã xong hoặc lỗi thì trả về luôn, không gọi AI nữa
        if (task.getStatus() == AITask.TaskStatus.SUCCESS || task.getStatus() == AITask.TaskStatus.SUCCESS) {
            return task;
        }

        // Lấy Celery Task ID (đã lưu tạm trong resultSummary ở bước trên)
        String celeryTaskId = task.getResultSummary();
        String url = aiServiceUrl + "/task-status/" + celeryTaskId;

        try {
            AiStatusResponse response = restTemplate.getForObject(url, AiStatusResponse.class);
            
            if (response != null) {
                if ("SUCCESS".equalsIgnoreCase(response.getStatus())) {
                    task.setStatus(AITask.TaskStatus.SUCCESS);
                    
                    // Lấy kết quả tóm tắt thực sự từ JSON trả về
                    if (response.getResult() != null && response.getResult().containsKey("summary")) {
                        String summaryText = (String) response.getResult().get("summary");
                        task.setResultSummary(summaryText); // Ghi đè ID cũ bằng kết quả thật
                    }
                } 
                else if ("SUCCESS".equalsIgnoreCase(response.getStatus())) {
                    task.setStatus(AITask.TaskStatus.SUCCESS);
                    task.setResultSummary("Lỗi từ AI Service: " + response.getResult());
                }
                // Nếu PENDING hoặc PROGRESS thì giữ nguyên
            }
            return aiTaskRepository.save(task);
        } catch (Exception e) {
            return task; // Trả về task cũ nếu lỗi kết nối
        }
    }


    /**
     * API mới: Gửi file PDF/Word sang AI để trích xuất JSON (OCR)
     * Endpoint AI: POST /extract-syllabus-json
     */
    @Transactional
    public AITask requestExtractSyllabus(MultipartFile file) {
        String url = aiServiceUrl + "/extract-syllabus-json";

        try {
            // 1. Chuẩn bị Header
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            // 2. Chuẩn bị Body (đóng gói file)
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            
            // Bắt buộc phải override getFilename() để RestTemplate gửi đúng tên file
            ByteArrayResource fileResource = new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename();
                }
            };
            
            body.add("file", fileResource); // Key "file" khớp với curl mẫu: -F 'file=@...'

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            // 3. Gọi AI Service
            // Response mẫu: { "task_id": "uuid...", "message": "..." }
            ResponseEntity<Map> response = restTemplate.postForEntity(url, requestEntity, Map.class);
            Map<String, Object> responseBody = response.getBody();

            if (responseBody != null && responseBody.containsKey("task_id")) {
                String externalTaskId = (String) responseBody.get("task_id");

                // 4. Lưu Task vào DB (Trạng thái PENDING)
                AITask aiTask = AITask.builder()
                        .taskType(AITask.TaskType.EXTRACT_SYLLABUS) // Loại task mới
                        .status(AITask.TaskStatus.PENDING)
                        .resultSummary(externalTaskId) // Lưu ID task của Python để polling sau này
                        .createdAt(LocalDateTime.now())
                        .build();

                return aiTaskRepository.save(aiTask);
            } else {
                throw new RuntimeException("AI Service không trả về task_id");
            }

        } catch (IOException e) {
            throw new RuntimeException("Lỗi xử lý file: " + e.getMessage());
        } catch (Exception e) {
            throw new RuntimeException("Không thể gọi AI Service: " + e.getMessage());
        }
    }



    // ...existing code...

/**
 * Lấy toàn bộ kết quả từ Python AI và trả về cho frontend
 * Tương tự checkTaskStatus nhưng trả về full JSON response
 */
public Object getFullTaskResult(Long dbTaskId) {
    // 1. Lấy AITask từ DB
    AITask task = aiTaskRepository.findById(dbTaskId)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy Task ID: " + dbTaskId));

    // 2. Nếu đã SUCCESS hoặc FAILURE, kiểm tra xem có cần gọi lại AI không
    if (task.getStatus() == AITask.TaskStatus.SUCCESS || 
        task.getStatus() == AITask.TaskStatus.FAILURE) {
        
        // Nếu resultSummary đã chứa JSON (không phải UUID), trả về luôn
        try {
            String resultSummary = task.getResultSummary();
            if (resultSummary != null && resultSummary.startsWith("{")) {
                return objectMapper.readValue(resultSummary, Object.class);
            }
        } catch (Exception e) {
            // Nếu parse lỗi, tiếp tục gọi AI
        }
    }

    // 3. Lấy Celery Task ID (đã lưu trong resultSummary)
    String celeryTaskId = task.getResultSummary();
    
    if (celeryTaskId == null || celeryTaskId.isEmpty()) {
        throw new RuntimeException("Task chưa có Celery ID");
    }

    // 4. Gọi Python AI để lấy kết quả
    String pythonUrl = aiServiceUrl + "/task-status/" + celeryTaskId;  // ✅ Sửa từ /api/tasks/ thành /task-status/
    
    try {
        ResponseEntity<String> response = restTemplate.getForEntity(pythonUrl, String.class);
        String jsonResponse = response.getBody();
        
        if (jsonResponse == null) {
            throw new RuntimeException("AI Service trả về null");
        }
        
        // 5. Parse JSON để lấy status
        var jsonNode = objectMapper.readTree(jsonResponse);
        String aiStatus = jsonNode.get("status").asText();
        
        // 6. Cập nhật status trong DB
        if ("SUCCESS".equalsIgnoreCase(aiStatus)) {
            task.setStatus(AITask.TaskStatus.SUCCESS);
            // Lưu toàn bộ JSON vào resultSummary để lần sau không cần gọi lại
            task.setResultSummary(jsonResponse);
        } 
        else if ("FAILURE".equalsIgnoreCase(aiStatus)) {
            task.setStatus(AITask.TaskStatus.FAILURE);
            task.setResultSummary(jsonResponse);
        }
        else if ("PROCESSING".equalsIgnoreCase(aiStatus) || "PROGRESS".equalsIgnoreCase(aiStatus)) {
            task.setStatus(AITask.TaskStatus.PROCESSING);
        }
        // PENDING giữ nguyên
        
        aiTaskRepository.save(task);
        
        // 7. Trả về TOÀN BỘ JSON cho frontend
        return objectMapper.readValue(jsonResponse, Object.class);
        
    } catch (org.springframework.web.client.HttpClientErrorException.NotFound e) {
        // Python AI trả về 404 - Task không tồn tại hoặc đã hết hạn
        task.setStatus(AITask.TaskStatus.FAILURE);
        aiTaskRepository.save(task);
        
        return Map.of(
            "status", "FAILURE",
            "error", "Task not found in AI service",
            "message", "Celery task đã hết hạn hoặc không tồn tại",
            "celeryTaskId", celeryTaskId
        );
        
    } catch (Exception e) {
        // Lỗi khác (network, parse JSON, etc.)
        task.setStatus(AITask.TaskStatus.FAILURE);
        aiTaskRepository.save(task);
        
        return Map.of(
            "status", "FAILURE",
            "error", e.getMessage(),
            "message", "Lỗi khi lấy kết quả từ AI Service"
        );
    }
}
}