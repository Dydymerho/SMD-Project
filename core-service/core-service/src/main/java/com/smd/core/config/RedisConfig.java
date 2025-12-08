package com.smd.core.config;

import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;

@Configuration
public class RedisConfig {

    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);

        // 1. Tạo ObjectMapper tùy chỉnh
        ObjectMapper mapper = new ObjectMapper();
        // --> Dòng quan trọng: Đăng ký module để xử lý LocalDateTime
        mapper.registerModule(new JavaTimeModule());
        // (Tùy chọn) Tắt tính năng viết ngày tháng dưới dạng timestamp (số) để nhìn cho đẹp (dạng chuỗi 2025-...)
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

        // --> Quan trọng: Cấu hình để Redis lưu cả thông tin Class (VD: com.smd.Syllabus) vào JSON
        // Nếu thiếu dòng này, khi lấy ra bạn sẽ bị lỗi ClassCastException (LinkedHashMap cannot be cast to Syllabus)
        mapper.activateDefaultTyping(
                mapper.getPolymorphicTypeValidator(),
                ObjectMapper.DefaultTyping.NON_FINAL,
                JsonTypeInfo.As.PROPERTY
        );

        // 2. Gắn ObjectMapper vào Serializer
        GenericJackson2JsonRedisSerializer serializer = new GenericJackson2JsonRedisSerializer(mapper);

        // 3. Cấu hình Template
        template.setKeySerializer(new StringRedisSerializer());
        template.setHashKeySerializer(new StringRedisSerializer());
        template.setValueSerializer(serializer);
        template.setHashValueSerializer(serializer);

        template.afterPropertiesSet();
        return template;
    }
}