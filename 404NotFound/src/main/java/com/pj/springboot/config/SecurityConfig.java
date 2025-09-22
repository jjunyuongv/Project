package com.pj.springboot.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.http.HttpMethod;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // CSRF는 REST API 개발 중 비활성화
            .csrf(csrf -> csrf.disable())
            // CORS 설정 적용
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            // 세션 정책
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
            // 인가 정책
            .authorizeHttpRequests(auth -> auth
                // 프리플라이트(OPTIONS) 전부 허용
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                // 직원/인증 관련 공개 엔드포인트 (두 설정 합침)
                .requestMatchers(
                    "/api/employees/signup",
                    "/api/employees/login",
                    "/api/employees/logout",
                    "/api/employees/session-check",
                    "/api/employees/find-id",
                    "/api/employees/reset-password"
                ).permitAll()

                // 이메일 인증 관련
                .requestMatchers(
                    "/api/email/**",
                    "/api/email/send-auth-code",
                    "/api/email/verify-auth-code"
                ).permitAll()

                // 캘린더/교대 메모/기타 공개 API
                .requestMatchers("/api/calendars", "/api/calendars/**").permitAll()
                .requestMatchers("/api/shift-memos", "/api/shift-memos/**").permitAll()
                .requestMatchers("/public-api/**").permitAll()

                // 개발용: 나머지도 전부 허용
                // 운영에서 인증 필요하면 아래 줄을 .authenticated() 로 변경
                .anyRequest().permitAll()
            );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration cfg = new CorsConfiguration();

        // 개발 환경: 로컬/사설망 Vite(5173/5174) 및 백엔드(8081) 허용
        cfg.setAllowedOriginPatterns(List.of(
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://192.168.*.*:5173",
            "http://10.*.*.*:5173",
            "http://localhost:5174",
            "http://127.0.0.1:5174",
            "http://localhost:8081"
        ));
        cfg.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        cfg.setAllowedHeaders(List.of("*"));
        cfg.setAllowCredentials(true);
        // 필요 시 노출 헤더 추가
        // cfg.setExposedHeaders(List.of("Authorization", "Content-Type"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", cfg);
        return source;
    }
}
