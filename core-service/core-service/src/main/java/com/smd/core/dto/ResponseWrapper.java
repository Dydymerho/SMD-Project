package com.smd.core.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Generic wrapper for API responses
 * Provides consistent response structure across all endpoints
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ResponseWrapper<T> {
    
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();
    
    private boolean success;
    private String message;
    private T data;
    
    /**
     * Constructor for responses with data
     */
    public ResponseWrapper(boolean success, String message, T data) {
        this.timestamp = LocalDateTime.now();
        this.success = success;
        this.message = message;
        this.data = data;
    }
    
    /**
     * Constructor for responses without data
     */
    public ResponseWrapper(boolean success, String message) {
        this.timestamp = LocalDateTime.now();
        this.success = success;
        this.message = message;
        this.data = null;
    }
    
    /**
     * Create a success response with data
     */
    public static <T> ResponseWrapper<T> success(String message, T data) {
        return new ResponseWrapper<>(true, message, data);
    }
    
    /**
     * Create a success response without data
     */
    public static <T> ResponseWrapper<T> success(String message) {
        return new ResponseWrapper<>(true, message, null);
    }
    
    /**
     * Create an error response with data
     */
    public static <T> ResponseWrapper<T> error(String message, T data) {
        return new ResponseWrapper<>(false, message, data);
    }
    
    /**
     * Create an error response without data
     */
    public static <T> ResponseWrapper<T> error(String message) {
        return new ResponseWrapper<>(false, message, null);
    }
}
