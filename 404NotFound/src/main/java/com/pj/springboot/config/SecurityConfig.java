package com.pj.springboot.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

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
            // CORS 활성화 (아래 corsConfigurationSource() 와 연동)
            .cors(c -> c.configurationSource(corsConfigurationSource()))
            // SPA + REST 조합에서는 보통 CSRF 비활성화 (세션/쿠키 CSRF 쓰면 여기 조정)
            .csrf(csrf -> csrf.disable())
            // 세션 정책 (필요 시 생성)
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
            // 인가 정책
            .authorizeHttpRequests(auth -> auth
                // 프리플라이트 허용
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                // 공개 엔드포인트
                .requestMatchers(
                    "/api/employees/signup",
                    "/api/employees/login",
                    "/api/employees/logout",
                    "/api/employees/session-check",
                    "/api/employees/find-id",
                    "/api/employees/reset-password"
                ).permitAll()
                .requestMatchers(
                    "/api/email/**",
                    "/api/email/send-auth-code",
                    "/api/email/verify-auth-code"
                ).permitAll()
                .requestMatchers("/api/calendars/**").permitAll()
                .requestMatchers("/api/shift-memos/**").permitAll()
                .requestMatchers("/public-api/**").permitAll()

                // 개발 단계: 나머지도 허용(운영 전환시 authenticated() 로 변경)
                .anyRequest().permitAll()
            );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration cfg = new CorsConfiguration();

        // 크로스 사이트 쿠키/세션을 쓴다면 true
        cfg.setAllowCredentials(true);

        // 허용 Origin (정확히 기입) — 포트까지 포함한 Origin 기준
        cfg.setAllowedOriginPatterns(List.of(
            // 개발
            "http://localhost:5173",
            "http://127.0.0.1:5173",

            // 현재 사용 중인 도메인
            "https://notfound.p-e.kr"     // 배포(HTTPS) 대비
        ));

        // 메서드/헤더
        cfg.setAllowedMethods(List.of("GET","POST","PUT","PATCH","DELETE","OPTIONS"));
        cfg.setAllowedHeaders(List.of("*"));
        // 필요시 브라우저에 노출할 응답 헤더
        cfg.setExposedHeaders(List.of("Set-Cookie"));
        // 프리플라이트 캐시
        cfg.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", cfg);
        return source;
    }
}
