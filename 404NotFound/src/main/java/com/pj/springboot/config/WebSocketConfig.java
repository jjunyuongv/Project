package com.pj.springboot.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.server.support.HttpSessionHandshakeInterceptor;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(StompEndpointRegistry reg) {
        reg.addEndpoint("/ws-chat")
           .addInterceptors(new HttpSessionHandshakeInterceptor())
           // ✅ 여러 PC에서 접속 허용 (개발용; 운영은 도메인 지정 권장)
           .setAllowedOriginPatterns("*")
           .withSockJS();
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry cfg) {
        cfg.setApplicationDestinationPrefixes("/app");
        cfg.enableSimpleBroker("/topic", "/queue");
        cfg.setUserDestinationPrefix("/user");
    }
}
