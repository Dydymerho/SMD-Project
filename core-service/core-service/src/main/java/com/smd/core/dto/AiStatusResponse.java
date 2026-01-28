package com.smd.core.dto;

import lombok.Data;
import java.util.Map;

@Data
public class AiStatusResponse {
    private String task_id;
    private String status; // SUCCESS, PENDING, FAILURE
    private Map<String, Object> result; // Kết quả tóm tắt nằm trong này
}