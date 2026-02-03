package com.smd.core.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AiTaskResponse {
    private String taskId;  // Make sure this matches
    private String status;
    private String message;
}