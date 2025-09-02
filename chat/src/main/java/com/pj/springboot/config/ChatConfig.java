package com.pj.springboot.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * 개발용 CORS 전역 허용
 * - /api/** : REST 엔드포인트
 * - /ws-chat/** : SockJS가 내부에서 사용하는 xhr_streaming/xhr_send/info 등 하위 경로
 */
@Configuration
public class ChatConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // REST
        registry.addMapping("/api/**")
                .allowedOriginPatterns("http://localhost:5173", "http://127.0.0.1:5173") // Vite
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);

        // SockJS 내부 XHR 경로까지 허용
        registry.addMapping("/ws-chat/**")
                .allowedOriginPatterns("http://localhost:5173", "http://127.0.0.1:5173")
                .allowedMethods("GET", "POST", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
