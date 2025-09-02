package com.pj.springboot.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * STOMP 엔드포인트와 브로커 설정
 * - 엔드포인트: /ws-chat (SockJS 사용)
 * - 클라 → 서버: /app/...
 * - 서버 → 클라: /topic/..., /queue/...
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(StompEndpointRegistry reg) {
        reg.addEndpoint("/ws-chat")
           .setAllowedOriginPatterns(
               "http://localhost:5173", "http://127.0.0.1:5173" // Vite
               // 필요하면 추가: "http://localhost:3000", "http://127.0.0.1:3000"
           )
           .withSockJS(); // SockJS 사용 (프론트도 SockJS로 연결 중)
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry cfg) {
        // 클라이언트 → 서버 전송 prefix (@MessageMapping 매핑)
        cfg.setApplicationDestinationPrefixes("/app");

        // 서버 → 클라이언트 브로드캐스트 prefix
        cfg.enableSimpleBroker("/topic", "/queue");
        cfg.setUserDestinationPrefix("/user"); // 1:1 개인 큐가 필요하면 사용 가능
    }
}
