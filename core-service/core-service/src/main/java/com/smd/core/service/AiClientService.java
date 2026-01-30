package com.smd.core.service;

import com.smd.core.dto.AiStatusResponse;
import com.smd.core.dto.AiTaskResponse;
import com.smd.core.entity.AITask;
import com.smd.core.entity.Syllabus; // Import Syllabus
import com.smd.core.exception.ResourceNotFoundException; // Import Exception
import com.smd.core.repository.AiTaskRepository;
import com.smd.core.repository.SyllabusRepository; // Import Repository
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

@Service
@RequiredArgsConstructor
public class AiClientService {

    private final AiTaskRepository aiTaskRepository;
    private final SyllabusRepository syllabusRepository; // 1. Inject Repository này
    private final RestTemplate restTemplate = new RestTemplate();

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
            
            if (response.getBody() == null || response.getBody().getTask_id() == null) {
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
                    .resultSummary(response.getBody().getTask_id())
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
}